---
title: Useful commands
description: Lists of commands I use often, but also forget often.
author: Bjørnar Hagen
categories:
  - Code
posterImageSize: sm
publishDate: 2021-01-28T20:08:47.577Z
summary: Lists of commands I use often, but also forget often.
type: page
hideFromList: true
layoutSectionClasses:
headerClasses: bg-theme-reverse bg-dots-dark bg-dots-md
headerContentClasses: bg-theme-reverse fg-theme
headerContent: Lists of commands I use often, but also forget often.
---

{{< info-section >}}
{{< info-section-left icon="🔐" title="Security & privacy" />}}
{{< info-section-right >}}
{{< raw-html >}}

<dt>
    <input value="tar czf myDir.tar.gz myDir" type="text">
    <input value="gpg -c myDir.tar.gz" type="text">
</dt>
<dd>Make a password encrypted backup of a directory</dd>

<dt>
    <input value="gpg -d myDir.tar.gz.gpg > myDir.tar.gz" type="text">
    <input value="tar xzf myDir.tar.gz" type="text">
</dt>
<dd>Decrypt an encrypted directory</dd>
{{< /raw-html >}}
{{< /info-section-right >}}
{{</ info-section >}}

{{< info-section >}}
{{< info-section-left icon="☸" title="Kubernetes" />}}
{{< info-section-right >}}
{{< raw-html >}}

<dt>
<input value="ENTRYPOINT ['tail', '-f', '/dev/null']" type="text">
</dt>
<dd>Make a Dockerfile run forever so you can debug it</dd>

<dt>
    <textarea rows="8">

apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
name: bjornar-dev-certificate
namespace: bjornar-dev-ns
spec:
dnsNames: - bjornar.dev - www.bjornar.dev
secretName: bjornar-dev-tls
issuerRef:
name: letsencrypt-cluster-issuer
kind: ClusterIssuer
</textarea>

</dt>
<dd>k8s manifest example - certificate</dd>

<dt>
    <textarea rows="8">

apiVersion: apps/v1
kind: Deployment
metadata:
name: bjornar-dev-deployment
namespace: bjornar-dev-ns
spec:
selector:
matchLabels:
app: bjornar-dev-app
replicas: 1
template:
metadata:
labels:
app: bjornar-dev-app
spec:
containers: - name: bjornar-dev-app
image: registry.bjornar.dev/personal/bjornarhagen
envFrom: - secretRef:
name: dot-env
imagePullPolicy: Always
ports: - containerPort: 80
resources:
requests:
cpu: "100m"
memory: "160Mi"
limits:
memory: "256Mi"
imagePullSecrets: - name: private-container-registry-secrets
</textarea>

</dt>
<dd>k8s manifest example - deployment</dd>

                <dt>
                    <textarea rows="8">

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: bjornar-dev-ingress
namespace: bjornar-dev-ns
annotations:
kubernetes.io/ingress.class: "nginx"
nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
tls: - hosts: - bjornar.dev - www.bjornar.dev
secretName: bjornar-dev-tls
rules: - host: bjornar.dev
http: &http_rules
paths: - path: /
pathType: Prefix
backend:
service:
name: bjornar-dev-service
port:
number: 80 - host: www.bjornar.dev
http: \*http_rules

---

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: bjornar-dev-ingress-admin
namespace: bjornar-dev-ns
annotations:
kubernetes.io/ingress.class: "nginx"
nginx.ingress.kubernetes.io/ssl-redirect: "true"
nginx.ingress.kubernetes.io/use-regex: "true"
nginx.ingress.kubernetes.io/rewrite-target: /admin/$1
nginx.ingress.kubernetes.io/whitelist-source-range: "127.0.0.1" # Replace with public IP
spec:
tls: - hosts: - bjornar.dev - www.bjornar.dev
secretName: bjornar-dev-tls
rules: - host: bjornar.dev
http: &http_rules_admin
paths: - path: /admin
pathType: Exact
backend:
service:
name: bjornar-dev-service
port:
number: 80 - path: /admin/(.*)
pathType: Prefix
backend:
service:
name: bjornar-dev-service
port:
number: 80 - host: www.bjornar.dev
http: *http_rules_admin
</textarea>

</dt>
<dd>k8s manifest example - ingress with a private /admin space</dd>

<dt>
    <textarea rows="8">

apiVersion: v1
kind: Service
metadata:
name: bjornar-dev-service
namespace: bjornar-dev-ns
labels:
app: bjornar-dev-app
spec:
type: ClusterIP
selector:
app: bjornar-dev-app
ports: - protocol: TCP
name: http
port: 80
targetPort: 80
</textarea>

</dt>
<dd>k8s manifest example - service</dd>
{{< /raw-html >}}
{{< /info-section-right >}}
{{</ info-section >}}

{{< info-section >}}
{{< info-section-left icon="🐧" title="Linux" />}}
{{< info-section-right >}}
{{< raw-html >}}

<dl>
<dt>
<input value="sudo usermod -a -G www-data username" type="text">
</dt>
<dd>Add user to www-data</dd>

<dt>
    <input value="sudo chown www-data:www-data . -R" type="text">
</dt>
<dd>set www-data to owner of folder</dd>

<dt>
    <input value="sudo find . -type d -exec chmod 775 {} +" type="text">
</dt>
<dd>Change folder permissions</dd>

<dt>
    <input value="sudo find . -type f -exec chmod 664 {} +" type="text">
</dt>
<dd>Change file permissions</dd>

<dt>
    <input value="sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/example.com" type="text">
    <input value="sudo ln -s /etc/apache2/sites-available/example.com.conf /etc/apache2/sites-enabled/example.com.conf" type="text">
</dt>
<dd>Create symbolic link between sites-available and sites-enabled</dd>

<dt>
    <textarea rows="8">
#!/bin/sh

# For AWS Credentials

export HOME=/home/username

THEDATE=`date +%Y-%m-%d-%H-%M-%S`
prefix="my-prefix"

# tar the folder

sudo tar czf /backups/${prefix}-www-daily-${THEDATE}.tar.gz -C /var www

# sync to amazon

/usr/local/bin/aws s3 cp /backups/${prefix}-www-daily-${THEDATE}.tar.gz s3://bucket-name
</textarea>

</dt>
<dd>Backup folder to AWS S3 using the AWS cli</dd>

                    <dt>
                        <textarea rows="8">

0 0 \* \* _ /backup-daily.sh > /backup.log 2>&1
0 0 _ _ 0 /backup-weekly.sh > /backup.log 2>&1
0 0 1 _ _ /backup-monthly.sh > /backup.log 2>&1
0 0 1 1 _ /backup-yearly.sh > /backup.log 2>&1
0 0 1 1 \* /backup-permanent.sh > /backup.log 2>&1
</textarea>

</dt>
<dd>Cron job schedule for backups</dd>
</dl>
{{< /raw-html >}}
{{< /info-section-right >}}
{{</ info-section >}}

{{< info-section >}}
{{< info-section-left icon="👨‍💻" title="Web dev & DevOps" />}}
{{< info-section-right >}}
{{< raw-html >}}

<dl>
<dt>
<input value="openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout privkey.pem -out fullchain.pem" type="text">
</dt>
<dd>Create self-signed certificate for local use</dd>

<dt>
    <input value="ssh user@server -L LOCAL_PORT:localhost:REMOTE_PORT" type="text">
</dt>
<dd>Port forward a remote port to a local one</dd>
<dd>Very handy for using local software with remote data</dd>
<dd>
    <span class="note">MySQL example:</span>
    <code>ssh user@server -L 3307:localhost:3306</code>
</dd>
<dd>
    <code>localhost:3307</code> now works locally as <code>localhost:3306</code> works on the server</dd>

<dt>
    <textarea rows="8">
const form = document.querySelector('form');
const data = new FormData(form);

let xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
if (this.readyState == 4 && this.status == 200) {
let response = null;

        try {
            response = JSON.parse(xhr.responseText);
        } catch (e) {
            console.error(e);
        }

        handleSuccess(input, response);
    }

};
xhr.open("POST", form.action, true);
xhr.send(data);
</textarea>

</dt>
<dd>XMLHttpRequest for formdata</dd>
</dl>
{{< /raw-html >}}
{{< /info-section-right >}}
{{</ info-section >}}

{{< info-section >}}
{{< info-section-left icon="🪟" title="Windows" />}}
{{< info-section-right >}}
{{< raw-html >}}

<dl>
<dt>
<input value='New-SelfSignedCertificate -DnsName "example.com", "www.example.com"' type="text">
</dt>
<dd>Create a self-signed certificate</dd>
<dd>
<span class="note">NOTE:</span> Requires admin</dd>
<dt>
<input value="Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" type="text">
</dt>
<dd>Install Chocolatey</dd>
<dd>
<span class="note">NOTE:</span> Requires admin</dd>
</dl>
{{< /raw-html >}}
{{< /info-section-right >}}
{{< /info-section >}}

{{< raw-html >}}

<style>
dl {
display: block;
margin: 0 auto;
width: 100%;
}

dt {
    margin-top: 50px;
}

dt input,
dt textarea {
    font-family: monospace;
    font-size: inherit;
    padding: 10px;
    color: var(--color-light-contrast);
    border: 1px solid var(--color-light-contrast);
    outline: none;
    width: 100%;
    background-color: var(--color-dark-contrast);
}

dt input:focus,
dt input:hover,
dt textarea:focus,
dt textarea:hover {
    cursor: pointer;
    color: var(--color-primary);
    border-color: var(--color-primary);
}

dt + dd {
    font-weight: bold;
}

dd {
    line-height: 200%;
}

.success {
    padding: 2.5px 5px;
    color: #fff;
    background-color: var(--color-success-contrast);
}

.warning {
    padding: 2.5px 5px;
    color: #000;
    background-color: var(--color-warning-contrast);
}

.note {
    padding: 2.5px 5px;
    color: #fff;
    background-color: var(--color-note-contrast);
}

.alert {
    padding: 2.5px 5px;
    color: #000;
    background-color: var(--color-alert-contrast);
}
</style>

{{</ raw-html >}}
