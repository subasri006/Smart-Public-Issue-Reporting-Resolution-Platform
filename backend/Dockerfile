# Production Dockerfile for CivicFix Node.js/Express Backend on Render
FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Prepare upload directory and set user
RUN mkdir -p uploads/complaints && chown -R node:node /app

USER node

# Expose default port (Render will inject PORT dynamically at runtime)
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "src/server.js"]
