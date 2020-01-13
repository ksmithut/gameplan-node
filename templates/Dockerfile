FROM node:12-alpine

# Needed for grpc
# RUN apk --no-cache add --virtual libc6-compat
# Needed for bcrypt
# RUN apk --no-cache add --virtual builds-deps build-base python

# Create app directory
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app

# Install dependencies
COPY --chown=node:node package.json yarn.lock ./
RUN yarn --production --silent

# Bundle app source
COPY . .

# Exports
EXPOSE 3000
CMD [ "node", "." ]
