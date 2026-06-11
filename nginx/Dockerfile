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

# OWASP image drops privileges to non-root user, so we don't need to touch logs here
# Nginx will write to /var/log/nginx/modsec_audit.log natively at runtime (since it's a volume)

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
