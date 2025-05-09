#!/bin/sh
set -e
full_path=$HOME/github.com/loicbourgois/vellipsis
full_path=$full_path \
  docker-compose --file $full_path/docker-compose.yml down
$HOME/github.com/loicbourgois/vellipsis/build.sh
echo "################################"
echo "# Frontend at http://localhost #"
echo "################################"
full_path=$full_path \
  docker-compose \
  --file $full_path/docker-compose.yml \
  up --build
