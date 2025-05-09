#!/bin/sh
set -e
cargo fmt \
    --manifest-path $HOME/github.com/loicbourgois/vellipsis/engine/Cargo.toml
cd $HOME/github.com/loicbourgois/vellipsis/engine-wasm
wasm-pack build --release --target web --no-typescript --no-pack
cp $HOME/github.com/loicbourgois/vellipsis/engine-wasm/pkg/vellipsis_wasm* \
    $HOME/github.com/loicbourgois/vellipsis/front/vellipsis
cd $HOME/github.com/loicbourgois/vellipsis/front/
aa=$(ls -d */)
aa=$( echo "${aa//bug\//}"  ) 
aa=$( echo "${aa//vellipsis\//}"  ) 
aa=$( echo "${aa//\//}"  ) 
bb=$( cat $HOME/github.com/loicbourgois/vellipsis/front/list-folders.template )
bb=$( echo "${bb//FOLDERS/$aa}"  )
echo $bb > $HOME/github.com/loicbourgois/vellipsis/front/list-folders.js