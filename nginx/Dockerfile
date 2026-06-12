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

# Hapus template bawaan Nginx agar entrypoint tidak mencoba menimpa default.conf kita
USER root
RUN rm -f /etc/nginx/templates/conf.d/default.conf.template
USER nginx

# Salin konfigurasi Nginx kita secara langsung ke dalam image (bukan bind mount)
# Agar script OWASP base image (seperti 93-update-proxy-ssl-config.sh) bisa memodifikasinya tanpa error "Resource busy"
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf
# OWASP image drops privileges to non-root user, so we don't need to touch logs here
# Nginx will write to /var/log/nginx/modsec_audit.log natively at runtime (since it's a volume)

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
