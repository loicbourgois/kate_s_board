async function get_shader_base(path) {
    const aa = await fetch(path, {cache: "reload"})
    const source = await aa.text()
    return source
}
async function get_shader(path) {
    let common_src = await get_shader_base("/compute/common.wgsl")
    common_src = common_src.replace("{DIAMETER}", 0.5)
    common_src = common_src.replace("{GRID_CELL_COUNT_SIDE}", 512)
    common_src = common_src.replace("{MAX_NODE_PER_GRID_CELL}", 128)
    const source = await get_shader_base(`/${path}`)
    return source.replace("{common}", common_src)
}
export {
    get_shader
}
