use crate::compute::common::get_common;
use crate::ComputeGridReset;
use crate::GridList;
use crate::Nodes;
use std::borrow::Cow;
use wgpu::BindGroup;
use wgpu::BindGroupLayout;
use wgpu::Buffer;
use wgpu::CommandEncoder;
use wgpu::ComputePipeline;
use wgpu::Device;

pub struct ComputeGridUpdate {
    pub pipeline: ComputePipeline,
    pub bind_group: BindGroup,
    pub bind_group_layout: BindGroupLayout,
    pub work_group_count: u32,
}

impl ComputeGridUpdate {
    pub fn new(
        device: &Device,
        nodes: &Nodes,
        app_state_buffer: &Buffer,
        compute_grid_reset: &ComputeGridReset,
        work_group_count: u32,
        grid_list: &GridList,
    ) -> ComputeGridUpdate {
        let shader_source = include_str!("grid_update.wgsl").replace("{common}", &get_common());
        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: None,
            source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(&shader_source)),
        });
        let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            entries: &[
                wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(16), //std::mem::size_of::<AppState>() as u64,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: nodes.binding_in,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: true },
                        has_dynamic_offset: false,
                        min_binding_size: nodes.min_binding_size,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: compute_grid_reset.counter_binding,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: false },
                        has_dynamic_offset: false,
                        min_binding_size: compute_grid_reset.min_binding_size,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: grid_list.binding,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: false },
                        has_dynamic_offset: false,
                        min_binding_size: grid_list.min_binding_size,
                    },
                    count: None,
                },
            ],
            label: None,
        });
        let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &bind_group_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: app_state_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: nodes.buffers[0].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: compute_grid_reset.counter_binding,
                    resource: compute_grid_reset.counter_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: grid_list.binding,
                    resource: grid_list.buffer.as_entire_binding(),
                },
            ],
            label: None,
        });
        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("compute"),
            bind_group_layouts: &[&bind_group_layout],
            push_constant_ranges: &[],
        });
        let pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
            label: Some("Compute pipeline"),
            layout: Some(&pipeline_layout),
            module: &shader,
            entry_point: "main",
        });
        ComputeGridUpdate {
            pipeline,
            bind_group,
            bind_group_layout,
            work_group_count,
        }
    }

    pub fn setup_encoder(&self, encoder: &mut CommandEncoder) {
        let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
            label: None,
            timestamp_writes: None,
        });
        pass.set_pipeline(&self.pipeline);
        pass.set_bind_group(0, &self.bind_group, &[]);
        pass.dispatch_workgroups(self.work_group_count, 1, 1);
    }
}
