#!/usr/bin/env bash
# generate-dashboards.sh — Régénère le bloc `const agents` des dashboards depuis agents.json
# Usage: ./scripts/generate-dashboards.sh
# Dépendances: jq (apt install jq / brew install jq)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
AGENTS_JSON="$ROOT_DIR/agents.json"

# Vérification des dépendances
if ! command -v jq &> /dev/null; then
  echo "Erreur : jq est requis. Installez avec : apt install jq (Linux) ou brew install jq (Mac)"
  exit 1
fi

if [ ! -f "$AGENTS_JSON" ]; then
  echo "Erreur : agents.json introuvable à $AGENTS_JSON"
  exit 1
fi

# Fonction : génère le JS d'un agent en JSON-like JS object
agent_to_js() {
  jq -r '
    def skills_to_js:
      if (.[0] | type) == "string" then
        map("{ label: \(. | @json), detail: \"\" }") | join(", ")
      else
        map("{ label: \(.label | @json), detail: \(.detail | @json) }") | join(", ")
      end;

    "  {\n" +
    "    id: " + (.id | @json) + ",\n" +
    "    icon: " + (.icon | @json) + ",\n" +
    "    name: " + (.id | @json) + ",\n" +
    "    title: " + (.title | @json) + ",\n" +
    "    role: " + (.role | @json) + ",\n" +
    "    model: " + (.modelLabel | @json) + ",\n" +
    "    color: " + (.color | @json) + ",\n" +
    "    desc: " + (.description | @json) + ",\n" +
    "    tools: [" + ([.tools[] | @json] | join(", ")) + "],\n" +
    "    highlight: " + ((.highlight // false) | tostring) + ",\n" +
    "    skills: [" + (.skills | skills_to_js) + "],\n" +
    "    invocation: \"Use the " + .id + " subagent\",\n" +
    "    personality: " + ((.description | split(".")[0]) + "." | @json) + "\n" +
    "  },"
  '
}

# Fonction : génère le JS du tableau agents pour une équipe donnée
generate_agents_js() {
  local team="$1"
  local include_meta="$2"

  echo "const agents = ["

  # Agents de l'équipe principale
  jq -c --arg team "$team" '.teams[$team].agents[]' "$AGENTS_JSON" | while IFS= read -r agent; do
    echo "$agent" | agent_to_js
  done

  # Agents méta si demandé
  if [ "$include_meta" = "true" ]; then
    jq -c '.teams.meta.agents[]' "$AGENTS_JSON" | while IFS= read -r agent; do
      echo "$agent" | jq -r '.role = "Méta" | .highlight = true' | agent_to_js
    done
  fi

  echo "];"
}

# Fonction : injecte le JS entre les marqueurs dans un fichier HTML
inject_agents_data() {
  local html_file="$1"
  local team="$2"
  local include_meta="$3"

  if [ ! -f "$html_file" ]; then
    echo "  Fichier introuvable : $html_file — ignoré"
    return
  fi

  if ! grep -q "AGENTS_DATA_START" "$html_file" || ! grep -q "AGENTS_DATA_END" "$html_file"; then
    echo "  Marqueurs AGENTS_DATA_START/END introuvables dans $html_file — ignoré"
    return
  fi

  # Génère les données dans un fichier temp
  local data_file
  data_file=$(mktemp)
  generate_agents_js "$team" "$include_meta" > "$data_file"

  # Injecte entre les marqueurs
  local tmp_file
  tmp_file=$(mktemp)

  awk '
    /AGENTS_DATA_START/ {
      print $0
      while ((getline line < "'"$data_file"'") > 0) print line
      skip = 1
      next
    }
    /AGENTS_DATA_END/ {
      print $0
      skip = 0
      next
    }
    !skip { print }
  ' "$html_file" > "$tmp_file"

  mv "$tmp_file" "$html_file"
  rm -f "$data_file"
  echo "  ✓ $html_file mis à jour"
}

echo "Génération des dashboards depuis agents.json..."
echo ""

echo "Dashboard Dev :"
inject_agents_data "$ROOT_DIR/agent-dev/dashboard.html" "dev" "true"

echo "Dashboard Comm :"
inject_agents_data "$ROOT_DIR/agent-com/dashboard-comm.html" "comm" "false"

echo ""

# Affiche le nombre d'agents par dashboard
dev_count=$(jq '.teams.dev.agents | length' "$AGENTS_JSON")
meta_count=$(jq '.teams.meta.agents | length' "$AGENTS_JSON")
comm_count=$(jq '.teams.comm.agents | length' "$AGENTS_JSON")
echo "Résumé : Dev=$dev_count agents (+$meta_count méta), Comm=$comm_count agents"
echo "Terminé."
