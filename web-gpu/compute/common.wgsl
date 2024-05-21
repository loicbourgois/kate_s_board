const GRID_CELL_COUNT_SIDE = {GRID_CELL_COUNT_SIDE};
const MAX_NODE_PER_GRID_CELL = u32({MAX_NODE_PER_GRID_CELL});
const diameter = f32({DIAMETER});
struct Particle {
  p : vec2<f32>,
//   pp: vec2<f32>,
//   m: f32,
  // _ alignement
};
struct GpuContext {
    canvas: vec2f,
    screen: vec2f,
};
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
fn get_grid_coord(p: vec2<f32>) -> vec2<i32> {
  let gridx = max(0, min( i32(floor(p.x / diameter)) + GRID_CELL_COUNT_SIDE/2, GRID_CELL_COUNT_SIDE-1));
  let gridy = max(0, min( i32(floor(p.y / diameter)) + GRID_CELL_COUNT_SIDE/2, GRID_CELL_COUNT_SIDE-1));
  return vec2(gridx, gridy);
}