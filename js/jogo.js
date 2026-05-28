document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const jogos = await window.BetLocal.fetchJogos();
  const jogo = jogos.find((item) => String(item.id) === String(id)) || jogos[0];

  if (!jogo) {
    document.getElementById("match-banner").innerHTML = `
      <div class="match-banner-inner">
        <div>
          <span class="eyebrow">Jogo indisponível</span>
          <h1>Nenhum jogo encontrado</h1>
          <p>Volte para a página principal e escolha outra partida.</p>
        </div>
      </div>
    `;
    return;
  }

  renderMatchBanner(jogo);
  renderMarkets(jogo, jogos);
});

function renderMatchBanner(jogo) {
  const banner = document.getElementById("match-banner");
  const score = jogo.placar ? jogo.placar.split("-").map((part) => part.trim()) : ["-", "-"];
  const isLive = jogo.status?.toLowerCase().includes("vivo");

  banner.innerHTML = `
    <div class="match-banner-inner">
      <div>
        <span class="eyebrow">${window.BetLocal.escapeHTML(jogo.campeonato)}</span>
        <div class="match-teams">
          <div class="match-team">
            ${window.BetLocal.renderTeamLogo(jogo.logo_casa, jogo.time_casa, "large")}
            <span>${window.BetLocal.escapeHTML(jogo.time_casa)}</span>
          </div>
          <strong>x</strong>
          <div class="match-team">
            ${window.BetLocal.renderTeamLogo(jogo.logo_fora, jogo.time_fora, "large")}
            <span>${window.BetLocal.escapeHTML(jogo.time_fora)}</span>
          </div>
        </div>
        <p>${window.BetLocal.escapeHTML(jogo.data)} • ${window.BetLocal.escapeHTML(jogo.hora)} • ${window.BetLocal.escapeHTML(jogo.status)}</p>
      </div>
      <div class="scoreboard" aria-label="Placar">
        <span class="status-badge ${isLive ? "live" : ""}">${window.BetLocal.escapeHTML(jogo.status)}</span>
        <strong>${window.BetLocal.escapeHTML(score[0])}</strong>
        <span>x</span>
        <strong>${window.BetLocal.escapeHTML(score[1])}</strong>
      </div>
    </div>
  `;
}

function renderMarkets(jogo, jogos) {
  const container = document.getElementById("mercados-container");
  if (!container) return;

  const allMarkets = [
    {
      nome: "Resultado final",
      descricao: "Aposta no vencedor da partida ou no empate ao fim do tempo regulamentar.",
      opcoes: [
        { nome: jogo.time_casa, odd: jogo.odds_1x2.casa },
        { nome: "Empate", odd: jogo.odds_1x2.empate },
        { nome: jogo.time_fora, odd: jogo.odds_1x2.fora }
      ]
    },
    ...(jogo.mercados || []).filter((market) => market.nome !== "Resultado final")
  ];

  container.innerHTML = allMarkets.map((market) => `
    <article class="market-box">
      <div class="market-title">
        <h3>${window.BetLocal.escapeHTML(market.nome)}</h3>
        <button class="info-badge" type="button" aria-label="Explicação do mercado ${window.BetLocal.escapeHTML(market.nome)}">
          !
          <span>${window.BetLocal.escapeHTML(market.descricao || "Mercado de aposta disponivel para este jogo.")}</span>
        </button>
      </div>
      <div class="market-buttons">
        ${market.opcoes.map((option) => window.BetLocal.renderOddButton(jogo, market.nome, option.nome, option.odd)).join("")}
      </div>
    </article>
  `).join("");

  window.BetLocal.wireOddButtons(container, jogos);
}
