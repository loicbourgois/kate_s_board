use crate::common::get_common;
use crate::WINDOW_HEIGHT;
use crate::WINDOW_WIDTH;
use std::borrow::Cow;
use std::mem;
use wgpu::BindGroup;
use wgpu::BindGroupLayout;
use wgpu::Buffer;
use wgpu::CommandEncoder;
use wgpu::Device;
use wgpu::PipelineLayout;
use wgpu::RenderPipeline;
use wgpu::ShaderModule;
use wgpu::TextureFormat;
use wgpu::TextureView;

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
    let source = include_str!("render.wgsl").replace("{common}", &get_common());
    device.create_shader_module(wgpu::ShaderModuleDescriptor {
        label: None,
        source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(&source)),
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
                    resource: app_state_buffer.as_entire_binding(),
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

pub fn render_setup_pass(
    encoder: &mut CommandEncoder,
    view: &TextureView,
    render_pipeline: &RenderPipeline,
    render_bind_groups: &Vec<BindGroup>,
    frame_num: usize,
) {
    let mut rpass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
        label: None,
        color_attachments: &[Some(wgpu::RenderPassColorAttachment {
            view: &view,
            resolve_target: None,
            ops: wgpu::Operations {
                load: wgpu::LoadOp::Clear(wgpu::Color::GREEN),
                store: wgpu::StoreOp::Store,
            },
        })],
        depth_stencil_attachment: None,
        timestamp_writes: None,
        occlusion_query_set: None,
    });
    rpass.set_pipeline(&render_pipeline);
    rpass.set_bind_group(0, &render_bind_groups[frame_num % 2], &[]);
    rpass.draw(0..6, 0..1);
}
