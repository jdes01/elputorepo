FROM node:24.11-alpine

ENV NODE_ENV=development

WORKDIR /app/elputofrontend

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . . 

EXPOSE 3000

CMD ["npm", "run", "dev"]
