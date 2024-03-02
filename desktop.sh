#!/bin/sh
set -e

cargo fmt \
    --manifest-path $HOME/github.com/loicbourgois/kate_s_board/desktop/Cargo.toml

RUST_LOG=desktop=info \
    cargo run \
    --release \
    --manifest-path $HOME/github.com/loicbourgois/kate_s_board/desktop/Cargo.toml
