import httpx
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

APIS = [
    ("API-Football Nova 1", "d096e762ddd15d82d9135366e65d6de050a8b8676d7549af6c83227887d17ae9"),
    ("API-Football Nova 2", "425257ac2bf87e2552ba95c5509693af"),
    ("API-Football Nova 3", "fe80bd94-093e-4e97-8b6e-ccd2a07e3514"),
    ("API-Football Atual", "6512896b81baf1e82ea25425879bbc60"),
]

FALLBACK = "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/jogos"

print("=" * 60)
print("TESTE DE APIs - FALLBACK EM CASCATA")
print("=" * 60)

today = "2026-06-14"

# Testar APIs API-Football
for name, key in APIS:
    print(f"\n[Testando] {name}...")
    try:
        with httpx.Client(timeout=15) as client:
            response = client.get(
                f"https://v3.football.api-sports.io/fixtures?date={today}&timezone=America/Sao_Paulo",
                headers={"x-apisports-key": key}
            )
            data = response.json()
            
            if data.get('errors') and data['errors'].get('token'):
                error = data['errors']['token']
                # Simplificar mensagens de erro
                if 'Missing' in error or 'Invalid' in error:
                    print(f"  [X] FALHOU: Key invalida/expirada")
                else:
                    print(f"  [X] FALHOU: {error[:60]}")
            elif data.get('results', 0) > 0:
                print(f"  [OK] FUNCIONANDO! {data['results']} jogos")
            else:
                print(f"  [X] FALHOU: 0 jogos")
                
    except Exception as e:
        print(f"  [X] FALHOU: {e}")

# Testar fallback
print(f"\n[Testando] Supabase (fallback)...")
try:
    with httpx.Client(timeout=15) as client:
        response = client.get(FALLBACK)
        data = response.json()
        jogos = data.get('jogos') or data.get('response') or []
        if isinstance(jogos, dict):
            jogos = jogos.get('jogos') or []
        print(f"  [OK] FUNCIONANDO! {len(jogos)} jogos")
except Exception as e:
    print(f"  [X] FALHOU: {e}")

print("\n" + "=" * 60)
print("RESUMO:")
print("  - Se TODAS as API-Football falharem, o sistema usa o Supabase")
print("  - O arquivo js/api-fallback.js implementa o fallback automatico")
print("=" * 60)