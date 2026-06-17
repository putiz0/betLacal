import httpx
import sys
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')

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
}

def identifyLeague(jogo):
    home = jogo.get('time_casa', '')
    away = jogo.get('time_fora', '')
    current = jogo.get('campeonato', '')
    
    if current and current not in ['Outros', 'Campeonato']:
        return current
    
    if home in TEAM_LEAGUE_MAP:
        return TEAM_LEAGUE_MAP[home]
    if away in TEAM_LEAGUE_MAP:
        return TEAM_LEAGUE_MAP[away]
    
    return current or "Outros"

url = "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/jogos"

with httpx.Client(timeout=15) as client:
    response = client.get(url)
    data = response.json()
    jogos = data.get('jogos', [])
    
    for j in jogos:
        j['campeonato'] = identifyLeague(j)
    
    outros = [j for j in jogos if j.get('campeonato') == 'Outros']
    
    print("=" * 70)
    print("TIMES AINDA SEM MAPEAMENTO (52 jogos)")
    print("=" * 70)
    
    times_faltando = Counter()
    for j in outros:
        times_faltando[j.get('time_casa')] += 1
        times_faltando[j.get('time_fora')] += 1
    
    print("\nTimes que precisam de mapeamento:")
    for time, count in times_faltando.most_common():
        print(f"  {count:2d}x {time}")
    
    print("\n" + "=" * 70)
    print("SUGESTOES DE ADICAO:")
    print("=" * 70)
    
    # Gerar sugestoes baseadas em padroes
    sugestoes = {}
    for time in times_faltando:
        if "RJ" in time or "Rio" in time:
            sugestoes[time] = "Campeonato Carioca"
        elif "-SP" in time:
            sugestoes[time] = "Campeonato Paulista"
        elif "-MG" in time:
            sugestoes[time] = "Campeonato Mineiro"
        elif "-PR" in time:
            sugestoes[time] = "Campeonato Paranaense"
        elif "-SC" in time:
            sugestoes[time] = "Campeonato Catarinense"
        elif "-RS" in time:
            sugestoes[time] = "Campeonato Gaúcho"
        elif "BA" in time:
            sugestoes[time] = "Campeonato Baiano"
        elif "PE" in time:
            sugestoes[time] = "Campeonato Pernambucano"
        elif "CE" in time:
            sugestoes[time] = "Campeonato Cearense"
        elif "GO" in time:
            sugestoes[time] = "Campeonato Goiano"
        elif "PA" in time:
            sugestoes[time] = "Campeonato Paraense"
        elif "MA" in time:
            sugestoes[time] = "Campeonato Maranhense"
        elif "RN" in time:
            sugestoes[time] = "Campeonato Potiguar"
        elif "PB" in time:
            sugestoes[time] = "Campeonato Paraibano"
        elif "SE" in time:
            sugestoes[time] = "Campeonato Sergipano"
        elif "AL" in time:
            sugestoes[time] = "Campeonato Alagoano"
        elif "PI" in time:
            sugestoes[time] = "Campeonato Potosiense"
        elif "DF" in time:
            sugestoes[time] = "Campeonato Brasiliense"
        elif "ES" in time:
            sugestoes[time] = "Campeonato Capixaba"
        elif "MS" in time:
            sugestoes[time] = "Campeonato Sul-Mato-Grossense"
        elif "MT" in time:
            sugestoes[time] = "Campeonato Mato-Grossense"
        elif "RO" in time:
            sugestoes[time] = "Campeonato Rondoniense"
        elif "TO" in time:
            sugestoes[time] = "Campeonato Tocantinense"
        elif "AC" in time:
            sugestoes[time] = "Campeonato Acreano"
        elif "AP" in time:
            sugestoes[time] = "Campeonato Amapaense"
        elif "RR" in time:
            sugestoes[time] = "Campeonato Roraimense"
        elif "AM" in time:
            sugestoes[time] = "Campeonato Amazonense"
    
    for time, liga in sorted(sugestoes.items()):
        print(f'  "{time}": "{liga}",')
    
    print("\n" + "=" * 70)