import httpx
import sys
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')

# Mapeamento de times
TEAM_LEAGUE_MAP = {
    "Flamengo": "Campeonato Brasileiro Serie A",
    "Fluminense": "Campeonato Brasileiro Serie A",
    "Botafogo": "Campeonato Brasileiro Serie A",
    "Grêmio": "Campeonato Brasileiro Serie A",
    "Internacional": "Campeonato Brasileiro Serie A",
    "Cuiabá": "Campeonato Brasileiro Serie A",
    "Vila Nova": "Campeonato Brasileiro Serie B",
    "Goiás": "Campeonato Brasileiro Serie B",
    "Sport": "Campeonato Brasileiro Serie B",
    "Juventude": "Campeonato Brasileiro Serie B",
    "Ponte Preta": "Campeonato Brasileiro Serie B",
    "Botafogo-SP": "Campeonato Brasileiro Serie B",
    "Brusque": "Campeonato Brasileiro Serie B",
    "São Bernardo": "Campeonato Brasileiro Serie C",
    "Paysandu": "Campeonato Brasileiro Serie C",
    "Náutico": "Campeonato Brasileiro Serie C",
    "Tombense": "Campeonato Brasileiro Serie C",
    "Santa Cruz": "Campeonato Brasileiro Serie D",
    "Inter de Limeira": "Campeonato Brasileiro Serie D",
    "Athletic Club-MG": "Campeonato Brasileiro Serie D",
    "Joinville": "Campeonato Catarinense",
    "Concídia": "Campeonato Catarinense",
    "São José-MA": "Campeonato Maranhense",
    "São Raimundo-RR": "Campeonato Roraimense",
    "São Raimundo-PA": "Campeonato Paraense",
    "Tupan": "Campeonato Maranhense",
    "Nacional-AM": "Campeonato Amazonense",
    "Manaus": "Campeonato Amazonense",
    "Galvez": "Campeonato Acreano",
    "Union La Calera": "Campeonato Chileno",
    "Universidad Chile": "Campeonato Chileno",
    "Universidad Cat\u00f3lica": "Campeonato Chileno",
    "Universidad de Concepci\u00f3n": "Campeonato Chileno",
    "Alemanha": "Copa do Mundo",
    "Holanda": "Copa do Mundo",
    "Japão": "Copa do Mundo",
    "Cura\u00e7ao": "Copa do Mundo",
    "Costa do Marfim": "Copa do Mundo",
    "Equador": "Copa do Mundo",
    "Suécia": "Copa do Mundo",
    "Tunísia": "Copa do Mundo",
}

def identifyLeague(jogo):
    home = jogo.get('time_casa', '')
    away = jogo.get('time_fora', '')
    current = jogo.get('campeonato', '')
    
    if current and current not in ['Outros', 'Campeonato', 'Campeonato de Clubes']:
        return current
    
    if home in TEAM_LEAGUE_MAP:
        return TEAM_LEAGUE_MAP[home]
    if away in TEAM_LEAGUE_MAP:
        return TEAM_LEAGUE_MAP[away]
    
    return current or "Outros"

print("=" * 70)
print("TESTE DO MAPEAMENTO DE LIGAS")
print("=" * 70)

url = "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/jogos"

try:
    with httpx.Client(timeout=15) as client:
        response = client.get(url)
        data = response.json()
        jogos = data.get('jogos', [])
        
        # Aplicar mapeamento
        for j in jogos:
            j['campeonato'] = identifyLeague(j)
        
        # Contar antes e depois
        antes = Counter(j.get('campeonato') for j in jogos)
        
        # Remover "Outros" que foram mapeados
        mapeados = sum(1 for j in jogos if j.get('campeonato') != 'Outros')
        
        print(f"\nTotal de jogos: {len(jogos)}")
        print(f"Jogos com liga identificada: {mapeados}")
        print(f"Jogos ainda como 'Outros': {len(jogos) - mapeados}")
        
        print("\n" + "-" * 70)
        print("LIGAS DEPOIS DO MAPEAMENTO:")
        print("-" * 70)
        
        for liga, count in antes.most_common()[:20]:
            print(f"  {count:3d}x {liga}")
        
        print("\n" + "-" * 70)
        print("EXEMPLOS DE JOGOS MAPEADOS:")
        print("-" * 70)
        
        mapeados_exemplos = [j for j in jogos if j.get('campeonato') != 'Outros' and j.get('campeonato') != 'Copa do Mundo'][:10]
        for j in mapeados_exemplos:
            print(f"  [{j.get('hora')}] {j.get('time_casa')} vs {j.get('time_fora')}")
            print(f"           -> {j.get('campeonato')}")
        
        print("\n" + "=" * 70)
        print("RESUMO:")
        print(f"  - {mapeados}/{len(jogos)} jogos agora tem liga identificada")
        print(f"  - Filtro de ligas ordenadas por prioridade")
        print(f"  - Arquivos atualizados:")
        print("    * js/league-mapping.js - mapeamento de times")
        print("    * js/app.js - integracao com filtro")
        print("    * *.html - inclusao do script de liga")
        print("    * test-leagues.html - pagina de teste")
        print("=" * 70)

except Exception as e:
    print(f"Erro: {e}")