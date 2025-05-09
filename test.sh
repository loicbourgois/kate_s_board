#!/bin/sh
set -e
cargo fmt \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/engine/Cargo.toml
cargo run \
    --release \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/engine/Cargo.toml
