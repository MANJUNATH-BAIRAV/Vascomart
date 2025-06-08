# Stage 1: Build React app
FROM node:18 as build

WORKDIR /app

# Copy package files and install dependencies first (better caching)
COPY package.json package-lock.json* ./
RUN npm install

# Copy rest of the source code
COPY . .

# Build the React app for production
RUN npm run build


# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
