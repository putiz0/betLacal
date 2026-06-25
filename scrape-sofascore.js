const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TOR_PROXY = process.env.TOR_PROXY || 'socks5://127.0.0.1:9050';
const OUTPUT = path.join(__dirname, 'api', 'estatisticas.json');
const PLACAR = path.join(__dirname, 'api', 'placar-jogos.json');

function log(level, msg) {
  const ts = new Date().toISOString();
  console.log(`${ts} [${level}] ${msg}`);
}

const LEAGUE_CONFIG = {
  'Copa do Mundo':              { id: 16,   cat: 'world', slug: 'world-championship' },
  'Copa do Mundo Feminina':     { id: 16,   cat: 'world', slug: 'world-championship' },
  'Copa do Mundo Sub-20':       { id: 16,   cat: 'world', slug: 'world-championship' },
  'Campeonato Brasileiro Serie A':  { id: 325,  cat: 'brazil', slug: 'brasileirao-serie-a' },
  'Campeonato Brasileiro Serie B':  { id: 390,  cat: 'brazil', slug: 'brasileirao-serie-b' },
  'Campeonato Brasileiro Serie C':  { id: 1281, cat: 'brazil', slug: 'brasileirao-serie-c' },
  'Campeonato Brasileiro Serie D':  { id: 1281, cat: 'brazil', slug: 'brasileirao-serie-c' },
  'Campeonato Paulista':        { id: 372,  cat: 'brazil', slug: 'paulista-serie-a1' },
  'Campeonato Paulista Sub-20': { id: 372,  cat: 'brazil', slug: 'paulista-serie-a1' },
  'Campeonato Carioca':         { id: 92,   cat: 'brazil', slug: 'carioca' },
  'Campeonato Carioca A2':      { id: 18644, cat: 'brazil', slug: 'carioca-serie-a2' },
  'Campeonato Mineiro':         { id: 379,  cat: 'brazil', slug: 'mineiro-modulo-i' },
  'Campeonato Mineiro - Modulo 2': { id: 20069, cat: 'brazil', slug: 'mineiro-modulo-ii' },
  'Campeonato Gaucho':          { id: 377,  cat: 'brazil', slug: 'gaucho' },
  'Campeonato Gaucho Sub-20':   { id: 377,  cat: 'brazil', slug: 'gaucho' },
  'Campeonato Catarinense':     { id: 376,  cat: 'brazil', slug: 'catarinense' },
  'Campeonato Catarinense Sub-20': { id: 376, cat: 'brazil', slug: 'catarinense' },
  'Campeonato Catarinense Sub-20': { id: 376, cat: 'brazil', slug: 'catarinense' },
  'Campeonato Catarinense - Segunda Divisao': { id: 20070, cat: 'brazil', slug: 'catarinense-serie-b' },
  'Campeonato Mineiro - Modulo 2': { id: 20069, cat: 'brazil', slug: 'mineiro-modulo-ii' },
  'Copa do Brasil':             { id: 373,  cat: 'brazil', slug: 'copa-do-brasil' },
  'Copa do Nordeste':           { id: 1596, cat: 'brazil', slug: 'copa-do-nordeste' },
  'Campeonato Brasileiro - Sub-20': { id: 9233, cat: 'brazil', slug: 'u20-campeonato-brasileiro' },
  'Campeonato Brasileiro Sub-20': { id: 9233, cat: 'brazil', slug: 'u20-campeonato-brasileiro' },
  'Campeonato Maranhense':      { id: 11664, cat: 'brazil', slug: 'maranhense' },
  'Campeonato Maranhense - Segunda Divisao': { id: 20891, cat: 'brazil', slug: 'maranhense-serie-b' },
  'Copa Chile':                 { id: 1221, cat: 'chile', slug: 'copa-chile' },
  'Copa Rio':                   { id: 20547, cat: 'brazil', slug: 'copa-rio' },
  'Campeonato Espanhol':        { id: 8,    cat: 'spain', slug: 'laliga' },
  'Campeonato Ingles':          { id: 17,   cat: 'england', slug: 'premier-league' },
  'Campeonato Italiano':        { id: 23,   cat: 'italy', slug: 'serie-a' },
  'Campeonato Alemao':          { id: 35,   cat: 'germany', slug: 'bundesliga' },
  'Campeonato Frances':         { id: 34,   cat: 'france', slug: 'ligue-1' },
  'Champions League':           { id: 7,    cat: 'europe', slug: 'uefa-champions-league' },
  'Europa League':              { id: 73,   cat: 'europe', slug: 'uefa-europa-league' },
  'Conference League':          { id: 1153, cat: 'europe', slug: 'uefa-europa-conference-league' },
  'Libertadores':               { id: 80,   cat: 'south-america', slug: 'copa-libertadores' },
  'Copa Sudamericana':          { id: 567,  cat: 'south-america', slug: 'copa-sudamericana' },
};

const PT_TO_EN = {
  'Brasil': 'Brazil',
  'Suica': 'Switzerland',
  'Canada': 'Canada',
  'Bosnia e Herzegovina': 'Bosnia & Herzegovina',
  'Qatar': 'Qatar',
  'Escocia': 'Scotland',
  'Marrocos': 'Morocco',
  'Haiti': 'Haiti',
  'Africa do Sul': 'South Africa',
  'Coreia do Sul': 'South Korea',
  'Republica Tcheca': 'Czechia',
  'Mexico': 'Mexico',
  'Alemanha': 'Germany',
  'Inglaterra': 'England',
  'Espanha': 'Spain',
  'Franca': 'France',
  'Portugal': 'Portugal',
  'Holanda': 'Netherlands',
  'Paises Baixos': 'Netherlands',
  'Italia': 'Italy',
  'Argentina': 'Argentina',
  'Uruguai': 'Uruguay',
  'Colombia': 'Colombia',
  'Belgica': 'Belgium',
  'Croacia': 'Croatia',
  'Servia': 'Serbia',
  'Polonia': 'Poland',
  'Dinamarca': 'Denmark',
  'Suecia': 'Sweden',
  'Noruega': 'Norway',
  'Austria': 'Austria',
  'Japao': 'Japan',
  'Arabia Saudita': 'Saudi Arabia',
  'Ira': 'Iran',
  'Australia': 'Australia',
  'EUA': 'USA',
  'Estados Unidos': 'USA',
  'Costa Rica': 'Costa Rica',
  'Jamaica': 'Jamaica',
  'Panama': 'Panama',
  'Egito': 'Egypt',
  'Nigeria': 'Nigeria',
  'Camaroes': 'Cameroon',
  'Senegal': 'Senegal',
  'Gana': 'Ghana',
  'Costa do Marfim': "Cote d'Ivoire",
  'Tunisia': 'Tunisia',
  'Argentina': 'Argentina',
  'RD Congo': 'DR Congo',
  'Republica Democratica do Congo': 'DR Congo',
  'Cabo Verde': 'Cabo Verde',
  'Peru': 'Peru',
  'Equador': 'Ecuador',
  'Paraguai': 'Paraguay',
  'Chile': 'Chile',
  'Bolivia': 'Bolivia',
  'Venezuela': 'Venezuela',
  'Nova Zelandia': 'New Zealand',
  'Turquia': 'Turkiye',
  'Uzbequistao': 'Uzbekistan',
  'Iraque': 'Iraq',
  'Jordania': 'Jordan',
  'Curacao': 'Curacao',
  'Universidad Chile': 'Universidad de Chile',
};

const NORM_PT_TO_EN = {};
for (const [pt, en] of Object.entries(PT_TO_EN)) {
  NORM_PT_TO_EN[normalizeForMatch(pt)] = en;
}
const NORM_EN_TO_PT = {};
for (const [pt, en] of Object.entries(PT_TO_EN)) {
  NORM_EN_TO_PT[normalizeForMatch(en)] = pt;
}

function stripAccents(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeForMatch(s) {
  return stripAccents(s)
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestMatch(placarName, sofascoreNames) {
  var nPlacar = normalizeForMatch(placarName)
    .replace(/sub[\s-]*(\d+)/g, 'u$1');;

  for (const sn of sofascoreNames) {
    if (normalizeForMatch(sn) === nPlacar) {
      return sn;
    }
  }

  const enName = NORM_PT_TO_EN[nPlacar];
  if (enName) {
    const nEn = normalizeForMatch(enName);
    for (const sn of sofascoreNames) {
      if (normalizeForMatch(sn) === nEn) {
        return sn;
      }
    }
  }

  const sorted = [...sofascoreNames].sort((a, b) => b.length - a.length);
  for (const sn of sorted) {
    const ns = normalizeForMatch(sn);
    if (ns.includes(nPlacar) || nPlacar.includes(ns)) {
      return sn;
    }
  }

  const nWords = nPlacar.split(' ').filter(w => w.length > 1);
  if (nWords.length > 1) {
    for (const sn of sorted) {
      const sWords = normalizeForMatch(sn).split(' ').filter(w => w.length > 1);
      const matches = nWords.filter(w => sWords.includes(w));
      const nonMatches = nWords.filter(w => !sWords.includes(w));
      const threshold = nWords.length <= 3 ? nWords.length - 1 : Math.ceil(nWords.length * 0.7);
      if (matches.length >= threshold && nonMatches.length <= 1) {
        return sn;
      }
    }
  }

  return null;
}

function extractTeamNames(placarGames, leagueName) {
  const names = new Set();
  for (const g of placarGames) {
    if (g.campeonato === leagueName) {
      names.add(g.time_casa);
      names.add(g.time_fora);
    }
  }
  return [...names];
}

async function fetchLeagueStats(page, config) {
  const url = `https://www.sofascore.com/football/tournament/${config.cat}/${config.slug}/${config.id}`;
  log('INFO', `Acessando ${url}`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    const data = await page.evaluate(() => {
      const el = document.getElementById('__NEXT_DATA__');
      if (!el) return null;
      return JSON.parse(el.textContent);
    });

    if (!data) {
      log('WARN', 'Sem __NEXT_DATA__ encontrado');
      return null;
    }

    const pp = data.props?.pageProps;
    if (!pp || !pp.standings) {
      log('WARN', 'Sem standings no pageProps');
      return null;
    }

    const stds = pp.standings;
    const teams = {};

    for (const group of stds) {
      const rows = group.rows || [];
      for (const row of rows) {
        if (row.team && row.team.name) {
          const name = row.team.name;
          const mp = row.matches || 0;
          const gf = row.scoresFor || 0;
          const ga = row.scoresAgainst || 0;

          if (mp > 0) {
            teams[name] = {
              avg_gf: Math.round((gf / mp) * 100) / 100,
              avg_ga: Math.round((ga / mp) * 100) / 100,
              avg_crdy: 2.0,
              avg_crdr: 0.08,
              possession: 50,
              mp,
              gf,
              ga,
            };
          }
        }
      }
    }

    log('INFO', `  Times encontrados: ${Object.keys(teams).length}`);
    return teams;
  } catch (err) {
    log('ERROR', `  Erro ao acessar ${url}: ${err.message}`);
    return null;
  }
}

async function main() {
  log('INFO', '=== Sofascore Stat Scraper ===');
  log('INFO', `Tor proxy: ${TOR_PROXY}`);

  let placarData;
  try {
    placarData = JSON.parse(fs.readFileSync(PLACAR, 'utf-8'));
  } catch (err) {
    log('ERROR', `Erro ao ler ${PLACAR}: ${err.message}`);
    process.exit(1);
  }

  const placarGames = placarData.jogos || [];
  if (placarGames.length === 0) {
    log('WARN', 'Nenhum jogo no placar.');
  }

  const leagues = [...new Set(placarGames.map(g => g.campeonato))];
  log('INFO', `Ligas no placar: ${leagues.join(', ')}`);

  const existingStats = {};
  try {
    const existing = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
    if (existing.times) {
      Object.assign(existingStats, existing.times);
    }
  } catch (err) {
    log('INFO', 'Nenhum estatisticas.json existente.');
  }

  const browser = await chromium.launch({
    headless: true,
    proxy: { server: TOR_PROXY },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const allStats = { ...existingStats };

  const normConfig = {};
  for (const [k, v] of Object.entries(LEAGUE_CONFIG)) {
    const nk = stripAccents(k).replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();
    normConfig[nk] = v;
  }

  for (const league of leagues) {
    const normalizedLeague = stripAccents(league)
      .replace(/[-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const config = normConfig[normalizedLeague] || LEAGUE_CONFIG[league];
    if (!config) {
      log('INFO', `Liga "${league}" nao mapeada. Usando stats existentes.`);
      continue;
    }

    const placarTeams = extractTeamNames(placarGames, league);
    log('INFO', `Processando "${league}" (${placarTeams.length} times)`);

    const sofascoreTeams = await fetchLeagueStats(page, config);
    if (!sofascoreTeams) {
      log('WARN', `  Falha ao obter stats para "${league}"`);
      continue;
    }

    const sofaNames = Object.keys(sofascoreTeams);
    let matched = 0;

    for (const ptName of placarTeams) {
      if (allStats[ptName]) {
        matched++;
        continue;
      }

      const nPtName = normalizeForMatch(ptName);
      let sofaName = null;

      if (NORM_PT_TO_EN[nPtName]) {
        const enName = NORM_PT_TO_EN[nPtName];
        for (const sn of sofaNames) {
          if (normalizeForMatch(sn) === normalizeForMatch(enName)) {
            sofaName = sn;
            break;
          }
        }
      }

      if (!sofaName) {
        sofaName = findBestMatch(ptName, sofaNames);
      }

      if (sofaName && sofascoreTeams[sofaName]) {
        allStats[ptName] = sofascoreTeams[sofaName];
        matched++;
        log('DEBUG', `  Mapeado: "${ptName}" -> Sofascore "${sofaName}"`);
      } else {
        log('DEBUG', `  Sem match: "${ptName}" (Sofascore tem: ${sofaNames.slice(0,5).join(', ')})`);
      }
    }

    for (const [sn, stats] of Object.entries(sofascoreTeams)) {
      if (!allStats[sn]) {
        allStats[sn] = stats;
        const nSn = normalizeForMatch(sn);
        if (NORM_EN_TO_PT[nSn]) {
          allStats[NORM_EN_TO_PT[nSn]] = stats;
        }
      }
    }

    log('INFO', `  Match: ${matched}/${placarTeams.length} times`);
  }

  await browser.close();

  const output = {
    _scrapedAt: new Date().toISOString(),
    times: allStats,
  };

  const dir = path.dirname(OUTPUT);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  log('INFO', `Stats salvos: ${Object.keys(allStats).length} times em ${OUTPUT}`);
}

main().catch(err => {
  log('ERROR', `Fatal: ${err.message}`);
  process.exit(1);
});
