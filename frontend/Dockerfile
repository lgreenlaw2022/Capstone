FROM node:18-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build the app
RUN npm run build

# Environment setup
ENV NODE_ENV=production

# Use shell form to allow environment variable interpolation
CMD npm start -- -p ${PORT:-3000} 