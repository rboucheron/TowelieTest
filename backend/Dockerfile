FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
RUN bunx prisma generate

COPY tsconfig.json ./
COPY src ./src

EXPOSE 8000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run seed && bun run start"]
