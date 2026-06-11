FROM owasp/modsecurity-crs:nginx-alpine

# Set environment variables untuk owasp/modsecurity-crs
ENV PARANOIA=1
ENV EXECUTING_PARANOIA=2
ENV ENFORCE_BODYPROC_URLENCODED=1

# Buat direktori untuk ModSecurity config kustom
RUN mkdir -p /etc/nginx/modsecurity

# Salin konfigurasi kustom EcoPoint
COPY modsecurity/modsecurity.conf /etc/nginx/modsecurity/
COPY modsecurity/unicode.mapping /etc/nginx/modsecurity/
COPY modsecurity/ecopoint-rules.conf /etc/nginx/modsecurity/

# Salin konfigurasi utama Nginx
# OWASP image biasanya memakai template, tapi kita menimpanya langsung
COPY nginx.conf /etc/nginx/nginx.conf

# Teruskan log Modsec ke stdout/stderr Docker agar bisa dibaca dari 'docker logs'
RUN touch /var/log/nginx/modsec_audit.log \
    && chown nginx:nginx /var/log/nginx/modsec_audit.log

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
