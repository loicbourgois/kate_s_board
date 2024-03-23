use crate::vector::Vector;
use serde::{Deserialize, Serialize};

pub const NODE_SIZE: usize = 15 * 8 + 8 * 3;

pub struct VectorIsize {
    pub x: isize,
    pub y: isize,
}

#[derive(Deserialize, Serialize)]
pub struct NodeConfig {
    pub x: f64,
    pub y: f64,
    pub turbo_max_speed: f64,
    pub fixed: bool,
}

pub struct Node {
    pub p: Vector,
    pub pp: Vector,
    pub dp: Vector,
    pub dv: Vector,
    pub v: Vector,
    pub direction: Vector,
    pub grid: VectorIsize,
    pub m: f64,
    pub turbo_max_speed: f64,
    pub turbo_rate: f64,
    pub z: usize,
    pub idx: usize,
    pub fixed: bool,
}
