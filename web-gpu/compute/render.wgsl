struct GpuContext {
    canvas: vec2f,
    screen: vec2f,
};
@group(0) @binding(0) var<uniform> gpu_context : GpuContext;
@group(0) @binding(4) var<storage, read> screen : array<f32>;

struct VSOutput {
    @builtin(position) position: vec4f,
};

@vertex
fn vs(@builtin(vertex_index) in_vertex_index: u32) -> VSOutput {
    var vertices = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>(1.0, -1.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(-1.0, -1.0),
    );
    let p = vertices[in_vertex_index];
    var vsOut: VSOutput;
    vsOut.position = vec4f(p.x, p.y, 0.0, 1.0);
    return vsOut;
}

@fragment
fn fs(vsOut: VSOutput) -> @location(0) vec4<f32> {
    let width = i32(gpu_context.screen.x);
    let idx = i32(vsOut.position.x) + i32(vsOut.position.y) * width;
    return vec4<f32>(
        screen[idx],
        screen[idx],
        0.0,
        1.0
    );
}
