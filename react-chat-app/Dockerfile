# Use an official node image as the base
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy the rest of the application code into the container
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
