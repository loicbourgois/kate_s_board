mod math;
mod node;
mod vector;
use crate::vector::Vector;
use engine::Config;
use engine::Simulation;
use rand::Rng;
use std::collections::HashMap;
use std::time::Instant;

pub struct WH {
    w: u32,
    h: u32,
}

pub fn get_colors() -> HashMap<String, [u8; 3]> {
    let mut colors = HashMap::new();
    colors.insert("#0".to_owned(), [255, 0, 255]); // pink
    colors.insert("#1".to_owned(), [255, 255, 0]); // yellow
    colors.insert("#2".to_owned(), [0, 255, 255]); // light blue
    colors.insert("#3".to_owned(), [164, 164, 255]); // blue
    for i in 4..100 {
        colors.insert(format!("#{i}"), [255, 255, 255]); // white
    }
    colors
}

fn data_to_img(path: &str, data: &Vec<(usize, f64, String)>, max_w: f64) {
    let colors = get_colors();
    let wh = WH { w: 3000, h: 2000 };
    if data.is_empty() {
        return;
    }
    let mut min_h = data[0].1;
    for a in data {
        min_h = min_h.min(a.1);
    }
    let mut max_h = data[0].1;
    for a in data {
        max_h = max_h.max(a.1);
    }
    max_h -= min_h;
    min_h *= 1.1;
    max_h *= 1.1;
    let mut img: image::RgbImage = image::ImageBuffer::new(wh.w, wh.h);
    for p in data {
        let h = wh.h - ((p.1 - min_h) / max_h * wh.h as f64) as u32;
        let w = (p.0 as f64 / max_w * wh.w as f64) as u32;
        let aa: isize = 1;
        for w_ in (-aa)..=aa {
            for h_ in (-aa)..=aa {
                if (w_ * h_).abs() > aa - 1 {
                    continue;
                }
                let ww = (w as isize + w_).min(wh.w as isize - 1).max(0) as u32;
                let hh = (h as isize + h_).min(wh.h as isize - 1).max(0) as u32;
                let pix = img.get_pixel_mut(ww, hh);
                let c = colors.get(&p.2).unwrap();
                for i in 0..3 {
                    pix[i] = c[i];
                }
            }
        }
    }
    img.save(path).unwrap();
}

fn main() {
    run_1();
    run_2();
    run_3();
    run_4();
    run_5();
}

fn get_config_str() -> String {
    serde_json::to_string(&Config {
        crdv: 4.0,
        crdp: 2.0,
        crdv2: 0.0,
        crdp2: 0.00000,
        diameter: 0.01,
        gravity: 0.000001,
        ticker: 10,
        friction_ratio: 0.0,
        max_speed: 0.01,
    })
    .unwrap()
}

fn run_1() {
    let mut s = Simulation::new(get_config_str());
    let mut rng = rand::thread_rng();
    for _ in 0..5000 {
        s.add_node(rng.gen::<f64>() * 1.0, rng.gen::<f64>() * 1.0, false);
    }
    let step_count = 10;
    let now = Instant::now();
    println!("start");
    for i in 0..step_count {
        s.sub_tick();
        let t = (now.elapsed().as_nanos() / (i + 1)) as f64 / 1_000_000_000.0;
        println!("t: {t}");
    }
    let t = (now.elapsed().as_nanos() / step_count) as f64 / 1_000_000_000.0;
    println!("end    {t}");
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/01-01.png",
        &s.get_data_1(),
        step_count as f64,
    );
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/01-02.png",
        &s.get_data_2(),
        step_count as f64,
    );
}

fn run_2() {
    let mut s = Simulation::new(get_config_str());
    s.add_node(0.5, 0.0, true);
    s.add_node(0.5, 0.02, false);
    s.add_node(0.5, -0.03, false);
    s.add_link(0, 2, 0.03, 0.1, 2.0);
    s.store_data = true;
    let step_count = 10000;
    for _ in 0..step_count {
        s.sub_tick();
    }
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/02-01.png",
        &s.get_data_1(),
        step_count as f64,
    );
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/02-02.png",
        &s.get_data_2(),
        step_count as f64,
    );
}

fn run_3() {
    let mut s = Simulation::new(get_config_str());
    let _ = s.add_node(0.5, 1.0, false);
    let _ = s.add_node(0.5, 1.1, false);
    let _ = s.add_node(0.5, 0.5, true);
    let _ = s.add_node(0.5, 0.3, true);
    s.store_data = true;
    let step_count = 10000;
    for _ in 0..step_count {
        s.sub_tick();
    }
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/03-01.png",
        &s.get_data_1(),
        step_count as f64,
    );
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/03-02.png",
        &s.get_data_2(),
        step_count as f64,
    );
}

fn run_4() {
    let mut s = Simulation::new(get_config_str());
    let a = s.add_node(0.5, 1.0, true);
    let b = s.add_node(0.75, 1.0, true);
    let c = s.add_node(0.5, 1.25, false);
    let _ = s.add_node(0.75, 1.25, true);
    s.add_link(a, b, 0.25, 0.001, 20.0);
    s.add_link(b, c, 0.3, 0.001, 20.0);
    s.add_clink(a, b, c, -0.125, 0.05, 2.0);
    s.store_data = true;
    let step_count = 40000;
    for _ in 0..step_count {
        s.sub_tick();
    }
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/04-01.png",
        &s.get_data_1(),
        step_count as f64,
    );
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/04-02.png",
        &s.get_data_2(),
        step_count as f64,
    );
}

fn run_5() {
    let mut s = Simulation::new(get_config_str());
    let c = 49;
    for i in 0..c {
        s.add_node(0.01 * i as f64 - 0.01 * (c as f64) / 2.0, 0.0, true);
    }
    for i in 0..25 {
        s.add_node(0.0, 0.011 * (i + 1) as f64, false);
    }
    s.store_data = true;
    let step_count = 10000;
    for _ in 0..step_count {
        s.sub_tick();
    }
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/05-01.png",
        &s.get_data_1(),
        step_count as f64,
    );
    data_to_img(
        "/Users/loicbourgois/github.com/loicbourgois/kate_s_board/data/05-02.png",
        &s.get_data_2(),
        step_count as f64,
    );
}
