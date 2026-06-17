import httpx
import sys
sys.stdout.reconfigure(encoding='utf-8')

keys = {
    'Fallback (atual)': '6512896b81baf1e82ea25425879bbc60',
    'Nova 1': 'd096e762ddd15d82d9135366e65d6de050a8b8676d7549af6c83227887d17ae9',
    'Nova 2': '425257ac2bf87e2552ba95c5509693af',
    'Nova 3': 'fe80bd94-093e-4e97-8b6e-ccd2a07e3514',
}

url = 'https://v3.football.api-sports.io/fixtures?date=2026-06-14&timezone=America/Sao_Paulo'

print("=" * 60)
print("TESTE DE API KEYS - API-FOOTBALL")
print("=" * 60)

for name, key in keys.items():
    try:
        with httpx.Client(timeout=15) as client:
            response = client.get(url, headers={'x-apisports-key': key})
            data = response.json()
            if data.get('errors'):
                error_msg = list(data['errors'].values())[0] if data['errors'] else 'Unknown'
                print(f'\n{name}:')
                print(f'  [X] ERRO - {error_msg}')
            elif data.get('results', 0) > 0:
                print(f'\n{name}:')
                print(f'  [OK] {data["results"]} jogos encontrados')
            else:
                print(f'\n{name}:')
                print(f'  [OK] 0 jogos (sem jogos hoje)')
    except Exception as e:
        print(f'\n{name}:')
        print(f'  [X] ERRO - {e}')

print("\n" + "=" * 60)