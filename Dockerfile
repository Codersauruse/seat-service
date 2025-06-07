FROM node:18-alpine
WORKDIR /app

# Accept build arguments
ARG PORT
ARG MONGODB_URI
ARG APP_NAME
ARG INSTANCE_ID
ARG EUREKA_HOST

# Convert build args to environment variables
ENV PORT=$PORT
ENV MONGODB_URI=$MONGODB_URI
ENV APP_NAME=$APP_NAME
ENV INSTANCE_ID=$INSTANCE_ID
ENV EUREKA_HOST=$EUREKA_HOST

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