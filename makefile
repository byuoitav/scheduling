## makefile for scheduling panels ##

# vars
ORG=$(shell echo $(CIRCLE_PROJECT_USERNAME))
BRANCH=$(shell echo $(CIRCLE_BRANCH))
NAME=$(shell echo $(CIRCLE_PROJECT_REPONAME))

ifeq ($(NAME),)
NAME := $(shell basename "$(PWD)")
endif

ifeq ($(ORG),)
ORG=byuoitav
endif

ifeq ($(BRANCH),)
BRANCH:= $(shell git rev-parse --abbrev-ref HEAD)
endif

# python
PYTHON=python3
FLASK=flask
FLASK_RUN=$(FLASK) run --host=0.0.0.0
FLASK_APP=server.py
PIP=pip3
PIP_INSTALL=$(PIP) install

# docker
DOCKER=docker
DOCKER_BUILD=$(DOCKER) build
DOCKER_LOGIN=$(DOCKER) login -u $(UNAME) -p $(PASS)
DOCKER_PUSH=$(DOCKER) push
DOCKER_FILE=dockerfile
DOCKER_FILE_ARM=dockerfile-arm

UNAME=$(shell echo $(DOCKER_USERNAME))
EMAIL=$(shell echo $(DOCKER_EMAIL))
PASS=$(shell echo $(DOCKER_PASSWORD))

# angular
NPM=npm
NPM_INSTALL=$(NPM) install
NG_BUILD=ng build --prod --aot --build-optimizer 
NG1=web

build: $(NG1)
	# ng1
	cd $(NG1) && $(NPM_INSTALL) && $(NG_BUILD) --base-href="./$(NG1)/"
	mv $(NG1)/dist $(NG1)-dist

clean: 
	rm -rf $(NG1)-dist

run: $(NG1)-dist server

server: $(FLASK_APP)
	$(FLASK_RUN)

deps: 
	$(PIP_INSTALL) maya 
	$(PIP_INSTALL) flask 
	$(PIP_INSTALL) flask_cors 
	$(PIP_INSTALL) flask_restplus 
	$(PIP_INSTALL) exchangelib 

docker: docker-x86 docker-arm

docker-x86: $(NG1)-dist
ifeq "$(BRANCH)" "master"
	$(eval BRANCH=development)
endif
	$(DOCKER_BUILD) -f $(DOCKER_FILE) -t $(ORG)/$(NAME):$(BRANCH) .
	@echo logging in to dockerhub...
	@$(DOCKER_LOGIN)
	$(DOCKER_PUSH) $(ORG)/$(NAME):$(BRANCH)
ifeq "$(BRANCH)" "development"
	$(eval BRANCH=master)
endif

docker-arm: $(NG1)-dist
ifeq "$(BRANCH)" "master"
	$(eval BRANCH=development)
endif
	$(DOCKER_BUILD) -f $(DOCKER_FILE_ARM) -t $(ORG)/$(NAME)-arm:$(BRANCH) .
	@echo logging in to dockerhub...
	@$(DOCKER_LOGIN)
	$(DOCKER_PUSH) $(ORG)/$(NAME)-arm:$(BRANCH)
ifeq "$(BRANCH)" "development"
	$(eval BRANCH=master)
endif

### deps
$(NG1)-dist:
	$(MAKE) build
