struct Node {
  p : vec2<f32>,
  pp: vec2<f32>,
};
struct AppState {
    window_width: f32,
    window_height: f32,
    num_particles: i32,
    diameter: f32,
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