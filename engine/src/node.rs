use crate::vector::Vector;
use serde::{Deserialize, Serialize};

pub const NODE_SIZE: usize = 6 * 16 + 4 * 8 + 4 * 4;

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

#[derive(Deserialize, Serialize)]
pub struct NodeConfig2 {
    pub x: f64,
    pub y: f64,
    pub turbo_max_speed: Option<f64>,
    pub fixed: Option<bool>,
    pub dx: Option<f64>,
    pub dy: Option<f64>,
    pub kind: String,
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
    pub kind: usize,
    pub active: u8,
    pub fixed: bool,
}
