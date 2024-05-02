use crate::NUM_PARTICLES;
use crate::WINDOW_HEIGHT;
use crate::WINDOW_WIDTH;
use encase::ShaderType;
use wgpu::Buffer;
use wgpu::Device;
#[derive(Debug, ShaderType)]
pub struct AppState {
    pub window_width: f32,
    pub window_height: f32,
    pub num_particles: i32,
    pub diameter: f32,
}

impl AppState {
    pub fn as_wgsl_bytes(&self) -> encase::internal::Result<Vec<u8>> {
        let mut buffer = encase::UniformBuffer::new(Vec::new());
        buffer.write(self)?;
        Ok(buffer.into_inner())
    }

    pub fn get_buffer(device: &Device) -> Buffer {
        device.create_buffer(&wgpu::BufferDescriptor {
            label: None,
            size: std::mem::size_of::<AppState>() as u64,
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        })
    }
}

impl Default for AppState {
    fn default() -> Self {
        AppState {
            window_width: WINDOW_WIDTH as f32,
            window_height: WINDOW_HEIGHT as f32,
            num_particles: NUM_PARTICLES as i32,
            diameter: 0.02,
        }
    }
}
