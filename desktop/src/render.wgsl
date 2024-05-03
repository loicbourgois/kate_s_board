{common}


@group(0) @binding(0) var<uniform> app_state: AppState;
// @group(0) @binding(1) var<storage, read> nodes : array<Node>;
@group(0) @binding(2) var<storage, read> screen : array<f32>;


struct VSOutput {
  @builtin(position) position: vec4f,
};

@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> VSOutput {
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
fn fs_main(vsOut: VSOutput) -> @location(0) vec4<f32> {
    let min_dim = min(app_state.window_width, app_state.window_height);
    let idx = i32(vsOut.position.x) + i32(vsOut.position.y) * 1600;
    return vec4<f32>(
        screen[idx],
        0.0, 
        0.0,
        1.0
    );

}
