#!/usr/bin/env python3
"""
fetch_football_data.py
Collecte les données football live pour l'équipe agent-foot.

Sources (par ordre de priorité) :
  1. ESPN API (public, sans clé)    → résultats, form, H2H
  2. API-Football (si APIFOOTBALL_KEY) → stats avancées, blessures
  3. TheSportsDB (public, sans clé) → fallback résultats

Usage :
  python3 fetch_football_data.py \
    --team-a-espn 93 --team-b-espn 97 \
    --team-a-name "Athletic Club" \
    --team-b-name "Real Sociedad" \
    --league esp.1 \
    --competition "Copa del Rey" \
    --date "2026-03-04" \
    --output "agent-foot/cache/athletic-vs-sociedad-2026-03-04.json"
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime, timezone

# ─── ESPN IDs — La Liga ────────────────────────────────────────────────────────
ESPN_TEAMS_LALIGA = {
    "Athletic Club":    93,   "Real Sociedad":   97,
    "Real Madrid":      86,   "Barcelona":       83,
    "Atletico Madrid":  1068, "Sevilla":         243,
    "Real Betis":       101,  "Villarreal":      102,
    "Valencia":         95,   "Osasuna":         84,
    "Celta Vigo":       85,   "Getafe":          9812,  # placeholder
    "Mallorca":         1067, "Rayo Vallecano":  3842,
    "Girona":           9812, "Alaves":          96,
    "Espanyol":         104,  "Levante":         103,
    "Elche":            3787, "Las Palmas":      244,
}

# ESPN IDs — Ligue 1
ESPN_TEAMS_LIGUE1 = {
    "PSG":          160,  "Marseille":    116,
    "Lyon":         115,  "Monaco":       1904,
    "Lens":         3842, "Lille":        117,
    "Nice":         118,  "Rennes":       119,
    "Strasbourg":   120,  "Nantes":       121,
}

# ESPN IDs — Premier League
ESPN_TEAMS_PL = {
    "Arsenal":          359,  "Manchester City":  382,
    "Liverpool":        364,  "Chelsea":          363,
    "Tottenham":        367,  "Manchester United": 360,
    "Newcastle":        361,  "Aston Villa":      362,
}

# ESPN IDs — Bundesliga
ESPN_TEAMS_BUND = {
    "Bayern Munich":    132,  "Dortmund":         124,
    "Bayer Leverkusen": 131,  "Leipzig":          11420,
}

# ESPN IDs — Serie A
ESPN_TEAMS_SERIEA = {
    "Juventus":   111,  "Inter":   110,
    "Milan":      103,  "Napoli":  112,
    "Roma":       104,  "Lazio":   105,
}

# Mapping nom ligue → ESPN slug
LEAGUE_SLUGS = {
    "La Liga": "esp.1", "Copa del Rey": "esp.copa_del_rey",
    "Ligue 1": "fra.1", "Coupe de France": "fra.coupe_de_france",
    "Premier League": "eng.1", "FA Cup": "eng.fa",
    "Bundesliga": "ger.1", "DFB Pokal": "ger.dfb_pokal",
    "Serie A": "ita.1", "Coppa Italia": "ita.coppa_italia",
    "Champions League": "UEFA.CHAMPIONS", "Europa League": "UEFA.EUROPA",
    "Conference League": "UEFA.CONFERENCE",
}

APIFOOTBALL_KEY = os.getenv("APIFOOTBALL_KEY", "")
DELAY = 1.2  # secondes entre requêtes

# ─── HTTP Helper ──────────────────────────────────────────────────────────────

def fetch_url(url: str, headers: dict = None, timeout: int = 15) -> str | None:
    default_headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
    }
    if headers:
        default_headers.update(headers)
    try:
        req = urllib.request.Request(url, headers=default_headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  ⚠️  {url[:80]} → {e}", file=sys.stderr)
        return None


def fetch_json(url: str, headers: dict = None) -> dict | list | None:
    raw = fetch_url(url, headers)
    if not raw:
        return None
    try:
        return json.loads(raw)
    except Exception as e:
        print(f"  ⚠️  JSON parse error: {e}", file=sys.stderr)
        return None

# ─── ESPN API ─────────────────────────────────────────────────────────────────

ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer"

def espn_get_team_schedule(team_id: int, league_slug: str = "esp.1", limit: int = 20) -> list:
    """Récupère les derniers matchs d'une équipe via ESPN API."""
    url = f"{ESPN_BASE}/{league_slug}/teams/{team_id}/schedule?limit={limit}"
    print(f"  📡 ESPN → {url}", file=sys.stderr)
    data = fetch_json(url)
    time.sleep(DELAY)
    if not data:
        return []
    return data.get("events", [])


def parse_espn_events(events: list, team_id: int) -> dict:
    """Parse les événements ESPN en données structurées."""
    matches = []
    for e in events:
        try:
            comps = e.get("competitions", [{}])
            c = comps[0] if comps else {}
            status = c.get("status", {}).get("type", {})
            if not status.get("completed", False):
                continue  # ignorer les matchs non joués

            date = e.get("date", "")[:10]
            competitors = c.get("competitors", [])
            if len(competitors) < 2:
                continue

            h = next((x for x in competitors if x.get("homeAway") == "home"), competitors[0])
            a = next((x for x in competitors if x.get("homeAway") == "away"), competitors[1])

            h_score = h.get("score", {})
            a_score = a.get("score", {})
            hs = int(h_score.get("displayValue", 0)) if isinstance(h_score, dict) else int(h_score or 0)
            as_ = int(a_score.get("displayValue", 0)) if isinstance(a_score, dict) else int(a_score or 0)

            h_id = int(h["team"]["id"])
            a_id = int(a["team"]["id"])
            is_home = (h_id == team_id)
            gf = hs if is_home else as_
            ga = as_ if is_home else hs
            result = "W" if gf > ga else ("D" if gf == ga else "L")
            opponent = a["team"]["displayName"] if is_home else h["team"]["displayName"]
            league = e.get("season", {}).get("displayName", "Unknown")

            matches.append({
                "date": date,
                "competition": league,
                "home": is_home,
                "opponent": opponent,
                "score": f"{gf}-{ga}",
                "result": result,
                "goals_for": gf,
                "goals_against": ga,
                "espn_event_id": e.get("id"),
            })
        except Exception as ex:
            continue

    return matches


def compute_stats(matches: list) -> dict:
    """Calcule les stats agrégées depuis les matchs."""
    if not matches:
        return {}

    total = len(matches)
    gf_total = sum(m["goals_for"] for m in matches)
    ga_total = sum(m["goals_against"] for m in matches)

    home_matches = [m for m in matches if m["home"]]
    away_matches = [m for m in matches if not m["home"]]

    def form_from_matches(ms):
        return [m["result"] for m in ms]

    def win_rate(ms):
        if not ms:
            return 0.0
        return round(sum(1 for m in ms if m["result"] == "W") / len(ms), 2)

    return {
        "matches_played": total,
        "goals_scored_per_match": round(gf_total / total, 2),
        "goals_conceded_per_match": round(ga_total / total, 2),
        "win_rate": win_rate(matches),
        "home_win_rate": win_rate(home_matches),
        "away_win_rate": win_rate(away_matches),
    }


def fetch_espn_team(team_id: int, league_slug: str = "esp.1") -> dict:
    """Collecte complète d'une équipe via ESPN."""
    events = espn_get_team_schedule(team_id, league_slug, limit=25)
    matches = parse_espn_events(events, team_id)

    # Trier par date
    matches.sort(key=lambda m: m["date"])

    home_matches = [m for m in matches if m["home"]]
    away_matches = [m for m in matches if not m["home"]]

    season_stats = compute_stats(matches[-20:])  # 20 derniers pour les stats

    home_form5 = [m["result"] for m in home_matches[-5:]]
    away_form5 = [m["result"] for m in away_matches[-5:]]

    return {
        "source": "espn",
        "status": "ok" if matches else "empty",
        "team_id": team_id,
        "form_5": [m["result"] for m in matches[-5:]],
        "form_10": [m["result"] for m in matches[-10:]],
        "recent_matches": matches[-10:],
        "season_stats": season_stats,
        "home_stats": {
            "form_5": home_form5,
            "goals_for_per_match": round(sum(m["goals_for"] for m in home_matches) / (len(home_matches) or 1), 2),
            "goals_against_per_match": round(sum(m["goals_against"] for m in home_matches) / (len(home_matches) or 1), 2),
        },
        "away_stats": {
            "form_5": away_form5,
            "goals_for_per_match": round(sum(m["goals_for"] for m in away_matches) / (len(away_matches) or 1), 2),
            "goals_against_per_match": round(sum(m["goals_against"] for m in away_matches) / (len(away_matches) or 1), 2),
        },
        "all_matches": matches,
    }

# ─── API-Football (optionnel) ─────────────────────────────────────────────────

APIFOOTBALL_TEAM_IDS = {
    "Athletic Club": 532, "Real Sociedad": 548,
    "Real Madrid": 541, "Barcelona": 529,
    "PSG": 85, "Lyon": 80,
    "Manchester City": 50, "Arsenal": 42, "Liverpool": 40,
    "Bayern Munich": 157, "Juventus": 496,
}

def fetch_apifootball_injuries(team_id: int, fixture_id: int = None) -> list:
    """Récupère les blessures via API-Football si clé disponible."""
    if not APIFOOTBALL_KEY:
        return []
    url = f"https://v3.football.api-sports.io/injuries?team={team_id}&season=2025"
    data = fetch_json(url, headers={
        "x-rapidapi-key": APIFOOTBALL_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
    })
    time.sleep(DELAY)
    if not data or "response" not in data:
        return []
    injuries = []
    for item in data["response"][:8]:
        player = item.get("player", {})
        injuries.append({
            "player": player.get("name", "Unknown"),
            "status": item.get("player", {}).get("reason", "injured").lower(),
        })
    return injuries

# ─── H2H ─────────────────────────────────────────────────────────────────────

def build_h2h(matches_a: list, team_b_name: str) -> dict:
    """Trouve les H2H dans les matchs récents de l'équipe A."""
    h2h = []
    search_terms = team_b_name.lower().replace(" ", "").replace("-", "")

    for m in matches_a:
        opp = m.get("opponent", "").lower().replace(" ", "").replace("-", "")
        # Matching flexible
        if (search_terms in opp or opp in search_terms or
            any(part in opp for part in search_terms.split() if len(part) > 4)):
            is_home = m.get("home", True)
            res = m.get("result", "?")
            winner = "home" if res == "W" else ("away" if res == "L" else "draw")
            if not is_home:
                winner = "away" if res == "W" else ("home" if res == "L" else "draw")
            h2h.append({
                "date": m["date"],
                "competition": m.get("competition", ""),
                "score": m["score"],
                "winner": winner,
                "home_team": "team_a" if is_home else "team_b",
            })

    total_goals = sum(
        int(m["score"].split("-")[0]) + int(m["score"].split("-")[1])
        for m in h2h if "-" in m["score"]
    )
    avg_goals = round(total_goals / len(h2h), 2) if h2h else None

    return {
        "found": len(h2h),
        "last_5": h2h[-5:],
        "home_wins": sum(1 for m in h2h if m["winner"] == "home"),
        "draws": sum(1 for m in h2h if m["winner"] == "draw"),
        "away_wins": sum(1 for m in h2h if m["winner"] == "away"),
        "avg_goals_per_match": avg_goals,
    }

# ─── Assemblage ───────────────────────────────────────────────────────────────

def build_output(args) -> dict:
    team_a_name = args.team_a_name
    team_b_name = args.team_b_name
    league_slug = args.league

    print(f"\n🕷️  Collecte ESPN : {team_a_name} vs {team_b_name}", file=sys.stderr)
    print(f"   Ligue : {league_slug} | Date : {args.date}", file=sys.stderr)
    print("─" * 50, file=sys.stderr)

    # 1. ESPN (source principale)
    print("\n[1/3] ESPN — équipe domicile...", file=sys.stderr)
    espn_a = fetch_espn_team(args.team_a_espn, league_slug)

    print("\n[2/3] ESPN — équipe extérieur...", file=sys.stderr)
    espn_b = fetch_espn_team(args.team_b_espn, league_slug)

    # 2. H2H
    print("\n[3/3] Construction H2H...", file=sys.stderr)
    h2h = build_h2h(espn_a.get("all_matches", []), team_b_name)

    # 3. Blessures via API-Football si dispo
    injuries_a = []
    injuries_b = []
    if APIFOOTBALL_KEY:
        print("\n[+] API-Football — blessures...", file=sys.stderr)
        api_id_a = APIFOOTBALL_TEAM_IDS.get(team_a_name)
        api_id_b = APIFOOTBALL_TEAM_IDS.get(team_b_name)
        if api_id_a:
            injuries_a = fetch_apifootball_injuries(api_id_a)
        if api_id_b:
            injuries_b = fetch_apifootball_injuries(api_id_b)

    def squad_status(injuries):
        if not injuries:
            return "unknown (API-Football key required)"
        n = len(injuries)
        return "limited" if n > 3 else ("moderate" if n > 1 else "good")

    sources_ok = sum([
        espn_a.get("status") == "ok",
        espn_b.get("status") == "ok",
    ])
    reliability = "high" if sources_ok == 2 else ("medium" if sources_ok == 1 else "low")

    output = {
        "match": {
            "home": team_a_name,
            "away": team_b_name,
            "competition": args.competition,
            "date": args.date,
            "scraped_at": datetime.now(timezone.utc).isoformat(),
        },
        "home_team": {
            "espn_id": args.team_a_espn,
            "form_5": espn_a.get("form_5", []),
            "form_10": espn_a.get("form_10", []),
            "recent_matches": espn_a.get("recent_matches", []),
            "season_stats": espn_a.get("season_stats", {}),
            "home_stats": espn_a.get("home_stats", {}),
            "injuries": injuries_a,
            "suspensions": [],
            "squad_availability": squad_status(injuries_a),
        },
        "away_team": {
            "espn_id": args.team_b_espn,
            "form_5": espn_b.get("form_5", []),
            "form_10": espn_b.get("form_10", []),
            "recent_matches": espn_b.get("recent_matches", []),
            "season_stats": espn_b.get("season_stats", {}),
            "away_stats": espn_b.get("away_stats", {}),
            "injuries": injuries_b,
            "suspensions": [],
            "squad_availability": squad_status(injuries_b),
        },
        "h2h": h2h,
        "odds": {},
        "data_quality": {
            "espn_home": espn_a.get("status") == "ok",
            "espn_away": espn_b.get("status") == "ok",
            "xg_available": False,  # ESPN ne fournit pas de xG
            "injuries_confirmed": bool(APIFOOTBALL_KEY),
            "h2h_found": h2h["found"] > 0,
            "reliability": reliability,
            "note": "xG non disponible via ESPN — utiliser API-Football (APIFOOTBALL_KEY) pour les stats avancées",
        },
    }
    return output

# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Fetch football match data via ESPN API")

    # IDs ESPN
    parser.add_argument("--team-a-espn", type=int, required=True,
                        help="ESPN team ID équipe domicile (ex: 93 pour Athletic Club)")
    parser.add_argument("--team-b-espn", type=int, required=True,
                        help="ESPN team ID équipe extérieur (ex: 97 pour Real Sociedad)")

    # Noms
    parser.add_argument("--team-a-name", default="Équipe A")
    parser.add_argument("--team-b-name", default="Équipe B")

    # Match info
    parser.add_argument("--league", default="esp.1",
                        help="ESPN league slug (esp.1, fra.1, eng.1, ger.1, ita.1, UEFA.CHAMPIONS...)")
    parser.add_argument("--competition", default="Unknown")
    parser.add_argument("--date", default=datetime.now().strftime("%Y-%m-%d"))
    parser.add_argument("--output", default=None)

    # Utilitaire : lister les IDs connus
    parser.add_argument("--list-teams", action="store_true",
                        help="Afficher les IDs ESPN connus par ligue")

    args = parser.parse_args()

    if args.list_teams:
        print("\n📋 IDs ESPN connus:\n")
        for league, teams in [
            ("La Liga (esp.1)", ESPN_TEAMS_LALIGA),
            ("Ligue 1 (fra.1)", ESPN_TEAMS_LIGUE1),
            ("Premier League (eng.1)", ESPN_TEAMS_PL),
        ]:
            print(f"  {league}:")
            for name, tid in teams.items():
                print(f"    {tid:6d}  {name}")
        return

    data = build_output(args)
    json_output = json.dumps(data, ensure_ascii=False, indent=2)

    if args.output:
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(json_output)
        print(f"\n✅ Sauvegardé → {args.output}", file=sys.stderr)

    print(json_output)

    dq = data["data_quality"]
    form_a = data["home_team"]["form_5"]
    form_b = data["away_team"]["form_5"]
    print(f"""
📡 RAPPORT DE COLLECTE
────────────────────────────────────────
Match       : {data['match']['home']} vs {data['match']['away']}
ESPN home   : {'✅ OK' if dq['espn_home'] else '❌ Échec'} — forme 5 : {' '.join(form_a) if form_a else 'N/A'}
ESPN away   : {'✅ OK' if dq['espn_away'] else '❌ Échec'} — forme 5 : {' '.join(form_b) if form_b else 'N/A'}
H2H         : {'✅ ' + str(data['h2h']['found']) + ' matchs trouvés' if dq['h2h_found'] else '❌ Aucun (élargir la recherche)'}
Blessures   : {'✅ API-Football active' if dq['injuries_confirmed'] else '⚠️ Set APIFOOTBALL_KEY pour les blessures'}
xG          : ⚠️ Non disponible via ESPN (nécessite API-Football Premium)
Fiabilité   : {dq['reliability'].upper()}
────────────────────────────────────────""", file=sys.stderr)


if __name__ == "__main__":
    main()
