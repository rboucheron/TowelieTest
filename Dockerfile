FROM dunglas/frankenphp:1-php8.3-bookworm

WORKDIR /app

RUN install-php-extensions \
    intl \
    opcache \
    pdo_pgsql \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY docker/frankenphp/Caddyfile /etc/caddy/Caddyfile