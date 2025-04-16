# Stage 1: Build stage using Node.js 18-alpine
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build the application
COPY . .
RUN npm run build

# Stage 2: Production stage using Node.js 18-alpine
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only the built application and necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm install --production

# Expose the port and define the startup command
EXPOSE 3000
CMD ["npm", "start"]
