FROM node:12-alpine

# Needed for grpc
# RUN apk --no-cache add --virtual libc6-compat
# Needed for bcrypt
# RUN apk --no-cache add --virtual builds-deps build-base python

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn --production

# Bundle app source
COPY src src

# Exports
# USER node
EXPOSE 3000
CMD [ "node", "." ]
