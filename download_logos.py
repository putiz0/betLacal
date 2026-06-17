"""
Script para baixar escudos de times de futebol
Usa TheSportsDB API (gratuita)
"""

import requests
import json
import os
from pathlib import Path

# Diretório para salvar os logos
SCRIPT_DIR = Path(__file__).parent
LOGOS_DIR = SCRIPT_DIR / "logos"
LOGOS_JSON = SCRIPT_DIR / "logos_data.json"

# Times para buscar (expansível)
TEAMS_TO_FETCH = [
    # BRASILEIRO
    "Flamengo", "Fluminense", "Botafogo", "Grêmio", "Internacional",
    "Corinthians", "Palmeiras", "Santos", "São Paulo", "Cruzeiro",
    "Bahia", "Fortaleza", "Athletico-PR", "Vasco", "Red Bull Bragantino",
    "Cuiabá", "Sport", "Vitória", "Ceará", "Coritiba", "Goiás",
    "Vila Nova", "Juventude", "Ponte Preta", "Guarani", "Sampaio Corrêa",
    "Londrina", "Operário-PR", "CRB", "Náutico", "Paysandu", "ABC",
    "Santa Cruz", "Botafogo-SP", "São Bernardo", "Tombense", "CSA",
    "América-MG", "Ituano", "Novorizontino", "Brusque", "Figueirense",
    
    # PREMIER LEAGUE
    "Manchester City", "Arsenal", "Liverpool", "Chelsea", "Manchester United",
    "Tottenham", "Newcastle", "Brighton", "Aston Villa", "West Ham",
    "Brentford", "Crystal Palace", "Wolverhampton", "Fulham", "Everton",
    "Nottingham Forest", "Bournemouth", "Leicester City", "Burnley",
    "West Brom", "Swansea", "Leeds United", "Norwich",
    
    # LA LIGA
    "Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla", "Real Betis",
    "Real Sociedad", "Villarreal", "Athletic Bilbao", "Valencia", "Girona",
    "Osasuna", "Mallorca", "Getafe", "Celta Vigo", "Espanyol",
    "Rayo Vallecano", "Cadiz", "Granada", "Almeria", "Las Palmas",
    
    # SERIE A ITALIANA
    "Inter Milan", "AC Milan", "Juventus", "Napoli", "Roma", "Lazio",
    "Atalanta", "Fiorentina", "Bologna", "Torino", "Sassuolo",
    "Udinese", "Sampdoria", "Genoa", "Cagliari", "Verona",
    "Empoli", "Lecce", "Monza", "Salernitana", "Frosinone",
    
    # BUNDESLIGA
    "Bayern", "Dortmund", "Leipzig", "Bayer Leverkusen", "Eintracht Frankfurt",
    "Wolfsburg", "Borussia Monchengladbach", "Stuttgart", "Union Berlin",
    "Hoffenheim", "Koln", "Freiburg", "Mainz", "Bochum", "Augsburg",
    "Schalke", "Hertha Berlin", "Arminia Bielefeld", "Werder Bremen",
    
    # LIGUE 1
    "PSG", "Olympique Marseille", "Monaco", "Lyon", "Lille",
    "Nice", "Rennes", "Strasbourg", "Montpellier", "Lens",
    "Toulouse", "Nantes", "Brest", "Auxerre", "Reims",
    "Le Havre", "Metz", "Clermont", "Lorient", "Angers",
    
    # ARGENTINO
    "Boca Juniors", "River Plate", "Independiente", "Racing Club", "San Lorenzo",
    "Huracan", "Velez Sarsfield", "Estudiantes", "Gimnasia", "Defensa y Justicia",
    "Talleres", "Union", "Lanus", "Banfield", "Godoy Cruz",
    "Argentinos Juniors", "Platense", "Sarmiento", "Barracas Central", "Tucuman",
    
    # PORTUGUÊS
    "Benfica", "Porto", "Sporting CP", "Braga", "Portimonense",
    "Famalicao", "Santa Clara", "Arouca", "Gil Vicente", "Vizela",
    "Casa Pia", "Rio Ave", "Estrela", "Moreirense", "Boavista",
    
    # SELEÇÕES
    "Brasil", "Argentina", "Alemanha", "França", "Itália", "Espanha",
    "Inglaterra", "Portugal", "Holanda", "Bélgica", "Croácia",
    "Uruguai", "Colômbia", "México", "Estados Unidos", "Japão",
    "Coreia do Sul", "Austrália", "Marrocos", "Egito", "Nigéria",
    "Senegal", "Gana", "Camarões", "Equador", "Peru", "Chile",
    "Paraguai", "Bolívia", "Venezuela", "Suécia", "Suíça", "Polônia",
    "Tunísia", "Catar", "Irã", "Arábia Saudita",
    
    # OUTROS
    "Ajax", "Shakhtar Donetsk", "Galatasaray", "Fenerbahce", "Besiktas",
    "Celtic", "Rangers", "Dynamo Kyiv", "Olympiacos", "PAOK",
    "Anderlecht", "Feyenoord", "PSV Eindhoven", "AZ Alkmaar",
]

# Mapeamento de variações de nome
NAME_VARIATIONS = {
    # Brasileiros
    "Flamengo": ["CR Flamengo", "Flamengo RJ"],
    "Fluminense": ["Fluminense FC"],
    "Botafogo": ["Botafogo FR", "Botafogo-RJ"],
    "Grêmio": ["Grêmio FBPA"],
    "Internacional": ["SC Internacional"],
    "Corinthians": ["Corinthians-SP", "SC Corinthians"],
    "Palmeiras": ["SE Palmeiras"],
    "Santos": ["Santos FC"],
    "São Paulo": ["São Paulo FC", "SPFC"],
    "Cruzeiro": ["Cruzeiro EC"],
    "Vasco": ["CR Vasco da Gama", "Vasco da Gama"],
    "Athletico-PR": ["Athletico Paranaense", "Club Athletico Paranaense"],
    
    # Europeus
    "Barcelona": ["FC Barcelona", "Barça"],
    "Real Madrid": ["Real Madry"],
    "Manchester City": ["Man City"],
    "Manchester United": ["Man United"],
    "Inter Milan": ["Inter", "FC Internazionale"],
    "AC Milan": ["Milan", "AC Milan"],
    "Bayern": ["Bayern München", "FC Bayern"],
    "PSG": ["Paris Saint-Germain"],
    "Olympique Marseille": ["Marseille", "OM"],
    "Atletico Madrid": ["Atlético Madrid"],
    
    # Argentino
    "Boca Juniors": ["CA Boca Juniors"],
    "River Plate": ["CA River Plate"],
    "Independiente": ["Club Independiente"],
    "Racing Club": ["Racing"],
    "San Lorenzo": ["San Lorenzo de Almagro"],
}


def search_team_on_thesportsdb(team_name):
    """Busca time na TheSportsDB API"""
    url = f"https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t={requests.utils.quote(team_name)}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            teams = data.get("teams") or []
            if teams:
                # Pegar o primeiro resultado (mais relevante)
                team = teams[0]
                return {
                    "id": team.get("idTeam"),
                    "name": team.get("strTeam"),
                    "alternate": team.get("strTeamAlternate"),
                    "badge": team.get("strTeamBadge"),
                    "logo": team.get("strTeamLogo"),
                    "banner": team.get("strTeamBanner"),
                    "formed_year": team.get("intFormedYear"),
                    "league": team.get("strLeague"),
                    "country": team.get("strCountry"),
                }
    except Exception as e:
        print(f"  Erro ao buscar {team_name}: {e}")
    return None


def download_logo(url, team_name):
    """Baixa logo e salva localmente"""
    if not url:
        return None
    
    try:
        response = requests.get(url, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        if response.status_code == 200:
            # Criar nome de arquivo seguro
            safe_name = "".join(c for c in team_name if c.isalnum() or c in (' ', '-', '_')).strip()
            safe_name = safe_name.replace(' ', '_')
            
            # Tentar detectar extensão do arquivo
            content_type = response.headers.get('content-type', '')
            if 'png' in content_type.lower():
                ext = 'png'
            elif 'gif' in content_type.lower():
                ext = 'gif'
            elif 'webp' in content_type.lower():
                ext = 'webp'
            else:
                ext = 'png'  # default
            
            filename = f"{safe_name}.{ext}"
            filepath = LOGOS_DIR / filename
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"  ✓ Salvo: {filename}")
            return str(filepath)
    except Exception as e:
        print(f"  ✗ Erro ao baixar {url}: {e}")
    return None


def main():
    """Função principal"""
    print("=" * 60)
    print("BAIXADOR DE ESCUDOS DE TIMES DE FUTEBOL")
    print("=" * 60)
    
    # Criar diretório de logos
    LOGOS_DIR.mkdir(exist_ok=True)
    
    # Resultados
    results = {
        "teams": {},
        "missing": [],
        "downloads": []
    }
    
    teams_to_search = set(TEAMS_TO_FETCH)
    
    # Adicionar variações de nome
    for base_name, variations in NAME_VARIATIONS.items():
        teams_to_search.add(base_name)
        teams_to_search.update(variations)
    
    print(f"\nBuscando {len(teams_to_search)} times...\n")
    
    for team_name in sorted(teams_to_search):
        print(f"Buscando: {team_name}")
        
        # Buscar na API
        team_data = search_team_on_thesportsdb(team_name)
        
        if team_data and team_data.get("badge"):
            badge_url = team_data["badge"]
            logo_url = team_data.get("logo") or badge_url
            
            # Tentar baixar o logo
            local_path = download_logo(logo_url or badge_url, team_name)
            
            if local_path:
                results["teams"][team_name] = {
                    "name": team_data["name"],
                    "badge_url": badge_url,
                    "local_path": local_path,
                    "country": team_data.get("country"),
                    "league": team_data.get("league"),
                }
                results["downloads"].append(team_name)
            else:
                # Salvar URL mesmo se não conseguiu baixar
                results["teams"][team_name] = {
                    "name": team_data["name"],
                    "badge_url": badge_url,
                    "local_path": None,
                    "country": team_data.get("country"),
                    "league": team_data.get("league"),
                }
        else:
            results["missing"].append(team_name)
            print(f"  ✗ Time não encontrado")
        
        # Pequena pausa para não sobrecarregar a API
        import time
        time.sleep(0.3)
    
    # Salvar resultados em JSON
    with open(LOGOS_JSON, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Resumo
    print("\n" + "=" * 60)
    print("RESUMO")
    print("=" * 60)
    print(f"Total buscado: {len(teams_to_search)}")
    print(f"Encontrados: {len(results['teams'])}")
    print(f"Baixados: {len(results['downloads'])}")
    print(f"Não encontrados: {len(results['missing'])}")
    print(f"\nArquivos salvos em: {LOGOS_DIR}")
    print(f"Dados salvos em: {LOGOS_JSON}")
    
    if results["missing"]:
        print(f"\nTimes não encontrados:")
        for team in results["missing"][:20]:
            print(f"  - {team}")
        if len(results["missing"]) > 20:
            print(f"  ... e mais {len(results['missing']) - 20}")
    
    return results


if __name__ == "__main__":
    main()
