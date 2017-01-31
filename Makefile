
# Never directly modify the default environment
environment = development

repo_full_name = $(shell git remote -v | grep origin | grep push | grep -o '[^:/]\+\/[^/]\+\s\+' | grep -o '[^:]\+\/[^. ]\+')
git_sha = $(shell git rev-parse --short HEAD)
git_branch = $(shell git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3)
whoami = $(shell whoami)

default: build

build: docker-build

run: build
	docker-compose up

package: build

upload: build
	docker push $(repo_full_name)

clean: clean-docker-build

test_ci:
	docker-compose --project-name ci_build -f test/docker-compose-ci.yml run dasein

docker-build:
	docker build --force-rm -t $(repo_full_name):$(git_sha) .
	docker tag $(repo_full_name):$(git_sha) $(repo_full_name):latest

# Dashes before the commands below indicate a non-zero exit status is okay.
clean-docker-build:
	-docker rm $(repo_full_name):$(git_sha)
	-docker rmi $(repo_full_name):$(git_sha)
