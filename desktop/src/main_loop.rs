use crate::app_state::AppState;
use crate::compute_1::compute_setup_pass;
use crate::particle_counter::ParticleCounter;
use crate::render::render_setup_pass;
use crate::ComputeGridReset;
use crate::ComputeGridUpdate;
use crate::MAX_NODE_PER_GRID_CELL;
use std::time::Instant;
use wgpu::Adapter;
use wgpu::BindGroup;
use wgpu::Buffer;
use wgpu::ComputePipeline;
use wgpu::Device;
use wgpu::Instance;
use wgpu::Queue;
use wgpu::RenderPipeline;
use wgpu::ShaderModule;
use wgpu::Surface;
use wgpu::SurfaceConfiguration;
use winit::event::Event;
use winit::event::WindowEvent;
use winit::event_loop::EventLoop;
use winit::window::Window;

pub fn run_event_loop(
    event_loop: EventLoop<()>,
    instance: &Instance,
    adapter: &Adapter,
    shader: &ShaderModule,
    queue: &Queue,
    device: &Device,
    render_pipeline: &RenderPipeline,
    surface: &Surface,
    window: &Window,
    config: &mut SurfaceConfiguration,
    app_state_buffer: &Buffer,
    render_bind_groups: &Vec<BindGroup>,
    compute_pipeline: &ComputePipeline,
    compute_bind_groups: &Vec<BindGroup>,
    work_group_count: u32,
    particle_counter: &ParticleCounter,
    compute_grid_reset: &ComputeGridReset,
    compute_grid_update: &ComputeGridUpdate,
) {
    let mut state = Some(AppState::default());
    let mut frame_num = 0;
    let mut frame_start = Instant::now();
    event_loop
        .run(move |event, target| {
            let _ = (instance, adapter, shader);
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
                        println!("window width:  {}", config.width);
                        println!("window height: {}", config.height);
                    }
                    WindowEvent::RedrawRequested => {
                        println!("# frame #{}", frame_num);
                        let elapsed = frame_start.elapsed().as_millis();
                        println!("elapsed: {}", elapsed);
                        frame_start = Instant::now();
                        // READ
                        wgpu::util::DownloadBuffer::read_buffer(
                            &device,
                            &queue,
                            &particle_counter.buffers[(frame_num + 1) % 2].slice(..),
                            |zoop| match zoop {
                                Ok(view) => {
                                    let result: &[u32; 1] = bytemuck::from_bytes(&view);
                                    println!("particle_count: {:?}", result);
                                }
                                Err(_) => {}
                            },
                        );
                        wgpu::util::DownloadBuffer::read_buffer(
                            &device,
                            &queue,
                            &compute_grid_reset.counter_buffer.slice(0..4 * 64 * 64),
                            |zoop| match zoop {
                                Ok(view) => {
                                    let mut max_ = 0;
                                    let mut max_id = 0;
                                    let data: &[u32; 64 * 64] = bytemuck::from_bytes(&view);
                                    let mut s = 0;
                                    for (i, x_) in (data).iter().enumerate() {
                                        let x = *x_;
                                        s += x;
                                        if x > max_ {
                                            max_ = x;
                                            max_id = i;
                                        }
                                        max_ = max_.max(x);
                                    }
                                    println!("particle_count_2: {:?}", s);
                                    println!("  max: {:?}/{}", max_, MAX_NODE_PER_GRID_CELL);
                                    println!("  idx: {:?}", max_id);
                                    // println!("  lendata: {:?}", data.len());
                                }
                                Err(_) => {}
                            },
                        );
                        // setup
                        let frame = surface
                            .get_current_texture()
                            .expect("Failed to acquire next swap chain texture");
                        let view = frame
                            .texture
                            .create_view(&wgpu::TextureViewDescriptor::default());
                        // write
                        let state_ref = state.as_ref().unwrap();
                        queue.write_buffer(
                            &app_state_buffer,
                            0,
                            &state_ref.as_wgsl_bytes().expect(
                                "Error in encase translating AppState struct to WGSL bytes.",
                            ),
                        );
                        // encoder
                        let mut encoder =
                            device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
                                label: None,
                            });
                        compute_grid_reset.setup_encoder(&mut encoder);
                        compute_grid_update.setup_encoder(&mut encoder);
                        compute_setup_pass(
                            &mut encoder,
                            compute_pipeline,
                            compute_bind_groups,
                            work_group_count,
                            frame_num,
                        );
                        render_setup_pass(
                            &mut encoder,
                            &view,
                            render_pipeline,
                            render_bind_groups,
                            frame_num,
                        );
                        // run
                        queue.submit(Some(encoder.finish()));
                        frame.present();
                        frame_num += 1;
                        println!("duration: {}", frame_start.elapsed().as_millis());
                        window.request_redraw();
                    }
                    WindowEvent::CloseRequested => target.exit(),
                    _ => {}
                };
            }
        })
        .unwrap();
}
