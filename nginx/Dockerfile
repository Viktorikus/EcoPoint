FROM nginx:alpine

# Install ModSecurity module for Nginx from Alpine repository (Edge testing)
RUN apk add --no-cache \
    --repository=https://dl-cdn.alpinelinux.org/alpine/edge/community \
    --repository=https://dl-cdn.alpinelinux.org/alpine/edge/testing \
    modsecurity nginx-mod-http-modsecurity curl git

# Download OWASP Core Rule Set v4
RUN git clone --depth 1 --branch v4.0.0 \
        https://github.com/coreruleset/coreruleset /etc/nginx/owasp-crs && \
    cp /etc/nginx/owasp-crs/crs-setup.conf.example \
       /etc/nginx/owasp-crs/crs-setup.conf

# Buat direktori untuk ModSecurity config
RUN mkdir -p /etc/nginx/modsecurity

# Download recommended modsecurity.conf
RUN curl -s https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/modsecurity.conf-recommended \
    -o /etc/nginx/modsecurity/modsecurity.conf

# Copy config files
COPY modsecurity/modsecurity.conf /etc/nginx/modsecurity/
COPY modsecurity/unicode.mapping /etc/nginx/modsecurity/
COPY modsecurity/ecopoint-rules.conf /etc/nginx/modsecurity/
COPY nginx.conf /etc/nginx/nginx.conf

# Clean up
RUN apk del git curl

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
