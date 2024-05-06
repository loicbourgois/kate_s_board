{common}
@group(0) @binding(0) var<uniform> sp : AppState;
@group(0) @binding(4) var<storage, read_write> screen_buffer_to_clean : array<f32>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&screen_buffer_to_clean);
  let idx = global_invocation_id.x;
  if (idx >= total) {
    return;
  }
  screen_buffer_to_clean[idx] = 0.0;
}
