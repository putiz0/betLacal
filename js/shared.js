function getFinancialTotals(history) {
  return history.reduce((acc, bet) => {
    const value = Number(bet.valor || 0);
    const returnValue = Number(bet.retorno || 0);
    if (bet.status !== "Cancelada") acc.totalStaked += value;
    if (bet.status === "Perdida") acc.grossProfit += value;
    if (bet.status === "Ganha" || bet.status === "Paga") acc.prizes += returnValue;
    if (bet.status === "Aberta" || bet.status === "Ganha") acc.exposure += returnValue;
    acc.net = acc.grossProfit - acc.prizes;
    return acc;
  }, { totalStaked: 0, grossProfit: 0, prizes: 0, exposure: 0, net: 0 });
}

function mostCommon(values) {
  const counts = values.filter(Boolean).reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function statusClass(status) {
  return normalize(status || "Aberta").replace(/\s+/g, "-");
}

function renderSelectionsSummary(bet, showSettlement = false) {
  return (bet.selections || []).map(item => `
    <div>
      <strong>${window.BetLocal.escapeHTML(item.jogo)}</strong><br>
      <small>${window.BetLocal.escapeHTML(item.mercado)}: ${window.BetLocal.escapeHTML(item.opcao)} @ ${window.BetLocal.formatOdd(item.odd)}</small>
      ${showSettlement && item.settlement ? `<br><small>🏁 ${window.BetLocal.escapeHTML(item.settlement)}</small>` : ""}
    </div>
  `).join("");
}

function exportCSV(data, filename = "export.csv") {
  if (!data.length) {
    showToast("Nenhum dado para exportar.", "warning");
    return;
  }

  const headers = Object.keys(data[0]);
  const lines = data.map(row =>
    headers.map(h => {
      const val = row[h];
      const str = val == null ? "" : String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Arquivo "${filename}" exportado!`);
}
