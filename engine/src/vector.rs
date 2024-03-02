use serde::Deserialize;
use wasm_bindgen::prelude::wasm_bindgen;
#[derive(Copy, Clone, Debug, Deserialize)]
#[wasm_bindgen]
pub struct Vector {
    pub x: f64,
    pub y: f64,
}
