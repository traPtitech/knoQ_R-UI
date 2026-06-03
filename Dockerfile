FROM --platform=$BUILDPLATFORM node:22.15.0-alpine@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd AS build
WORKDIR /app

RUN apk update

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN NODE_ENV=production npm run build

# 本番環境
FROM caddy:2.10.0-alpine@sha256:ae4458638da8e1a91aafffb231c5f8778e964bca650c8a8cb23a7e8ac557aa3c
EXPOSE 80
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
