# copying implementation from remix indie stack repo
# https://github.com/remix-run/indie-stack/blob/main/Dockerfile
# don't think I'll keep the multi-stage build stuff for now bc I'm not even trying to deploy yet, just
# trying to run locally

# base node image, at time of writing (2/26/2025) am using node v22.13.0
FROM node:22
# inside docker container, we will be working in the /my_app directory following this line
WORKDIR /my_app
EXPOSE 5173

# so package.json and package-lock.json on host are copied into /my_app/package*.json
COPY package*.json ./
# unsure if the --include=dev arg is necessary when not running production node env
# RUN npm install --include=dev
RUN npm install

# copy rest of the source files in after npm install. Unsure how node_modules is handled bc I have it in my
# .dockerignore, and also have an anonymous volume created for it in my compose file
COPY . .

# choosing between RUN, CMD, and ENTRYPOINT commands
# https://www.docker.com/blog/docker-best-practices-choosing-between-run-cmd-and-entrypoint/
CMD [ "npm", "run", "dev" ]

#
# later, try to update this Dockerfile to something like the definition here and copied below:
# https://docs.docker.com/guides/nodejs/develop/#update-your-dockerfile-for-development
# this article shows how to use a single docker file for dev and prod. For the time being though, want to get
# my implementation working first

# ARG NODE_VERSION=22.0.0

# FROM node:${NODE_VERSION}-alpine as base
# WORKDIR /usr/src/app
# EXPOSE 3000

# FROM base as dev
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm ci --include=dev
# USER node
# COPY . .
# CMD npm run dev

# FROM base as prod
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm ci --omit=dev
# USER node
# COPY . .
# CMD node src/index.js