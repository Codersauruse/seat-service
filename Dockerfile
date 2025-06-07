FROM node:18-alpine

WORKDIR /app

# Accept build arguments
ARG PORT
ARG MONGODB_URI

# Convert build args to environment variables
ENV PORT=$PORT
ENV MONGODB_URI=$MONGODB_URI

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE $PORT

# Start the application
CMD ["node", "index.js"]