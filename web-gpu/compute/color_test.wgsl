{common}
@group(0) @binding(0) var<uniform> gpu_context : GpuContext;
@group(0) @binding(4) var<storage, read_write> screen : array<f32>;
@compute
@workgroup_size(1)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
    let zoom = 0.1;
    let ps = array(
        vec2f(0.0, 0.0),
        vec2f(0.0, 0.0),
    );
    let center = vec2(
        i32(gpu_context.canvas.x * 0.5),
        i32(gpu_context.canvas.y * 0.5),
    );
    let diam2 = i32(diameter * min(gpu_context.canvas.x, gpu_context.canvas.y) * zoom ) ;
    let i_min = center.x - diam2/2;
    let i_max = i_min + diam2;
    let j_min = center.y - diam2/2;
    let j_max = j_min + diam2;
    for (var i = i_min; i < i_max; i++) {
        for (var j = j_min; j < j_max; j++) {
            let idx = i + j * i32(gpu_context.screen.x);
            let d = vec2(i, j) - center;
            if ( d.x*d.x+d.y*d.y < diam2 * diam2 / 4 ) {
                screen[idx] = 0.1;
            }
        }
    }
}
