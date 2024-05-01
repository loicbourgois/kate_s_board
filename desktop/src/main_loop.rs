use crate::app_state::AppState;
use crate::grid_counter::GridCounter;
use crate::particle_counter::ParticleCounter;
use std::time::Instant;
use wgpu::Adapter;
use wgpu::BindGroup;
use wgpu::Buffer;
use wgpu::ComputePipeline;
use wgpu::Device;
use wgpu::Instance;
// use wgpu::PipelineLayout;
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
    grid_counter: &GridCounter,
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
                        let frame = surface
                            .get_current_texture()
                            .expect("Failed to acquire next swap chain texture");
                        let view = frame
                            .texture
                            .create_view(&wgpu::TextureViewDescriptor::default());
                        let state_ref = state.as_ref().unwrap();
                        queue.write_buffer(
                            &app_state_buffer,
                            0,
                            &state_ref.as_wgsl_bytes().expect(
                                "Error in encase translating AppState struct to WGSL bytes.",
                            ),
                        );
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
                            &grid_counter.buffers[(frame_num + 1) % 2].slice(0..4 * 64 * 64),
                            |zoop| match zoop {
                                Ok(view) => {
                                    let data: &[u32; 64 * 64] = bytemuck::from_bytes(&view);
                                    let mut s = 0;
                                    for x in *data {
                                        s += x;
                                    }
                                    println!("particle_count_2: {:?}", s);
                                }
                                Err(_) => {}
                            },
                        );
                        let mut encoder =
                            device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
                                label: None,
                            });
                        {
                            let mut cpass =
                                encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
                                    label: None,
                                    timestamp_writes: None,
                                });
                            cpass.set_pipeline(&compute_pipeline);
                            cpass.set_bind_group(0, &compute_bind_groups[frame_num % 2], &[]);
                            cpass.dispatch_workgroups(work_group_count, 1, 1);
                        }
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
                            rpass.set_bind_group(0, &render_bind_groups[frame_num % 2], &[]);
                            rpass.draw(0..6, 0..1);
                        }
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
