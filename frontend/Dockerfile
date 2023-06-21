# Base on offical Node.js Alpine image
FROM node:16-alpine

# Set working directory
RUN mkdir /home/app && chown -R node:node /home/app
WORKDIR /home/app

# Install PM2 globally
RUN npm install --global pm2

ENV PORT=3001

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY --chown=node:node ./package*.json ./

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Install dependencies
RUN npm install --frozen-lockfile

# Copy all files
COPY --chown=node:node ./ ./

# Build app
RUN npm run build

# Run npm start script with PM2 when container starts
CMD [ "pm2-runtime", "npm", "--", "start" ]