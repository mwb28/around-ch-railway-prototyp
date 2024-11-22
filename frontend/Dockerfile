# Base image
FROM nginx:latest

# Copy built frontend files into Nginx's default directory
COPY ./build /usr/share/nginx/html

# Expose the port the frontend listens on
EXPOSE 5000

# Change Nginx default configuration to listen on port 5000
RUN sed -i 's/listen 80;/listen 5000;/' /etc/nginx/conf.d/default.conf
