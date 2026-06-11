FROM ubuntu:22.04

# Hindari prompt interaktif saat instalasi apt
ENV DEBIAN_FRONTEND=noninteractive

# Install Nginx dan ModSecurity langsung dari repository resmi Ubuntu
# Ubuntu 22.04 sudah memiliki package WAF yang siap pakai dan sangat stabil
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nginx \
    libnginx-mod-http-modsecurity \
    modsecurity-crs \
    && rm -rf /var/lib/apt/lists/*

# Buat direktori untuk ModSecurity config kustom
RUN mkdir -p /etc/nginx/modsecurity

# Salin konfigurasi kustom EcoPoint
COPY modsecurity/modsecurity.conf /etc/nginx/modsecurity/
COPY modsecurity/unicode.mapping /etc/nginx/modsecurity/
COPY modsecurity/ecopoint-rules.conf /etc/nginx/modsecurity/

# Salin konfigurasi utama Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Teruskan log Nginx ke stdout/stderr Docker agar bisa dibaca dari 'docker logs'
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && touch /var/log/nginx/modsec_audit.log \
    && chown www-data:www-data /var/log/nginx/modsec_audit.log

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
