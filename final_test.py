import httpx
import sys
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')

# Mapeamento completo (copiado do league-mapping.js)
TEAM_LEAGUE_MAP = {
    # SERIE A
    "Flamengo": "Campeonato Brasileiro Serie A",
    "Fluminense": "Campeonato Brasileiro Serie A",
    "Botafogo": "Campeonato Brasileiro Serie A",
    "Grêmio": "Campeonato Brasileiro Serie A",
    "Internacional": "Campeonato Brasileiro Serie A",
    "Cuiabá": "Campeonato Brasileiro Serie A",
    "Cruzeiro": "Campeonato Brasileiro Serie A",
    "Palmeiras": "Campeonato Brasileiro Serie A",
    "Santos": "Campeonato Brasileiro Serie A",
    "Corinthians": "Campeonato Brasileiro Serie A",
    "São Paulo": "Campeonato Brasileiro Serie A",
    "Bahia": "Campeonato Brasileiro Serie A",
    "Fortaleza": "Campeonato Brasileiro Serie A",
    "Red Bull Bragantino": "Campeonato Brasileiro Serie A",
    
    # SERIE B
    "Vila Nova": "Campeonato Brasileiro Serie B",
    "Goiás": "Campeonato Brasileiro Serie B",
    "Sport": "Campeonato Brasileiro Serie B",
    "Juventude": "Campeonato Brasileiro Serie B",
    "Ponte Preta": "Campeonato Brasileiro Serie B",
    "Botafogo-SP": "Campeonato Brasileiro Serie B",
    "Brusque": "Campeonato Brasileiro Serie B",
    
    # SERIE C
    "São Bernardo": "Campeonato Brasileiro Serie C",
    "Paysandu": "Campeonato Brasileiro Serie C",
    "Náutico": "Campeonato Brasileiro Serie C",
    "Tombense": "Campeonato Brasileiro Serie C",
    "Figueirense": "Campeonato Brasileiro Serie C",
    "ABC": "Campeonato Brasileiro Serie C",
    "CSA": "Campeonato Brasileiro Serie C",
    "Criciúma": "Campeonato Brasileiro Serie C",
    "Athletico-PR": "Campeonato Brasileiro Serie C",
    
    # SERIE D
    "Santa Cruz": "Campeonato Brasileiro Serie D",
    "Inter de Limeira": "Campeonato Brasileiro Serie D",
    "Athletic Club-MG": "Campeonato Brasileiro Serie D",
    "Floresta": "Campeonato Brasileiro Serie D",
    "Jaraguá": "Campeonato Brasileiro Serie D",
    "Humaitá": "Campeonato Brasileiro Serie D",
    "Nacional-AM": "Campeonato Amazonense",
    "Manaus": "Campeonato Amazonense",
    "Galvez": "Campeonato Acreano",
    "Independência": "Campeonato Mineiro",
    "Tupan": "Campeonato Amazonense",
    "São José-MA": "Campeonato Maranhense",
    
    # ESTADUAIS
    "América-RN": "Campeonato Potiguar",
    "América-MG": "Campeonato Mineiro",
    "ABC": "Campeonato Potiguar",
    "Potyguar": "Campeonato Potiguar",
    "Santa Cruz-RN": "Campeonato Potiguar",
    
    "Confiança": "Campeonato Sergipano",
    "Confiança-PB": "Campeonato Paraibano",
    "Treze": "Campeonato Paraibano",
    "Sousa": "Campeonato Paraibano",
    "Botafogo-PB": "Campeonato Paraibano",
    "Cruzeiro-PB": "Campeonato Paraibano",
    "Queimadense": "Campeonato Paraibano",
    
    "Sport": "Campeonato Pernambucano",
    "Santa Cruz": "Campeonato Pernambucano",
    "Náutico": "Campeonato Pernambucano",
    
    "Bahia": "Campeonato Baiano",
    "Vitória": "Campeonato Baiano",
    "Juazeirense": "Campeonato Baiano",
    "Jacobina": "Campeonato Baiano",
    "Vitória da Conquista": "Campeonato Baiano",
    "Porto-BA": "Campeonato Baiano",
    "Redenção BA": "Campeonato Baiano",
    "Conquista": "Campeonato Baiano",
    "Feira": "Campeonato Baiano",
    "Grapiuna Itabuna": "Campeonato Baiano",
    "Atlético Alagoinhas": "Campeonato Baiano",
    "Jacuipense": "Campeonato Baiano",
    "Maguary": "Campeonato Baiano",
    
    "Ceará": "Campeonato Cearense",
    "Fortaleza": "Campeonato Cearense",
    "Icasa": "Campeonato Cearense",
    "Ferroviário": "Campeonato Cearense",
    "Itapipoca": "Campeonato Cearense",
    "ASA": "Campeonato Cearense",
    "CRAC": "Campeonato Cearense",
    "Central": "Campeonato Cearense",
    
    "Goiás": "Campeonato Goiano",
    "Atlético-GO": "Campeonato Goiano",
    "Vila Nova": "Campeonato Goiano",
    "CRAC": "Campeonato Goiano",
    "Itumbiara": "Campeonato Goiano",
    "Goianesia": "Campeonato Goiano",
    
    "Cruzeiro": "Campeonato Mineiro",
    "Atlético-MG": "Campeonato Mineiro",
    "Tombense": "Campeonato Mineiro",
    "Democrata GV": "Campeonato Mineiro",
    "Patrocinense": "Campeonato Mineiro",
    "Uberlândia": "Campeonato Mineiro",
    "Athletic Club-MG": "Campeonato Mineiro",
    "América-MG": "Campeonato Mineiro",
    "Betim": "Campeonato Mineiro",
    "Boa": "Campeonato Mineiro",
    "Caldense": "Campeonato Mineiro",
    "Uberaba": "Campeonato Mineiro",
    
    "Corinthians": "Campeonato Paulista",
    "Palmeiras": "Campeonato Paulista",
    "Santos": "Campeonato Paulista",
    "São Paulo": "Campeonato Paulista",
    "Red Bull Bragantino": "Campeonato Paulista",
    "Ponte Preta": "Campeonato Paulista",
    "Guarani": "Campeonato Paulista",
    "Santo André": "Campeonato Paulista",
    "Botafogo-SP": "Campeonato Paulista",
    "Inter de Limeira": "Campeonato Paulista",
    "São Bernardo": "Campeonato Paulista",
    "Ituano": "Campeonato Paulista",
    "Porto Ferreira": "Campeonato Paulista",
    "Matonense": "Campeonato Paulista",
    "Catanduvense": "Campeonato Paulista",
    "Audax-SP": "Campeonato Paulista",
    "Paulinense": "Campeonato Paulista",
    "Manthiqueira": "Campeonato Paulista",
    "Barcelona-SP": "Campeonato Paulista",
    "Tupã": "Campeonato Paulista",
    "Itaquaquecetuba": "Campeonato Paulista",
    "Mauá": "Campeonato Paulista",
    
    "Paraná": "Campeonato Paranaense",
    "Coritiba": "Campeonato Paranaense",
    "Athletico-PR": "Campeonato Paranaense",
    "Operário-PR": "Campeonato Paranaense",
    "Londrina": "Campeonato Paranaense",
    "Cianorte": "Campeonato Paranaense",
    
    "Caxias": "Campeonato Gaúcho",
    "Grêmio": "Campeonato Gaúcho",
    "Internacional": "Campeonato Gaúcho",
    "São José-RS": "Campeonato Gaúcho",
    "Juventude": "Campeonato Gaúcho",
    "Santa Cruz-RS": "Campeonato Gaúcho",
    "Guarany de Bagé": "Campeonato Gaúcho",
    "Bagé": "Campeonato Gaúcho",
    "Brasil Farroupilha": "Campeonato Gaúcho",
    
    "Joinville": "Campeonato Catarinense",
    "Brusque": "Campeonato Catarinense",
    "Figueirense": "Campeonato Catarinense",
    "Avaí": "Campeonato Catarinense",
    "Criciúma": "Campeonato Catarinense",
    "Concídia": "Campeonato Catarinense",
    "Hercílio Luz": "Campeonato Catarinense",
    "Guarani de Palhoça": "Campeonato Catarinense",
    "Metropolitano": "Campeonato Catarinense",
    "Fluminense-SC": "Campeonato Catarinense",
    "Clube Laguna": "Campeonato Catarinense",
    "Jaraguá": "Campeonato Catarinense",
    "Cliper": "Campeonato Catarinense",
    "RB do Norte": "Campeonato Catarinense",
    
    "Paysandu": "Campeonato Paraense",
    "Remo": "Campeonato Paraense",
    "Tuna Luso": "Campeonato Paraense",
    "São Raimundo-PA": "Campeonato Paraense",
    "Manauara": "Campeonato Amazonense",
    "Amazonas": "Campeonato Amazonense",
    
    "Fast": "Campeonato Amazonense",
    "Nacional-AM": "Campeonato Amazonense",
    "Manaus": "Campeonato Amazonense",
    "Humaitá": "Campeonato Amazonense",
    "Guaporé": "Campeonato Amazonense",
    
    "Rio Branco-AC": "Campeonato Acreano",
    "Galvez": "Campeonato Acreano",
    
    "Sergipe": "Campeonato Sergipano",
    "Confiança": "Campeonato Sergipano",
    "Lagarto": "Campeonato Sergipano",
    "Itabaiana": "Campeonato Sergipano",
    "CSE": "Campeonato Sergipano",
    "Serra Branca": "Campeonato Sergipano",
    
    "CSA": "Campeonato Alagoano",
    "ASA": "Campeonato Alagoano",
    "CRB": "Campeonato Alagoano",
    
    "Itapipoca": "Campeonato Cearense",
    "ASA": "Campeonato Cearense",
    
    "São Raimundo-PA": "Campeonato Paraense",
    "Tupan": "Campeonato Maranhense",
    "São José-MA": "Campeonato Maranhense",
    
    "Brasiliense": "Campeonato Brasiliense",
    "Cruzeiro-DF": "Campeonato Brasiliense",
    "Sobradinho": "Campeonato Brasiliense",
    "Gama": "Campeonato Brasiliense",
    "CA Taguatinga": "Campeonato Brasiliense",
    "Paranoá": "Campeonato Brasiliense",
    "Ceilandense": "Campeonato Brasiliense",
    
    "Mixto": "Campeonato Mato-Grossense",
    "Cuiabá": "Campeonato Mato-Grossense",
    "Luverdense": "Campeonato Mato-Grossense",
    "Operário-MS": "Campeonato Sul-Mato-Grossense",
    "Novorizontino": "Campeonato Sul-Mato-Grossense",
    
    "Vasco": "Campeonato Carioca",
    "Fluminense": "Campeonato Carioca",
    "Flamengo": "Campeonato Carioca",
    "Botafogo": "Campeonato Carioca",
    "Audax-RJ": "Campeonato Carioca",
    "Volta Redonda": "Campeonato Carioca",
    "Madureira": "Campeonato Carioca",
    "Bangu": "Campeonato Carioca",
    "Americano": "Campeonato Carioca",
    "Olaria": "Campeonato Carioca",
    "Portuguesa-RJ": "Campeonato Carioca",
    "São Gonçalo EC RJ": "Campeonato Carioca",
    "Araruama": "Campeonato Carioca",
    "Cabofriense": "Campeonato Carioca",
    "Rio Branco VN": "Campeonato Carioca",
    "Buzios": "Campeonato Carioca",
    "Barcelona-RJ": "Campeonato Carioca",
    
    "Vitória-ES": "Campeonato Capixaba",
    "Rio Branco-ES": "Campeonato Capixaba",
    "Serra": "Campeonato Capixaba",
    "São Gabriel": "Campeonato Capixaba",
    "Desportiva": "Campeonato Capixaba",
    "Porto Vitória": "Campeonato Capixaba",
    "Rio Branco VN": "Campeonato Capixaba",
    "Caravaggio": "Campeonato Capixaba",
    "Vila Velha": "Campeonato Capixaba",
    "Viana": "Campeonato Capixaba",
    
    "São Paulo": "Copa do Brasil",
    "Flamengo": "Copa do Brasil",
    "Palmeiras": "Copa do Brasil",
    "Grêmio": "Copa do Brasil",
    "Corinthians": "Copa do Brasil",
    "Santos": "Copa do Brasil",
    "Bahia": "Copa do Brasil",
    "Fortaleza": "Copa do Brasil",
    "Cruzeiro": "Copa do Brasil",
    "Atlético-MG": "Copa do Brasil",
    "Botafogo": "Copa do Brasil",
    "Fluminense": "Copa do Brasil",
    "Vasco": "Copa do Brasil",
    "Athletico-PR": "Copa do Brasil",
    "Red Bull Bragantino": "Copa do Brasil",
    "Internacional": "Copa do Brasil",
    
    "Union La Calera": "Campeonato Chileno",
    "Universidad Chile": "Campeonato Chileno",
    "Universidad Católica": "Campeonato Chileno",
    "Universidad de Concepción": "Campeonato Chileno",
    "Concepcion": "Campeonato Chileno",
    "Deportes Limache": "Campeonato Chileno",
    
    "Alemanha": "Copa do Mundo",
    "Holanda": "Copa do Mundo",
    "Japão": "Copa do Mundo",
    "Curaçao": "Copa do Mundo",
    "Costa do Marfim": "Copa do Mundo",
    "Equador": "Copa do Mundo",
    "Suécia": "Copa do Mundo",
    "Tunísia": "Copa do Mundo",
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

print("=" * 70)
print("TESTE FINAL DO MAPEAMENTO")
print("=" * 70)

url = "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/jogos"

try:
    with httpx.Client(timeout=15) as client:
        response = client.get(url)
        data = response.json()
        jogos = data.get('jogos', [])
        
        if not jogos:
            print("\nNenhum jogo encontrado hoje.")
            print("O mapeamento foi adicionado ao arquivo js/league-mapping.js")
            print("Quando houver jogos, eles serao automaticamente mapeados.")
            sys.exit(0)
        
        for j in jogos:
            j['campeonato'] = identifyLeague(j)
        
        mapeados = sum(1 for j in jogos if j.get('campeonato') != 'Outros')
        ligas = Counter(j.get('campeonato') for j in jogos)
        
        print(f"\nTotal de jogos: {len(jogos)}")
        print(f"Jogos com liga identificada: {mapeados} ({mapeados/len(jogos)*100:.0f}%)")
        print(f"Jogos ainda como 'Outros': {len(jogos) - mapeados}")
        
        print("\n" + "-" * 70)
        print("LIGAS IDENTIFICADAS:")
        print("-" * 70)
        
        for liga, count in ligas.most_common():
            print(f"  {count:3d}x {liga}")
        
        outros = [j for j in jogos if j.get('campeonato') == 'Outros']
        if outros:
            print("\n" + "-" * 70)
            print("JOGOS AINDA SEM LIGA:")
            print("-" * 70)
            for j in outros[:10]:
                print(f"  [{j.get('hora')}] {j.get('time_casa')} vs {j.get('time_fora')}")
        
        print("\n" + "=" * 70)
        print("RESUMO FINAL:")
        print("=" * 70)
        print(f"  Mapeamento: js/league-mapping.js")
        print(f"  Integracao: js/app.js (funcao identifyLeague)")
        print(f"  Teste: test-leagues.html")
        print("=" * 70)

except Exception as e:
    print(f"Erro: {e}")
    print("\nO mapeamento foi adicionado ao arquivo js/league-mapping.js")