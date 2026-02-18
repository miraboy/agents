#!/usr/bin/env bash
# generate-adapters.sh — Injecte les listes d'agents dans les fichiers adapter depuis agents.json
# Usage: ./scripts/generate-adapters.sh
# Dépendances: jq (apt install jq / brew install jq)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
AGENTS_JSON="$ROOT_DIR/agents.json"
ADAPTERS_DIR="$ROOT_DIR/adapters"

# Vérification des dépendances
if ! command -v jq &> /dev/null; then
  echo "Erreur : jq est requis. Installez avec : apt install jq (Linux) ou brew install jq (Mac)"
  exit 1
fi

if [ ! -f "$AGENTS_JSON" ]; then
  echo "Erreur : agents.json introuvable à $AGENTS_JSON"
  exit 1
fi

# ---------------------------------------------------------------------------
# Fonctions utilitaires
# ---------------------------------------------------------------------------

# Injecte un bloc texte entre ADAPTERS_DATA_START et ADAPTERS_DATA_END dans un fichier HTML
inject_block() {
  local target_file="$1"
  local data_file="$2"

  if [ ! -f "$target_file" ]; then
    echo "  Fichier introuvable : $target_file — ignoré"
    return
  fi

  if ! grep -q "ADAPTERS_DATA_START" "$target_file" || ! grep -q "ADAPTERS_DATA_END" "$target_file"; then
    echo "  Marqueurs ADAPTERS_DATA_START/END introuvables dans $target_file — ignoré"
    return
  fi

  local tmp_file
  tmp_file=$(mktemp)

  awk '
    /ADAPTERS_DATA_START/ {
      print $0
      while ((getline line < "'"$data_file"'") > 0) print line
      skip = 1
      next
    }
    /ADAPTERS_DATA_END/ {
      print $0
      skip = 0
      next
    }
    !skip { print }
  ' "$target_file" > "$tmp_file"

  mv "$tmp_file" "$target_file"
  echo "  ✓ $target_file mis à jour"
}

# ---------------------------------------------------------------------------
# Génération : GitHub Copilot — copilot-instructions.md
# ---------------------------------------------------------------------------

generate_copilot_main() {
  local data_file
  data_file=$(mktemp)

  {
    echo "## Agent Roster"
    echo ""

    # Root
    echo "### Root"
    jq -r '.teams.root.agents[] | "- **\(.id)** (\(.modelLabel)) — \(.role) — \(.description | split(".")[0])"' "$AGENTS_JSON"
    echo ""

    # Meta
    echo "### Meta"
    jq -r '.teams.meta.agents[] | "- **\(.id)** (\(.modelLabel)) — \(.role) — \(.description | split(".")[0])"' "$AGENTS_JSON"
    echo ""

    # Dev team
    echo "### Dev Team"
    jq -r '.teams.dev.agents[] | "- **\(.id)** (\(.modelLabel)) — \(.role) — \(.description | split(".")[0])"' "$AGENTS_JSON"
    echo ""

    # Comm team
    echo "### Comm Team"
    jq -r '.teams.comm.agents[] | "- **\(.id)** (\(.modelLabel)) — \(.role) — \(.description | split(".")[0])"' "$AGENTS_JSON"
  } > "$data_file"

  inject_block "$ADAPTERS_DIR/github-copilot/copilot-instructions.md" "$data_file"
  rm -f "$data_file"
}

# ---------------------------------------------------------------------------
# Génération : Amazon Q — dev-team.md
# ---------------------------------------------------------------------------

generate_amazon_q_dev() {
  local data_file
  data_file=$(mktemp)

  {
    echo "## Dev Team Agents"
    echo ""
    echo "| Agent | Role | Specialty |"
    echo "|-------|------|-----------|"
    jq -r '.teams.dev.agents[] | "| \(.id) | \(.role) | \(.description | split(".")[0]) |"' "$AGENTS_JSON"
  } > "$data_file"

  inject_block "$ADAPTERS_DIR/amazon-q/rules/dev-team.md" "$data_file"
  rm -f "$data_file"
}

# ---------------------------------------------------------------------------
# Génération : Amazon Q — comm-team.md
# ---------------------------------------------------------------------------

generate_amazon_q_comm() {
  local data_file
  data_file=$(mktemp)

  {
    echo "## Comm Team Agents"
    echo ""
    echo "| Agent | Role | Specialty |"
    echo "|-------|------|-----------|"
    jq -r '.teams.comm.agents[] | "| \(.id) | \(.role) | \(.description | split(".")[0]) |"' "$AGENTS_JSON"
  } > "$data_file"

  inject_block "$ADAPTERS_DIR/amazon-q/rules/comm-team.md" "$data_file"
  rm -f "$data_file"
}

# ---------------------------------------------------------------------------
# Génération : Aider — CONVENTIONS.md
# ---------------------------------------------------------------------------

generate_aider_conventions() {
  local data_file
  data_file=$(mktemp)

  {
    echo "## Agent Reference"
    echo ""
    echo "### Dev Team"
    jq -r '.teams.dev.agents[] | "- \(.id): \(.role) — \(.description | split(".")[0])"' "$AGENTS_JSON"
    echo ""
    echo "### Comm Team"
    jq -r '.teams.comm.agents[] | "- \(.id): \(.role) — \(.description | split(".")[0])"' "$AGENTS_JSON"
  } > "$data_file"

  inject_block "$ADAPTERS_DIR/aider/CONVENTIONS.md" "$data_file"
  rm -f "$data_file"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

echo "Mise à jour des adapters depuis agents.json..."
echo ""

echo "GitHub Copilot :"
generate_copilot_main

echo ""
echo "Amazon Q — dev :"
generate_amazon_q_dev

echo "Amazon Q — comm :"
generate_amazon_q_comm

echo ""
echo "Aider :"
generate_aider_conventions

echo ""

# Résumé
dev_count=$(jq '.teams.dev.agents | length' "$AGENTS_JSON")
comm_count=$(jq '.teams.comm.agents | length' "$AGENTS_JSON")
meta_count=$(jq '.teams.meta.agents | length' "$AGENTS_JSON")
echo "Résumé : Dev=$dev_count agents, Comm=$comm_count agents, Méta=$meta_count agents"
echo "Note : les system prompts Codex (adapters/codex/) ne sont pas auto-générés (contenu narratif)."
echo "Terminé."
