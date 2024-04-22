#!/bin/sh
set -e
cargo fmt \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/engine/Cargo.toml
cd $HOME/github.com/loicbourgois/vellipsis/wasm-engine
wasm-pack build --release --target web --no-typescript --no-pack
