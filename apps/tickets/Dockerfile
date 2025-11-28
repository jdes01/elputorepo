FROM node:24.11-alpine

ARG DEBUG
ENV DEBUG=${DEBUG:-0}
ENV NODE_ENV=development

RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app/tickets
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client BEFORE copying source code
COPY src/contexts/core/infrastructure/prisma ./src/contexts/core/infrastructure/prisma
RUN npx prisma generate --schema=./src/contexts/core/infrastructure/prisma/schema.prisma

# Copy application code and config files
COPY src ./src
COPY scripts ./scripts
COPY tsconfig*.json ./
COPY nest-cli.json ./

EXPOSE 3000

CMD ["sh", "./scripts/run.sh"]
