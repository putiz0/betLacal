const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TOR_PROXY = process.env.TOR_PROXY || 'socks5://127.0.0.1:9050';
const OUTPUT_FILE = path.join(__dirname, 'api', 'estatisticas.json');
const GAMES_FILE = path.join(__dirname, 'api', 'placar-jogos.json');
const DATA_TTL_HOURS = 6;

function log(level, msg) {
  const ts = new Date().toISOString();
  const prefix = { INFO: '[INFO]', WARN: '[WARN]', ERROR: '[ERROR]' }[level] || '[INFO]';
  console.log(`${ts} ${prefix} ${msg}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const BROWSER_ARGS = ['--disable-blink-features=AutomationControlled'];
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

async function createPage(browser) {
  const ctx = await browser.newContext({ userAgent: BROWSER_UA });
  const page = await ctx.newPage();
  await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  return page;
}

const SOCCERSTATS_LEAGUES = {
  'brazil': { name: 'Campeonato Brasileiro Serie A' },
  'brazil2': { name: 'Campeonato Brasileiro Serie B' },
  'brazil3': { name: 'Campeonato Brasileiro Serie C' },
  'england': { name: 'Premier League' },
  'spain': { name: 'La Liga' },
  'italy': { name: 'Serie A Italy' },
  'germany': { name: 'Bundesliga' },
  'france': { name: 'Ligue 1' },
  'portugal': { name: 'Primeira Liga' },
  'netherlands': { name: 'Eredivisie' },
};

const LEAGUE_MATCH = {};
for (const [key, info] of Object.entries(SOCCERSTATS_LEAGUES)) {
  const n = info.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-–—]/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  LEAGUE_MATCH[n] = key;
  for (const alias of [info.name, ...info.name.split(' ').slice(0, 3).join(' ')]) {
    const an = alias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-–—]/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    if (an.length > 3) LEAGUE_MATCH[an] = key;
  }
}

function findLeague(raw) {
  if (!raw) return null;
  const n = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-–—]/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  for (const [pattern, key] of Object.entries(LEAGUE_MATCH)) {
    if (n.includes(pattern) || pattern.includes(n)) return key;
  }
  if (n.includes('serie a') || n.includes('serie a')) return 'brazil';
  if (n.includes('serie b')) return 'brazil2';
  if (n.includes('serie c')) return 'brazil3';
  return null;
}

function normalizeTeam(name) {
  const map = [
    ['Athletico PR', 'Athletico PR', 'Athletico Paranaense', 'CA Paranaense'],
    ['Bragantino', 'Red Bull Bragantino', 'RB Bragantino', 'CA Bragantino'],
    ['Flamengo', 'CR Flamengo', 'Flamengo RJ'],
    ['Corinthians', 'Corinthians Paulista', 'SC Corinthians'],
    ['Palmeiras', 'SE Palmeiras'],
    ['Sao Paulo', 'São Paulo', 'SPFC', 'São Paulo FC'],
    ['Santos', 'Santos FC', 'Santos SP'],
    ['Vasco', 'Vasco da Gama', 'CR Vasco'],
    ['Fluminense', 'Fluminense FC', 'Fluminense RJ'],
    ['Botafogo', 'Botafogo RJ', 'Botafogo FR'],
    ['Gremio', 'Grêmio', 'Grêmio FBPA'],
    ['Internacional', 'SC Internacional', 'Internacional RS'],
    ['Cruzeiro', 'Cruzeiro EC', 'Cruzeiro MG'],
    ['Atletico MG', 'Atlético Mineiro', 'Atletico Mineiro', 'CA Mineiro'],
    ['Atletico GO', 'Atlético Goianiense'],
    ['Bahia', 'EC Bahia', 'Bahia BA'],
    ['Fortaleza', 'Fortaleza EC', 'Fortaleza CE'],
    ['Ceara', 'Ceará', 'Ceará SC'],
    ['Sport', 'Sport Recife'],
    ['Coritiba', 'Coritiba FBC'],
    ['Goias', 'Goiás', 'Goiás EC'],
    ['America MG', 'América Mineiro', 'America Mineiro'],
    ['Vitoria', 'Vitória', 'EC Vitória'],
    ['Juventude', 'EC Juventude'],
    ['Cuiaba', 'Cuiabá', 'Cuiabá EC'],
    ['Chapecoense', 'Chapecoense AF'],
    ['Avai', 'Avaí', 'Avaí FC'],
    ['Londrina', 'Londrina EC'],
    ['CRB', 'CRB AL', 'CRB Maceio'],
    ['Ponte Preta', 'AA Ponte Preta'],
    ['Guarani', 'Guarani FC', 'Guarani SP'],
    ['Mirassol', 'Mirassol FC', 'Mirassol SP'],
    ['Novorizontino', 'Novorizontino SP'],
    ['Ituano', 'Ituano FC', 'Ituano SP'],
    ['Vila Nova', 'Vila Nova FC', 'Vila Nova GO'],
    ['ABC', 'ABC FC', 'ABC RN'],
    ['Remo', 'Remo PA', 'Clube do Remo'],
    ['Paysandu', 'Paysandu SC', 'Paysandu PA'],
    ['Nautico', 'Náutico', 'Nautico PE'],
    ['Sampaio Correa', 'Sampaio Corrêa'],
    ['Botafogo SP', 'Botafogo SP FC'],
    ['Botafogo PB', 'Botafogo PB FC'],
    ['Tombense', 'Tombense FC', 'Tombense MG'],
    ['Brusque', 'Brusque FC', 'Brusque SC'],
    ['Criciuma', 'Criciúma', 'Criciúma EC'],
    ['Operario', 'Operário PR'],
  ];
  const n = (name || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  if (!n) return name;
  for (const group of map) {
    for (const alias of group) {
      const a = alias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      if (n === a) return group[0];
    }
  }
  return name;
}

async function scrapeSoccerStats(browser, leagueCode) {
  const stats = {};

  async function scrapeTable(url, extractor) {
    const page = await createPage(browser);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(2000);
      const data = await page.evaluate(extractor);
      return data || {};
    } catch (e) {
      log('WARN', `soccerstats ${url} error: ${e.message}`);
      return {};
    } finally {
      await page.close();
    }
  }

  const mainData = await scrapeTable(
    `https://www.soccerstats.com/latest.asp?league=${leagueCode}`,
    () => {
      const tables = document.querySelectorAll('table[id="btable"]');
      let leagueTable = null;
      for (const t of tables) {
        const txt = t.textContent || '';
        if (txt.includes('GP') && (txt.includes('GF') || txt.includes('GA')) && txt.includes('Pts')) {
          leagueTable = t;
          break;
        }
      }
      if (!leagueTable) return null;
      const rows = leagueTable.querySelectorAll('tr');
      const results = {};
      let foundHeader = false;
      rows.forEach(row => {
        const a = row.querySelector('a');
        if (!a) return;
        const cells = row.querySelectorAll('td');
        if (cells.length < 8) return;
        const txt = row.textContent || '';
        if (txt.includes('GP') && txt.includes('GF')) { foundHeader = true; return; }
        const name = a.textContent.trim();
        if (!name || name.length <= 2 || name === 'stats') return;
        const vals = [];
        cells.forEach(c => {
          const v = parseInt(c.textContent.trim());
          if (!isNaN(v)) vals.push(v);
        });
        if (vals.length < 5) return;
        const gp = vals[0];
        const gf = vals[3];
        const ga = vals[4];
        if (!gp || gp < 1) return;
        results[name] = { mp: gp, gf, ga, avg_gf: gf / gp, avg_ga: ga / gp };
      });
      return results;
    }
  );

  const cornerData = await scrapeTable(
    `https://www.soccerstats.com/table.asp?league=${leagueCode}&tid=cr`,
    () => {
      const tables = document.querySelectorAll('table[id="btable"]');
      let crTable = tables[0];
      for (const t of tables) {
        const txt = t.textContent || '';
        if (txt.includes('Corner') && txt.includes('Total corners')) { crTable = t; break; }
      }
      if (!crTable) return null;
      const rows = crTable.querySelectorAll('tr');
      const results = {};
      rows.forEach(row => {
        const a = row.querySelector('a');
        if (!a) return;
        const name = a.textContent.trim();
        if (!name || name.length <= 2) return;
        const cells = row.querySelectorAll('td');
        if (cells.length < 9) return;
        results[name] = {
          corners_for_avg: parseFloat(cells[2]?.textContent) || 0,
          corners_against_avg: parseFloat(cells[3]?.textContent) || 0,
          corners_total_avg: parseFloat(cells[5]?.textContent) || 0
        };
      });
      return results;
    }
  );

  const ouData = await scrapeTable(
    `https://www.soccerstats.com/table.asp?league=${leagueCode}&tid=c`,
    () => {
      const tables = document.querySelectorAll('table[id="btable"]');
      let ouTable = tables[0];
      for (const t of tables) {
        const txt = t.textContent || '';
        if (txt.includes('Over') && txt.includes('BTTS')) { ouTable = t; break; }
      }
      if (!ouTable) return null;
      const rows = ouTable.querySelectorAll('tr');
      const results = {};
      rows.forEach(row => {
        const a = row.querySelector('a');
        if (!a) return;
        const name = a.textContent.trim();
        if (!name || name.length <= 2) return;
        const cells = row.querySelectorAll('td');
        if (cells.length < 10) return;
        results[name] = {
          over15_pct: parseInt(cells[4]?.textContent) || 0,
          over25_pct: parseInt(cells[5]?.textContent) || 0,
          over35_pct: parseInt(cells[6]?.textContent) || 0,
          btts_pct: parseInt(cells[9]?.textContent) || 0
        };
      });
      return results;
    }
  );

  const merged = {};
  const allTeams = new Set([...Object.keys(mainData), ...Object.keys(cornerData), ...Object.keys(ouData)]);
  for (const team of allTeams) {
    merged[team] = { ...(mainData[team] || {}), ...(cornerData[team] || {}), ...(ouData[team] || {}) };
  }

  return merged;
}

function matchTeams(stats, placarTeams) {
  const matched = {};
  for (const [placarName] of Object.entries(placarTeams)) {
    const pn = normalizeTeam(placarName);
    if (!pn) continue;
    const pnClean = pn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    for (const [statName, data] of Object.entries(stats)) {
      const sn = statName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      if (pnClean === sn || sn.includes(pnClean) || pnClean.includes(sn)) {
        matched[placarName] = data;
        break;
      }
    }
  }
  return matched;
}

function loadExisting() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      const data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      if (data._scrapedAt) {
        const age = (Date.now() - new Date(data._scrapedAt).getTime()) / (1000 * 60 * 60);
        if (age < DATA_TTL_HOURS) return data;
      }
    }
  } catch (e) {}
  return null;
}

function loadTeams() {
  try {
    const data = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf-8'));
    const teams = {};
    for (const j of (data.jogos || [])) {
      const liga = (j.campeonato || j.liga || j.league || '').trim();
      const home = (j.time_casa || j.home || '').trim();
      const away = (j.time_fora || j.away || '').trim();
      if (home) teams[home] = liga;
      if (away) teams[away] = liga;
    }
    return teams;
  } catch (e) {
    return {};
  }
}

async function main() {
  log('INFO', '=== scraper de estatisticas ===');

  const cached = loadExisting();
  if (cached) { log('INFO', 'Usando cache'); return cached; }

  const teamMap = loadTeams();
  if (!Object.keys(teamMap).length) { log('WARN', 'Sem times'); return {}; }

  log('INFO', `Times: ${Object.keys(teamMap).length}`);

  const browser = await chromium.launch({ headless: true, args: BROWSER_ARGS });

  try {
    const leagueCodes = new Set();
    const teamByLeague = {};
    for (const [team, liga] of Object.entries(teamMap)) {
      const code = findLeague(liga);
      if (code) {
        leagueCodes.add(code);
        if (!teamByLeague[code]) teamByLeague[code] = [];
        teamByLeague[code].push(team);
      }
    }

    log('INFO', `Ligas: ${Array.from(leagueCodes).join(', ')}`);

    const allStats = {};
    for (const code of leagueCodes) {
      log('INFO', `Scraping ${code}...`);
      const leagueStats = await scrapeSoccerStats(browser, code);
      const subset = {};
      for (const t of (teamByLeague[code] || [])) subset[t] = teamMap[t];
      const matched = matchTeams(leagueStats, subset);
      for (const [team, data] of Object.entries(matched)) {
        allStats[team] = { ...data, liga: teamMap[team], stats_source: 'soccerstats' };
      }
      log('INFO', `${code}: ${Object.keys(matched).length} times`);
      await sleep(2000);
    }

    log('INFO', `Total com stats: ${Object.keys(allStats).length}`);

    if (Object.keys(allStats).length > 0) {
      const output = { _scrapedAt: new Date().toISOString(), times: allStats };
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
    }

    return allStats;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(e => { log('ERROR', `Fatal: ${e.message}`); process.exit(1); });
}

module.exports = { main, loadTeams, findLeague };
