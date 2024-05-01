use crate::NUM_PARTICLES;
use crate::PARTICLE_SIZE;
use crate::WINDOW_HEIGHT;
use crate::WINDOW_WIDTH;
use std::borrow::Cow;
use std::mem;
use wgpu::BindGroup;
use wgpu::BindGroupLayout;
use wgpu::Buffer;
use wgpu::Device;
use wgpu::PipelineLayout;
use wgpu::RenderPipeline;
use wgpu::ShaderModule;
use wgpu::TextureFormat;

pub fn get_render_pipeline(
    device: &Device,
    pipeline_layout: &PipelineLayout,
    shader: &ShaderModule,
    swapchain_format: TextureFormat,
) -> RenderPipeline {
    device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
        label: None,
        layout: Some(&pipeline_layout),
        vertex: wgpu::VertexState {
            module: &shader,
            entry_point: "vs_main",
            buffers: &[],
        },
        fragment: Some(wgpu::FragmentState {
            module: &shader,
            entry_point: "fs_main",
            targets: &[Some(swapchain_format.into())],
        }),
        primitive: wgpu::PrimitiveState::default(),
        depth_stencil: None,
        multisample: wgpu::MultisampleState::default(),
        multiview: None,
    })
}

pub fn get_render_shader(device: &Device) -> ShaderModule {
    device.create_shader_module(wgpu::ShaderModuleDescriptor {
        label: None,
        source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(include_str!("render.wgsl"))),
    })
}

pub fn get_render_pipeline_layout(
    device: &Device,
    bind_group_layout: &BindGroupLayout,
) -> PipelineLayout {
    device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: None,
        bind_group_layouts: &[bind_group_layout],
        push_constant_ranges: &[],
    })
}

pub fn get_render_bind_group_layout(device: &Device) -> BindGroupLayout {
    device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
        label: None,
        entries: &[
            wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::VERTEX_FRAGMENT,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: wgpu::BufferSize::new(16), //std::mem::size_of::<AppState>() as u64,
                },
                count: None,
            },
            wgpu::BindGroupLayoutEntry {
                binding: 1,
                visibility: wgpu::ShaderStages::VERTEX_FRAGMENT,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: true },
                    has_dynamic_offset: false,
                    min_binding_size: wgpu::BufferSize::new(
                        (NUM_PARTICLES * PARTICLE_SIZE * 4) as _,
                    ),
                },
                count: None,
            },
            wgpu::BindGroupLayoutEntry {
                binding: 2,
                visibility: wgpu::ShaderStages::VERTEX_FRAGMENT,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: true },
                    has_dynamic_offset: false,
                    min_binding_size: wgpu::BufferSize::new(
                        (WINDOW_WIDTH * WINDOW_HEIGHT * mem::size_of::<f32>()) as _,
                    ),
                },
                count: None,
            },
        ],
    })
}

pub fn get_render_bind_group(
    device: &Device,
    bind_group_layout: &BindGroupLayout,
    app_state_buffer: &Buffer,
    particle_buffers: &Vec<Buffer>,
    screen_buffers: &Vec<Buffer>,
) -> Vec<BindGroup> {
    let mut bds = Vec::new();
    for i in 0..2 {
        bds.push(device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: None,
            layout: &bind_group_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding {
                        buffer: &app_state_buffer,
                        offset: 0,
                        size: None,
                    }),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: particle_buffers[i].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 2,
                    resource: screen_buffers[i].as_entire_binding(),
                },
            ],
        }))
    }
    bds
}
