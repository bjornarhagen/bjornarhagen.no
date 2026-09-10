#!/bin/sh
set -eu
cd "$(dirname "$0")/.."

# Pass an existing image to test it without rebuilding.
image=${1:-bjornarhagen-no:production-test}
if [ "$#" -eq 0 ]; then
    docker build -t "$image" .
fi

container=$(docker run -d --user 1000:1000 --read-only \
    --tmpfs /tmp:rw,nosuid,nodev --cap-drop ALL \
    --security-opt no-new-privileges "$image")
cleanup() {
    docker logs "$container"
    docker rm -f "$container" >/dev/null
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

# No source mount: assertions run against only the final image's packaged files.
docker exec -i "$container" bun run - < scripts/test-production.mjs
