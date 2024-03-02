struct Node {
  p : vec2<f32>,
  pp: vec2<f32>,
};

struct SimParams {
  speed : f32,
  num_particles: f32,
};


@group(0) @binding(0) var<uniform> params : SimParams;
@group(0) @binding(1) var<storage, read> nis : array<Node>;
@group(0) @binding(2) var<storage, read_write> nos : array<Node>;


fn delta(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return b - a;
}


fn distance_sqrd(a: vec2<f32>, b: vec2<f32>) -> f32{
  let dp = delta(a, b);
  return dp.x * dp.x + dp.y * dp.y;
}


fn distance(a: vec2<f32>, b: vec2<f32>) -> f32{
  return sqrt(distance_sqrd(a, b));
}

@compute
@workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&nis);
  let idx = global_invocation_id.x;
  if (idx >= total) {
    return;
  }
  let diameter = 0.02;
  let diam_sqrd = diameter*diameter;
  var n1 = nis[idx];
  var dv = vec2<f32>(0.0, 0.0);
  var dp = vec2<f32>(0.0, 0.0);
  dv += n1.p - n1.pp;
  let c = vec2<f32>(0.5, 0.5);
  let gravity = (c - n1.p) * 0.00001;
  if ( distance(c, n1.p) > 0.4) {
    dv += gravity;
  }
  for (var i = 0; i < i32(params.num_particles); i++) {
    var n2 = nis[i];
    let d_sqrd = distance_sqrd(n1.p, n2.p);
    if d_sqrd <= diam_sqrd {
      let dist = sqrt(d_sqrd);
      let delta_position = delta(n1.p, n2.p);
      let crdv = 4.0;
      let crdp = 1.0;
      let dd = dist - diameter;
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
  nos[idx].pp = nos[idx].p ;
  nos[idx].p += dv;
}
