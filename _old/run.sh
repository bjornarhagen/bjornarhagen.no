#!/bin/sh

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for podman and docker
if command_exists podman; then
    echo "Using podman as the container tool"
    CONTAINER_TOOL=podman
elif command_exists docker; then
    echo "Using docker as the container tool"
    CONTAINER_TOOL=docker
else
    echo "Could not find podman or docker. Please install one of them and try again."
    exit 1
fi

# Run the command
$CONTAINER_TOOL run --rm -it -v "`pwd`:/src" -p 1313:1313 docker.io/klakegg/hugo:0.101.0-ext server
