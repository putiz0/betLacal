const SUPABASE_URL = window.BetLocalConfig?.supabaseUrl || "https://uagwqerjcjjlnftytkqe.supabase.co";
const SUPABASE_ANON_KEY = window.BetLocalConfig?.supabaseAnonKey || "sb_publishable_K6kMg8_wOUqzrpP3xziF2Q_PpSz4-Z6";
const BETLOCAL_BETS_TABLE = "Apostas";

const betLocalSupabaseClient = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function betToSupabaseRow(bet) {
  return {
    cliente_id: bet.cliente_id || window.BetLocalTenant?.getCurrentClient?.()?.id || "cliente-local",
    codigo: bet.codigo,
    data_iso: bet.data_iso,
    data: bet.data,
    selections: bet.selections,
    odd_total: Number(bet.odd_total),
    valor: Number(bet.valor),
    retorno: Number(bet.retorno),
    status: bet.status,
    pagamento: bet.pagamento,
    settlement_note: bet.settlement_note || null,
    atualizado_em: bet.atualizado_em || null
  };
}

function rowToBet(row) {
  return {
    cliente_id: row.cliente_id,
    codigo: row.codigo,
    data_iso: row.data_iso,
    data: row.data || new Date(row.data_iso).toLocaleString("pt-BR"),
    selections: row.selections || [],
    odd_total: Number(row.odd_total),
    valor: Number(row.valor),
    retorno: Number(row.retorno),
    status: row.status || "Aberta",
    pagamento: row.pagamento || "Pendente",
    settlement_note: row.settlement_note || null,
    atualizado_em: row.atualizado_em || null
  };
}

let _realtimeChannel = null;

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

  async fetchCurrentProfile() {
    if (!this.client) return null;

    const { data: authData, error: authError } = await this.client.auth.getUser();
    if (authError || !authData?.user) return null;

    const { data, error } = await this.client
      .from("user_profiles")
      .select("user_id, cliente_id, role, nome")
      .eq("user_id", authData.user.id)
      .single();

    if (error) throw error;
    return data;
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
      .eq("codigo", code)
      .eq("cliente_id", window.BetLocalTenant?.getCurrentClient?.()?.id || "cliente-local");

    if (error) throw error;
    return { ok: true };
  },

  async updateBet(bet) {
    if (!this.client) return { ok: false, skipped: true };

    const { error } = await this.client
      .from(BETLOCAL_BETS_TABLE)
      .update(betToSupabaseRow({ ...bet, atualizado_em: new Date().toLocaleString("pt-BR") }))
      .eq("codigo", bet.codigo)
      .eq("cliente_id", bet.cliente_id || window.BetLocalTenant?.getCurrentClient?.()?.id || "cliente-local");

    if (error) throw error;
    return { ok: true };
  },

  async fetchBets() {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from(BETLOCAL_BETS_TABLE)
      .select("*")
      .eq("cliente_id", window.BetLocalTenant?.getCurrentClient?.()?.id || "cliente-local")
      .order("data_iso", { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToBet);
  },

  subscribeToBetUpdates(callback) {
    if (!this.client) return null;
    if (_realtimeChannel) {
      this.client.removeChannel(_realtimeChannel);
    }
    _realtimeChannel = this.client
      .channel("betlocal-bets")
      .on("postgres_changes", { event: "*", schema: "public", table: BETLOCAL_BETS_TABLE }, (payload) => {
        if (typeof callback === "function") {
          callback(payload);
        }
      })
      .subscribe();
    return _realtimeChannel;
  },

  unsubscribeFromBetUpdates() {
    if (_realtimeChannel && this.client) {
      this.client.removeChannel(_realtimeChannel);
      _realtimeChannel = null;
    }
  }
};
