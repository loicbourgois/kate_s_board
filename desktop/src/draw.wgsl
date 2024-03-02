struct AppState {
    window_width: f32,
    window_height: f32,
    num_particles: i32,
};


struct Node {
    p: vec2<f32>,
    pp: vec2<f32>,
};


@group(0) @binding(0) var<uniform> app_state: AppState;

@group(0) @binding(1) var<storage, read> nodes : array<Node>;


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
    let diam = 0.02;
    let radius = diam * 0.5;
    let radius_sqrd = radius * radius;
    var c1 = 0.0;
    var c2 = 0.0;
    for (var i = 0; i < app_state.num_particles; i++) {
        let n = nodes[i];
        let p = vec2<f32>(
            (vsOut.position.x - (app_state.window_width - min_dim) * 0.5 )/min_dim , 
            1.0-(vsOut.position.y - (app_state.window_height - min_dim) * 0.5)/min_dim ,
        );
        let delta = n.p - p;
        let dist_sqrd = delta.x * delta.x + delta.y * delta.y;
        if (dist_sqrd < radius_sqrd ) {
            c1 = 1.0;
        }
        let aa = (1.0 / dist_sqrd);
        c2 += aa * aa * diam * diam * 0.001 ;
    }
    var v = min(floor(c1+c2)+c2*0.03, 1.0);
    // v = c1;
    let v2 = min(floor(c1)+c2*0.03, 1.0);
    return vec4<f32>(
        (v*0.2+v2)*0.5, 
        (v*0.5+v2)*0.5, 
        (v+v2)*0.5,
        1.0
    );
}
