#!/bin/bash

# Function to check if a command exists
command_exists() {
    type "$1" &>/dev/null
}

# Check for podman and docker
if command_exists podman; then
    CONTAINER_TOOL=podman
elif command_exists docker; then
    CONTAINER_TOOL=docker
else
    echo "Could not find podman or docker. Please install one of them and try again."
    exit 1
fi

# Run the command
$CONTAINER_TOOL run --rm -it -v $(pwd):/src -p 1313:1313 docker.io/klakegg/hugo:0.101.0-ext -D --gc
