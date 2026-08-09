# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app (ensure Vite builds to 'dist' folder)
RUN npm run build

# Stage 1.5: Development (Vite dev server)
FROM node:22-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (src is volume-mounted for hot reload)
COPY . .

EXPOSE 5173

# Start Vite dev server bound to all interfaces
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 2: Serve with Nginx
FROM nginxinc/nginx-unprivileged:alpine

# Copy custom nginx config (make sure nginx.conf listens on 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port (unprivileged cannot bind to 80)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]