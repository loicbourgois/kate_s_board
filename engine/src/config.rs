use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Config {
    pub crdv: f64,
    pub crdp: f64,
    // pub crdv2: f64,
    // pub crdp2: f64,
    pub diameter: f64,
    pub gravity: f64,
    pub central_gravity: f64,
    pub friction_ratio: f64,
    pub ticker: usize,
    pub max_speed: f64,
}
