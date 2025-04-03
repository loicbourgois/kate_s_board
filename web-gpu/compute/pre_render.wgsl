{common}
@group(0) @binding(0) var<uniform> gpu_context : GpuContext;
@group(0) @binding(1) var<storage, read> particle : array<Particle>;
@group(0) @binding(4) var<storage, read_write> screen : array<f32>;
@compute
@workgroup_size(${workgroup_size})
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
    let total = arrayLength(&particle);
    let diameter = gpu_context.diameter;
    let idx = global_invocation_id.x;
    if (idx >= total) {
        return;
    }
    let p = particle[idx];
    let zoom = 0.01;
    let min_canvas_dim = min(gpu_context.canvas.x, gpu_context.canvas.y);
    let center = vec2(
        i32(gpu_context.canvas.x * 0.5 + p.p.x * min_canvas_dim*zoom),
        i32(gpu_context.canvas.y * 0.5 + p.p.y * min_canvas_dim*zoom),
    );
    let diam2 = i32(diameter * min_canvas_dim * zoom  ) ;
    let i_min = center.x - diam2/2;
    let i_max = i_min + diam2;
    let j_min = center.y - diam2/2;
    let j_max = j_min + diam2;
    var aa = 0;
    for (var i = i_min; i < i_max; i++) {
        for (var j = j_min; j < j_max; j++) {
            let idx = i + j * i32(gpu_context.screen.x);
            let d = vec2(i, j) - center;
            if ( d.x*d.x+d.y*d.y < diam2 * diam2 / 4 ) {
                screen[idx] = 1.0;
            }
            aa += 1;
        }
    }
}
