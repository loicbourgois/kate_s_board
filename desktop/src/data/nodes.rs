use crate::NUM_PARTICLES;
use crate::PARTICLE_SIZE;
use nanorand::Rng;
use nanorand::WyRand;
use std::mem;
use std::num::NonZeroU64;
use wgpu::util::DeviceExt;
use wgpu::BindGroupLayoutEntry;
use wgpu::Buffer;
use wgpu::Device;

pub struct Nodes {
    pub binding_in: u32,
    pub buffers: Vec<Buffer>,
    pub min_binding_size: Option<NonZeroU64>,
}

impl Nodes {
    pub fn new(device: &Device) -> Nodes {
        let binding_in = 1;
        let mut rng = WyRand::new_seed(42);
        let mut unif = || rng.generate::<f32>();
        let mut data = vec![0.0f32; (PARTICLE_SIZE * NUM_PARTICLES) as usize];
        for x in data.chunks_mut(PARTICLE_SIZE) {
            x[0] = unif() * 0.9;
            x[1] = unif() * 0.9;
            x[2] = x[0];
            x[3] = x[1];
        }
        let mut buffers = Vec::new();
        for _ in 0..2 {
            buffers.push(
                device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                    label: Some(&format!("particle buffer in")),
                    contents: bytemuck::cast_slice(&data),
                    usage: wgpu::BufferUsages::VERTEX
                        | wgpu::BufferUsages::STORAGE
                        | wgpu::BufferUsages::COPY_DST,
                }),
            );
        }
        let min_binding_size = wgpu::BufferSize::new((data.len() * mem::size_of::<i32>()) as _);
        Nodes {
            binding_in,
            buffers,
            min_binding_size,
        }
    }
}
