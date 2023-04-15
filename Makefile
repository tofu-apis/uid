# PROJECT_NAME defaults to name of the current directory.
# should not to be changed if you follow GitOps operating procedures.
PROJECT_NAME = $(notdir $(PWD))

# docker compose source files
DOCKER_COMPOSE_MAIN_FILE_NAME = docker-compose.yml
DOCKER_COMPOSE_LINT_FILE_NAME = docker-compose.lint.yml
DOCKER_COMPOSE_TEST_UNIT_FILE_NAME = docker-compose.test-unit.yml

##
## This makefile is allows for the following commands:
##
##--------------------------------------------------------------------
## DOCKER COMMANDS            | Description
##--------------------------------------------------------------------

.PHONY: build build-test check-docker clean rebuild rebuild-test

# check-docker command should be on any commands with no dependencies on other docker based commands
## check-docker               | Checks that docker is up an running prior to executing a dependent command
check-docker:
	@docker version > /dev/null 2>&1 || { echo "Docker is not running, so cannot execute command. Exiting..."; exit 1; }

## dckr-build                 | Builds the main service
dckr-build: check-docker
	docker compose --file $(DOCKER_COMPOSE_MAIN_FILE_NAME) build

## dckr-build-all             | Builds all docker compose files for build, lint, and tests
dckr-build-all: check-docker
	docker compose \
		--file $(DOCKER_COMPOSE_MAIN_FILE_NAME) \
		--file $(DOCKER_COMPOSE_LINT_FILE_NAME) \
		--file $(DOCKER_COMPOSE_TEST_UNIT_FILE_NAME) \
		build

## dckr-build-linter          | Builds the lint docker image
dckr-build-linter: check-docker
	docker compose --file $(DOCKER_COMPOSE_LINT_FILE_NAME) build

## dckr-build-test-unit       | Builds the test docker image
dckr-build-test-unit: check-docker
	docker compose --file $(DOCKER_COMPOSE_TEST_UNIT_FILE_NAME) build

## dckr-clean                 | Stops all docker containers running
dckr-clean: check-docker
	docker compose \
		--file $(DOCKER_COMPOSE_MAIN_FILE_NAME) \
	    --file $(DOCKER_COMPOSE_LINT_FILE_NAME) \
		--file $(DOCKER_COMPOSE_TEST_UNIT_FILE_NAME) \
	down --remove-orphans --rmi all

## dckr-rebuild               | Builds the main service with no caching and pulling in the latest images
dckr-rebuild: check-docker
	docker compose --file $(DOCKER_COMPOSE_MAIN_FILE_NAME) build --no-cache --pull

## dckr-rebuild-all           | Builds all docker compose files for build, lint, and tests with no caching
##                            | and pulling in the latest images
dckr-rebuild-all: check-docker
	docker compose \
		--file $(DOCKER_COMPOSE_MAIN_FILE_NAME) \
		--file $(DOCKER_COMPOSE_LINT_FILE_NAME) \
		--file $(DOCKER_COMPOSE_TEST_UNIT_FILE_NAME) \
		build --no-cache --pull

## dckr-rebuild-test-unit     | Builds the test image with no caching and pulling in the latest image
dckr-rebuild-test-unit: check-docker
	docker compose --file $(DOCKER_COMPOSE_TEST_UNIT_FILE_NAME) build --no-cache --pull

##--------------------------------------------------------------------
## LOCAL COMMANDS             | Description
##--------------------------------------------------------------------

## fmt                        | Runs the formatter (forces formatting changes)
fmt:
	yarn run format

## fmt-check                  | Runs the formatter checker
fmt-check:
	yarn run format:check

## lint                       | Runs the linter (and package checker)
lint:
	yarn run lint

## lint-fix                   | Runs the linter (and package checker)
lint-fix:
	yarn run lint-fix

## build                      | Runs the build
build:
	yarn run build

## help                       | Outputs the possible make commands
help: Makefile
	@sed -n 's/^##//p' $<

## precommit                  | Runs necessary build/tests before committing (intentionally not running e2e tests due to local slowness)
precommit: build fmt-check lint test-unit

## test-unit                  | Runs the unit tests
test-unit:
	yarn run test:unit

##--------------------------------------------------------------------
## LOCAL WATCH COMMANDS       | Description
##--------------------------------------------------------------------

## watch-fmt                  | Watch runs the formatter (forces formatting changes)
watch-fmt:
	yarn run format:watch

## watch-lint                 | Watch runs the linter (and package checker)
watch-lint:
	yarn run lint:watch

## watch-lint-fix             | Watch runs the linter (and package checker)
watch-lint-fix:
	yarn run lint-fix:watch

## watch-build                | Watch runs the build
watch-build:
	yarn run build:watch

## watch-unit-test            | Runs the unit tests
watch-unit-test:
	yarn run test:unit:watch
