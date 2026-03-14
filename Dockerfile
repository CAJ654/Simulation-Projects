# Use a specific, lightweight Node.js version
FROM node:20-slim AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Use a lightweight Nginx image
FROM nginx:stable-alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/nginx.conf

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built application from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
