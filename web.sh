#!/bin/sh
set -e
full_path=$HOME/github.com/loicbourgois/vellipsis
full_path=$full_path \
  docker-compose --file $full_path/docker-compose.yml down
cargo fmt \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/engine/Cargo.toml
# cargo run \
#     --release \
#     --manifest-path $HOME/github.com/loicbourgois/vellipsis/engine/Cargo.toml
cd $HOME/github.com/loicbourgois/vellipsis/wasm-engine
wasm-pack build --release --target web --no-typescript --no-pack
cp $HOME/github.com/loicbourgois/vellipsis/wasm-engine/pkg/wasm* \
    $HOME/github.com/loicbourgois/vellipsis/front
echo "################################"
echo "# Frontend at http://localhost #"
echo "################################"
full_path=$full_path \
  docker-compose \
  --file $full_path/docker-compose.yml \
  up --build
