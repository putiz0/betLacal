const SUPABASE_URL = "https://uagwqerjcjjlnftytkqe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_K6kMg8_wOUqzrpP3xziF2Q_PpSz4-Z6";
const BETLOCAL_BETS_TABLE = "Apostas";

const betLocalSupabaseClient = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function betToSupabaseRow(bet) {
  return {
    codigo: bet.codigo,
    data_iso: bet.data_iso,
    data: bet.data,
    selections: bet.selections,
    odd_total: Number(bet.odd_total),
    valor: Number(bet.valor),
    retorno: Number(bet.retorno),
    status: bet.status,
    pagamento: bet.pagamento,
    atualizado_em: bet.atualizado_em || null
  };
}

function rowToBet(row) {
  return {
    codigo: row.codigo,
    data_iso: row.data_iso,
    data: row.data || new Date(row.data_iso).toLocaleString("pt-BR"),
    selections: row.selections || [],
    odd_total: Number(row.odd_total),
    valor: Number(row.valor),
    retorno: Number(row.retorno),
    status: row.status || "Aberta",
    pagamento: row.pagamento || "Pendente",
    atualizado_em: row.atualizado_em || null
  };
}

window.BetLocalSupabase = {
  client: betLocalSupabaseClient,

  isEnabled() {
    return Boolean(this.client);
  },

  async insertBet(bet) {
    if (!this.client) return { ok: false, skipped: true };
    const { error } = await this.client
      .from(BETLOCAL_BETS_TABLE)
      .insert(betToSupabaseRow(bet));

    if (error) throw error;
    return { ok: true };
  },

  async updateBetStatus(code, status) {
    if (!this.client) return { ok: false, skipped: true };

    const payload = {
      status,
      pagamento: status === "Paga" ? "Pago" : "Pendente",
      atualizado_em: new Date().toLocaleString("pt-BR")
    };

    const { error } = await this.client
      .from(BETLOCAL_BETS_TABLE)
      .update(payload)
      .eq("codigo", code);

    if (error) throw error;
    return { ok: true };
  },

  async fetchBets() {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from(BETLOCAL_BETS_TABLE)
      .select("*")
      .order("data_iso", { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToBet);
  }
};
