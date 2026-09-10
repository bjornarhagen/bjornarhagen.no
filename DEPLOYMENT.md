# Deployment

Production: [https://bjornar.dev](https://bjornar.dev).

## Current release status

As reviewed on 2026-09-10, cluster auto-deployment is **not enabled**. Publishing
an image or merging this documentation does not update the cluster. The intended
release branch is `master`. The deployment registry in the private
infrastructure repository is authoritative for whether automation is enabled.

The source of the current cluster image (`5b296e4`) is included on `master`,
including its production Dockerfile and runtime tests. The obsolete Vercel
production workflow has been removed; the operator reports deleting the Vercel
projects on 2026-09-10. Existing manual/dev image publication is separate from
cluster delivery and does not change its pinned image.

## How releases will work once enabled

1. Open a PR and pass the repository's required checks. Public PRs use standard
   GitHub-hosted runners, including PRs from the owner, collaborators and forks.
2. Merge the reviewed change to the release branch. Once explicitly enabled,
   this merge authorizes an application image release.
3. Private infrastructure CI discovers the exact default-branch commit, requires
   its push CI to pass, builds and tests the container, and publishes an immutable
   image. Discovery polls approximately every 15 minutes; queueing and GitHub
   scheduling can add delay. There is no cross-repository deployment token here.
4. The deployment controller changes only the application's pinned image digests
   and release receipt. Flux applies the infrastructure commit. Delivery succeeds
   only after Flux reports that exact revision ready.

Current implementation preparation uses fresh GitHub-hosted VMs for builds.
Self-hosted release builds require separately verified disposable workers;
application PRs never select the persistent infrastructure runner.

## Build and verify

```sh
docker build --platform linux/amd64 -t website:check .
python3 scripts/check-container.py website:check
```

The build runs Astro type checks. Runtime tests exercise production routes,
redirects and 404s in the packaged image with a non-root user and read-only
filesystem. `container-checks.yml` runs these checks on PRs and `master` pushes
on GitHub-hosted runners with read-only repository access.

## Ownership, status and rollback

This repository owns application code, build inputs and application tests.
Private infrastructure owns deployment policy, image publication, Kubernetes,
DNS, TLS, production secrets and recovery procedures. Source visibility does
not determine container-package visibility.

Authorized operators can inspect the [deployment registry](https://github.com/bjornarhagen/ai-devops/blob/main/delivery/applications.json)
and [delivery runbook](https://github.com/bjornarhagen/ai-devops/blob/main/docs/runbooks/application-delivery.md).
These private links require access. Public contributors can inspect this repository's Actions
checks; deployment logs and private image artifacts remain private.

To pause releases, disable this application in the central registry; operators
can also stop all releases with the central switch. Rollback is an approved
infrastructure change restoring a previously tested image digest. Pause
continuous releases first so automation cannot immediately replace the rollback.
Never restore a database merely to roll back an application image.

Do not put deployment tokens, registry credentials, production environment
values, kubeconfigs or internal inventory into this repository's documentation,
PR output, build artifacts or workflow logs.
