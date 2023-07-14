# Base on offical Node.js Alpine image
FROM node:16-alpine

# Set working directory
RUN mkdir -p /home/app/ 
WORKDIR /home/app

# Install PM2 globally
RUN npm install --global pm2 typescript

# Set production mode
ENV NODE_ENV=production
ENV PORT=3000

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy all files
COPY ./ ./

RUN npm run database

# Build app
RUN npm run build

# Run npm start script with PM2 when container starts
CMD [ "pm2-runtime", "npm", "--", "start" ]
