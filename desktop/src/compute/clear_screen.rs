use crate::compute::common::get_common;
use std::borrow::Cow;
use std::num::NonZeroU64;
use wgpu::BindGroup;
use wgpu::Buffer;
use wgpu::CommandEncoder;
use wgpu::ComputePipeline;
use wgpu::Device;

pub struct ComputeClearScreen {
    pub pipeline: ComputePipeline,
    pub bind_groups: Vec<BindGroup>,
}

impl ComputeClearScreen {
    pub fn new(
        device: &Device,
        screen_buffer_min_binding_size: Option<NonZeroU64>,
        screen_buffer_binding: u32,
        screen_buffers: &[Buffer],
    ) -> ComputeClearScreen {
        let source = include_str!("clear_screen.wgsl").replace("{common}", &get_common());
        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: None,
            source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(&source)),
        });
        let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            entries: &[wgpu::BindGroupLayoutEntry {
                binding: screen_buffer_binding,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: false },
                    has_dynamic_offset: false,
                    min_binding_size: screen_buffer_min_binding_size,
                },
                count: None,
            }],
            label: None,
        });
        let mut bind_groups = Vec::new();
        for i in 0..2 {
            bind_groups.push(device.create_bind_group(&wgpu::BindGroupDescriptor {
                layout: &bind_group_layout,
                entries: &[wgpu::BindGroupEntry {
                    binding: screen_buffer_binding,
                    resource: screen_buffers[i].as_entire_binding(),
                }],
                label: None,
            }))
        }
        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("compute"),
            bind_group_layouts: &[&bind_group_layout],
            push_constant_ranges: &[],
        });
        let pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
            label: Some("--"),
            layout: Some(&pipeline_layout),
            module: &shader,
            entry_point: "main",
        });
        ComputeClearScreen {
            pipeline,
            bind_groups,
        }
    }
    pub fn setup_pass(&self, encoder: &mut CommandEncoder, step: usize) {
        let mut cpass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
            label: None,
            timestamp_writes: None,
        });
        cpass.set_pipeline(&self.pipeline);
        cpass.set_bind_group(0, &self.bind_groups[step % 2], &[]);
        cpass.dispatch_workgroups(2000 * 4000 / 256, 1, 1);
    }
}
