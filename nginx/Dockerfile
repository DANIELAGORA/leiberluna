FROM nginx:alpine

# Copiar configuración
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos estáticos del frontend
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Crear archivo de autenticación para n8n
RUN echo "admin:$(openssl passwd -apr1 'n8n-admin-2024')" > /etc/nginx/.htpasswd

# Permisos
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]