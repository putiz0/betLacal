import httpx
import sys
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("ANALISE DOS JOGOS POR LIGA")
print("=" * 60)

url = "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/jogos"

try:
    with httpx.Client(timeout=15) as client:
        response = client.get(url)
        data = response.json()
        jogos = data.get('jogos', [])
        
        print(f"\nTotal de jogos: {len(jogos)}")
        
        # Contar por liga
        ligas = Counter()
        paises = Counter()
        
        for j in jogos:
            liga = j.get('campeonato', 'Desconhecido')
            pais = j.get('pais', 'Desconhecido')
            ligas[liga] += 1
            paises[pais] += 1
        
        print("\n" + "-" * 40)
        print("LIGAS (ordenado por quantidade):")
        print("-" * 40)
        for liga, count in ligas.most_common():
            print(f"  {count:3d}x {liga}")
        
        print("\n" + "-" * 40)
        print("PAISES:")
        print("-" * 40)
        for pais, count in paises.most_common():
            print(f"  {count:3d}x {pais}")
        
        # Filtrar apenas jogos que da pra apostar
        apostaveis = [j for j in jogos if j.get('allow_aposta') == True]
        print(f"\n\nJogos que DA PRA APOSTAR: {len(apostaveis)}")
        
        # Jogos ao vivo
        ao_vivo = [j for j in jogos if 'ao vivo' in (j.get('status') or '').lower()]
        print(f"Jogos AO VIVO: {len(ao_vivo)}")
        
        # Jogos encerrados
        encerrados = [j for j in jogos if 'encerrado' in (j.get('status') or '').lower()]
        print(f"Jogos ENCERRADOS: {len(encerrados)}")
        
        # Pre-jogo
        pre_jogo = [j for j in jogos if 'pre' in (j.get('status') or '').lower()]
        print(f"Jogos PRE-JOGO: {len(pre_jogo)}")
        
except Exception as e:
    print(f"Erro: {e}")