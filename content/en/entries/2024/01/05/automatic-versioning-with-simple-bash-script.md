---
title: Auto versioning your app with a simple bash script
author: Bjørnar Hagen
categories:
  - Code
  - DevOps
posterImage: /entries/2024/01/05/header.jpg
posterImageCredits: null
posterImageSize: sm
publishDate: 2024-01-05T13:54:00.000Z
summary: To automatically version your app can be pretty complicated and a lot of solutions require complex dependencies and configurations. In this post I will show you how to do it with just a simple Bash script and Git.
body_id: post-page
body_classes: nav-small
---

To automatically version your app can be pretty complicated and a lot of solutions require complex dependencies and configurations. In this post I will show you how to do it with just a simple Bash script and Git.

## Preqrequisites

Bash, Git

## The script

```shell
#!/bin/bash

echo "🚀 Starting auto-version script"

# Get the latest tag from git and use it to get the version number
VERSION=$(git describe --abbrev=0 --tags)
VERSION_NUMBER=$(echo $VERSION | sed 's/v//g')
OLD_VERSION_NUMBER=$(echo $VERSION | sed 's/v//g')

# Get the number of commits since the last tag
COMMITS_SINCE_TAG=$(git rev-list --count $VERSION..HEAD)

MAJOR=$(echo $VERSION_NUMBER | cut -d'.' -f1)
MINOR=$(echo $VERSION_NUMBER | cut -d'.' -f2)
PATCH=$(echo $VERSION_NUMBER | cut -d'.' -f3)

INCREASE_MAJOR=false
INCREASE_MINOR=false
INCREASE_PATCH=false

# Loop through the commits and check the prefix of each commit message
for COMMIT in $(git log --pretty=format:"%H" $VERSION..HEAD); do
  MESSAGE=$(git log --pretty=format:"%s" -n 1 $COMMIT)
  echo "🔍 Checking commit message: \"$MESSAGE\""
  case $MESSAGE in
  breaking:*)
    INCREASE_MAJOR=true
    INCREASE_MINOR=true
    INCREASE_PATCH=true
    echo "   💥 Breaking change detected 💥"
    ;;
  feat:*)
    INCREASE_MINOR=true
    INCREASE_PATCH=true
    echo "   ✨ Minor change detected ✨"
    ;;
  refactor:* | fix:* | build:* | ci:* | docs:* | perf:* | style:* | test:* | chore:*)
    INCREASE_PATCH=true
    echo "   🛠️ Patch change detected 🛠️"
    ;;
  *)
    echo "   🤷 No change detected, make sure to follow the commit message format! 🤷"
    ;;
  esac
done

if [ "$INCREASE_MAJOR" = true ]; then
  MAJOR=$((MAJOR + 1))
  MINOR=0
  PATCH=0
elif [ "$INCREASE_MINOR" = true ]; then
  MINOR=$((MINOR + 1))
  PATCH=0
elif [ "$INCREASE_PATCH" = true ]; then
  PATCH=$((PATCH + 1))
fi

VERSION_NUMBER="$((MAJOR)).$((MINOR)).$((PATCH))"
echo "Old version: $OLD_VERSION_NUMBER"
echo "New version: $VERSION_NUMBER"

echo "optional-prefix-v$VERSION_NUMBER" >public/version.txt
```
