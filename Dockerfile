# etapa 1: build
FROM node:22-alpine AS builder


# directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias
COPY package.json package-lock.json  ./

# instalar dependencias
RUN npm install

# Copiar el resto del codigo
COPY . .

RUN npm run build


# etapa 2: Imagen final
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la app
CMD ["node", "dist/main"]