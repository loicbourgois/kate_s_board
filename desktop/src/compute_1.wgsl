{common}
@group(0) @binding(0) var<uniform> sp : AppState;
@group(0) @binding(1) var<storage, read> nis : array<Node>;
@group(0) @binding(2) var<storage, read_write> nos : array<Node>;
@group(0) @binding(3) var<storage, read_write> screen_buffer : array<f32>;
@group(0) @binding(4) var<storage, read_write> screen_buffer_to_clean : array<f32>;
@group(0) @binding(5) var<storage, read_write> particle_counter : array<atomic<i32>>;
@group(0) @binding(6) var<storage, read_write> particle_counter_to_clean : array<i32>;
@group(0) @binding(7) var<storage, read> grid_counter : array<i32>;
@group(0) @binding(8) var<storage, read> grid_list : array<u32>;
struct NodeDraw {
    a: vec2<i32>,
    b: vec2<i32>,
    c: vec2<i32>,
    d_sqrd: i32
};
fn node_draw(p: vec2<f32>, window_width: f32, min_dim: f32, window_height: f32 ) -> NodeDraw {
  let zoom = 0.3;
  let cf = p * zoom + vec2f(0.5 * window_width / min_dim, 0.5 * window_height / min_dim) ;
  let af = cf - vec2f(diameter, diameter) * 0.9 * zoom;
  let bf = cf + vec2f(diameter, diameter) * 0.9 * zoom;
  let a = vec2( i32(af.x * min_dim), i32(af.y * min_dim) );
  let b = vec2( i32(bf.x * min_dim), i32(bf.y * min_dim) );
  let c = vec2( i32(cf.x * min_dim), i32(cf.y * min_dim) );
  let d = i32(diameter*zoom*min_dim*0.9);
  return NodeDraw(a,b,c,d*d);
}
@compute
@workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&nis);
  let idx = global_invocation_id.x;
  if (idx >= total) {
    return;
  }
  let min_dim = min(sp.window_width, sp.window_height);
  let diam_sqrd = sp.diameter*sp.diameter;
  var n1 = nis[idx];
  var dv = vec2<f32>(0.0, 0.0);
  var dp = vec2<f32>(0.0, 0.0);
  dv += n1.p - n1.pp;
  let c = vec2<f32>(0.0, 0.0);
  let gravity = (c - n1.p) * 0.000003;
  // if ( distance(c, n1.p) > 0.4) {
    dv += gravity;
  // }
  let gp = get_grid_coord(n1.p);
  for (var a = max(0, gp.x-1); a < min(gp.x+2, GRID_CELL_COUNT_SIDE) ; a++) {
    for (var b = max(0, gp.y-1); b < min(gp.y+2, GRID_CELL_COUNT_SIDE) ; b++) {
      let grididx = a + b * GRID_CELL_COUNT_SIDE;
      for (var i = 0; i < grid_counter[grididx] ; i++) {
        let idx2 = grid_list[ grididx * MAX_NODE_PER_GRID_CELL + i ];
        var n2 = nis[idx2];
        let d_sqrd = distance_sqrd(n1.p, n2.p);
        if d_sqrd <= diam_sqrd && u32(idx2) != idx {
          let dist = sqrt(d_sqrd);
          let delta_position = delta(n1.p, n2.p);
          let crdv = 6.0;
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
    }
  }
  nos[idx].p = n1.p + dp ;
  nos[idx].pp = nos[idx].p;
  nos[idx].p += dv;
  let nd_2 = node_draw(nos[idx].p, sp.window_width, min_dim, sp.window_height);
  for (var x = max(0, nd_2.a.x); x < min(nd_2.b.x, 1600) ; x++) {
    for (var y = max(0, nd_2.a.y); y < min(nd_2.b.y, 1200) ; y++) {
      let ip = x + y * 1600;
      let d_ = nd_2.c - vec2(x,y);
      let dd = d_.x * d_.x + d_.y * d_.y;
      if (dd < nd_2.d_sqrd) { 
        screen_buffer[ip] = 1.0;
      }
    }
  }
  particle_counter_to_clean[0] = 0;
  atomicAdd(&particle_counter[0], 1);
}
