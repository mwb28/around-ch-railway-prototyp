# Base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the backend files
COPY . .

# Copy built frontend files into backend static directory
COPY ../frontend/build ./frontend

# Expose the port
EXPOSE 5000

# Default command to start the server
CMD ["npm", "run", "dev"]