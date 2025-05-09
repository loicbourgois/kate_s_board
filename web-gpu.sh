#!/bin/sh
set -e
echo "################################"
echo "# Frontend at http://localhost #"
echo "################################"
docker-compose \
  --file $HOME/github.com/loicbourgois/vellipsis/docker-compose.yml \
  up --build \
  web_gpu