# Stage 1: Build the React Application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the built files from 'dist' (Vite) or 'build' (CRA) to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# If you don't add this, refreshing on http://localhost/doctors might fail
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]