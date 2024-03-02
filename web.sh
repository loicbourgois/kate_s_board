#!/bin/sh
set -e
# full_path=$HOME/github.com/loicbourgois/kate_s_board
# full_path=$full_path \
#   docker-compose --file $full_path/docker-compose.yml down
cargo fmt \
    --manifest-path $HOME/github.com/loicbourgois/kate_s_board/engine/Cargo.toml
cargo run \
    --release \
    --manifest-path $HOME/github.com/loicbourgois/kate_s_board/engine/Cargo.toml
# cd $HOME/github.com/loicbourgois/kate_s_board/wasm-engine
# wasm-pack build --release --target web --no-typescript --no-pack
# cp $HOME/github.com/loicbourgois/kate_s_board/wasm-engine/pkg/wasm* \
#     $HOME/github.com/loicbourgois/kate_s_board/front
# echo "################################"
# echo "# Frontend at http://localhost #"
# echo "################################"
# full_path=$full_path \
#   docker-compose \
#   --file $full_path/docker-compose.yml \
#   up --build
