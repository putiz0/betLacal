const SUPABASE_URL = window.BetLocalConfig?.supabaseUrl || "";
const SUPABASE_ANON_KEY = window.BetLocalConfig?.supabaseAnonKey || "";
const BETLOCAL_BETS_TABLE = "Apostas";

// Só cria o cliente se a configuração estiver completa; caso contrário,
// o app roda em modo degradado (demo) sem acionar o backend.
const betLocalSupabaseClient =
  window.supabase?.createClient && SUPABASE_URL && SUPABASE_ANON_KEY
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

const TEAM_LOGOS_TABLE = "team_logos";
const TEAM_LOGOS_BUCKET = "team-logos";

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
  },

  // ==================== TEAM LOGOS ====================

  async fetchAllTeamLogos() {
    if (!this.client) return [];
    const { data, error } = await this.client
      .from(TEAM_LOGOS_TABLE)
      .select("team_name, logo_url, storage_path, updated_at")
      .order("team_name", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async saveTeamLogo(teamName, logoUrl, storagePath) {
    if (!this.client) return { ok: false, skipped: true };
    const { error } = await this.client
      .from(TEAM_LOGOS_TABLE)
      .upsert({
        team_name: teamName,
        logo_url: logoUrl,
        storage_path: storagePath || null
      }, { onConflict: "team_name" });
    if (error) throw error;
    return { ok: true };
  },

  async deleteTeamLogo(teamName) {
    if (!this.client) return { ok: false, skipped: true };
    const { error } = await this.client
      .from(TEAM_LOGOS_TABLE)
      .delete()
      .eq("team_name", teamName);
    if (error) throw error;
    return { ok: true };
  },

  async uploadTeamLogoImage(file, teamName) {
    if (!this.client) return { ok: false, skipped: true, url: null };
    const ext = file.name.split(".").pop() || "png";
    const fileName = `logos/${teamName.replace(/[^a-zA-Z0-9_-]/g, "_")}.${ext}`;

    const { error: uploadError } = await this.client
      .storage
      .from(TEAM_LOGOS_BUCKET)
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = this.client
      .storage
      .from(TEAM_LOGOS_BUCKET)
      .getPublicUrl(fileName);

    const logoUrl = urlData?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/${TEAM_LOGOS_BUCKET}/${fileName}`;
    return { ok: true, url: logoUrl, storagePath: fileName };
  },

  async deleteTeamLogoImage(storagePath) {
    if (!this.client || !storagePath) return { ok: false, skipped: true };
    const { error } = await this.client
      .storage
      .from(TEAM_LOGOS_BUCKET)
      .remove([storagePath]);
    if (error) throw error;
    return { ok: true };
  },

  async syncTeamLogosFromLocal(teamName, logoUrl) {
    if (!this.client || !teamName || !logoUrl) return null;
    const existing = await this.fetchAllTeamLogos();
    const found = existing.find(t => t.team_name === teamName);
    if (found) return found.logo_url;
    await this.saveTeamLogo(teamName, logoUrl);
    return logoUrl;
  }
};
