# Stage 1: Build stage using a Node.js version supported by Next.js and Prisma
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build the application
COPY . .
RUN npm run prisma:generate
RUN npm run build

# Stage 2: Production stage
FROM node:22-alpine AS runner
WORKDIR /app

# Copy only the built application and necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm ci --omit=dev

# Expose the port and define the startup command
EXPOSE 3000
CMD ["npm", "start"]
