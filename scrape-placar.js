const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');
const OddsCalc = require('./js/odds-calc.js');

const TOR_PROXY = process.env.TOR_PROXY;
const BROWSER_ARGS = ['--disable-blink-features=AutomationControlled'];
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

let ESTATISTICAS = {};

function log(level, msg) {
  const ts = new Date().toISOString();
  const prefix = { INFO: '[INFO]', WARN: '[WARN]', ERROR: '[ERROR]', DEBUG: '[DEBUG]' }[level] || '[INFO]';
  console.log(`${ts} ${prefix} ${msg}`);
}

const LOCK_FILE = path.join(__dirname, '.placar_scrape_lock');
const OUTPUT_FILE = path.join(__dirname, 'api', 'placar-jogos.json');
const LOGOS_FILE = path.join(__dirname, 'js', 'team-logos-data.json');
const MAX_RUNS_PER_DAY = 2;
const MIN_HOURS_BETWEEN_RUNS = 10;

const LEAGUE_CLEANUPS = {
  'MAIS POPULARES AGORA': null,
  'Copa do Mundo': 'Copa do Mundo',
  'Copa do Mundo Feminina': 'Copa do Mundo Feminina',
  'Copa do Mundo Sub-20': 'Copa do Mundo Sub-20',
  'Mundial de Clubes': 'Mundial de Clubes',
  'Libertadores': 'Libertadores',
  'Copa Libertadores': 'Libertadores',
  'Copa Sul-Americana': 'Copa Sul-Americana',
  'Sul-Americana': 'Copa Sul-Americana',
  'Champions League': 'Champions League',
  'Europa League': 'Europa League',
  'Conference League': 'Conference League',
  'Recopa Sul-Americana': 'Recopa Sul-Americana',
  'Campeonato Brasileiro Série A': 'Campeonato Brasileiro Serie A',
  'Brasileirão Série A': 'Campeonato Brasileiro Serie A',
  'Brasileirão Serie A': 'Campeonato Brasileiro Serie A',
  'Campeonato Brasileiro Serie A': 'Campeonato Brasileiro Serie A',
  'Campeonato Brasileiro Série B': 'Campeonato Brasileiro Serie B',
  'Brasileirão Série B': 'Campeonato Brasileiro Serie B',
  'Campeonato Brasileiro Serie B': 'Campeonato Brasileiro Serie B',
  'Brasileirão Série C': 'Campeonato Brasileiro Serie C',
  'Campeonato Brasileiro Serie C': 'Campeonato Brasileiro Serie C',
  'Brasileirão Série D': 'Campeonato Brasileiro Serie D',
  'Campeonato Brasileiro Serie D': 'Campeonato Brasileiro Serie D',
  'Copa do Brasil': 'Copa do Brasil',
  'Copa do Nordeste': 'Copa do Nordeste',
  'Copa Verde': 'Copa Verde',
  'Supercopa do Brasil': 'Supercopa do Brasil',
  'Campeonato Paulista': 'Campeonato Paulista',
  'Paulista': 'Campeonato Paulista',
  'Campeonato Carioca': 'Campeonato Carioca',
  'Carioca': 'Campeonato Carioca',
  'Campeonato Mineiro': 'Campeonato Mineiro',
  'Mineiro': 'Campeonato Mineiro',
  'Campeonato Gaúcho': 'Campeonato Gaúcho',
  'Gaúcho': 'Campeonato Gaúcho',
  'Campeonato Paranaense': 'Campeonato Paranaense',
  'Paranaense': 'Campeonato Paranaense',
  'Campeonato Baiano': 'Campeonato Baiano',
  'Baiano': 'Campeonato Baiano',
  'Campeonato Pernambucano': 'Campeonato Pernambucano',
  'Pernambucano': 'Campeonato Pernambucano',
  'Campeonato Cearense': 'Campeonato Cearense',
  'Cearense': 'Campeonato Cearense',
  'Campeonato Goiano': 'Campeonato Goiano',
  'Goiano': 'Campeonato Goiano',
  'Campeonato Potiguar': 'Campeonato Potiguar',
  'Campeonato Sergipano': 'Campeonato Sergipano',
  'Campeonato Alagoano': 'Campeonato Alagoano',
  'Campeonato Paraibano': 'Campeonato Paraibano',
  'Campeonato Maranhense': 'Campeonato Maranhense',
  'Campeonato Piauiense': 'Campeonato Piauiense',
  'Campeonato Catarinense': 'Campeonato Catarinense',
  'Catarinense': 'Campeonato Catarinense',
  'Campeonato Capixaba': 'Campeonato Capixaba',
  'Campeonato Mato-Grossense': 'Campeonato Mato-Grossense',
  'Campeonato Sul-Mato-Grossense': 'Campeonato Sul-Mato-Grossense',
  'Campeonato Paraense': 'Campeonato Paraense',
  'Campeonato Amazonense': 'Campeonato Amazonense',
  'Campeonato Rondoniense': 'Campeonato Rondoniense',
  'Campeonato Acreano': 'Campeonato Acreano',
  'Campeonato Tocantinense': 'Campeonato Tocantinense',
  'Campeonato Baiano - Segunda Divisão': 'Campeonato Baiano Segunda Divisao',
  'Campeonato Candango Sub-20': 'Campeonato Candango Sub-20',
  'Campeonato Cearense Sub-20': 'Campeonato Cearense Sub-20',
  'Campeonato Cearense Sub-17': 'Campeonato Cearense Sub-17',
  'Campeonato Paulista Sub-20': 'Campeonato Paulista Sub-20',
  'Campeonato Carioca Sub-20': 'Campeonato Carioca Sub-20',
  'Campeonato Mineiro Sub-20': 'Campeonato Mineiro Sub-20',
  'Campeonato Gaúcho Sub-20': 'Campeonato Gaucho Sub-20',
  'Campeonato Paranaense Sub-20': 'Campeonato Paranaense Sub-20',
  'Campeonato Brasiliense': 'Campeonato Brasiliense',
  'Brasiliense': 'Campeonato Brasiliense',
  'Jogos Amistosos': 'Amistosos',
  'Amistosos': 'Amistosos',
  'La Liga': 'Campeonato Espanhol',
  'Campeonato Espanhol': 'Campeonato Espanhol',
  'Premier League': 'Campeonato Ingles',
  'Campeonato Inglês': 'Campeonato Ingles',
  'Serie A': 'Campeonato Italiano',
  'Campeonato Italiano': 'Campeonato Italiano',
  'Bundesliga': 'Campeonato Alemao',
  'Campeonato Alemão': 'Campeonato Alemao',
  'Ligue 1': 'Campeonato Frances',
  'Campeonato Francês': 'Campeonato Frances',
  'Primeira Liga': 'Campeonato Portugues',
  'Campeonato Português': 'Campeonato Portugues',
  'Eredivisie': 'Campeonato Holandes',
  'Liga Argentina': 'Campeonato Argentino',
  'Campeonato Argentino': 'Campeonato Argentino',
  'Liga MX': 'Campeonato Mexicano',
  'Campeonato Mexicano': 'Campeonato Mexicano',
  'Campeonato Chileno': 'Campeonato Chileno',
  'Copa Chile': 'Copa Chile',
  'Campeonato Colombiano': 'Campeonato Colombiano',
  'Campeonato Uruguaio': 'Campeonato Uruguaio',
  'Campeonato Paraguaio': 'Campeonato Paraguaio',
  'Campeonato Peruano': 'Campeonato Peruano',
  'Campeonato Boliviano': 'Campeonato Boliviano',
  'Campeonato Equatoriano': 'Campeonato Equatoriano',
  'Campeonato Venezuelano': 'Campeonato Venezuelano',
  'MLS': 'MLS',
  'Major League Soccer': 'MLS',
  'Liga dos Campeões da AFC': 'AFC Champions League',
  'Liga dos Campeões da CAF': 'CAF Champions League',
  'Campeonato Saudita': 'Campeonato Saudita',
  'Campeonato Chinês': 'Campeonato Chines',
  'J-League': 'Campeonato Japones',
  'Campeonato Japonês': 'Campeonato Japones',
  'K-League': 'Campeonato Coreano',
  'A-League': 'Campeonato Australiano',
};

let TEAM_LOGOS = {};

function loadLogos() {
  try {
    if (fs.existsSync(LOGOS_FILE)) {
      TEAM_LOGOS = JSON.parse(fs.readFileSync(LOGOS_FILE, 'utf-8'));
      log('INFO', `LOGOS: Carregados ${Object.keys(TEAM_LOGOS).length} logos do cache.`);
    }
  } catch (e) {
    log('WARN', `LOGOS: Erro ao carregar cache de logos: ${e.message}`);
  }
}

function saveLogos() {
  try {
    const dir = path.dirname(LOGOS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOGOS_FILE, JSON.stringify(TEAM_LOGOS, null, 2));
    log('INFO', `LOGOS: Cache salvo com ${Object.keys(TEAM_LOGOS).length} logos.`);
  } catch (e) {
    log('WARN', `LOGOS: Erro ao salvar cache: ${e.message}`);
  }
}

function loadStats() {
  try {
    const file = path.join(__dirname, 'api', 'estatisticas.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      ESTATISTICAS = data.times || {};
    }
  } catch (e) {}
}

function stripYouthSuffix(name) {
  return name
    .replace(/\s+(Sub-\d{2}|Sub-\d{1}|Under-\d{2}|B|II|2|Youth)$/i, '')
    .replace(/\s+(SP|RJ|RS|SC|PR|BA|CE|PE|MG|GO|MT|MS|DF|ES|RN|PB|AL|SE|PI|MA|PA|AM|RO|AC|TO|AP|RR)$/i, '')
    .trim();
}

function findLogo(teamName) {
  if (!teamName) return null;

  if (TEAM_LOGOS[teamName]) return TEAM_LOGOS[teamName];

  const stripped = stripYouthSuffix(teamName);
  if (stripped !== teamName && TEAM_LOGOS[stripped]) {
    TEAM_LOGOS[teamName] = TEAM_LOGOS[stripped];
    return TEAM_LOGOS[teamName];
  }

  const aliasMap = {
    'Escócia': 'Scotland',
    'Haiti': 'Haiti',
    'Canadá': 'Canada',
    'Qatar': 'Qatar',
    'Escócia': 'Scotland',
  };

  const alias = aliasMap[teamName];
  if (alias && TEAM_LOGOS[alias]) {
    TEAM_LOGOS[teamName] = TEAM_LOGOS[alias];
    return TEAM_LOGOS[teamName];
  }

  return null;
}

function decimalOdd(seed, base = 1.65) {
  return Math.round((base + ((seed * 37) % 145) / 100) * 100) / 100;
}

const ODD_REDUCTION_FACTOR = 0.8;
const MINIMUM_ODD = 1.01;

function reduceOdd(odd) {
  return Math.max(MINIMUM_ODD, Math.round(odd * ODD_REDUCTION_FACTOR * 100) / 100);
}

function makeSeed(home, away) {
  let hash = 0;
  const str = home + '|' + away;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) || 1;
}

function buildDemoMarkets(home, away) {
  return [
    {
      nome: "Dupla chance",
      descricao: "Aposte em duas possibilidades de resultado ao mesmo tempo.",
      opcoes: [
        { nome: home + " ou Empate", odd: reduceOdd(1.22) },
        { nome: home + " ou " + away, odd: reduceOdd(1.45) },
        { nome: "Empate ou " + away, odd: reduceOdd(1.35) }
      ]
    },
    {
      nome: "Ambas marcam",
      descricao: "Aposte se os dois times irao marcar pelo menos um gol.",
      opcoes: [
        { nome: "Sim", odd: reduceOdd(1.72) },
        { nome: "Nao", odd: reduceOdd(2.05) }
      ]
    },
    {
      nome: "Total de gols",
      descricao: "Aposte no numero total de gols da partida.",
      opcoes: [
        { nome: "Mais de 0.5", odd: reduceOdd(1.08) },
        { nome: "Mais de 1.5", odd: reduceOdd(1.38) },
        { nome: "Mais de 2.5", odd: reduceOdd(1.85) },
        { nome: "Mais de 3.5", odd: reduceOdd(2.65) },
        { nome: "Menos de 2.5", odd: reduceOdd(1.92) },
        { nome: "Menos de 3.5", odd: reduceOdd(1.42) }
      ]
    },
    {
      nome: "Intervalo - Resultado",
      descricao: "Aposte no resultado apenas do primeiro tempo.",
      opcoes: [
        { nome: home, odd: reduceOdd(2.65) },
        { nome: "Empate", odd: reduceOdd(2.15) },
        { nome: away, odd: reduceOdd(2.85) }
      ]
    },
    {
      nome: "Intervalo/Final",
      descricao: "Aposte na combinacao de resultado do 1 tempo e resultado final.",
      opcoes: [
        { nome: home + "/" + home, odd: reduceOdd(3.2) },
        { nome: home + "/" + away, odd: reduceOdd(8.5) },
        { nome: "EMP/EMP", odd: reduceOdd(6.8) },
        { nome: away + "/" + home, odd: reduceOdd(9.2) },
        { nome: away + "/" + away, odd: reduceOdd(3.5) }
      ]
    },
    {
      nome: "Escanteios - Total",
      descricao: "Aposte no total de escanteios da partida.",
      opcoes: [
        { nome: "Mais de 7.5", odd: reduceOdd(1.72) },
        { nome: "Mais de 8.5", odd: reduceOdd(1.86) },
        { nome: "Mais de 9.5", odd: reduceOdd(2.05) },
        { nome: "Menos de 8.5", odd: reduceOdd(1.86) },
        { nome: "Menos de 9.5", odd: reduceOdd(1.72) }
      ]
    },
    {
      nome: "Escanteios - Handicap",
      descricao: "Aposte no handicap de escanteios entre os times.",
      opcoes: [
        { nome: home + " -2.5", odd: reduceOdd(1.92) },
        { nome: away + " +2.5", odd: reduceOdd(1.92) }
      ]
    },
    {
      nome: "Cartoes - Total",
      descricao: "Aposte no numero total de cartoes amarelos e vermelhos.",
      opcoes: [
        { nome: "Mais de 3.5", odd: reduceOdd(1.65) },
        { nome: "Mais de 4.5", odd: reduceOdd(1.82) },
        { nome: "Mais de 5.5", odd: reduceOdd(2.15) },
        { nome: "Menos de 4.5", odd: reduceOdd(1.92) },
        { nome: "Menos de 5.5", odd: reduceOdd(1.68) }
      ]
    },
    {
      nome: "Handicap Asiatico",
      descricao: "Aposte com vantagem ou desvantagem de gols para um time.",
      opcoes: [
        { nome: home + " -0.5", odd: reduceOdd(2.15) },
        { nome: away + " +0.5", odd: reduceOdd(1.72) },
        { nome: home + " -1.0", odd: reduceOdd(2.65) },
        { nome: away + " +1.0", odd: reduceOdd(1.45) }
      ]
    },
    {
      nome: "Placar correto",
      descricao: "Aposte no resultado exato da partida.",
      opcoes: [
        { nome: "1 x 0", odd: reduceOdd(7.5) },
        { nome: "2 x 0", odd: reduceOdd(9.5) },
        { nome: "2 x 1", odd: reduceOdd(8.8) },
        { nome: "1 x 1", odd: reduceOdd(6.2) },
        { nome: "2 x 2", odd: reduceOdd(11.0) },
        { nome: "0 x 0", odd: reduceOdd(8.5) }
      ]
    },
    {
      nome: "Primeiro gol",
      descricao: "Aposte em qual time marcara o primeiro gol.",
      opcoes: [
        { nome: home, odd: reduceOdd(1.85) },
        { nome: "Nenhum gol", odd: reduceOdd(8.5) },
        { nome: away, odd: reduceOdd(2.05) }
      ]
    },
    {
      nome: "Ultimo gol",
      descricao: "Aposte em qual time marcara o ultimo gol.",
      opcoes: [
        { nome: home, odd: reduceOdd(1.92) },
        { nome: "Nenhum gol", odd: reduceOdd(8.5) },
        { nome: away, odd: reduceOdd(1.92) }
      ]
    },
    {
      nome: "Gols no 1 tempo",
      descricao: "Aposte quantos gols serao marcados no primeiro tempo.",
      opcoes: [
        { nome: "Mais de 0.5", odd: reduceOdd(1.35) },
        { nome: "Mais de 1.5", odd: reduceOdd(2.35) },
        { nome: "Menos de 1.5", odd: reduceOdd(1.55) },
        { nome: "Nenhum gol", odd: reduceOdd(4.25) }
      ]
    },
    {
      nome: "Gols no 2 tempo",
      descricao: "Aposte quantos gols serao marcados no segundo tempo.",
      opcoes: [
        { nome: "Mais de 0.5", odd: reduceOdd(1.28) },
        { nome: "Mais de 1.5", odd: reduceOdd(2.05) },
        { nome: "Menos de 1.5", odd: reduceOdd(1.72) },
        { nome: "Nenhum gol", odd: reduceOdd(5.5) }
      ]
    },
    {
      nome: "Ambas marcam - Tempos",
      descricao: "Aposte se cada time marca em cada tempo.",
      opcoes: [
        { nome: "AMB no 1T", odd: reduceOdd(4.5) },
        { nome: "AMB no 2T", odd: reduceOdd(3.8) },
        { nome: "AMB em ambos", odd: reduceOdd(12.0) }
      ]
    },
    {
      nome: "Vencedor + Total",
      descricao: "Aposte na combinacao de vencedor e total de gols.",
      opcoes: [
        { nome: home + " + Mais de 2.5", odd: reduceOdd(2.85) },
        { nome: home + " + Menos de 2.5", odd: reduceOdd(4.2) },
        { nome: away + " + Mais de 2.5", odd: reduceOdd(4.5) },
        { nome: away + " + Menos de 2.5", odd: reduceOdd(3.8) },
        { nome: "EMP + Mais de 2.5", odd: reduceOdd(5.5) }
      ]
    }
  ];
}

async function fetchLogosFromTheSportsDB(teams) {
  const missing = teams.filter(t => t && !TEAM_LOGOS[t] && t.length > 2);
  if (!missing.length) return;

  const unique = [...new Set(missing)];
  log('INFO', `LOGOS: Buscando ${unique.length} logos no TheSportsDB...`);

  let fetched = 0;
  for (const team of unique) {
    try {
      const searchName = stripYouthSuffix(team);
      const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(searchName)}`;
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const teamsData = data.teams || [];
      if (teamsData.length > 0) {
        const logo = teamsData[0].strTeamLogo || teamsData[0].strTeamBadge;
        if (logo) {
          TEAM_LOGOS[team] = logo;
          fetched++;
          if (fetched % 10 === 0) log('INFO', `LOGOS: ${fetched}/${unique.length}...`);
        }
      }
    } catch {
    }
  }

  log('INFO', `LOGOS: ${fetched} novos logos encontrados.`);
  saveLogos();
}

function readLock() {
  try {
    if (!fs.existsSync(LOCK_FILE)) return null;
    return JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

function writeLockAtomic(data) {
  const tmpFile = LOCK_FILE + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(data), 'utf-8');
  fs.renameSync(tmpFile, LOCK_FILE);
}

function canRun() {
  const lock = readLock();
  if (!lock) return true;
  const lastRun = new Date(lock.lastRun);
  const now = new Date();
  const hoursSinceLast = (now - lastRun) / (1000 * 60 * 60);
  if (hoursSinceLast < MIN_HOURS_BETWEEN_RUNS) {
    log('INFO', `LOCK: Ultima execucao foi ha ${hoursSinceLast.toFixed(1)}h. Minimo: ${MIN_HOURS_BETWEEN_RUNS}h entre execucoes.`);
    log('INFO', `LOCK: Ja rodou ${lock.count} vez(es) hoje (max ${MAX_RUNS_PER_DAY}).`);
    return false;
  }
  const lastDate = lastRun.toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  if (lastDate === today && lock.count >= MAX_RUNS_PER_DAY) {
    log('INFO', `LOCK: Limite de ${MAX_RUNS_PER_DAY} execucoes por dia atingido.`);
    return false;
  }
  return true;
}

function updateLock() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const lock = readLock();
  let count = 1;
  if (lock && lock.lastRun?.slice(0, 10) === today) {
    count = (lock.count || 0) + 1;
  }
  writeLockAtomic({ lastRun: now.toISOString(), count });
}

async function withRetry(fn, retries = 3, baseDelay = 2000) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        log('WARN', `RETRY: Tentativa ${attempt}/${retries} falhou. Aguardando ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

async function scrapePlacar() {
  loadLogos();

  if (!canRun()) {
    log('INFO', 'Scraper bloqueado pelo limite de execucao (max 2x/dia).');
    return [];
  }

  log('INFO', 'Iniciando scraper do Placar de Futebol...');
  log('INFO', 'URL: https://www.placardefutebol.com.br/jogos-de-hoje');

  loadStats();
  log('INFO', `STATS: ${Object.keys(ESTATISTICAS).length} times com estatisticas carregadas.`);

  const torProxy = TOR_PROXY ? { server: TOR_PROXY } : undefined;
  if (torProxy) log('INFO', `TOR: Usando proxy ${TOR_PROXY}`);
  const browser = await chromium.launch({ headless: true, args: BROWSER_ARGS, proxy: torProxy });
  const ctx = await browser.newContext({ userAgent: BROWSER_UA });
  const page = await ctx.newPage();
  await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': 'https://www.placardefutebol.com.br/',
  });

  try {
    log('INFO', 'Acessando site...');
    await withRetry(() => page.goto('https://www.placardefutebol.com.br/jogos-de-hoje', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    }), 3, 3000);

    await page.waitForTimeout(2000);

    const jogos = await page.evaluate((leagueMap) => {
      const results = [];
      const seenGames = new Set();

      function normalizeLeagueName(name) {
        const trimmed = name.trim();
        return leagueMap[trimmed] || trimmed;
      }

      function parseStatus(statusText) {
        const upper = statusText.toUpperCase().trim();
        let hora = null;
        let status = 'Pre-jogo';
        const horaMatch = statusText.match(/(\d{1,2}:\d{2})/);

        if (upper.includes('ENCERRADO') || upper.includes('FINAL') || upper.includes('FIM')) {
          status = 'Encerrado';
        } else if (upper.includes('ADIADO') || upper.includes('CANCELADO') || upper.includes('SUSPENSO')) {
          status = 'Adiado';
        } else if (upper.includes('AO VIVO') || upper.includes('VIVO') || upper.includes('1º TEMPO') || upper.includes('2º TEMPO') || upper.includes('INTERVALO')) {
          status = 'Ao vivo';
          hora = null;
        } else if (upper.startsWith('HOJE') || upper.startsWith('AMANHÃ') || upper.startsWith('AMANHA')) {
          hora = horaMatch ? horaMatch[1] : null;
        } else if (horaMatch) {
          hora = horaMatch[1];
        }
        return { status, hora };
      }

      function extractMatchInfo(matchRow, leagueName) {
        const teamElements = matchRow.querySelectorAll('.team-name .team_link');
        if (teamElements.length < 2) return null;
        const timeCasa = teamElements[0].textContent.trim();
        const timeFora = teamElements[1].textContent.trim();
        if (!timeCasa || !timeFora) return null;
        const gameKey = `${timeCasa}|${timeFora}`;
        if (seenGames.has(gameKey)) return null;
        seenGames.add(gameKey);

        const scoreElements = matchRow.querySelectorAll('.match-score .badge');
        let placar = null;
        if (scoreElements.length >= 2) {
          const golsCasa = scoreElements[0].textContent.trim();
          const golsFora = scoreElements[1].textContent.trim();
          if (golsCasa && golsFora && /^\d+$/.test(golsCasa)) {
            placar = `${golsCasa} - ${golsFora}`;
          }
        }

        const statusEl = matchRow.querySelector('.status .badge');
        const statusText = statusEl ? statusEl.textContent.trim() : '';
        const { status, hora } = parseStatus(statusText);

        const link = matchRow.closest('a');
        const href = link ? link.getAttribute('href') || '' : '';
        const dateMatch = href.match(/(\d{2}-\d{2}-\d{4})/);
        const data = dateMatch ? dateMatch[1].replace(/-/g, '/') : null;

        return {
          id: `placar_${Date.now()}_${results.length}`,
          time_casa: timeCasa,
          time_fora: timeFora,
          placar,
          hora,
          data,
          campeonato: normalizeLeagueName(leagueName),
          status,
          logo_casa: null,
          logo_fora: null,
        };
      }

      function getLeagueNameFromHeader(headerEl) {
        const h3 = headerEl.querySelector('.match-list_league-name, h3');
        return h3 ? h3.textContent.trim() : null;
      }

      function findMatchContainer(element) {
        let current = element;
        let next = current.nextElementSibling;
        if (!next || !next.classList || !next.classList.contains('container') || !next.classList.contains('content')) {
          current = current.parentElement?.closest('a') || current;
          next = current.nextElementSibling;
        }
        while (next) {
          if (next.classList && next.classList.contains('container') && next.classList.contains('content')) {
            return next;
          }
          next = next.nextElementSibling;
        }
        return null;
      }

      function parseMatches(matchContainer, leagueName) {
        if (!matchContainer) return;
        const matchLinks = matchContainer.querySelectorAll('a[href*="/"]');
        matchLinks.forEach((link) => {
          if (link.querySelector('.standing-link, .go-to-standing')) return;
          const matchRow = link.querySelector('.row.align-items-center.content');
          if (!matchRow) return;
          const info = extractMatchInfo(matchRow, leagueName);
          if (info) results.push(info);
        });
      }

      const leagueHeaders = document.querySelectorAll('.league-name');
      leagueHeaders.forEach((header) => {
        const leagueName = getLeagueNameFromHeader(header);
        if (!leagueName) return;
        if (leagueName === 'MAIS POPULARES AGORA') return;
        const parentRow = header.closest('.row-fix');
        if (!parentRow) return;
        const matchContainer = findMatchContainer(parentRow);
        parseMatches(matchContainer, leagueName);
      });

      return results;
    }, LEAGUE_CLEANUPS);

    await browser.close();

    if (jogos.length > 0) {
      const allTeams = new Set();
      jogos.forEach(j => { allTeams.add(j.time_casa); allTeams.add(j.time_fora); });

      const missingLogos = [];
      jogos.forEach(j => {
        j.logo_casa = findLogo(j.time_casa) || null;
        j.logo_fora = findLogo(j.time_fora) || null;
        if (!j.logo_casa) missingLogos.push(j.time_casa);
        if (!j.logo_fora) missingLogos.push(j.time_fora);
      });

      const totalSlots = jogos.length * 2;
      const logoCount = jogos.reduce((acc, j) => acc + (j.logo_casa ? 1 : 0) + (j.logo_fora ? 1 : 0), 0);
      log('INFO', `LOGOS: ${logoCount}/${totalSlots} logos encontrados (${Math.round(logoCount/totalSlots*100)}%).`);

      if (missingLogos.length > 0) {
        log('INFO', `LOGOS: ${missingLogos.length} times sem logo. Buscando...`);
        await fetchLogosFromTheSportsDB(missingLogos);

        jogos.forEach(j => {
          if (!j.logo_casa) j.logo_casa = findLogo(j.time_casa) || null;
          if (!j.logo_fora) j.logo_fora = findLogo(j.time_fora) || null;
        });
      }

      jogos.forEach(j => {
        j.allow_aposta = j.status === 'Pre-jogo';
        const homeStats = ESTATISTICAS[j.time_casa];
        const awayStats = ESTATISTICAS[j.time_fora];
        if (homeStats && awayStats) {
          const s = OddsCalc.extractStatsFromJogo({ _estatisticas: ESTATISTICAS, time_casa: j.time_casa, time_fora: j.time_fora });
          const leagueAvg = 1.35;
          var lambdaHome = OddsCalc.calculateGoalExpectancy(
            { avg_gf: s.homeAvgGf, avg_ga: s.homeAvgGa },
            { avg_gf: s.awayAvgGf, avg_ga: s.awayAvgGa },
            leagueAvg
          );
          var lambdaAway = OddsCalc.calculateGoalExpectancy(
            { avg_gf: s.awayAvgGf, avg_ga: s.awayAvgGa },
            { avg_gf: s.homeAvgGf, avg_ga: s.homeAvgGa },
            leagueAvg
          );
          j.odds_1x2 = OddsCalc.calculateMatchOdds1X2(lambdaHome, lambdaAway);
          j.mercados = OddsCalc.buildMarketsFromStats(j.time_casa, j.time_fora, ESTATISTICAS);
        } else {
          const seed = makeSeed(j.time_casa, j.time_fora);
          const homeStrength = makeSeed(j.time_casa, j.time_casa);
          const awayStrength = makeSeed(j.time_fora, j.time_fora);
          const homeFavored = homeStrength >= awayStrength;
          j.odds_1x2 = {
            casa: reduceOdd(decimalOdd(seed, homeFavored ? 1.55 : 1.85)),
            empate: reduceOdd(decimalOdd(seed + 1, 2.75)),
            fora: reduceOdd(decimalOdd(seed + 2, homeFavored ? 1.85 : 1.55)),
          };
          j.mercados = buildDemoMarkets(j.time_casa, j.time_fora);
        }
      });

      const oddsCount = jogos.filter(j => j.odds_1x2).length;
      log('INFO', `ODDS: Odds geradas para ${oddsCount}/${jogos.length} jogos.`);

      updateLock();

      const data = {
        source: 'placar',
        scraped_at: new Date().toISOString(),
        jogos,
      };

      const outputDir = path.dirname(OUTPUT_FILE);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
      log('INFO', `Jogos salvos em ${OUTPUT_FILE}`);

      const logoCount2 = jogos.reduce((acc, j) => acc + (j.logo_casa ? 1 : 0) + (j.logo_fora ? 1 : 0), 0);
      const leagues = [...new Set(jogos.map((j) => j.campeonato))];
      log('INFO', `Ligas encontradas (${leagues.length}): ${leagues.join(', ')}`);

      log('INFO', `Primeiros jogos (ate 10):`);
      jogos.slice(0, 10).forEach((j) => {
        const placarStr = j.placar ? ` [${j.placar}]` : '';
        const logos = j.logo_casa && j.logo_fora ? ' OK' : j.logo_casa || j.logo_fora ? ' HALF' : ' MISS';
        log('INFO', `  ${j.time_casa} x ${j.time_fora} - ${j.campeonato}${j.hora ? ` (${j.hora})` : ''}${placarStr}${logos}`);
      });
    } else {
      log('WARN', 'Nenhum jogo encontrado. Verifique a estrutura do site.');
    }

    return jogos;
  } catch (error) {
    log('ERROR', `Erro no scraper: ${error.message}`);
    await browser.close();
    return [];
  }
}

if (require.main === module) {
  scrapePlacar()
    .then((jogos) => {
      log('INFO', `Scraper concluido. ${jogos.length} jogos encontrados.`);
      process.exit(0);
    })
    .catch((err) => {
      log('ERROR', `Erro fatal: ${err}`);
      process.exit(1);
    });
}

module.exports = { scrapePlacar, decimalOdd, reduceOdd, makeSeed, stripYouthSuffix, buildDemoMarkets };
