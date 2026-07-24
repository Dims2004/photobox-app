FROM node:18-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies (including devDependencies like nodemon, which
# docker-compose's dev command relies on). Using "npm install" instead of
# "npm ci" so the build does not hard-require a matching
# package-lock.json to be present in the build context.
RUN npm install

# Copy application code
COPY . .

# Create upload directories
RUN mkdir -p uploads/projects uploads/results uploads/temp

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
