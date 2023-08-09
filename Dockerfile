# Base image with necessary dependencies
FROM node:12.22.9

# Set the working directory
WORKDIR /app

# Install necessary libraries and dependencies


# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
RUN npm install @tensorflow/tfjs-node
# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .
EXPOSE 4080
# Start the application
CMD ["npm", "start"]


