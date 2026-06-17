import httpx
import sys
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

print("=" * 70)
print("MAPEAMENTO DE TIMES -> LIGAS")
print("=" * 70)

url = "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/jogos"

try:
    with httpx.Client(timeout=15) as client:
        response = client.get(url)
        data = response.json()
        jogos = data.get('jogos', [])
        
        # Separar jogos com liga definida vs "Outros"
        com_liga = []
        sem_liga = []
        
        for j in jogos:
            if j.get('campeonato') == 'Outros':
                sem_liga.append(j)
            else:
                com_liga.append(j)
        
        print(f"\nJogos com liga definida: {len(com_liga)}")
        print(f"Jogos sem liga (Outros): {len(sem_liga)}")
        
        # Listar todos os times sem liga
        print("\n" + "=" * 70)
        print("TIMES SEM LIGA IDENTIFICADA:")
        print("=" * 70)
        
        times_sem_liga = set()
        for j in sem_liga:
            times_sem_liga.add(j.get('time_casa', ''))
            times_sem_liga.add(j.get('time_fora', ''))
        
        print("\nOrdem alfabetica:")
        for t in sorted(times_sem_liga):
            print(f"  - {t}")
        
        # Criar mapa de times -> liga baseado nos que tem liga
        mapa_times = {}
        for j in com_liga:
            liga = j.get('campeonato', '')
            mapa_times[j.get('time_casa', '')] = liga
            mapa_times[j.get('time_fora', '')] = liga
        
        print("\n" + "=" * 70)
        print("TIMES COM LIGA IDENTIFICADA (referencia):")
        print("=" * 70)
        
        times_com_liga = defaultdict(list)
        for j in com_liga:
            times_com_liga[j.get('time_casa', '')].append(j.get('campeonato'))
            times_com_liga[j.get('time_fora', '')].append(j.get('campeonato'))
        
        for time, ligas in sorted(times_com_liga.items()):
            ligas_unicas = list(set(ligas))
            print(f"  {time}: {', '.join(ligas_unicas)}")
        
        # Sugerir mapeamentos comuns de estaduais
        print("\n" + "=" * 70)
        print("SUGESTOES DE MAPEAMENTO (estaduais):")
        print("=" * 70)
        
        # Times que provavelmente sao de estaduais
        sugestoes = {
            # Paulistas
            "Juventude": "Campeonato Brasileiro Serie B",
            "Ponte Preta": "Campeonato Brasileiro Serie B",
            "São Bernardo": "Campeonato Brasileiro Serie C",
            "Botafogo-SP": "Campeonato Brasileiro Serie B",
            "Santo André": "Campeonato Brasileiro Serie D",
            "Inter de Limeira": "Campeonato Brasileiro Serie D",
            
            # Catarinenses
            "Brusque": "Campeonato Brasileiro Serie B",
            "Figueirense": "Campeonato Brasileiro Serie C",
            
            # Gaúchos
            "Juventude": "Campeonato Brasileiro Serie B",
            
            # Mineiros
            "Athletic Club-MG": "Campeonato Brasileiro Serie D",
            "Tombense": "Campeonato Brasileiro Serie C",
            
            # Nordestinos
            "Sport": "Campeonato Brasileiro Serie B",
            "Náutico": "Campeonato Brasileiro Serie C",
            "Santa Cruz": "Campeonato Brasileiro Serie D",
            "Paysandu": "Campeonato Brasileiro Serie C",
            "Ceará": "Campeonato Brasileiro Serie B",
            
            # Centrais
            "Vila Nova": "Campeonato Brasileiro Serie B",
            "Cuiabá": "Campeonato Brasileiro Serie A",
            "Goiás": "Campeonato Brasileiro Serie B",
            "Botafogo-RJ": "Campeonato Brasileiro Serie A",
            "Vasco": "Campeonato Brasileiro Serie B",
            "Fluminense": "Campeonato Brasileiro Serie A",
            
            # Norte
            "Tupinambá": "Campeonato Paraense",
            "Paysandu": "Campeonato Paraense",
        }
        
        for time, liga in sorted(sugestoes.items()):
            if time in times_sem_liga:
                print(f"  {time} -> {liga}")
        
        print("\n" + "=" * 70)
        print("TOTAL DE TIMES UNICOS SEM LIGA:", len(times_sem_liga))
        print("=" * 70)

except Exception as e:
    print(f"Erro: {e}")