FROM node:24-slim

ENV INDEXER_NAME=collector

RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client apt-utils && \
    rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

WORKDIR /app

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm codegen

CMD ["sh", "-c", "pnpm start:${INDEXER_NAME}"]
