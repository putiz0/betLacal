(function (root) {
  var OddsCalc = {};

  function factorial(n) {
    if (n <= 1) return 1;
    var r = 1;
    for (var i = 2; i <= n; i++) r *= i;
    return r;
  }

  function poissonProb(k, lambda) {
    return Math.pow(lambda, k) * Math.exp(-lambda) / factorial(k);
  }

  function poissonCumulative(k, lambda) {
    var sum = 0;
    for (var i = 0; i <= k; i++) sum += poissonProb(i, lambda);
    return sum;
  }

  OddsCalc.poissonProb = poissonProb;
  OddsCalc.poissonCumulative = poissonCumulative;

  function getTeamStat(stats, team, stat, defaultValue) {
    if (!stats || !stats[team]) return defaultValue;
    var val = stats[team][stat];
    return (val !== undefined && val !== null) ? val : defaultValue;
  }

  OddsCalc.getTeamStat = getTeamStat;

  function extractStatsFromJogo(jogo) {
    var stats = jogo._estatisticas;
    if (!stats) return null;
    var home = jogo.time_casa || jogo.home || '';
    var away = jogo.time_fora || jogo.away || '';
    return {
      homeAvgGf: getTeamStat(stats, home, 'avg_gf', 1.4),
      homeAvgGa: getTeamStat(stats, home, 'avg_ga', 1.2),
      awayAvgGf: getTeamStat(stats, away, 'avg_gf', 1.2),
      awayAvgGa: getTeamStat(stats, away, 'avg_ga', 1.4),
      homeAvgCrdy: getTeamStat(stats, home, 'avg_crdy', 2.0),
      awayAvgCrdy: getTeamStat(stats, away, 'avg_crdy', 2.2),
      homeAvgCrdr: getTeamStat(stats, home, 'avg_crdr', 0.08),
      awayAvgCrdr: getTeamStat(stats, away, 'avg_crdr', 0.1),
      homePoss: getTeamStat(stats, home, 'possession', 50),
      awayPoss: getTeamStat(stats, away, 'possession', 50),
    };
  }

  OddsCalc.extractStatsFromJogo = extractStatsFromJogo;

  function calculateGoalExpectancy(homeStats, awayStats, leagueAvgGf) {
    var leagueAvg = leagueAvgGf || 1.4;
    var homeAttack = homeStats ? (homeStats.avg_gf / leagueAvg) : 1.0;
    var awayDefense = awayStats ? (awayStats.avg_ga / leagueAvg) : 1.0;
    return leagueAvg * homeAttack * awayDefense;
  }

  OddsCalc.calculateGoalExpectancy = calculateGoalExpectancy;

  function calculateOverUnderOdds(lambda, line, overRound, underRound) {
    var probUnder = poissonCumulative(Math.floor(line), lambda);
    var probOver = 1 - probUnder;
    var oddOver = probOver > 0 ? (1 / probOver) * (overRound || 1.0) : 10;
    var oddUnder = probUnder > 0 ? (1 / probUnder) * (underRound || 1.0) : 10;
    return {
      over: Math.round(oddOver * 100) / 100,
      under: Math.round(oddUnder * 100) / 100,
      probOver: probOver,
      probUnder: probUnder
    };
  }

  OddsCalc.calculateOverUnderOdds = calculateOverUnderOdds;

  function calculateBothTeamsToScore(lambdaHome, lambdaAway, roundFactor) {
    roundFactor = roundFactor || 0.85;
    var probHomeScore = 1 - poissonProb(0, lambdaHome);
    var probAwayScore = 1 - poissonProb(0, lambdaAway);
    var probSim = probHomeScore * probAwayScore;
    var probNao = 1 - probSim;
    return {
      sim: probSim > 0 ? Math.round((1 / probSim) * (1 + (1 - roundFactor)) * 100) / 100 : 10,
      nao: probNao > 0 ? Math.round((1 / probNao) * (1 + (1 - roundFactor)) * 100) / 100 : 10
    };
  }

  OddsCalc.calculateBothTeamsToScore = calculateBothTeamsToScore;

  function calculateExactScoreOdds(lambdaHome, lambdaAway) {
    var scores = [
      { h: 0, a: 0 }, { h: 1, a: 0 }, { h: 2, a: 0 }, { h: 3, a: 0 },
      { h: 0, a: 1 }, { h: 1, a: 1 }, { h: 2, a: 1 }, { h: 3, a: 1 },
      { h: 0, a: 2 }, { h: 1, a: 2 }, { h: 2, a: 2 },
      { h: 0, a: 3 }, { h: 1, a: 3 },
    ];
    return scores.map(function (s) {
      var prob = poissonProb(s.h, lambdaHome) * poissonProb(s.a, lambdaAway);
      var odd = prob > 0.0001 ? Math.round((1 / prob) * 0.92 * 100) / 100 : 50;
      return { nome: s.h + ' x ' + s.a, odd: Math.max(1.01, odd) };
    });
  }

  OddsCalc.calculateExactScoreOdds = calculateExactScoreOdds;

  function calculateHalfTimeResultOdds(lambdaHome, lambdaAway) {
    var homeProb = 0, drawProb = 0, awayProb = 0;
    for (var h = 0; h <= 5; h++) {
      for (var a = 0; a <= 5; a++) {
        if (h === a && h > 5) continue;
        var prob = poissonProb(h * 0.45, lambdaHome * 0.45) * poissonProb(a * 0.45, lambdaAway * 0.45);
        if (h > a) homeProb += prob;
        else if (h === a) drawProb += prob;
        else awayProb += prob;
      }
    }
    var total = homeProb + drawProb + awayProb;
    var round = 0.88;
    return {
      home: total > 0 ? Math.round((1 / (homeProb / total)) * round * 100) / 100 : 2.5,
      draw: total > 0 ? Math.round((1 / (drawProb / total)) * round * 100) / 100 : 2.0,
      away: total > 0 ? Math.round((1 / (awayProb / total)) * round * 100) / 100 : 2.8
    };
  }

  OddsCalc.calculateHalfTimeResultOdds = calculateHalfTimeResultOdds;

  function calculateDoubleChance(lambdaHome, lambdaAway) {
    var maxGoals = Math.max(4, Math.ceil(lambdaHome + lambdaAway) + 3);
    var homeWin = 0, draw = 0, awayWin = 0;
    for (var h = 0; h <= maxGoals; h++) {
      for (var a = 0; a <= maxGoals; a++) {
        var prob = poissonProb(h, lambdaHome) * poissonProb(a, lambdaAway);
        if (h > a) homeWin += prob;
        else if (h === a) draw += prob;
        else awayWin += prob;
      }
    }
    var total = homeWin + draw + awayWin;
    var round = 0.88;
    return {
      homeOuEmpate: total > 0 ? Math.round((1 / ((homeWin + draw) / total)) * round * 100) / 100 : 1.2,
      homeOuAway: total > 0 ? Math.round((1 / ((homeWin + awayWin) / total)) * round * 100) / 100 : 1.35,
      awayOuEmpate: total > 0 ? Math.round((1 / ((awayWin + draw) / total)) * round * 100) / 100 : 1.3,
      homeWin: total > 0 ? Math.round((1 / (homeWin / total)) * round * 100) / 100 : 2.5,
      awayWin: total > 0 ? Math.round((1 / (awayWin / total)) * round * 100) / 100 : 3.0,
      draw: total > 0 ? Math.round((1 / (draw / total)) * round * 100) / 100 : 3.2
    };
  }

  OddsCalc.calculateDoubleChance = calculateDoubleChance;

  function calculateMatchOdds1X2(lambdaHome, lambdaAway, margin) {
    margin = margin || 0.05;
    var maxGoals = Math.max(4, Math.ceil(lambdaHome + lambdaAway) + 3);
    var homeWin = 0, draw = 0, awayWin = 0;
    for (var h = 0; h <= maxGoals; h++) {
      for (var a = 0; a <= maxGoals; a++) {
        var prob = poissonProb(h, lambdaHome) * poissonProb(a, lambdaAway);
        if (h > a) homeWin += prob;
        else if (h === a) draw += prob;
        else awayWin += prob;
      }
    }
    var total = homeWin + draw + awayWin;
    var overround = 1 + margin;
    var maxOdds = 50;
    return {
      casa: total > 0 ? Math.min(maxOdds, Math.round((overround / (homeWin / total)) * 100) / 100) : maxOdds,
      empate: total > 0 ? Math.min(maxOdds, Math.round((overround / (draw / total)) * 100) / 100) : maxOdds,
      fora: total > 0 ? Math.min(maxOdds, Math.round((overround / (awayWin / total)) * 100) / 100) : maxOdds
    };
  }

  OddsCalc.calculateMatchOdds1X2 = calculateMatchOdds1X2;

  function calculateAsianHandicap(lambdaHome, lambdaAway) {
    var odds = calculateDoubleChance(lambdaHome, lambdaAway);
    return {
      home_neg_05: Math.round((1 / (1 / odds.homeWin)) * 1.05 * 100) / 100,
      away_pos_05: Math.round((1 / (1 - 1 / odds.homeWin)) * 1.05 * 100) / 100,
      home_neg_10: Math.round((1 / ((1 / odds.homeWin) + (1 / odds.draw) * 0.3)) * 100) / 100,
      away_pos_10: Math.round((1 / (1 - (1 / odds.homeWin) - (1 / odds.draw) * 0.3)) * 100) / 100
    };
  }

  OddsCalc.calculateAsianHandicap = calculateAsianHandicap;

  function decimalOdd(seed, base) {
    base = base || 1.65;
    return Math.round((base + ((seed * 37) % 145) / 100) * 100) / 100;
  }

  OddsCalc.decimalOdd = decimalOdd;

  function reduceOdd(odd) {
    return Math.max(1.01, Math.round(odd * 0.8 * 100) / 100);
  }

  OddsCalc.reduceOdd = reduceOdd;

  function buildMarketsFromStats(home, away, stats) {
    var s = extractStatsFromJogo({ _estatisticas: stats, time_casa: home, time_fora: away });
    var leagueAvg = 1.35;
    var lambdaHome = calculateGoalExpectancy(
      { avg_gf: s.homeAvgGf, avg_ga: s.homeAvgGa },
      { avg_gf: s.awayAvgGf, avg_ga: s.awayAvgGa },
      leagueAvg
    );
    var lambdaAway = calculateGoalExpectancy(
      { avg_gf: s.awayAvgGf, avg_ga: s.awayAvgGa },
      { avg_gf: s.homeAvgGf, avg_ga: s.homeAvgGa },
      leagueAvg
    );
    var lambdaTotal = lambdaHome + lambdaAway;
    var lambdaCornerTotal = (s.homeAvgGf + s.awayAvgGf + s.homeAvgGa + s.awayAvgGa) * 1.8;
    var lambdaCardTotal = s.homeAvgCrdy + s.awayAvgCrdy + s.homeAvgCrdr + s.awayAvgCrdr;

    var bt = calculateBothTeamsToScore(lambdaHome, lambdaAway);
    var ou = {
      '0.5': calculateOverUnderOdds(lambdaTotal, 0.5),
      '1.5': calculateOverUnderOdds(lambdaTotal, 1.5),
      '2.5': calculateOverUnderOdds(lambdaTotal, 2.5),
      '3.5': calculateOverUnderOdds(lambdaTotal, 3.5)
    };
    var scores = calculateExactScoreOdds(lambdaHome, lambdaAway);
    var ht = calculateHalfTimeResultOdds(lambdaHome, lambdaAway);
    var dc = calculateDoubleChance(lambdaHome, lambdaAway);
    var ah = calculateAsianHandicap(lambdaHome, lambdaAway);

    var corners = calculateOverUnderOdds(Math.max(lambdaCornerTotal, 5), 7.5);
    var corners85 = calculateOverUnderOdds(Math.max(lambdaCornerTotal, 5), 8.5);
    var corners95 = calculateOverUnderOdds(Math.max(lambdaCornerTotal, 5), 9.5);

    var cards35 = calculateOverUnderOdds(Math.max(lambdaCardTotal, 2), 3.5);
    var cards45 = calculateOverUnderOdds(Math.max(lambdaCardTotal, 2), 4.5);
    var cards55 = calculateOverUnderOdds(Math.max(lambdaCardTotal, 2), 5.5);

    var htGoals = calculateOverUnderOdds(lambdaTotal * 0.45, 0.5);
    var htGoals15 = calculateOverUnderOdds(lambdaTotal * 0.45, 1.5);
    var stGoals = calculateOverUnderOdds(lambdaTotal * 0.55, 0.5);
    var stGoals15 = calculateOverUnderOdds(lambdaTotal * 0.55, 1.5);

    return [
      {
        nome: "Dupla chance",
        descricao: "Aposte em duas possibilidades de resultado ao mesmo tempo.",
        opcoes: [
          { nome: home + " ou Empate", odd: dc.homeOuEmpate },
          { nome: home + " ou " + away, odd: dc.homeOuAway },
          { nome: "Empate ou " + away, odd: dc.awayOuEmpate }
        ]
      },
      {
        nome: "Ambas marcam",
        descricao: "Aposte se os dois times irao marcar pelo menos um gol.",
        opcoes: [
          { nome: "Sim", odd: bt.sim },
          { nome: "Nao", odd: bt.nao }
        ]
      },
      {
        nome: "Total de gols",
        descricao: "Aposte no numero total de gols da partida.",
        opcoes: [
          { nome: "Mais de 0.5", odd: ou['0.5'].over },
          { nome: "Mais de 1.5", odd: ou['1.5'].over },
          { nome: "Mais de 2.5", odd: ou['2.5'].over },
          { nome: "Mais de 3.5", odd: ou['3.5'].over },
          { nome: "Menos de 2.5", odd: ou['2.5'].under },
          { nome: "Menos de 3.5", odd: ou['3.5'].under }
        ]
      },
      {
        nome: "Intervalo - Resultado",
        descricao: "Aposte no resultado apenas do primeiro tempo.",
        opcoes: [
          { nome: home, odd: ht.home },
          { nome: "Empate", odd: ht.draw },
          { nome: away, odd: ht.away }
        ]
      },
      {
        nome: "Escanteios - Total",
        descricao: "Aposte no total de escanteios da partida.",
        opcoes: [
          { nome: "Mais de 7.5", odd: corners.over },
          { nome: "Mais de 8.5", odd: corners85.over },
          { nome: "Mais de 9.5", odd: corners95.over },
          { nome: "Menos de 8.5", odd: corners85.under },
          { nome: "Menos de 9.5", odd: corners95.under }
        ]
      },
      {
        nome: "Escanteios - Handicap",
        descricao: "Aposte no handicap de escanteios entre os times.",
        opcoes: [
          { nome: home + " -2.5", odd: Math.round((1 / (s.homeAvgGf / (s.homeAvgGf + s.awayAvgGf + 0.01))) * 0.9 * 100) / 100 },
          { nome: away + " +2.5", odd: Math.round((1 / (s.awayAvgGf / (s.homeAvgGf + s.awayAvgGf + 0.01))) * 0.9 * 100) / 100 }
        ]
      },
      {
        nome: "Cartoes - Total",
        descricao: "Aposte no numero total de cartoes amarelos e vermelhos.",
        opcoes: [
          { nome: "Mais de 3.5", odd: cards35.over },
          { nome: "Mais de 4.5", odd: cards45.over },
          { nome: "Mais de 5.5", odd: cards55.over },
          { nome: "Menos de 4.5", odd: cards45.under },
          { nome: "Menos de 5.5", odd: cards55.under }
        ]
      },
      {
        nome: "Handicap Asiatico",
        descricao: "Aposte com vantagem ou desvantagem de gols para um time.",
        opcoes: [
          { nome: home + " -0.5", odd: Math.max(1.1, ah.home_neg_05) },
          { nome: away + " +0.5", odd: Math.max(1.1, ah.away_pos_05) },
          { nome: home + " -1.0", odd: Math.max(1.1, ah.home_neg_10) },
          { nome: away + " +1.0", odd: Math.max(1.1, ah.away_pos_10) }
        ]
      },
      {
        nome: "Placar correto",
        descricao: "Aposte no resultado exato da partida.",
        opcoes: scores
      },
      {
        nome: "Primeiro gol",
        descricao: "Aposte em qual time marcara o primeiro gol.",
        opcoes: [
          { nome: home, odd: Math.round((1 / (lambdaHome / (lambdaHome + lambdaAway + 0.01))) * 0.9 * 100) / 100 },
          { nome: "Nenhum gol", odd: Math.round((1 / (Math.exp(-lambdaHome - lambdaAway))) * 0.85 * 100) / 100 },
          { nome: away, odd: Math.round((1 / (lambdaAway / (lambdaHome + lambdaAway + 0.01))) * 0.9 * 100) / 100 }
        ]
      },
      {
        nome: "Ultimo gol",
        descricao: "Aposte em qual time marcara o ultimo gol.",
        opcoes: [
          { nome: home, odd: Math.round((1 / (lambdaHome / (lambdaHome + lambdaAway + 0.01))) * 0.92 * 100) / 100 },
          { nome: "Nenhum gol", odd: Math.round((1 / (Math.exp(-lambdaHome - lambdaAway))) * 0.85 * 100) / 100 },
          { nome: away, odd: Math.round((1 / (lambdaAway / (lambdaHome + lambdaAway + 0.01))) * 0.92 * 100) / 100 }
        ]
      },
      {
        nome: "Gols no 1 tempo",
        descricao: "Aposte quantos gols serao marcados no primeiro tempo.",
        opcoes: [
          { nome: "Mais de 0.5", odd: htGoals.over },
          { nome: "Mais de 1.5", odd: htGoals15.over },
          { nome: "Menos de 1.5", odd: htGoals15.under },
          { nome: "Nenhum gol", odd: Math.round((1 / (Math.exp(-lambdaTotal * 0.45))) * 0.85 * 100) / 100 }
        ]
      },
      {
        nome: "Gols no 2 tempo",
        descricao: "Aposte quantos gols serao marcados no segundo tempo.",
        opcoes: [
          { nome: "Mais de 0.5", odd: stGoals.over },
          { nome: "Mais de 1.5", odd: stGoals15.over },
          { nome: "Menos de 1.5", odd: stGoals15.under },
          { nome: "Nenhum gol", odd: Math.round((1 / (Math.exp(-lambdaTotal * 0.55))) * 0.85 * 100) / 100 }
        ]
      },
      {
        nome: "Vencedor + Total",
        descricao: "Aposte na combinacao de vencedor e total de gols.",
        opcoes: [
          { nome: home + " + Mais de 2.5", odd: Math.round(dc.homeWin * ou['2.5'].over * 0.5 * 100) / 100 },
          { nome: home + " + Menos de 2.5", odd: Math.round(dc.homeWin * ou['2.5'].under * 0.5 * 100) / 100 },
          { nome: away + " + Mais de 2.5", odd: Math.round(dc.awayWin * ou['2.5'].over * 0.5 * 100) / 100 },
          { nome: away + " + Menos de 2.5", odd: Math.round(dc.awayWin * ou['2.5'].under * 0.5 * 100) / 100 },
          { nome: "EMP + Mais de 2.5", odd: Math.round(dc.draw * ou['2.5'].over * 0.5 * 100) / 100 }
        ]
      }
    ];
  }

  OddsCalc.buildMarketsFromStats = buildMarketsFromStats;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OddsCalc;
  } else {
    root.OddsCalc = OddsCalc;
  }
})(this);
