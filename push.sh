#!/usr/bin/env bash
# Commit and push everything to GitHub in one step.
# Usage:  npm run push -- "your commit message"
#    or:  ./push.sh "your commit message"
set -e

REPO_URL="https://github.com/akifshahzad/Akif-shahzad.git"
BRANCH="main"
MESSAGE="${1:-Update portfolio}"

cd "$(dirname "$0")"

# Author identity for commits in this repo
git config user.name "Akif Shahzad"
git config user.email "akifbutt796@gmail.com"

# Make sure the GitHub remote is set
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO_URL"
fi

# Commit local changes, if any
git add -A
if git diff --cached --quiet; then
  echo "No new changes to commit."
else
  git commit -m "$MESSAGE"
fi

# Bring in anything already on GitHub, then push
echo "Pulling latest from GitHub..."
if ! git pull origin "$BRANCH" --no-rebase --allow-unrelated-histories --no-edit; then
  echo ""
  echo "Merge conflict. Fix the files listed above, then run:"
  echo "  git add . && git commit --no-edit && npm run push"
  exit 1
fi

echo "Pushing to GitHub..."
git push -u origin "$BRANCH"
echo "Done: https://github.com/akifshahzad/Akif-shahzad"
