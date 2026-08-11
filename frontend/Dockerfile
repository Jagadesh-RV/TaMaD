# ============================================================
# TaMaD Frontend - Production Dockerfile
# ============================================================

# ------------------------------------------------------------
# Stage 1: Build
# ------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Build-time Firebase configuration
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

# Make the values available to Vite during npm run build
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID

# Copy package files first for Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY . .

# Build production frontend
RUN npm run build


# ------------------------------------------------------------
# Stage 2: Production Nginx
# ------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:alpine

# Custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite production build
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx unprivileged listens on 8080
EXPOSE 8080

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]