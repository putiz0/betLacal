import httpx
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Testa a estrutura do request
key = 'd096e762ddd15d82d9135366e65d6de050a8b8676d7549af6c83227887d17ae9'
url = 'https://v3.football.api-sports.io/fixtures'

print("=" * 60)
print("TESTE DETALHADO DA API")
print("=" * 60)

# Teste 1: Verificar se a URL está funcionando
print("\n1. Testando conexao basica...")
try:
    with httpx.Client(timeout=15) as client:
        response = client.get(url + "?date=2026-06-14")
        print(f"   Response: {response.status_code}")
        print(f"   Headers enviados: {dict(response.request.headers)}")
except Exception as e:
    print(f"   Erro: {e}")

# Teste 2: Com header correto
print("\n2. Testando com x-apisports-key...")
try:
    with httpx.Client(timeout=15) as client:
        response = client.get(
            url + "?date=2026-06-14",
            headers={"x-apisports-key": key}
        )
        data = response.json()
        print(f"   Status: {response.status_code}")
        print(f"   Results: {data.get('results', 0)}")
        print(f"   Errors: {data.get('errors', {})}")
        if data.get('response'):
            print(f"   Primeiro jogo: {data['response'][0]['teams']['home']['name']} vs {data['response'][0]['teams']['away']['name']}")
except Exception as e:
    print(f"   Erro: {e}")

# Teste 3: Tentar endpoint de leagues pra ver se muda algo
print("\n3. Testando endpoint /leagues...")
try:
    with httpx.Client(timeout=15) as client:
        response = client.get(
            "https://v3.football.api-sports.io/leagues",
            headers={"x-apisports-key": key}
        )
        data = response.json()
        print(f"   Status: {response.status_code}")
        print(f"   Results: {data.get('results', 0)}")
        print(f"   Errors: {data.get('errors', {})}")
except Exception as e:
    print(f"   Erro: {e}")

print("\n" + "=" * 60)