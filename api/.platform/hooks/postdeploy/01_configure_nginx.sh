#!/bin/bash

# Log the start of the script
exec > >(tee /var/log/eb-hooks.log | logger -t user-data -s 2>/dev/console) 2>&1
set -euo pipefail

echo "Starting Nginx + Certbot configuration"

# ----- SETTINGS -----
DOMAIN="${DOMAIN:?Set DOMAIN env var in EB}"
EMAIL="${LE_EMAIL:?Set LE_EMAIL env var in EB}"          
WEBROOT="/var/www/html"
LE_LIVE_DIR="/etc/letsencrypt/live/${DOMAIN}"

# Clean up Nginx confs
echo "Cleaning up old Nginx configurations"
rm -f /etc/nginx/conf.d/*.conf || true
rm -f /etc/nginx/sites-enabled/default || true

# Create nginx.conf
echo "Creating nginx.conf"
cat << 'EOF' > /etc/nginx/nginx.conf
user                    nginx;
worker_processes        auto;
error_log               /var/log/nginx/error.log;
pid                     /var/run/nginx.pid;

events {
    worker_connections  2048;
}

http {
    types_hash_max_size 4096;
    types_hash_bucket_size 128;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;
    log_format  main    '$remote_addr - $remote_user [$time_local] "$request" '
                        '$status $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" "$http_x_forwarded_for"';
    log_format healthd  '$msec"$uri"$status"$request_time"$upstream_response_time"'
                        '"$http_ssl_protocol""$http_ssl_cipher""$body_bytes_sent""$http_x_forwarded_for"';
    access_log          /var/log/nginx/access.log  main;
    sendfile            on;
    keepalive_timeout   65;

    client_max_body_size 20M;

    include             /etc/nginx/conf.d/*.conf;
}
EOF

echo "Created nginx.conf"

# Create upstream.conf
echo "Creating upstream.conf"
cat << 'EOF' > /etc/nginx/conf.d/upstream.conf
upstream nodejs {
    server 127.0.0.1:8080;  # Adjust the IP address and port as needed
}
EOF

echo "Created upstream.conf"

# Ensure webroot exists for ACME HTTP-01
mkdir -p "${WEBROOT}/.well-known/acme-challenge"

# Create temporary :80 server for ACME
echo "Creating 00_http_acme.conf"
cat << EOF > /etc/nginx/conf.d/00_http_acme.conf
server {
    listen 80;
    server_name ${DOMAIN};

    # Health endpoint for EB
    location = /health { return 200 'OK'; add_header Content-Type text/plain; }

    # Expose ACME challenge path over HTTP
    location ^~ /.well-known/acme-challenge/ {
        root ${WEBROOT};
        default_type "text/plain";
    }

    # NOTE: No redirect yet; certbot must be able to hit the path above via HTTP
}
EOF

# Reload nginx so ACME endpoint is live
nginx -t && service nginx reload

# Install certbot
if ! rpm -q epel-release >/dev/null 2>&1; then
  echo "Installing EPEL"
  amazon-linux-extras install epel -y
fi

echo "Installing certbot"
yum install -y certbot

#  Obtain/renew certificate via webroot
if [ ! -e "${LE_LIVE_DIR}/fullchain.pem" ]; then
  echo "Requesting new Let’s Encrypt certificate for ${DOMAIN}"
  certbot certonly --agree-tos -n --email "${EMAIL}" \
    --webroot -w "${WEBROOT}" -d "${DOMAIN}"
else
  echo "Renewing certificate if due"
  certbot renew -n || true
fi

# Create https.conf
echo "Creating https.conf"
cat << EOF > /etc/nginx/conf.d/https.conf
server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    ssl_session_timeout  10m;
    ssl_protocols  TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers   on;

    access_log /var/log/nginx/healthd/application.log healthd;
    access_log /var/log/nginx/access.log main;

    client_max_body_size 20M;

    location / {
        proxy_pass  http://nodejs;
        proxy_set_header   Connection "";
        proxy_http_version 1.1;
        proxy_set_header        Host            $host;
        proxy_set_header        X-Real-IP       $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto https;
    }
}

# HTTP server: keep ACME path, redirect everything else to HTTPS
server {
    listen 80;
    server_name ${DOMAIN};

    location = /health { return 200 'OK'; add_header Content-Type text/plain; }

    location ^~ /.well-known/acme-challenge/ {
        root ${WEBROOT};
        default_type "text/plain";
    }

    return 301 https://$host$request_uri;
}
EOF

echo "Created https.conf"

# Test & reload with HTTPS now that certs exist
nginx -t && service nginx reload

# Ensure renewals reload nginx automatically
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat >/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'SH'
#!/usr/bin/env bash
/usr/bin/systemctl reload nginx || /sbin/service nginx reload || true
SH
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# Set up logrotate
echo "Setting up logrotate for Nginx (if not present)"
cat << 'EOF' > /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nginx adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
EOF

echo "Nginx + Certbot configuration complete"