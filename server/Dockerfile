# Use an official Node runtime as a parent image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if available
COPY package.json ./

# Install app dependencies
RUN npm install --production

# Copy application source
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable defaults (can be overridden by docker-compose)
ENV NODE_ENV=production

# Start the API
CMD ["node", "src/index.js"]