FROM nginx:1.25-alpine AS builder

# Install build dependencies untuk kompilasi ModSecurity
RUN apk add --no-cache git gcc musl-dev make pcre-dev openssl-dev \
    libxml2-dev curl-dev libtool automake autoconf geoip-dev linux-headers

# Clone dan build ModSecurity v3
RUN git clone --depth 1 --branch v3.0.12 \
    https://github.com/SpiderLabs/ModSecurity /opt/modsecurity && \
    cd /opt/modsecurity && \
    git submodule init && git submodule update && \
    ./build.sh && ./configure && make -j4 && make install

# Clone ModSecurity-nginx connector
RUN git clone --depth 1 \
    https://github.com/SpiderLabs/ModSecurity-nginx /opt/ModSecurity-nginx

# Build Nginx dengan ModSecurity module (dynamic module)
# Gunakan versi Nginx yang sama dengan base image
RUN NGINX_VERSION=$(nginx -v 2>&1 | grep -oP '[\d.]+') && \
    wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    tar -xzf nginx-${NGINX_VERSION}.tar.gz && \
    cd nginx-${NGINX_VERSION} && \
    ./configure --with-compat --add-dynamic-module=/opt/ModSecurity-nginx && \
    make modules && \
    cp objs/ngx_http_modsecurity_module.so /opt/

FROM nginx:1.25-alpine

# Copy ModSecurity libraries dan module
COPY --from=builder /usr/local/modsecurity /usr/local/modsecurity
COPY --from=builder /opt/ngx_http_modsecurity_module.so \
    /etc/nginx/modules/

# Install runtime dependencies
RUN apk add --no-cache libstdc++ libxml2 pcre curl-dev

# Download OWASP Core Rule Set v4
RUN apk add --no-cache git && \
    git clone --depth 1 --branch v4.0.0 \
        https://github.com/coreruleset/coreruleset /etc/nginx/owasp-crs && \
    cp /etc/nginx/owasp-crs/crs-setup.conf.example \
       /etc/nginx/owasp-crs/crs-setup.conf && \
    apk del git

# Buat direktori untuk ModSecurity config
RUN mkdir -p /etc/nginx/modsecurity

# Copy config files
COPY modsecurity/modsecurity.conf /etc/nginx/modsecurity/
COPY modsecurity/unicode.mapping /etc/nginx/modsecurity/
COPY modsecurity/ecopoint-rules.conf /etc/nginx/modsecurity/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
