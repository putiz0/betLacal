// ============================================================
// MAPEAMENTO DE TIMES -> LIGAS
// ============================================================

const TEAM_LEAGUE_MAP = {
  // SERIE A
  "Flamengo": "Campeonato Brasileiro Serie A",
  "Fluminense": "Campeonato Brasileiro Serie A",
  "Botafogo": "Campeonato Brasileiro Serie A",
  "Grêmio": "Campeonato Brasileiro Serie A",
  "Internacional": "Campeonato Brasileiro Serie A",
  "Cuiabá": "Campeonato Brasileiro Serie A",
  
  // SERIE B
  "Vila Nova": "Campeonato Brasileiro Serie B",
  "Goiás": "Campeonato Brasileiro Serie B",
  "Sport": "Campeonato Brasileiro Serie B",
  "Juventude": "Campeonato Brasileiro Serie B",
  "Ponte Preta": "Campeonato Brasileiro Serie B",
  "Botafogo-SP": "Campeonato Brasileiro Serie B",
  "Brusque": "Campeonato Brasileiro Serie B",
  "Ceará": "Campeonato Brasileiro Serie C",
  
  // SERIE C
  "São Bernardo": "Campeonato Brasileiro Serie C",
  "Paysandu": "Campeonato Brasileiro Serie C",
  "Náutico": "Campeonato Brasileiro Serie C",
  "Tombense": "Campeonato Brasileiro Serie C",
  "Figueirense": "Campeonato Brasileiro Serie C",
  "ABC": "Campeonato Brasileiro Serie C",
  "CSA": "Campeonato Brasileiro Serie C",
  "São Raimundo-PA": "Campeonato Paraense",
  
  // SERIE D
  "Santa Cruz": "Campeonato Brasileiro Serie D",
  "Inter de Limeira": "Campeonato Brasileiro Serie D",
  "Athletic Club-MG": "Campeonato Brasileiro Serie D",
  "Floresta": "Campeonato Brasileiro Serie D",
  "Jaraguá": "Campeonato Brasileiro Serie D",
  "Humaitá": "Campeonato Brasileiro Serie D",
  "Nacional-AM": "Campeonato Amazonense",
  "Manaus": "Campeonato Amazonense",
  "Galvez": "Campeonato Acreano",
  "Independência": "Campeonato Mineiro",
  "Tupan": "Campeonato Amazonense",
  "São José-MA": "Campeonato Maranhense",
  
  // ESTADUAIS
  "América-RN": "Campeonato Potiguar",
  "ABC": "Campeonato Potiguar",
  "Potyguar": "Campeonato Potiguar",
  "Santa Cruz-RN": "Campeonato Potiguar",
  
  "Confiança": "Campeonato Sergipano",
  "Confiança-PB": "Campeonato Paraibano",
  "Treze": "Campeonato Paraibano",
  "Sousa": "Campeonato Paraibano",
  "Botafogo-PB": "Campeonato Paraibano",
  "Cruzeiro-PB": "Campeonato Paraibano",
  "Queimadense": "Campeonato Paraibano",
  
  "Sport": "Campeonato Pernambucano",
  "Santa Cruz": "Campeonato Pernambucano",
  "Náutico": "Campeonato Pernambucano",
  
  "Bahia": "Campeonato Baiano",
  "Vitória": "Campeonato Baiano",
  "Juazeirense": "Campeonato Baiano",
  "Jacobina": "Campeonato Baiano",
  "Vitória da Conquista": "Campeonato Baiano",
  "Fluminense-BA": "Campeonato Baiano",
  "Doce Mel": "Campeonato Baiano",
  "Porto-BA": "Campeonato Baiano",
  "Redenção BA": "Campeonato Baiano",
  "Conquista": "Campeonato Baiano",
  "Feira": "Campeonato Baiano",
  "Grapiuna Itabuna": "Campeonato Baiano",
  "Atético Alagoinhas": "Campeonato Baiano",
  "Jacuipense": "Campeonato Baiano",
  "Juazeirense": "Campeonato Baiano",
  "Maguary": "Campeonato Baiano",
  
  "Ceará": "Campeonato Cearense",
  "Fortaleza": "Campeonato Cearense",
  "Icasa": "Campeonato Cearense",
  "Ferroviário": "Campeonato Cearense",
  "Itapipoca": "Campeonato Cearense",
  "ASA": "Campeonato Cearense",
  "CRAC": "Campeonato Cearense",
  "Central": "Campeonato Cearense",
  
  "Goiás": "Campeonato Goiano",
  "Atlético-GO": "Campeonato Goiano",
  "Vila Nova": "Campeonato Goiano",
  "CRAC": "Campeonato Goiano",
  "Itumbiara": "Campeonato Goiano",
  "Goianesia": "Campeonato Goiano",
  
  "Cruzeiro": "Campeonato Mineiro",
  "Atlético-MG": "Campeonato Mineiro",
  "Tombense": "Campeonato Mineiro",
  "Democrata GV": "Campeonato Mineiro",
  "Patrocinense": "Campeonato Mineiro",
  "Uberlândia": "Campeonato Mineiro",
  "Athletic Club-MG": "Campeonato Mineiro",
  "América-MG": "Campeonato Mineiro",
  "Betim": "Campeonato Mineiro",
  "Boa": "Campeonato Mineiro",
  "Caldense": "Campeonato Mineiro",
  "Uberaba": "Campeonato Mineiro",
  "Independência": "Campeonato Mineiro",
  
  "Corinthians": "Campeonato Paulista",
  "Palmeiras": "Campeonato Paulista",
  "Santos": "Campeonato Paulista",
  "São Paulo": "Campeonato Paulista",
  "Red Bull Bragantino": "Campeonato Paulista",
  "Ponte Preta": "Campeonato Paulista",
  "Guarani": "Campeonato Paulista",
  "Santo André": "Campeonato Paulista",
  "Botafogo-SP": "Campeonato Paulista",
  "Inter de Limeira": "Campeonato Paulista",
  "São Bernardo": "Campeonato Paulista",
  "Água Santa": "Campeonato Paulista",
  "Ituano": "Campeonato Paulista",
  "Porto Ferreira": "Campeonato Paulista",
  "Matonense": "Campeonato Paulista",
  "Catanduvense": "Campeonato Paulista",
  "Rio Preto": "Campeonato Paulista",
  "Audax-SP": "Campeonato Paulista",
  "Paulinense": "Campeonato Paulista",
  "Manthiqueira": "Campeonato Paulista",
  "Barcelona-SP": "Campeonato Paulista",
  "Pérolas Negras": "Campeonato Paulista",
  "Ivinhema": "Campeonato Paulista",
  "Tupã": "Campeonato Paulista",
  "Itaquaquecetuba": "Campeonato Paulista",
  "Mauá": "Campeonato Paulista",
  
  "Paraná": "Campeonato Paranaense",
  "Coritiba": "Campeonato Paranaense",
  "Athletico-PR": "Campeonato Paranaense",
  "Operário-PR": "Campeonato Paranaense",
  "Londrina": "Campeonato Paranaense",
  "Cianorte": "Campeonato Paranaense",
  
  "Caxias": "Campeonato Gaúcho",
  "Grêmio": "Campeonato Gaúcho",
  "Internacional": "Campeonato Gaúcho",
  "São José-RS": "Campeonato Gaúcho",
  "Juventude": "Campeonato Gaúcho",
  "Santa Cruz-RS": "Campeonato Gaúcho",
  "Guarany de Bagé": "Campeonato Gaúcho",
  "Bagé": "Campeonato Gaúcho",
  "Brasil Farroupilha": "Campeonato Gaúcho",
  "Esportivo": "Campeonato Gaúcho",
  "Glória": "Campeonato Gaúcho",
  "Lajadense": "Campeonato Gaúcho",
  "Alemânia": "Campeonato Gaúcho",
  
"Joinville": "Campeonato Catarinense",
  "Brusque": "Campeonato Catarinense",
  "Figueirense": "Campeonato Catarinense",
  "Avaí": "Campeonato Catarinense",
  "Criciúma": "Campeonato Catarinense",
  "Concídia": "Campeonato Catarinense",
  "Barra": "Campeonato Catarinense",
  "Hercílio Luz": "Campeonato Catarinense",
  "Guarani de Palhoça": "Campeonato Catarinense",
  "Metropolitano": "Campeonato Catarinense",
  "Fluminense-SC": "Campeonato Catarinense",
  "Clube Laguna": "Campeonato Catarinense",
  "Jaraguá": "Campeonato Catarinense",
  "Canaã": "Campeonato Catarinense",
  "Cliper": "Campeonato Catarinense",
  "RB do Norte": "Campeonato Catarinense",
  "Athletico-PR": "Campeonato Paranaense",
  "Paraná": "Campeonato Paranaense",
  "Coritiba": "Campeonato Paranaense",
  "Operário-PR": "Campeonato Paranaense",
  "Londrina": "Campeonato Paranaense",
  "Cianorte": "Campeonato Paranaense",
  
  // NORTE/NORDESTE
  "Paysandu": "Campeonato Paraense",
  "Remo": "Campeonato Paraense",
  "Tuna Luso": "Campeonato Paraense",
  "São Raimundo-PA": "Campeonato Paraense",
  "Cametá": "Campeonato Paraense",
  "Araguaína": "Campeonato Tocantinense",
  "Palmas": "Campeonato Tocantinense",
  "Interporto": "Campeonato Tocantinense",
  
  "Fast": "Campeonato Amazonense",
  "Nacional-AM": "Campeonato Amazonense",
  "Manaus": "Campeonato Amazonense",
  "Penapolense": "Campeonato Amazonense",
  "Manauara": "Campeonato Amazonense",
  "Amazonas": "Campeonato Amazonense",
  "São Raimundo-PA": "Campeonato Amazonense",
  "Tupan": "Campeonato Amazonense",
  "Humaitá": "Campeonato Amazonense",
  "Guaporé": "Campeonato Amazonense",
  
  "Rio Branco-AC": "Campeonato Acreano",
  "Galvez": "Campeonato Acreano",
  "Andirá": "Campeonato Acreano",
  
  "Ji-Paraná": "Campeonato Rondoniense",
  "Vilhena": "Campeonato Rondoniense",
  "Guajará": "Campeonato Rondoniense",
  
  "Barcelona-RN": "Campeonato Potiguar",
  "América-RN": "Campeonato Potiguar",
  "ABC": "Campeonato Potiguar",
  
  "Sergipe": "Campeonato Sergipano",
  "Confiança": "Campeonato Sergipano",
  "Lagarto": "Campeonato Sergipano",
  "Itabaiana": "Campeonato Sergipano",
  "CSE": "Campeonato Sergipano",
  "Serra Branca": "Campeonato Sergipano",
  "SESP Taguatinga": "Campeonato Sergipano",
  "Decisão": "Campeonato Sergipano",
  "Retrô FC": "Campeonato Sergipano",
  
  "Alagoano": "Campeonato Alagoano",
  "CSA": "Campeonato Alagoano",
  "ASA": "Campeonato Alagoano",
  "CRB": "Campeonato Alagoano",
  "Coruripe": "Campeonato Alagoano",
  
  "Ceará": "Campeonato Cearense",
  "Fortaleza": "Campeonato Cearense",
  "Ferroviário": "Campeonato Cearense",
  "Icasa": "Campeonato Cearense",
  "Guarani-CE": "Campeonato Cearense",
  "Itapipoca": "Campeonato Cearense",
  
  "River-PI": "Campeonato Piauiense",
  "R性iver": "Campeonato Piauiense",
  "Fluminense-PI": "Campeonato Piauiense",
  "Altos": "Campeonato Piauiense",
  "Picos": "Campeonato Piauiense",
  
  "Maranhense": "Campeonato Maranhense",
  "Sampaio Corrêa": "Campeonato Maranhense",
  "Moto Club": "Campeonato Maranhense",
  "Imperatriz": "Campeonato Maranhense",
  "Tupan": "Campeonato Maranhense",
  "São José-MA": "Campeonato Maranhense",
  "Cordino": "Campeonato Maranhense",
  "Trezense": "Campeonato Maranhense",
  
  "ABC": "Campeonato Potiguar",
  "América-RN": "Campeonato Potiguar",
  "Potyguar Seridoense": "Campeonato Potiguar",
  
  // CENTRO-OESTE
  "Brasiliense": "Campeonato Brasiliense",
  "Cruzeiro-DF": "Campeonato Brasiliense",
  "Sobradinho": "Campeonato Brasiliense",
  "Gama": "Campeonato Brasiliense",
  "Taguatinga": "Campeonato Brasiliense",
  "CA Taguatinga": "Campeonato Brasiliense",
  "SESC-DF": "Campeonato Brasiliense",
  "Paranoá": "Campeonato Brasiliense",
  "Ceilandense": "Campeonato Brasiliense",
  "Samambaia": "Campeonato Brasiliense",
  
  "Mixto": "Campeonato Mato-Grossense",
  "Cuiabá": "Campeonato Mato-Grossense",
  "Luverdense": "Campeonato Mato-Grossense",
  "Operário-MS": "Campeonato Sul-Mato-Grossense",
  "Novorizontino": "Campeonato Sul-Mato-Grossense",
  "Comercial-MS": "Campeonato Sul-Mato-Grossense",
  
  // RJ
  "Vasco": "Campeonato Carioca",
  "Fluminense": "Campeonato Carioca",
  "Flamengo": "Campeonato Carioca",
  "Botafogo": "Campeonato Carioca",
  "Audax-RJ": "Campeonato Carioca",
  "Volta Redonda": "Campeonato Carioca",
  "Madureira": "Campeonato Carioca",
  "Bangu": "Campeonato Carioca",
  "Boa Vista": "Campeonato Carioca",
  "Americano": "Campeonato Carioca",
  "Olaria": "Campeonato Carioca",
  "Portuguesa-RJ": "Campeonato Carioca",
  "Sampaio Corrêa": "Campeonato Carioca",
  "Rio de Janeiro": "Campeonato Carioca",
  "São Gonçalo EC RJ": "Campeonato Carioca",
  "Araruama": "Campeonato Carioca",
  "Cabofriense": "Campeonato Carioca",
  "Duque de Caxias": "Campeonato Carioca",
  "Friburguense": "Campeonato Carioca",
  "Barra Mansa": "Campeonato Carioca",
  
  // ES
  "Vitória-ES": "Campeonato Capixaba",
  "Rio Branco-ES": "Campeonato Capixaba",
  "Serra": "Campeonato Capixaba",
  "São Gabriel": "Campeonato Capixaba",
  "Desportiva": "Campeonato Capixaba",
  "Tupy": "Campeonato Capixaba",
  "Porto Vitória": "Campeonato Capixaba",
  "Rio Branco VN": "Campeonato Capixaba",
  "Caravaggio": "Campeonato Capixaba",
  "Athletic Club-ES": "Campeonato Capixaba",
  "Vila Velha": "Campeonato Capixaba",
  "Itapemirim": "Campeonato Capixaba",
  
  // COPA DO BRASIL
  "São Paulo": "Copa do Brasil",
  "Flamengo": "Copa do Brasil",
  "Palmeiras": "Copa do Brasil",
  "Grêmio": "Copa do Brasil",
  "Corinthians": "Copa do Brasil",
  "Santos": "Copa do Brasil",
  "Bahia": "Copa do Brasil",
  "Fortaleza": "Copa do Brasil",
  "Cruzeiro": "Copa do Brasil",
  "Atlético-MG": "Copa do Brasil",
  "Botafogo": "Copa do Brasil",
  "Fluminense": "Copa do Brasil",
  "Vasco": "Copa do Brasil",
  "Athletico-PR": "Copa do Brasil",
  "Red Bull Bragantino": "Copa do Brasil",
  "Internacional": "Copa do Brasil",
  "Cuiabá": "Copa do Brasil",
  
  // COPA DO NORDESTE
  "Sport": "Copa do Nordeste",
  "Fortaleza": "Copa do Nordeste",
  "Ceará": "Copa do Nordeste",
  "Bahia": "Copa do Nordeste",
  "Vitória": "Copa do Nordeste",
  "Santa Cruz": "Copa do Nordeste",
  "Náutico": "Copa do Nordeste",
  "CRB": "Copa do Nordeste",
  "Confiança": "Copa do Nordeste",
  "Botafogo-PB": "Copa do Nordeste",
  "Caucaia": "Copa do Nordeste",
  "Sport": "Copa do Nordeste",
  "Freipaulistano": "Copa do Nordeste",
  "Estrela": "Copa do Nordeste",
  "Salgueiro": "Copa do Nordeste",
  "Afogados": "Copa do Nordeste",
  "Atlético-CE": "Copa do Nordeste",
  "Floresta": "Copa do Nordeste",
  "Parnahyba": "Copa do Nordeste",
  "River-PI": "Copa do Nordeste",
  "Altos": "Copa do Nordeste",
  "América-RN": "Copa do Nordeste",
  "ABC": "Copa do Nordeste",
  "Vitória": "Copa do Nordeste",
  "Jacobina": "Copa do Nordeste",
  "Fluminense-BA": "Copa do Nordeste",
  "Itabuna": "Copa do Nordeste",
  
  // LIBERTADORES
  "Flamengo": "Libertadores",
  "Palmeiras": "Libertadores",
  "Grêmio": "Libertadores",
  "Internacional": "Libertadores",
  "Santos": "Libertadores",
  "São Paulo": "Libertadores",
  "Corinthians": "Libertadores",
  "Athletico-PR": "Libertadores",
  "Atlético-MG": "Libertadores",
  "Fluminense": "Libertadores",
  "Botafogo": "Libertadores",
  "Vasco": "Libertadores",
  
  // CHAMPIONS LEAGUE
  "Real Madrid": "Champions League",
  "Barcelona": "Champions League",
  "Manchester City": "Champions League",
  "Liverpool": "Champions League",
  "Bayern": "Champions League",
  "PSG": "Champions League",
  "Juventus": "Champions League",
  "Chelsea": "Champions League",
  "Ajax": "Champions League",
  "Manchester United": "Champions League",
  "Tottenham": "Champions League",
  "Atletico Madrid": "Champions League",
  "Inter Milan": "Champions League",
  "AC Milan": "Champions League",
  "Dortmund": "Champions League",
  "Leipzig": "Champions League",
  "Sevilla": "Champions League",
  "Benfica": "Champions League",
  "Porto": "Champions League",
  "Shakhtar Donetsk": "Champions League",
  
  // OUTROS PAISES
  "Union La Calera": "Campeonato Chileno",
  "Universidad Chile": "Campeonato Chileno",
  "Colo-Colo": "Campeonato Chileno",
  "Audax Italiano": "Campeonato Chileno",
  "Universidad Cat\u00f3lica": "Campeonato Chileno",
  "Universidad de Concepci\u00f3n": "Campeonato Chileno",
  "Concepcion": "Campeonato Chileno",
  "Deportes Limache": "Campeonato Chileno",
  
  // SELECOES
  "Alemanha": "Copa do Mundo",
  "Brasil": "Copa do Mundo",
  "Argentina": "Copa do Mundo",
  "França": "Copa do Mundo",
  "Itália": "Copa do Mundo",
  "Espanha": "Copa do Mundo",
  "Inglaterra": "Copa do Mundo",
  "Portugal": "Copa do Mundo",
  "Holanda": "Copa do Mundo",
  "Bélgica": "Copa do Mundo",
  "Croácia": "Copa do Mundo",
  "Uruguai": "Copa do Mundo",
  "Colômbia": "Copa do Mundo",
  "México": "Copa do Mundo",
  "Estados Unidos": "Copa do Mundo",
  "Japão": "Copa do Mundo",
  "Coreia do Sul": "Copa do Mundo",
  "Austrália": "Copa do Mundo",
  "Cura\u00e7ao": "Copa do Mundo",
  "Costa do Marfim": "Copa do Mundo",
  "Equador": "Copa do Mundo",
  "Suécia": "Copa do Mundo",
  "Tunísia": "Copa do Mundo",
  "Marrocos": "Copa do Mundo",
  "Egito": "Copa do Mundo",
  "Nigéria": "Copa do Mundo",
  "Camarões": "Copa do Mundo",
  "Gana": "Copa do Mundo",
  "Senegal": "Copa do Mundo",
  "Argélia": "Copa do Mundo",
};

// ============================================================
// LIGAS PRIORITARIAS (ordem de exibicao)
// ============================================================

const LEAGUE_PRIORITY = {
  // INTERNACIONAIS
  "Copa do Mundo": 1,
  "Libertadores": 2,
  "Champions League": 3,
  "Copa Sul-Americana": 4,
  "Europa League": 5,
  
  // BRASILEIRO
  "Campeonato Brasileiro Serie A": 10,
  "Campeonato Brasileiro Serie B": 11,
  "Campeonato Brasileiro Serie C": 12,
  "Campeonato Brasileiro Serie D": 13,
  "Copa do Brasil": 14,
  "Copa do Nordeste": 15,
  "Copa Verde": 16,
  
  // ESTADUAIS PRINCIPAIS
  "Campeonato Paulista": 20,
  "Campeonato Carioca": 21,
  "Campeonato Mineiro": 22,
  "Campeonato Gaúcho": 23,
  "Campeonato Paranaense": 24,
  "Campeonato Baiano": 25,
  "Campeonato Pernambucano": 26,
  "Campeonato Cearense": 27,
  "Campeonato Sergipano": 28,
  "Campeonato Alagoano": 29,
  "Campeonato Potiguar": 30,
  "Campeonato Paraibano": 31,
  "Campeonato Goiano": 32,
  
  // OUTROS PAISES
  "Campeonato Chileno": 40,
  "Campeonato Argentino": 41,
  "Campeonato Mexicano": 42,
  "Campeonato Colombiano": 43,
  "Campeonato Peruano": 44,
  "Campeonato Paraguaio": 45,
  "Campeonato Uruguaio": 46,
  "Campeonato Boliviano": 47,
  
  // COPA FGF
  "Copa FGF": 90,
  "Copa Esp\u00edrito Santo": 91,
  "Copa do Estado": 92,
};

// ============================================================
// FUNCAO PARA IDENTIFICAR LIGA DE UM JOGO
// ============================================================

function identifyLeague(jogo) {
  const home = jogo.time_casa || jogo.home || "";
  const away = jogo.time_fora || jogo.away || "";
  const currentLeague = jogo.campeonato || "";
  
  // Se ja tem liga valida (nao e "Outros"), usar ela
  if (currentLeague && currentLeague !== "Outros" && currentLeague !== "Campeonato") {
    return currentLeague;
  }
  
  // Tentar identificar pela equipe
  const homeLeague = TEAM_LEAGUE_MAP[home];
  if (homeLeague) return homeLeague;
  
  const awayLeague = TEAM_LEAGUE_MAP[away];
  if (awayLeague) return awayLeague;
  
  // Padrao: usar o que vier da API
  return currentLeague || "Outros";
}

// ============================================================
// FUNCAO PARA ORDENAR LIGAS POR PRIORIDADE
// ============================================================

function sortLeagues(leagues) {
  return leagues.sort((a, b) => {
    const priorityA = LEAGUE_PRIORITY[a] || 50;
    const priorityB = LEAGUE_PRIORITY[b] || 50;
    return priorityA - priorityB;
  });
}

// ============================================================
// MAPEAMENTO DE ESCUDOS (URLs dos logos)
// ============================================================

const TEAM_LOGOS = {
  // SERIE A
  "Flamengo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05491.png",
  "Fluminense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05317.png",
  "Botafogo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05298.png",
  "Grêmio": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05325.png",
  "Internacional": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05331.png",
  "Cuiabá": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05449.png",
  "Cruzeiro": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05251.png",
  "Palmeiras": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05417.png",
  "Santos": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05463.png",
  "Corinthians": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05249.png",
  "São Paulo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05469.png",
  "Bahia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05284.png",
  "Fortaleza": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05318.png",
  "Athletico-PR": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05275.png",
  "Vasco": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05505.png",
  "Red Bull Bragantino": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05498.png",
  
  // SERIE B
  "Vila Nova": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05506.png",
  "Goiás": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05324.png",
  "Sport": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05466.png",
  "Juventude": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05338.png",
  "Ponte Preta": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05427.png",
  "Botafogo-SP": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05298.png",
  "Brusque": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05302.png",
  "Criciúma": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05250.png",
  "Figueirense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05316.png",
  "ABC": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05268.png",
  "CSA": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05254.png",
  "Náutico": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05415.png",
  "Paysandu": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05421.png",
  "Tombense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05482.png",
  "São Bernardo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05461.png",
  
  // LIBERTADORES / COPA DO BRASIL
  "Atlético-MG": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05271.png",
  
  // PAULISTA
  "Santo André": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05464.png",
  "Guarani": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05326.png",
  "Inter de Limeira": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05337.png",
  "Ituano": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05335.png",
  
  // MINEIRO
  "América-MG": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05272.png",
  "Athletic Club-MG": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05270.png",
  "Patrocinense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05420.png",
  "Uberlândia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05492.png",
  
  // CATARINENSE
  "Joinville": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05337.png",
  "Avaí": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05282.png",
  "Concídia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05248.png",
  
  // GAÚCHO
  "Juventude": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05338.png",
  "São José-RS": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05468.png",
  "Santa Cruz-RS": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05459.png",
  
  // PARANAENSE
  "Coritiba": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05252.png",
  "Operário-PR": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05416.png",
  "Londrina": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05343.png",
  
  // CARIOCA
  "Bangu": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05286.png",
  "Volta Redonda": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05508.png",
  "Madureira": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05344.png",
  "Portuguesa-RJ": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05429.png",
  "Olaria": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05413.png",
  "Americano": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05273.png",
  
  // CEARENSE
  "Ferroviário": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05315.png",
  "Icasa": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05330.png",
  
  // PERNAMBUCANO
  "Santa Cruz": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05459.png",
  
  // SERGIPANO
  "Confiança": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05247.png",
  "Itabaiana": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05333.png",
  "Lagarto": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05340.png",
  
  // GOIANO
  "Atlético-GO": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05270.png",
  "CRAC": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05253.png",
  
  // BAIANO
  "Vitória": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05509.png",
  "Juazeirense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05339.png",
  "Jacobina": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05336.png",
  
  // AMAZONENSE
  "Manaus": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05445.png",
  "Nacional-AM": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05411.png",
  "Humaitá": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05329.png",
  
  // PARAENSE
  "Remo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05452.png",
  "Tuna Luso": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05490.png",
  
  // MARANHENSE
  "Sampaio Corrêa": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05460.png",
  "Moto Club": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05404.png",
  "Tupan": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05490.png",
  
  // ACREANO
  "Galvez": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05321.png",
  
  // RONDONIENSE
  "Ji-Paraná": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05341.png",
  "Vilhena": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05502.png",
  
  // POTIGUAR
  "América-RN": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05272.png",
  
  // PARAIBANO
  "Treze": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05483.png",
  "Sousa": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05467.png",
  "Botafogo-PB": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05298.png",
  "Cruzeiro-PB": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05251.png",
  
  // ALAGOANO
  "CRB": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05254.png",
  "ASA": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05280.png",
  
  // BRASILIENSE
  "Brasiliense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05299.png",
  "Sobradinho": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05465.png",
  "Gama": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05322.png",
  
  // CHILENO
  "Universidad Chile": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05494.png",
  "Union La Calera": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05495.png",
  "Colo-Colo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_04677.png",
  "Audax Italiano": "https://ssl.gstatic.com/lln/sports/soccer/team/em_04678.png",
  "Universidad Católica": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05493.png",
  "Universidad de Concepción": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05496.png",
  
  // CAPIXABA
  "Vitória-ES": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05509.png",
  "Rio Branco-ES": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05456.png",
  "Serra": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05464.png",
  "Desportiva": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05257.png",
  "Porto Vitória": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05428.png",
  "Rio Branco VN": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05456.png",
  "Caravaggio": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05295.png",
  
  // CLUBES INTERNACIONAIS (adicionados para cobertura do placar)
  "Dynamo Kyiv": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05258.png",
  "Midtjylland": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05400.png",
  "Lillestrøm": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05342.png",
  "CSKA Sofia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05306.png",
  "Levski Sofia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05341.png",
  "Slovan Bratislava": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05466.png",
  "Wisła Płock": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05510.png",
  "Grazer AK": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05325.png",
  "DAC": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05254.png",
  "Trencin": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05483.png",
  "Győri ETO": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05324.png",
  "Pogoń Siedlce": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05428.png",
  "Polonia Bytom": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05425.png",
  "Nieciecza": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05413.png",
  "Unia Tarnów": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05494.png",
  "Oberwart": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05416.png",
  "Rapid Wien II": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05450.png",
  "Bayern Alzenau": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05289.png",
  "Hain": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05328.png",
  "Gryf Wejherowo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05326.png",
  "Differdange 03": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05257.png",
  "UNA Strassen": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05493.png",
  "Akademik Svishtov": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05268.png",
  "Pohronie": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05427.png",
  "Liptovský Mikuláš": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05343.png",
  "Povazska Bystrica": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05429.png",
  "Šamorín": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05461.png",
  "Baník Lehota p.Vtáčnikom": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05286.png",
  "Mačva Šabac": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05452.png",
  "Zemun": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05511.png",
  "Morelia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05404.png",
  "Necaxa": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05415.png",
  "San Marcos": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05460.png",
  "Deportes Limache": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05260.png",
  "Deportes Santa Cruz": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05459.png",
  "Leonico": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05340.png",

  // COPA DO MUNDO / SELEÇÕES (usando flagcdn para todas)
  "Alemanha": "https://flagcdn.com/w40/de.png",
  "Holanda": "https://flagcdn.com/w40/nl.png",
  "Brasil": "https://flagcdn.com/w40/br.png",
  "Argentina": "https://flagcdn.com/w40/ar.png",
  "França": "https://flagcdn.com/w40/fr.png",
  "Itália": "https://flagcdn.com/w40/it.png",
  "Espanha": "https://flagcdn.com/w40/es.png",
  "Inglaterra": "https://flagcdn.com/w40/gb.png",
  "Portugal": "https://flagcdn.com/w40/pt.png",
  "Japão": "https://flagcdn.com/w40/jp.png",
  "México": "https://flagcdn.com/w40/mx.png",
  "Estados Unidos": "https://flagcdn.com/w40/us.png",
  "Uruguai": "https://flagcdn.com/w40/uy.png",
  "Croácia": "https://flagcdn.com/w40/hr.png",
  "Bélgica": "https://flagcdn.com/w40/be.png",
  "Suíça": "https://flagcdn.com/w40/ch.png",
  "Polônia": "https://flagcdn.com/w40/pl.png",
  "Senegal": "https://flagcdn.com/w40/sn.png",
  "Marrocos": "https://flagcdn.com/w40/ma.png",
  "Egito": "https://flagcdn.com/w40/eg.png",
  "Nigéria": "https://flagcdn.com/w40/ng.png",
  "Camarões": "https://flagcdn.com/w40/cm.png",
  "Gana": "https://flagcdn.com/w40/gh.png",
  "Costa do Marfim": "https://flagcdn.com/w40/ci.png",
  "Equador": "https://flagcdn.com/w40/ec.png",
  "Colômbia": "https://flagcdn.com/w40/co.png",
  "Peru": "https://flagcdn.com/w40/pe.png",
  "Chile": "https://flagcdn.com/w40/cl.png",
  "Paraguai": "https://flagcdn.com/w40/py.png",
  "Bolívia": "https://flagcdn.com/w40/bo.png",
  "Venezuela": "https://flagcdn.com/w40/ve.png",
  "Suécia": "https://flagcdn.com/w40/se.png",
  "Tunísia": "https://flagcdn.com/w40/tn.png",
  "Austrália": "https://flagcdn.com/w40/au.png",
  "Coreia do Sul": "https://flagcdn.com/w40/kr.png",
  "Catar": "https://flagcdn.com/w40/qa.png",
  "Irã": "https://flagcdn.com/w40/ir.png",
  "Arábia Saudita": "https://flagcdn.com/w40/sa.png",
  "Escócia": "https://flagcdn.com/w40/gb-sct.png",
  "Haiti": "https://flagcdn.com/w40/ht.png",
  "Canadá": "https://flagcdn.com/w40/ca.png",
  "Qatar": "https://flagcdn.com/w40/qa.png",
  "Ucrânia": "https://flagcdn.com/w40/ua.png",
  "Dinamarca": "https://flagcdn.com/w40/dk.png",
  "Noruega": "https://flagcdn.com/w40/no.png",
  "Irlanda": "https://flagcdn.com/w40/ie.png",
  "Áustria": "https://flagcdn.com/w40/at.png",
  "Hungria": "https://flagcdn.com/w40/hu.png",
  "Romênia": "https://flagcdn.com/w40/ro.png",
  "República Tcheca": "https://flagcdn.com/w40/cz.png",
  "Grécia": "https://flagcdn.com/w40/gr.png",
  "Turquia": "https://flagcdn.com/w40/tr.png",
  "Curaçao": "https://flagcdn.com/w40/cw.png",
  
  // PREMIER LEAGUE
  "Manchester City": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05402.png",
  "Arsenal": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05426.png",
  "Liverpool": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05342.png",
  "Chelsea": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05305.png",
  "Manchester United": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05403.png",
  "Tottenham": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05478.png",
  "Newcastle": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05409.png",
  "Brighton": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05299.png",
  "Aston Villa": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05281.png",
  "West Ham": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05510.png",
  "Brentford": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05297.png",
  "Crystal Palace": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05253.png",
  "Wolverhampton": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05511.png",
  "Fulham": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05320.png",
  "Everton": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05314.png",
  "Nottingham Forest": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05412.png",
  "Bournemouth": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05292.png",
  "Leicester City": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05341.png",
  "West Brom": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05510.png",
  "Burnley": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05303.png",
  
  // LA LIGA
  "Real Madrid": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05452.png",
  "Barcelona": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05487.png",
  "Atletico Madrid": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05486.png",
  "Sevilla": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05464.png",
  "Real Betis": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05289.png",
  "Real Sociedad": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05459.png",
  "Villarreal": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05506.png",
  "Athletic Bilbao": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05270.png",
  "Valencia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05504.png",
  "Girona": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05324.png",
  "Osasuna": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05416.png",
  "Mallorca": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05445.png",
  "Getafe": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05322.png",
  "Celta Vigo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05305.png",
  "Espanyol": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05313.png",
  "Rayo Vallecano": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05451.png",
  "Almeria": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05272.png",
  "Cadiz": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05292.png",
  "Granada": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05325.png",
  "Las Palmas": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05443.png",
  
  // SERIE A
  "Inter Milan": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05331.png",
  "AC Milan": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05489.png",
  "Juventus": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05339.png",
  "Napoli": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05405.png",
  "Roma": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05456.png",
  "Lazio": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05340.png",
  "Atalanta": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05280.png",
  "Fiorentina": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05317.png",
  "Bologna": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05296.png",
  "Torino": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05483.png",
  "Sassuolo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05461.png",
  "Udinese": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05492.png",
  "Sampdoria": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05460.png",
  "Genoa": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05323.png",
  "Cagliari": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05292.png",
  "Verona": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05509.png",
  "Empoli": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05260.png",
  "Lecce": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05341.png",
  "Monza": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05402.png",
  "Salernitana": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05460.png",
  
  // BUNDESLIGA
  "Bayern": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05289.png",
  "Dortmund": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05257.png",
  "Leipzig": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05443.png",
  "Bayer Leverkusen": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05289.png",
  "Eintracht Frankfurt": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05315.png",
  "Wolfsburg": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05510.png",
  "Borussia Monchengladbach": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05257.png",
  "Stuttgart": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05475.png",
  "Hertha Berlin": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05328.png",
  "Union Berlin": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05492.png",
  "Hoffenheim": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05292.png",
  "Koln": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05306.png",
  "Freiburg": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05320.png",
  "Mainz": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05445.png",
  "Bochum": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05296.png",
  "Augsburg": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05281.png",
  "Schalke": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05461.png",
  "Arminia Bielefeld": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05289.png",
  
  // LIGUE 1
  "PSG": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05422.png",
  "Olympique Marseille": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05403.png",
  "Monaco": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05402.png",
  "Lyon": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05444.png",
  "Lille": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05342.png",
  "Nice": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05409.png",
  "Rennes": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05452.png",
  "Strasbourg": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05475.png",
  "Montpellier": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05404.png",
  "Lens": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05340.png",
  "Toulouse": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05483.png",
  "Nantes": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05410.png",
  "Brest": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05297.png",
  "Auxerre": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05281.png",
  "Reims": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05452.png",
  "Le Havre": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05327.png",
  "Metz": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05398.png",
  " Clermont": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05297.png",
  
  // ARGENTINO
  "Boca Juniors": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05297.png",
  "River Plate": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05456.png",
  "Independiente": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05331.png",
  "Racing Club": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05450.png",
  "San Lorenzo": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05459.png",
  "Huracan": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05329.png",
  "Velez Sarsfield": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05506.png",
  "Estudiantes": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05313.png",
  "Gimnasia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05323.png",
  "Defensa y Justicia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05257.png",
  "Talleres": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05482.png",
  "Union": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05494.png",
  "Lanus": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05340.png",
  "Banfield": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05286.png",
  "Godoy Cruz": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05325.png",
  "Argentinos Juniors": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05277.png",
  "Platense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05427.png",
  "Sarmiento": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05461.png",
  "Barracas Central": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05302.png",
  "Tucuman": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05488.png",
  
  // PORTUGUESE (PRIMEIRA LIGA)
  "Benfica": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05289.png",
  "Porto": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05429.png",
  "Sporting CP": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05461.png",
  "Braga": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05297.png",
  "Vitoria": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05509.png",
  "Portimonense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05429.png",
  "Famalicao": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05315.png",
  "Santa Clara": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05460.png",
  "Arouca": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05277.png",
  "Gil Vicente": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05323.png",
  "Vizela": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05506.png",
  "Casa Pia": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05295.png",
  "Rio Ave": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05452.png",
  "Estrela": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05313.png",
  "Moreirense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05404.png",
  "Boavista": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05289.png",
  "Feirense": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05315.png",
  "Pacos de Ferreira": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05418.png",
  "Tondela": "https://ssl.gstatic.com/lln/sports/soccer/team/em_05483.png",
};

// ============================================================
// CARREGAR LOGOS EXTRAS DO JSON
// ============================================================

let EXTRA_TEAM_LOGOS = {};

// Carregar logos extras do JSON gerado
async function loadExtraTeamLogos() {
  try {
    const response = await fetch("js/team-logos-data.json");
    if (response.ok) {
      EXTRA_TEAM_LOGOS = await response.json();
      console.log(`[Logos] Carregados ${Object.keys(EXTRA_TEAM_LOGOS).length} logos extras`);
    }
  } catch (e) {
    console.warn("[Logos] Não foi possível carregar team-logos-data.json");
  }
}

// Iniciar carregamento (expor promise para outros módulos aguardarem)
window.loadExtraTeamLogosPromise = loadExtraTeamLogos();

// ============================================================
// CACHE DE LOGOS DINÂMICOS (TheSportsDB)
// ============================================================

const LOGO_CACHE = {};
const LOGO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

// Funcao para buscar logo no TheSportsDB (assincrona)
async function fetchTeamLogoFromTheSportsDB(teamName) {
  const cacheKey = `sportsdb_${teamName}`;
  const cached = LOGO_CACHE[cacheKey];
  
  // Verificar cache
  if (cached && (Date.now() - cached.timestamp) < LOGO_CACHE_TTL) {
    return cached.logoUrl;
  }
  
  try {
    const encoded = encodeURIComponent(teamName);
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encoded}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const teams = data.teams || [];
    
    if (teams.length > 0) {
      const team = teams[0];
      const logoUrl = team.strTeamLogo || team.strTeamBadge;
      
      if (logoUrl) {
        // Salvar no cache
        LOGO_CACHE[cacheKey] = {
          logoUrl,
          timestamp: Date.now()
        };
        return logoUrl;
      }
    }
  } catch (e) {
    console.warn(`[TheSportsDB] Erro ao buscar ${teamName}:`, e);
  }
  
  return null;
}

// Funcao para buscar logo com fallback em cascata (assincrona)
async function getTeamLogo(teamName) {
  if (!teamName) return null;
  
  const name = teamName.trim();
  
  // 1. LOGO_CACHE (TheSportsDB previamente buscado ou Wikipedia)
  const cacheKey = `sportsdb_${name}`;
  if (LOGO_CACHE[cacheKey] && (Date.now() - LOGO_CACHE[cacheKey].timestamp) < LOGO_CACHE_TTL) {
    return LOGO_CACHE[cacheKey].logoUrl;
  }
  
  // 2. TEAM_LOGOS direto
  if (TEAM_LOGOS[name]) return TEAM_LOGOS[name];
  
  // 3. EXTRA_TEAM_LOGOS direto
  if (EXTRA_TEAM_LOGOS[name]) return EXTRA_TEAM_LOGOS[name];
  
  // 4. Alias
  const alias = TEAM_ALIASES[name];
  if (alias) {
    if (TEAM_LOGOS[alias]) return TEAM_LOGOS[alias];
    if (EXTRA_TEAM_LOGOS[alias]) return EXTRA_TEAM_LOGOS[alias];
    const aliasCacheKey = `sportsdb_${alias}`;
    if (LOGO_CACHE[aliasCacheKey] && (Date.now() - LOGO_CACHE[aliasCacheKey].timestamp) < LOGO_CACHE_TTL) {
      return LOGO_CACHE[aliasCacheKey].logoUrl;
    }
  }
  
  // 5. Variacoes inteligentes
  const variations = generateNameVariations(name);
  for (const v of variations) {
    if (TEAM_LOGOS[v]) return TEAM_LOGOS[v];
    if (EXTRA_TEAM_LOGOS[v]) return EXTRA_TEAM_LOGOS[v];
    const vAlias = TEAM_ALIASES[v];
    if (vAlias) {
      if (TEAM_LOGOS[vAlias]) return TEAM_LOGOS[vAlias];
      if (EXTRA_TEAM_LOGOS[vAlias]) return EXTRA_TEAM_LOGOS[vAlias];
    }
    const vCacheKey = `sportsdb_${v}`;
    if (LOGO_CACHE[vCacheKey] && (Date.now() - LOGO_CACHE[vCacheKey].timestamp) < LOGO_CACHE_TTL) {
      return LOGO_CACHE[vCacheKey].logoUrl;
    }
  }
  
  // 6. TheSportsDB (assincrono - consulta externa)
  const sportsdbLogo = await fetchTeamLogoFromTheSportsDB(name);
  if (sportsdbLogo) return sportsdbLogo;
  
  // 7. TheSportsDB com alias
  if (alias) {
    const aliasLogo = await fetchTeamLogoFromTheSportsDB(alias);
    if (aliasLogo) return aliasLogo;
  }
  
  // 8. TheSportsDB com variacoes
  for (const v of variations) {
    const vLgo = await fetchTeamLogoFromTheSportsDB(v);
    if (vLgo) return vLgo;
    const vAlias = TEAM_ALIASES[v];
    if (vAlias) {
      const vaLgo = await fetchTeamLogoFromTheSportsDB(vAlias);
      if (vaLgo) return vaLgo;
    }
  }
  
  return null;
}

// Gera variacoes de nome para busca
function generateNameVariations(name) {
  const vars = new Set();
  
  // 1. Remover sufixo "Sub-20" ou "Sub-20" (com ou sem hífen)
  let base = name.replace(/\s+Sub[-\s]?20\s*$/i, "").trim();
  if (base !== name.trim()) vars.add(base);
  
  // 2. Remover sufixo de estado (-RJ, -SP, -MG, -RS, -PR, -BA, -CE, -DF, -PB, -PE, -RN, -ES, -SC, -GO, -MS, -MT, -PA, -MA, -PI, -AL, -SE, -TO, -RO, -AC, -AM, -RR, -AP)
  const stateSuffixRemoved = base.replace(/-(RJ|SP|MG|RS|PR|BA|CE|DF|PB|PE|RN|ES|SC|GO|MS|MT|PA|MA|PI|AL|SE|TO|RO|AC|AM|RR|AP|CHI)$/i, "").trim();
  if (stateSuffixRemoved !== base && stateSuffixRemoved.length > 1) vars.add(stateSuffixRemoved);
  
  // 3. Se o nome original tinha estado, tentar sem estado
  const originalNoState = name.replace(/-(RJ|SP|MG|RS|PR|BA|CE|DF|PB|PE|RN|ES|SC|GO|MS|MT|PA|MA|PI|AL|SE|TO|RO|AC|AM|RR|AP|CHI)$/i, "").trim();
  if (originalNoState !== name.trim() && originalNoState.length > 1) vars.add(originalNoState);
  
  // 4. Combinado: Sub-20 + estado
  const combined = name.replace(/\s+Sub[-\s]?20\s*$/i, "").replace(/-(RJ|SP|MG|RS|PR|BA|CE|DF|PB|PE|RN|ES|SC|GO|MS|MT|PA|MA|PI|AL|SE|TO|RO|AC|AM|RR|AP|CHI)$/i, "").trim();
  if (combined !== name.trim() && combined.length > 1) vars.add(combined);
  
  // 5. Variacoes de prefixo/sufixo originais
  const suffixVariations = [
    name.replace(/\s+(FC|SC|AC|SE|CA)$/i, ""),
    name.replace(/^SC\s+/i, ""),
    name.replace(/^SE\s+/i, ""),
    name.replace(/^CA\s+/i, ""),
    name.replace(/^CR\s+/i, ""),
  ];
  
  for (const v of suffixVariations) {
    if (v !== name.trim()) vars.add(v.trim());
  }
  
  // 6. Da base ja limpa, tentar sem prefixos
  for (const v of [...vars]) {
    const clean = v.replace(/^(SC|SE|CA|CR|EC|FC)\s+/i, "").trim();
    if (clean !== v && clean.length > 1) vars.add(clean);
  }
  
  return [...vars];
}

// Versao sincrona para uso imediato
function getTeamLogoSync(teamName) {
  if (!teamName) return null;
  
  const name = teamName.trim();
  
  // 0. Verificar LOGO_CACHE (TheSportsDB previamente buscado)
  const cacheKey = `sportsdb_${name}`;
  if (LOGO_CACHE[cacheKey] && (Date.now() - LOGO_CACHE[cacheKey].timestamp) < LOGO_CACHE_TTL) {
    return LOGO_CACHE[cacheKey].logoUrl;
  }
  
  // 1. Direto em TEAM_LOGOS
  if (TEAM_LOGOS[name]) return TEAM_LOGOS[name];
  
  // 2. Direto em EXTRA_TEAM_LOGOS
  if (EXTRA_TEAM_LOGOS[name]) return EXTRA_TEAM_LOGOS[name];
  
  // 3. Alias
  const alias = TEAM_ALIASES[name];
  if (alias) {
    if (TEAM_LOGOS[alias]) return TEAM_LOGOS[alias];
    if (EXTRA_TEAM_LOGOS[alias]) return EXTRA_TEAM_LOGOS[alias];
    const aliasCacheKey = `sportsdb_${alias}`;
    if (LOGO_CACHE[aliasCacheKey] && (Date.now() - LOGO_CACHE[aliasCacheKey].timestamp) < LOGO_CACHE_TTL) {
      return LOGO_CACHE[aliasCacheKey].logoUrl;
    }
  }
  
  // 4. Variacoes inteligentes
  const variations = generateNameVariations(name);
  for (const v of variations) {
    if (TEAM_LOGOS[v]) return TEAM_LOGOS[v];
    if (EXTRA_TEAM_LOGOS[v]) return EXTRA_TEAM_LOGOS[v];
    const vAlias = TEAM_ALIASES[v];
    if (vAlias) {
      if (TEAM_LOGOS[vAlias]) return TEAM_LOGOS[vAlias];
      if (EXTRA_TEAM_LOGOS[vAlias]) return EXTRA_TEAM_LOGOS[vAlias];
    }
    const vCacheKey = `sportsdb_${v}`;
    if (LOGO_CACHE[vCacheKey] && (Date.now() - LOGO_CACHE[vCacheKey].timestamp) < LOGO_CACHE_TTL) {
      return LOGO_CACHE[vCacheKey].logoUrl;
    }
  }
  
  return null;
}

// Fator de redução das odds (20%)
const ODDS_REDUCTION_FACTOR = 0.80;
const MINIMUM_ODD = 1.01;

// Função para reduzir odds
function reduceOdds(odd) {
  return Math.max(MINIMUM_ODD, Math.round(odd * ODDS_REDUCTION_FACTOR * 100) / 100);
}

// Função para reduzir todas as odds de um jogo
function reduceGameOdds(jogo) {
  const reduced = { ...jogo };
  
  // Reduzir odds 1X2
  if (reduced.odds_1x2) {
    reduced.odds_1x2 = {
      casa: reduceOdds(reduced.odds_1x2.casa),
      empate: reduceOdds(reduced.odds_1x2.empate),
      fora: reduceOdds(reduced.odds_1x2.fora)
    };
  }
  
  // Reduzir odds dos mercados
  if (reduced.mercados) {
    reduced.mercados = reduced.mercados.map(mercado => ({
      ...mercado,
      opcoes: mercado.opcoes.map(opcao => ({
        ...opcao,
        odd: reduceOdds(opcao.odd)
      }))
    }));
  }
  
  return reduced;
}

// ============================================================
// ENRIQUECER JOGOS COM LIGAS IDENTIFICADAS
// ============================================================

function enrichJogosWithLeagues(jogos) {
  return jogos.map(jogo => ({
    ...jogo,
    campeonato: identifyLeague(jogo),
    _originalLeague: jogo.campeonato
  }));
}

// ============================================================
// ALIASES DE NOMES DE TIMES (para quando a API retorna nomes diferentes)
// ============================================================

const TEAM_ALIASES = {
  // ====== BRASILEIROS ======
  // Flamengo
  "Flamengo": "Flamengo",
  "CR Flamengo": "Flamengo",
  "Flamengo RJ": "Flamengo",
  
  // Fluminense
  "Fluminense": "Fluminense",
  "Fluminense FC": "Fluminense",
  
  // Botafogo
  "Botafogo": "Botafogo",
  "Botafogo FR": "Botafogo",
  "Botafogo-RJ": "Botafogo",
  
  // Grêmio
  "Grêmio": "Grêmio",
  "Grêmio FBPA": "Grêmio",
  
  // Internacional
  "Internacional": "Internacional",
  "SC Internacional": "Internacional",
  
  // Corinthians
  "Corinthians": "Corinthians",
  "SC Corinthians": "Corinthians",
  "Corinthians-SP": "Corinthians",
  
  // Palmeiras
  "Palmeiras": "Palmeiras",
  "SE Palmeiras": "Palmeiras",
  
  // Santos
  "Santos": "Santos",
  "Santos FC": "Santos",
  
  // São Paulo
  "São Paulo": "São Paulo",
  "São Paulo FC": "São Paulo",
  "SPFC": "São Paulo",
  
  // Cruzeiro
  "Cruzeiro": "Cruzeiro",
  "Cruzeiro EC": "Cruzeiro",
  
  // Vasco
  "Vasco": "Vasco",
  "CR Vasco da Gama": "Vasco",
  "Vasco da Gama": "Vasco",
  
  // Athletico-PR
  "Athletico-PR": "Athletico-PR",
  "Athletico Paranaense": "Athletico-PR",
  "Club Athletico Paranaense": "Athletico-PR",
  
  // Atlético-MG
  "Atlético-MG": "Atlético-MG",
  "Club de Regatas Minas Brasil": "Atlético-MG",
  
  // Vitória
  "Vitória": "Vitória",
  "EC Vitória": "Vitória",
  
  // Sport
  "Sport": "Sport",
  "Sport Club do Recife": "Sport",
  
  // ====== EUROPEUS ======
  // Barcelona
  "Barcelona": "Barcelona",
  "FC Barcelona": "Barcelona",
  "Barça": "Barcelona",
  
  // Real Madrid
  "Real Madrid": "Real Madrid",
  "Real Madry": "Real Madrid",
  
  // Manchester City
  "Manchester City": "Manchester City",
  "Man City": "Manchester City",
  
  // Manchester United
  "Manchester United": "Manchester United",
  "Man United": "Manchester United",
  
  // Inter Milan
  "Inter Milan": "Inter Milan",
  "Inter": "Inter Milan",
  "FC Internazionale": "Inter Milan",
  
  // AC Milan
  "AC Milan": "AC Milan",
  "Milan": "AC Milan",
  
  // Bayern
  "Bayern": "Bayern",
  "Bayern München": "Bayern",
  "FC Bayern": "Bayern",
  
  // PSG
  "PSG": "PSG",
  "Paris Saint-Germain": "PSG",
  
  // Marseille
  "Olympique Marseille": "Olympique Marseille",
  "Marseille": "Olympique Marseille",
  "OM": "Olympique Marseille",
  
  // Liverpool
  "Liverpool": "Liverpool",
  "Liverpool FC": "Liverpool",
  
  // Arsenal
  "Arsenal": "Arsenal",
  "Arsenal FC": "Arsenal",
  
  // Chelsea
  "Chelsea": "Chelsea",
  "Chelsea FC": "Chelsea",
  
  // Tottenham
  "Tottenham": "Tottenham",
  "Tottenham Hotspur": "Tottenham",
  
  // ====== ARGENTINOS ======
  "Boca Juniors": "Boca Juniors",
  "CA Boca Juniors": "Boca Juniors",
  "River Plate": "River Plate",
  "CA River Plate": "River Plate",
  "Independiente": "Independiente",
  "Club Independiente": "Independiente",
  "Racing Club": "Racing Club",
  "Racing": "Racing Club",
  "San Lorenzo": "San Lorenzo",
  "San Lorenzo de Almagro": "San Lorenzo",

  // ====== VARIAÇÕES DO PLACAR ======
  "Ypiranga": "Ypiranga-RS",
  "Portuguesa": "Portuguesa-RJ",
  "Sampaio Corrêa-RJ": "Sampaio Corrêa",
  "Sampaio Correa-RJ": "Sampaio Corrêa",
  "São Luiz-RS": "São Luiz",
  "Sao Luiz-RS": "São Luiz",
  "Guarani-MG": "Guarani",
  "Everton de Viña": "Everton CD",
  "Everton de Vina": "Everton CD",
  "Rangers-CHI": "Rangers",
  "Bragantino Sub-20": "Red Bull Bragantino",
  "Olaria Sub-20": "Olaria",
  "Floresta Sub-20": "Floresta",
  "Athletico-PR Sub-20": "Athletico-PR",
  "Athletico Paranaense Sub-20": "Athletico-PR",
  "America-RJ": "América-RJ",
  "America-MG": "América-MG",
  "Ceará Sub-20": "Ceará",
  "Ceara Sub-20": "Ceará",
  "Fortaleza Sub-20": "Fortaleza",
  "Ferroviário Sub-20": "Ferroviário",
  "Ferroviario Sub-20": "Ferroviário",
  "Paranoá Sub-20": "Paranoá",
  "Paranoa Sub-20": "Paranoá",
  "Taguatinga Sub-20": "Taguatinga",
  "Ceilândia": "Ceilandia",
  "Ceilandia Sub-20": "Ceilandia",
  "SESP Taguatinga Sub-20": "Taguatinga",
  "CA Taguatinga Sub-20": "Taguatinga",
  "Real-DF Sub-20": "Real Brasília",
  "Real-DF Sub-20": "Real Brasilia",
  "Tianguá Sub-20": "Tianguá",
  "Tiangua Sub-20": "Tianguá",
  "Camacari Sub-20": "Camaçari",
  "Vila Real Sub-20": "Vila Real",
  "Alianca Sub-20": "Aliança",
  "Queimadense Sub-20": "Queimadense",
  "America-RJ Sub-20": "América-RJ",
  "America-RN": "América-RN",

  // ====== SELEÇÕES ======
  "Curaçao": "Curaçao",
  "Curacao": "Curaçao",
  "Costa do Marfim": "Costa do Marfim",
  "Holanda": "Holanda",
  "Suécia": "Suécia",
  "Suecia": "Suécia",
  "Equador": "Equador",
  "Paraguai": "Paraguai",

  // ====== TIMES ÓRFÃOS (sem logo direto) ======
  "Portuguesa": "Portuguesa-RJ",
  "São Gonçalo EC RJ": "São Gonçalo",
  "CA Taguatinga Sub-20": "SESP Taguatinga",
  "Tianguá Sub-20": "Tianguá",
  "Grêmio Valparaíso Sub-20": "Grêmio Valparaiso",
  "José Bonifácio": "Jose Bonifacio",
};

// Função para encontrar logo com aliases (sincrona)
function findTeamLogoByName(teamName) {
  return getTeamLogoSync(teamName);
}

// Exportar para uso global
window.TeamLeagueMap = TEAM_LEAGUE_MAP;
window.LeaguePriority = LEAGUE_PRIORITY;
window.identifyLeague = identifyLeague;
window.sortLeagues = sortLeagues;
window.enrichJogosWithLeagues = enrichJogosWithLeagues;
window.TEAM_LOGOS = TEAM_LOGOS;
window.TEAM_ALIASES = TEAM_ALIASES;
window.findTeamLogoByName = findTeamLogoByName;
window.reduceOdds = reduceOdds;
window.reduceGameOdds = reduceGameOdds;

// Novas funções de logo
window.getTeamLogo = getTeamLogo;
window.getTeamLogoSync = getTeamLogoSync;
window.fetchTeamLogoFromTheSportsDB = fetchTeamLogoFromTheSportsDB;
window.LOGO_CACHE = LOGO_CACHE;
window.EXTRA_TEAM_LOGOS = EXTRA_TEAM_LOGOS;
window.loadExtraTeamLogos = loadExtraTeamLogos;