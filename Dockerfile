# To run this image execute the following commands:
# docker build --tag ~~__backend-app-name__~~:latest .
# docker run --detach --publish 3000:3000 ~~__backend-app-name__~~:latest

# Set the base image to jadesym/node-ubuntu-docker-base
# https://hub.docker.com/repository/docker/jadesym/node-ubuntu-docker-base
# Tag 0.0.3
FROM tofuapis/node-yarn-ubuntu-docker-base@sha256:e3baed1785d95476af038e23903b81044cb9f397ed7be441da49a0f9a5bff531 as base

#----------------------------------------------------------------------
# Build arguments and environment variables
#----------------------------------------------------------------------
ARG USER_NAME=node
ARG DATA_DIR=/data/
ENV LIB_DIR=$DATA_DIR/lib/

#----------------------------------------------------------------------
# Dependencies Installation
#----------------------------------------------------------------------
# Confirm Node Installation
RUN node -v
RUN yarn --version

# Adding non-interactive for debian front-end to hide dialog questions during build.
# Args only live during the build so they do not persist to the final image.
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get install -qq -y \
        less \
        # Dependencies necessary for wait-for
        netcat \
        wget \
    && apt-get -qq -y autoclean

#----------------------------------------------------------------------
# User & Directory Setup
#----------------------------------------------------------------------
RUN mkdir -p $LIB_DIR

RUN useradd -ms /bin/bash $USER_NAME
RUN chown -R $USER_NAME:$USER_NAME $DATA_DIR

USER $USER_NAME

WORKDIR $LIB_DIR

#----------------------------------------------------------------------
# Loading & Running the Repository Code
#----------------------------------------------------------------------
# Copy configuration and dependency files
COPY \
  # Copy NPM RC file for npm (used by yarn) configurations
  .npmrc \
  # Copy Yarn RC YAML file for yarn configurations
  .yarnrc.yml \
  # Copy dependencies definition files [package(-lock).json] as source of truth for dependencies
  yarn.lock \
  package.json \
  # Typescript configuration
  tsconfig.json \
  # To destination directory
  $LIB_DIR

# Copy source code contents. Directories are treated differently.
# Copying with multiple source files will copy the contents of the file
# instead of the directory, which is why this COPY command is separate.
COPY src $LIB_DIR/src

# Install dependencies from package lock (clean install)
RUN yarn install --frozen-lockfile

#----------------------------------------------------------------------
# Use multi-stage builds to build the environment
#----------------------------------------------------------------------
FROM base as builder

RUN yarn run build

#----------------------------------------------------------------------
# Use multi-stage builds to run the linter
#----------------------------------------------------------------------
FROM base as linter

COPY \
  .eslintrc.js \
  .prettierrc \
  .prettierignore \
  $LIB_DIR

RUN yarn run lint

#----------------------------------------------------------------------
# Use multi-stage builds to have the unit test image
#----------------------------------------------------------------------
FROM base as test-unit

# Copying necessary unit test files
COPY \
  jestconfig.json \
  # To destination directory
  $LIB_DIR
COPY test $LIB_DIR/test

RUN yarn run test:unit
