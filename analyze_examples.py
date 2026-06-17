import httpx
import sys
sys.stdout.reconfigure(encoding='utf-8')

url = "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/jogos"

print("=" * 60)
print("EXEMPLOS DE JOGOS - ANALISE DE DADOS")
print("=" * 60)

try:
    with httpx.Client(timeout=15) as client:
        response = client.get(url)
        data = response.json()
        jogos = data.get('jogos', [])
        
        # Mostrar alguns exemplos de cada tipo
        print("\nJOGOS COM 'Outros' (primeiros 10):")
        print("-" * 60)
        outros = [j for j in jogos if j.get('campeonato') == 'Outros'][:10]
        for j in outros:
            print(f"[{j.get('hora')}] {j.get('time_casa')} vs {j.get('time_fora')}")
            print(f"   Status: '{j.get('status')}' | allow_aposta: {j.get('allow_aposta')}")
            print()
        
        print("\nJOGOS COM LIGA IDENTIFICADA:")
        print("-" * 60)
        identificadas = [j for j in jogos if j.get('campeonato') != 'Outros']
        for j in identificadas:
            print(f"[{j.get('hora')}] {j.get('time_casa')} vs {j.get('time_fora')}")
            print(f"   Liga: {j.get('campeonato')} | Status: '{j.get('status')}'")
            print()

except Exception as e:
    print(f"Erro: {e}")