use encase::ShaderType;
use nanorand::Rng;
use nanorand::WyRand;
use std::borrow::Cow;
use std::mem;
use wgpu::util::DeviceExt;
use wgpu::Adapter;
use wgpu::BindGroup;
use wgpu::BindGroupLayout;
use wgpu::Buffer;
use wgpu::ComputePipeline;
use wgpu::Device;
use wgpu::Instance;
use wgpu::PipelineLayout;
use wgpu::Queue;
use wgpu::RenderPipeline;
use wgpu::ShaderModule;
use wgpu::Surface;
use wgpu::SurfaceConfiguration;
use wgpu::TextureFormat;
use winit::event::Event;
use winit::event::WindowEvent;
use winit::event_loop::EventLoop;
use winit::window::Window;

const NUM_PARTICLES: usize = 64;
const PARTICLE_SIZE: usize = 4;
const PARTICLES_PER_GROUP: u32 = 64;

#[derive(Debug, ShaderType)]
struct AppState {
    pub window_width: f32,
    pub window_height: f32,
    pub num_particles: i32,
}

impl AppState {
    fn as_wgsl_bytes(&self) -> encase::internal::Result<Vec<u8>> {
        let mut buffer = encase::UniformBuffer::new(Vec::new());
        buffer.write(self)?;
        Ok(buffer.into_inner())
    }
}

impl Default for AppState {
    fn default() -> Self {
        AppState {
            window_width: 1000.0,
            window_height: 1000.0,
            num_particles: NUM_PARTICLES as i32,
        }
    }
}

async fn get_gpu_adapter(instance: &Instance, surface: &Surface<'_>) -> Adapter {
    log::info!("Available adapters:");
    for a in instance.enumerate_adapters(wgpu::Backends::all()) {
        log::info!("    {:?}", a.get_info())
    }
    let adapter = instance
        .request_adapter(&wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::default(),
            force_fallback_adapter: false,
            compatible_surface: Some(surface),
        })
        .await
        .expect("Failed to find an appropriate adapter");
    log::info!("Selected adapter: {:?}", adapter.get_info());
    adapter
}

fn optional_features_f() -> wgpu::Features {
    wgpu::Features::empty()
}

fn required_features_f() -> wgpu::Features {
    wgpu::Features::empty()
}

fn required_downlevel_capabilities_f() -> wgpu::DownlevelCapabilities {
    wgpu::DownlevelCapabilities {
        flags: wgpu::DownlevelFlags::empty(),
        shader_model: wgpu::ShaderModel::Sm5,
        ..wgpu::DownlevelCapabilities::default()
    }
}

fn required_limits_f() -> wgpu::Limits {
    wgpu::Limits::downlevel_defaults() // These downlevel limits will allow the code to run on all possible hardware
}

async fn get_device_queue(adapter: &Adapter) -> (Device, Queue) {
    adapter
        .request_device(
            &wgpu::DeviceDescriptor {
                label: None,
                required_features: wgpu::Features::empty(),
                required_limits: wgpu::Limits::default().using_resolution(adapter.limits()),
            },
            None,
        )
        .await
        .expect("Failed to create device")
}

fn get_shader(device: &Device) -> ShaderModule {
    device.create_shader_module(wgpu::ShaderModuleDescriptor {
        label: None,
        source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(include_str!("draw.wgsl"))),
    })
}

fn get_pipeline_layout(device: &Device, bind_group_layout: &BindGroupLayout) -> PipelineLayout {
    device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: None,
        bind_group_layouts: &[bind_group_layout],
        push_constant_ranges: &[],
    })
}

fn get_swapchain_format(surface: &Surface, adapter: &Adapter) -> TextureFormat {
    let swapchain_capabilities = surface.get_capabilities(&adapter);
    swapchain_capabilities.formats[0]
}

fn get_render_pipeline(
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

fn configure(
    window: &Window,
    surface: &Surface,
    adapter: &Adapter,
    device: &Device,
) -> SurfaceConfiguration {
    let mut size = window.inner_size();
    size.width = size.width.max(1);
    size.height = size.height.max(1);
    let config = surface
        .get_default_config(&adapter, size.width, size.height)
        .unwrap();
    surface.configure(&device, &config);
    config
}

fn run_event_loop(
    event_loop: EventLoop<()>,
    instance: &Instance,
    adapter: &Adapter,
    shader: &ShaderModule,
    pipeline_layout: &PipelineLayout,
    queue: &Queue,
    device: &Device,
    render_pipeline: &RenderPipeline,
    surface: &Surface,
    window: &Window,
    config: &mut SurfaceConfiguration,
    uniform_buffer: &Buffer,
    bind_groups: &Vec<BindGroup>,
    compute_pipeline: &ComputePipeline,
    particle_bind_groups: &Vec<BindGroup>,
    work_group_count: u32,
) {
    let mut state = Some(AppState::default());
    let mut frame_num = 0;

    // let window_loop = EventLoopWrapper::new(title);

    event_loop
        .run(move |event, target| {
            // Have the closure take ownership of the resources.
            // `event_loop.run` never returns, therefore we must do this to ensure
            // the resources are properly cleaned up.
            let _ = (instance, adapter, shader, pipeline_layout);

            if let Event::WindowEvent {
                window_id: _,
                event,
            } = event
            {
                match event {
                    WindowEvent::Resized(new_size) => {
                        config.width = new_size.width.max(1);
                        config.height = new_size.height.max(1);
                        state.as_mut().unwrap().window_height = config.height as f32;
                        state.as_mut().unwrap().window_width = config.width as f32;
                        surface.configure(&device, &config);
                        // On macos the window needs to be redrawn manually after resizing
                        window.request_redraw();
                    }
                    WindowEvent::RedrawRequested => {
                        let frame = surface
                            .get_current_texture()
                            .expect("Failed to acquire next swap chain texture");
                        let view = frame
                            .texture
                            .create_view(&wgpu::TextureViewDescriptor::default());
                        let state_ref = state.as_ref().unwrap();
                        queue.write_buffer(
                            &uniform_buffer,
                            0,
                            &state_ref.as_wgsl_bytes().expect(
                                "Error in encase translating AppState struct to WGSL bytes.",
                            ),
                        );
                        let mut encoder =
                            device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
                                label: None,
                            });
                        encoder.push_debug_group("compute");
                        {
                            let mut cpass =
                                encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
                                    label: None,
                                    timestamp_writes: None,
                                });
                            cpass.set_pipeline(&compute_pipeline);
                            cpass.set_bind_group(0, &particle_bind_groups[frame_num % 2], &[]);
                            cpass.dispatch_workgroups(work_group_count, 1, 1);
                        }
                        encoder.pop_debug_group();
                        {
                            let mut rpass =
                                encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
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
                            rpass.set_bind_group(0, &bind_groups[frame_num % 2], &[]);
                            rpass.draw(0..6, 0..1);
                        }
                        queue.submit(Some(encoder.finish()));
                        frame.present();
                        frame_num += 1;
                        window.request_redraw();
                    }
                    WindowEvent::CloseRequested => target.exit(),
                    _ => {}
                };
            }
        })
        .unwrap();
}

fn get_uniform_buffer(device: &Device) -> Buffer {
    device.create_buffer(&wgpu::BufferDescriptor {
        label: None,
        size: std::mem::size_of::<AppState>() as u64,
        usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: false,
    })
}

fn get_bind_group_layout(device: &Device) -> BindGroupLayout {
    device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
        label: None,
        entries: &[
            wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::VERTEX_FRAGMENT,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: None,
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
        ],
    })
}

fn get_bind_group(
    device: &Device,
    bind_group_layout: &BindGroupLayout,
    uniform_buffer: &Buffer,
    particle_buffers: &Vec<Buffer>,
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
                        buffer: &uniform_buffer,
                        offset: 0,
                        size: None,
                    }),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: particle_buffers[i].as_entire_binding(),
                },
            ],
        }))
    }
    bds
}

fn required_downlevel_capabilities_() -> wgpu::DownlevelCapabilities {
    wgpu::DownlevelCapabilities {
        flags: wgpu::DownlevelFlags::empty(),
        shader_model: wgpu::ShaderModel::Sm5,
        ..wgpu::DownlevelCapabilities::default()
    }
}

async fn run(event_loop: EventLoop<()>, window: Window) {
    let mut initial_particle_data = vec![0.0f32; (PARTICLE_SIZE * NUM_PARTICLES) as usize];
    let mut rng = WyRand::new_seed(42);
    let mut unif = || rng.generate::<f32>();
    for x in initial_particle_data.chunks_mut(PARTICLE_SIZE) {
        x[0] = unif();
        x[1] = unif();
        x[2] = x[0];
        x[3] = x[1];
    }

    let mut particle_buffers = Vec::<wgpu::Buffer>::new();
    let mut particle_bind_groups = Vec::<wgpu::BindGroup>::new();

    let backends = wgpu::util::backend_bits_from_env().unwrap_or_default();
    let dx12_shader_compiler = wgpu::util::dx12_shader_compiler_from_env().unwrap_or_default();
    let gles_minor_version = wgpu::util::gles_minor_version_from_env().unwrap_or_default();

    let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
        backends,
        flags: wgpu::InstanceFlags::from_build_config().with_env(),
        dx12_shader_compiler,
        gles_minor_version,
    });
    let surface = (instance.create_surface(&window).unwrap());
    let adapter = get_gpu_adapter(&instance, &surface).await;
    let required_downlevel_capabilities = required_downlevel_capabilities_();
    let downlevel_capabilities = adapter.get_downlevel_capabilities();
    assert!(
        downlevel_capabilities.shader_model >= required_downlevel_capabilities.shader_model,
        "Adapter does not support the minimum shader model required to run this example: {:?}",
        required_downlevel_capabilities.shader_model
    );
    assert!(
        downlevel_capabilities
            .flags
            .contains(required_downlevel_capabilities.flags),
        "Adapter does not support the downlevel capabilities required to run this example: {:?}",
        required_downlevel_capabilities.flags - downlevel_capabilities.flags
    );
    let (device, queue) = get_device_queue(&adapter).await;
    for i in 0..2 {
        particle_buffers.push(
            device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: Some(&format!("Particle Buffer {i}")),
                contents: bytemuck::cast_slice(&initial_particle_data),
                usage: wgpu::BufferUsages::VERTEX
                    | wgpu::BufferUsages::STORAGE
                    | wgpu::BufferUsages::COPY_DST,
            }),
        );
    }
    let shader = get_shader(&device);
    let uniform_buffer = get_uniform_buffer(&device);
    let bind_group_layout = get_bind_group_layout(&device);
    let bind_groups = get_bind_group(
        &device,
        &bind_group_layout,
        &uniform_buffer,
        &particle_buffers,
    );
    let pipeline_layout = get_pipeline_layout(&device, &bind_group_layout);
    let swapchain_format = get_swapchain_format(&surface, &adapter);
    let render_pipeline = get_render_pipeline(&device, &pipeline_layout, &shader, swapchain_format);
    let mut config = configure(&window, &surface, &adapter, &device);
    let sim_param_data = [
        0.001f32, // speed
        NUM_PARTICLES as f32,
    ]
    .to_vec();
    let sim_param_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
        label: Some("Simulation Parameter Buffer"),
        contents: bytemuck::cast_slice(&sim_param_data),
        usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    });
    let compute_bind_group_layout =
        device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            entries: &[
                wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(
                            (sim_param_data.len() * mem::size_of::<f32>()) as _,
                        ),
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 1,
                    visibility: wgpu::ShaderStages::COMPUTE,
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
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: false },
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(
                            (NUM_PARTICLES * PARTICLE_SIZE * 4) as _,
                        ),
                    },
                    count: None,
                },
            ],
            label: None,
        });
    let compute_pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: Some("compute"),
        bind_group_layouts: &[&compute_bind_group_layout],
        push_constant_ranges: &[],
    });
    for i in 0..2 {
        particle_bind_groups.push(device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &compute_bind_group_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: sim_param_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: particle_buffers[i].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 2,
                    resource: particle_buffers[(i + 1) % 2].as_entire_binding(), // bind to opposite buffer
                },
            ],
            label: None,
        }));
    }
    let work_group_count = ((NUM_PARTICLES as f32) / (PARTICLES_PER_GROUP as f32)).ceil() as u32;
    let compute_shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
        label: None,
        source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(include_str!("compute.wgsl"))),
    });
    let compute_pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
        label: Some("Compute pipeline"),
        layout: Some(&compute_pipeline_layout),
        module: &compute_shader,
        entry_point: "main",
    });
    run_event_loop(
        event_loop,
        &instance,
        &adapter,
        &shader,
        &pipeline_layout,
        &queue,
        &device,
        &render_pipeline,
        &surface,
        &window,
        &mut config,
        &uniform_buffer,
        &bind_groups,
        &compute_pipeline,
        &particle_bind_groups,
        work_group_count,
    );
}

pub fn main() {
    env_logger::init();
    let event_loop = EventLoop::new().unwrap();
    let builder = winit::window::WindowBuilder::new();
    let window = builder.build(&event_loop).unwrap();
    pollster::block_on(run(event_loop, window));
}
