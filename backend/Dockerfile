# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for typescript compilation)
RUN npm install

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# Stage 1.5: Development (hot-reload via ts-node-dev)
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code (src is volume-mounted for hot reload)
COPY . .

EXPOSE 5000

# Start dev server with auto-restart
CMD ["npm", "run", "dev"]

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --only=production

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/index.js"]