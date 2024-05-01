#!/bin/sh
set -e

cargo fmt \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/desktop/Cargo.toml

RUST_LOG=desktop=info \
    cargo build \
    --release \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/desktop/Cargo.toml
