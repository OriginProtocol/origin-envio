FROM node:24.3.0-slim

ARG INDEXER_NAME

RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client && \
    rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@9.7.1

WORKDIR /app

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

COPY . .

ENV INDEXER_NAME=${INDEXER_NAME}

RUN pnpm ${INDEXER_NAME}:codegen

CMD pnpm ${INDEXER_NAME}:start
