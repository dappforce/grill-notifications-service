# Base image
FROM node:18 as builder

# Create app directory
WORKDIR /opt/subsocial/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn build

FROM gcr.io/distroless/nodejs:18 AS runner

WORKDIR /opt/subsocial/app

COPY --from=builder /opt/subsocial/app .

# Start the server using the production build
CMD [ "dist/main.js" ]
