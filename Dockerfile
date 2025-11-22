# ---- Base image ----
FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY api ./api
# COPY libs ./libs

RUN npm install

# For dev: run Nest through Nx
EXPOSE 3000
CMD ["npx", "nx", "serve", "api", "--host=0.0.0.0"]
