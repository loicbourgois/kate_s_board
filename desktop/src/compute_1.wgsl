{common}


@group(0) @binding(0) var<uniform> sp : AppState;
@group(0) @binding(1) var<storage, read> nis : array<Node>;
@group(0) @binding(2) var<storage, read_write> nos : array<Node>;
@group(0) @binding(3) var<storage, read_write> screen_buffer : array<f32>;
@group(0) @binding(4) var<storage, read_write> screen_buffer_to_clean : array<f32>;
@group(0) @binding(5) var<storage, read_write> particle_counter : array<atomic<i32>>;
@group(0) @binding(6) var<storage, read_write> particle_counter_to_clean : array<i32>;
@group(0) @binding(7) var<storage, read_write> grid_counter : array<atomic<i32>>;


@compute
@workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&nis);
  let idx = global_invocation_id.x;
  if (idx >= total) {
    return;
  }
  let grid_cell_count_side = 64;
  let diam_sqrd = sp.diameter*sp.diameter;
  var n1 = nis[idx];
  let zoom = 0.05;
  let ptp = n1.p * zoom + vec2f(0.5, 0.5) * (1.0 - zoom);
  let ip = i32(ptp.x * 1600.0) + i32(ptp.y * 1200.0) * 1600;
  screen_buffer_to_clean[ip] = 0.0;
  var dv = vec2<f32>(0.0, 0.0);
  var dp = vec2<f32>(0.0, 0.0);
  dv += n1.p - n1.pp;
  let c = vec2<f32>(0.5, 0.5);
  let gravity = (c - n1.p) * 0.00001;
  if ( distance(c, n1.p) > 0.4) {
    dv += gravity;
  }
  for (var i = 0; i < i32(sp.num_particles); i++) {
    var n2 = nis[i];
    let d_sqrd = distance_sqrd(n1.p, n2.p);
    if d_sqrd <= diam_sqrd {
      let dist = sqrt(d_sqrd);
      let delta_position = delta(n1.p, n2.p);
      let crdv = 4.0;
      let crdp = 1.0;
      let dd = dist - sp.diameter;
      let dd_crdv = dd * crdv;
      let crdp_crdv = crdp * crdv;
      let u1 = delta_position.x * dd_crdv;
      let u2 = delta_position.y * dd_crdv;
      dv.x += u1;
      dv.y += u2;
      dp.x += u1 * crdp_crdv;
      dp.y += u2 * crdp_crdv;
    }
  }
  nos[idx].p = n1.p + dp ;
  nos[idx].pp = nos[idx].p;
  nos[idx].p += dv;
  let p = nos[idx].p;
  let pt = p * zoom + vec2f(0.5, 0.5) * (1.0 - zoom);
  let i = i32(pt.x * 1600.0) + i32(pt.y * 1200.0) * 1600;
  screen_buffer[i] = 1.0;
  particle_counter_to_clean[0] = 0;
  // let gridx = max(0, min(i32(floor(p.x / sp.diameter)) + grid_cell_count_side/2, grid_cell_count_side-1));
  // let gridy = max(0, min(i32(floor(p.y / sp.diameter)) + grid_cell_count_side/2, grid_cell_count_side-1));
  // let grididx = gridx + gridy * grid_cell_count_side;
  // for (var i = 0; i < 64*64; i++) {
  //   grid_counter_to_clean[i] = 0;
  // }
  // atomicAdd(&grid_counter[grididx], 1);
  atomicAdd(&particle_counter[0], 1);
}
