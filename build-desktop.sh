#!/bin/sh
set -e

cargo fmt \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/desktop/Cargo.toml

RUST_LOG=desktop=info \
    cargo build \
    --release \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/desktop/Cargo.toml

cargo clippy \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/desktop/Cargo.toml\
    --release \
    --all \
    -- \
    -Aclippy::needless_range_loop \
    -Aclippy::single_match \
    -Aclippy::too_many_arguments \
    -D warnings
