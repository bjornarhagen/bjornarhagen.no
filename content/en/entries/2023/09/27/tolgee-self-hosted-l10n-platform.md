---
title: Tolgee - Self hosted l10n platform
description: Tolgee is an open source localization platform with cheap cloud plans and a self hosted option. It has great features, SDKs for all the popular JS front-ends, and a nice UI. In this post I'll show you how I set it up in k8s.
author: Bjørnar Hagen
categories:
  - DevOps
  - k8s
posterImage: /entries/2023/09/27/header.jpg
posterImageCredits: null
posterImageSize: sm
publishDate: 2023-09-27T11:15:00.000Z
summary: Tolgee is an open source localization platform with cheap cloud plans and a self hosted option. It has great features, SDKs for all the popular JS front-ends, and a nice UI. In this post I'll show you how I set it up in k8s.
body_id: post-page
body_classes: nav-small
---

Tolgee has good documentation on how to run in Docker: https://tolgee.io/platform/self_hosting/running_with_docker, but unfortunately nothing on k8s, hence this post.

## Preqrequisites

You have a running PostgreSQL database available.

You need to have the following Postgre extentions enabled:

- pg_trgm
- unaccent

nb: you have to be superuser to do this

## Kubernetes setup

**File structure:**

```shell
> tree -a
.
├── .env
├── install.sh
└── tolgee-k8s-manifest.yaml
```

**File contents:**

tolgee-k8s-manifest.yaml:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tolgee-deployment
  namespace: REPLACE_WITH_NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tolgee
  template:
    metadata:
      labels:
        app: tolgee
    spec:
      containers:
        - name: tolgee
          image: tolgee/tolgee
          resources:
            requests:
              cpu: '100m'
              memory: '512Mi'
            limits:
              memory: '2Gi'
          envFrom:
            - secretRef:
                name: tolgee-secret
          ports:
            - name: http
              containerPort: 8080
          volumeMounts:
            - mountPath: /data
              name: tolgee-data
          startupProbe:
            initialDelaySeconds: 60
            httpGet:
              path: /
              port: http
          readinessProbe:
            httpGet:
              path: /login
              port: http
          livenessProbe:
            httpGet:
              path: /login
              port: http
      volumes:
        - name: tolgee-data
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: tolgee-service
  namespace: REPLACE_WITH_NAMESPACE
spec:
  selector:
    app: tolgee
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
      name: http
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/backend-protocol: HTTP
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
    # Uncomment the following line to turn on a whitelist with your IP
    # nginx.ingress.kubernetes.io/whitelist-source-range: 10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,REPLACE_WITH_IP/28
  name: tolgee-ingress
  namespace: REPLACE_WITH_NAMESPACE
spec:
  tls:
    - hosts:
        - tolgee.example.com
      secretName: tolgee-tls
  rules:
    - host: tolgee.example.com
      http:
        paths:
          - backend:
              service:
                name: tolgee-service
                port:
                  name: http
            path: /
            pathType: Prefix
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: tolgee-certificate
  namespace: REPLACE_WITH_NAMESPACE
spec:
  dnsNames:
    - tolgee.example.com
  secretName: tolgee-tls
  issuerRef:
    name: letsencrypt-production
    kind: ClusterIssuer
```

.env:

```env
SERVER_PORT=8080
SPRING_DATASOURCE_URL=REPLACE_ME
SPRING_DATASOURCE_USERNAME=REPLACE_ME
SPRING_DATASOURCE_PASSWORD=REPLACE_ME
TOLGEE_FILE_STORAGE_URL=
TOLGEE_FRONT_END_URL=
TOLGEE_MAX_SCREENSHOTS_PER_KEY=20
TOLGEE_MAX_TRANSLATION_TEXT_LENGTH=10000
TOLGEE_MAX_UPLOAD_FILE_SIZE=51200
TOLGEE_AUTHENTICATION_CREATE_INITIAL_USER=true
TOLGEE_AUTHENTICATION_ENABLED=true
TOLGEE_AUTHENTICATION_INITIAL_PASSWORD=REPLACE_ME
TOLGEE_AUTHENTICATION_INITIAL_USERNAME=REPLACE_ME
TOLGEE_AUTHENTICATION_JWT_EXPIRATION=604800000
TOLGEE_AUTHENTICATION_JWT_SECRET=REPLACE_WITH_TOKEN
TOLGEE_AUTHENTICATION_JWT_SUPER_EXPIRATION=3600000
TOLGEE_AUTHENTICATION_NATIVE_ENABLED=true
TOLGEE_AUTHENTICATION_NEEDS_EMAIL_VERIFICATION=false
TOLGEE_AUTHENTICATION_REGISTRATIONS_ALLOWED=true
TOLGEE_AUTHENTICATION_USER_CAN_CREATE_ORGANIZATIONS=true
TOLGEE_BATCH_CONCURRENCY=1
TOLGEE_CACHE_CAFFEINE_MAX_SIZE=-1
TOLGEE_CACHE_DEFAULT_TTL=7200000
TOLGEE_CACHE_ENABLED=false
TOLGEE_CACHE_USE_REDIS=false
TOLGEE_FILE_STORAGE_S3_ACCESS_KEY=
TOLGEE_FILE_STORAGE_S3_BUCKET_NAME=
TOLGEE_FILE_STORAGE_S3_ENABLED=false
TOLGEE_FILE_STORAGE_S3_ENDPOINT=
TOLGEE_FILE_STORAGE_S3_SECRET_KEY=
TOLGEE_FILE_STORAGE_S3_SIGNING_REGION=
TOLGEE_MACHINE_TRANSLATION_FREE_CREDITS_AMOUNT=-1
TOLGEE_MACHINE_TRANSLATION_AWS_ACCESS_KEY=
TOLGEE_MACHINE_TRANSLATION_AWS_DEFAULT_ENABLED=false
TOLGEE_MACHINE_TRANSLATION_AWS_DEFAULT_PRIMARY=false
TOLGEE_MACHINE_TRANSLATION_AWS_ENABLED=
TOLGEE_MACHINE_TRANSLATION_AWS_REGION=eu-central-1
TOLGEE_MACHINE_TRANSLATION_AWS_SECRET_KEY=
TOLGEE_MACHINE_TRANSLATION_AZURE_AUTH_KEY=
TOLGEE_MACHINE_TRANSLATION_AZURE_DEFAULT_ENABLED=false
TOLGEE_MACHINE_TRANSLATION_AZURE_DEFAULT_PRIMARY=false
TOLGEE_MACHINE_TRANSLATION_AZURE_REGION=
TOLGEE_MACHINE_TRANSLATION_BAIDU_ACTION=false
TOLGEE_MACHINE_TRANSLATION_BAIDU_APP_ID=
TOLGEE_MACHINE_TRANSLATION_BAIDU_APP_SECRET=
TOLGEE_MACHINE_TRANSLATION_BAIDU_DEFAULT_ENABLED=false
TOLGEE_MACHINE_TRANSLATION_BAIDU_DEFAULT_PRIMARY=false
TOLGEE_MACHINE_TRANSLATION_DEEPL_AUTH_KEY=
TOLGEE_MACHINE_TRANSLATION_DEEPL_DEFAULT_ENABLED=false
TOLGEE_MACHINE_TRANSLATION_DEEPL_DEFAULT_PRIMARY=false
TOLGEE_MACHINE_TRANSLATION_DEEPL_FORMALITY=default
TOLGEE_MACHINE_TRANSLATION_GOOGLE_API_KEY=
TOLGEE_MACHINE_TRANSLATION_GOOGLE_DEFAULT_ENABLED=false
TOLGEE_MACHINE_TRANSLATION_GOOGLE_DEFAULT_PRIMARY=false
TOLGEE_POSTGRES_AUTOSTART_CONTAINER_NAME=tolgee_postgres
TOLGEE_POSTGRES_AUTOSTART_DATABASE_NAME=tolgee_db
TOLGEE_POSTGRES_AUTOSTART_ENABLED=false
TOLGEE_POSTGRES_AUTOSTART_MODE=DOCKER
TOLGEE_POSTGRES_AUTOSTART_PASSWORD=password
TOLGEE_POSTGRES_AUTOSTART_PORT=25432
TOLGEE_POSTGRES_AUTOSTART_USER=tolgee_user
TOLGEE_RATE_LIMITS_ENABLED=true
TOLGEE_SENTRY_CLIENT_DSN=
TOLGEE_SENTRY_SERVER_DSN=
TOLGEE_SENTRY_TRACES_SAMPLE_RATE=
TOLGEE_SMTP_AUTH=false
TOLGEE_SMTP_FROM=
TOLGEE_SMTP_HOST=
TOLGEE_SMTP_PASSWORD=
TOLGEE_SMTP_PORT=25
TOLGEE_SMTP_SSL_ENABLED=false
TOLGEE_SMTP_TLS_ENABLED=false
TOLGEE_SMTP_TLS_REQUIRED=false
TOLGEE_SMTP_USERNAME=
TOLGEE_TELEMETRY_ENABLED=true
TOLGEE_WEBSOCKET_USE_REDIS=false
```

install.sh:

```shell
#!/bin/bash

kubectl -n REPLACE_WITH_NAMESPACE create secret generic tolgee-secret --from-env-file=.env --save-config --dry-run=client -o yaml | kubectl -n REPLACE_WITH_NAMESPACE apply -f -
kubectl -n REPLACE_WITH_NAMESPACE apply -f tolgee-k8s-manifest.yaml
```

Now all you need to do is update the `.env` with your own values, and run `./install.sh`.
