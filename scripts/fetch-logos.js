const fs = require('fs');
const https = require('https');
const path = require('path');

const PROJECT = path.resolve(__dirname, '..');
const OUTPUT = path.join(PROJECT, 'api', 'team-logos-thesportsdb.json');
const PLACAR = path.join(PROJECT, 'api', 'placar-jogos.json');
const EXTRA_LOGOS = path.join(PROJECT, 'js', 'team-logos-data.json');
const LEAGUE_MAP = path.join(PROJECT, 'js', 'league-mapping.js');

// Rate limiting
const DELAY_MS = 400;
const BATCH_SIZE = 5;
let requestsThisRun = 0;

// Coletar todos os nomes de times de todas as fontes
function extractTeamNames() {
  const names = new Set();

  // 1. Do placar
  if (fs.existsSync(PLACAR)) {
    const p = JSON.parse(fs.readFileSync(PLACAR, 'utf8'));
    (p.jogos || []).forEach(j => { names.add(j.time_casa); names.add(j.time_fora); });
  }

  // 2. De team-logos-data.json
  if (fs.existsSync(EXTRA_LOGOS)) {
    Object.keys(JSON.parse(fs.readFileSync(EXTRA_LOGOS, 'utf8'))).forEach(k => names.add(k));
  }

  // 3. De TEAM_LOGOS em league-mapping.js
  const code = fs.readFileSync(LEAGUE_MAP, 'utf8');
  const urlRe = /^\s+"([^"]+)":\s+"https?:\/\/[^"]+",?\s*$/gm;
  let m;
  while ((m = urlRe.exec(code)) !== null) names.add(m[1]);

  // 4. De TEAM_ALIASES
  const aliasRe = /^\s+"([^"]+)":\s+"([^"]+)",?\s*$/gm;
  while ((m = aliasRe.exec(code)) !== null) {
    // Only include the aliases section (after the comment)
    if (code.indexOf('ALIASES DE NOMES') > 0) {
      names.add(m[1]);
      names.add(m[2]);
    }
  }

  return [...names].sort();
}

// Fazer requisição HTTPS
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (BetLocal/1.0)' },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('timeout')); });
  });
}

// Buscar logo no TheSportsDB
async function fetchFromTheSportsDB(teamName) {
  const encoded = encodeURIComponent(teamName);
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encoded}`;
  
  try {
    const { status, data } = await httpsGet(url);
    if (status !== 200) return null;
    
    const parsed = JSON.parse(data);
    const teams = parsed.teams || [];
    if (teams.length > 0) {
      const team = teams[0];
      const badge = team.strBadge || team.strTeamLogo || team.strTeamBadge;
      if (badge && badge.startsWith('http')) return badge;
    }
  } catch (e) {
    // Silently fail
  }
  return null;
}

// Buscar logo na Wikipedia via API
async function fetchFromWikipedia(teamName) {
  // Try Portuguese Wikipedia first (since most teams are known in PT)
  const wikiLangs = ['pt', 'en'];
  
  for (const lang of wikiLangs) {
    // Search for the team
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(teamName + ' football club')}&format=json&srlimit=1`;
    try {
      const { status, data } = await httpsGet(searchUrl);
      if (status !== 200) continue;
      
      const parsed = JSON.parse(data);
      const pages = parsed.query?.search;
      if (!pages || pages.length === 0) continue;
      
      const title = encodeURIComponent(pages[0].title);
      
      // Get page image
      const imgUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&pithumbsize=120&format=json`;
      const { status: imgStatus, data: imgData } = await httpsGet(imgUrl);
      if (imgStatus !== 200) continue;
      
      const imgParsed = JSON.parse(imgData);
      const pages2 = imgParsed.query?.pages;
      if (!pages2) continue;
      
      const pageId = Object.keys(pages2)[0];
      if (pageId === '-1') continue;
      
      const thumbnail = pages2[pageId]?.thumbnail?.source;
      if (thumbnail) return thumbnail;
    } catch (e) {
      // Continue to next language
    }
  }
  return null;
}

// Buscar logo com fallback: TheSportsDB -> Wikipedia
async function fetchLogo(teamName) {
  // 1. Try TheSportsDB
  const sportsdb = await fetchFromTheSportsDB(teamName);
  if (sportsdb) return { source: 'thesportsdb', url: sportsdb };
  
  // 2. Try Wikipedia
  const wiki = await fetchFromWikipedia(teamName);
  if (wiki) return { source: 'wikipedia', url: wiki };
  
  return null;
}

// Processar times em lotes
async function processAllTeams(teams) {
  // Carregar resultados existentes (se houver)
  let results = {};
  if (fs.existsSync(OUTPUT)) {
    try { results = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); } catch(e) {}
  }
  
  // Filtrar apenas times que ainda não foram resolvidos
  const pending = teams.filter(t => !results[t] || !results[t].url);
  console.log(`Total: ${teams.length} | Já resolvidos: ${teams.length - pending.length} | Pendentes: ${pending.length}`);
  
  if (pending.length === 0) {
    console.log('Nada a fazer.');
    return results;
  }
  
  let completed = 0;
  let found = 0;
  
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (team) => {
      const logo = await fetchLogo(team);
      if (logo) {
        results[team] = logo;
        found++;
        console.log(`  [OK] ${team} -> ${logo.source}`);
      } else {
        results[team] = null;
        console.log(`  [--] ${team} -> nada`);
      }
      completed++;
    });
    
    await Promise.all(promises);
    
    // Salvar a cada lote
    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2), 'utf8');
    
    // Delay entre lotes
    if (i + BATCH_SIZE < pending.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }
  
  console.log(`\nFinalizado: ${found}/${pending.length} encontrados`);
  return results;
}

// ----- MAIN -----
async function main() {
  console.log('=== Buscador de Logos (TheSportsDB + Wikipedia) ===\n');
  
  const teams = extractTeamNames();
  console.log(`Total de times únicos: ${teams.length}\n`);
  
  const results = await processAllTeams(teams);
  
  // Estatísticas
  const found = Object.entries(results).filter(([k, v]) => v !== null && v !== undefined && v.url);
  const notFound = Object.entries(results).filter(([k, v]) => v === null || v === undefined);
  
  console.log(`\n=== RESUMO ===`);
  console.log(`Total: ${teams.length}`);
  console.log(`Com logo: ${found.length}`);
  console.log(`Sem logo: ${notFound.length}`);
  console.log(`\nSalvo em: ${OUTPUT}`);
}

main().catch(console.error);
