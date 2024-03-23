mod entity;
mod math;
mod node;
mod vector;
use crate::entity::Entity;
use crate::math::collision_response;
use crate::math::delta;
use crate::math::distance;
use crate::math::distance_sqrd;
use crate::math::find_angle;
use crate::math::norm;
use crate::math::normalize_2;
use crate::math::rotate;
use crate::node::Node;
use crate::node::NodeConfig;
use crate::node::VectorIsize;
use crate::node::NODE_SIZE;
use crate::vector::Vector;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::collections::HashSet;
use wasm_bindgen::prelude::wasm_bindgen;

pub struct Link {
    l: f64,
    s: f64,
    damping: f64,
    a: usize,
    b: usize,
}

pub struct Clink {
    angle: f64,
    strengh: f64,
    damping: f64,
    a: usize,
    b: usize,
    c: usize,
}

#[wasm_bindgen]
pub struct Simulation {
    pub step: usize,
    nodes: Vec<Node>,
    links: Vec<Link>,
    clinks: Vec<Clink>,
    mass: f64,
    pub diameter: f64,
    gravity: f64,
    crdv: f64,
    crdp: f64,
    crdv2: f64,
    crdp2: f64,
    pub store_data: bool,
    data_1: Vec<(usize, f64, String)>,
    data_2: Vec<(usize, f64, String)>,
    mouse: Vector,
    pub focused_node: Option<usize>,
    pub focused_cp: Option<usize>,
    control_points: Vec<Vector>,
    beziers: Vec<Bezier>,
    ticker: usize,
    friction_ratio: f64,
    max_speed: f64,
    grid: HashMap<(isize, isize), Vec<usize>>,
    linked: HashMap<usize, HashSet<usize>>,
    entities: Vec<Entity>,
}

#[derive(Clone)]
pub struct Bezier {
    idxs: Vec<usize>,
    ratio: f64,
    z: usize,
}

impl Simulation {
    pub fn get_data_1(&self) -> &Vec<(usize, f64, String)> {
        &self.data_1
    }
    pub fn get_data_2(&self) -> &Vec<(usize, f64, String)> {
        &self.data_2
    }
}

pub fn lerp(a: Vector, b: Vector, t: f64) -> Vector {
    return Vector {
        x: (a.x * (1.0 - t) + b.x * t),
        y: (a.y * (1.0 - t) + b.y * t),
    };
}

#[derive(Deserialize, Serialize)]
pub struct Config {
    pub crdv: f64,
    pub crdp: f64,
    pub crdv2: f64,
    pub crdp2: f64,
    pub diameter: f64,
    pub gravity: f64,
    pub friction_ratio: f64,
    pub ticker: usize,
    pub max_speed: f64,
}

#[wasm_bindgen]
impl Simulation {
    pub fn new(config_str: String) -> Self {
        let config: Config = serde_json::from_str(&config_str).unwrap();
        Simulation {
            step: 0,
            nodes: Vec::new(),
            links: Vec::new(),
            clinks: Vec::new(),
            mass: 1.0,
            diameter: config.diameter,
            gravity: config.gravity,
            crdv: config.crdv,
            crdp: config.crdp,
            crdv2: config.crdv2,
            crdp2: config.crdp2,
            store_data: false,
            data_1: Vec::new(),
            data_2: Vec::new(),
            mouse: Vector { x: 0.0, y: 0.0 },
            focused_node: None,
            focused_cp: None,
            beziers: Vec::new(),
            control_points: Vec::new(),
            ticker: config.ticker,
            friction_ratio: config.friction_ratio,
            max_speed: config.max_speed,
            grid: HashMap::new(),
            linked: HashMap::new(),
            entities: Vec::new(),
        }
    }

    pub fn create_entity(
        &mut self,
        node_ids: Vec<usize>,
        orientation_node_ids: Vec<usize>,
    ) -> usize {
        let entity_id = self.entities.len();
        self.entities.push(Entity {
            node_ids,
            id: entity_id,
            p: Vector::new(),
            v: Vector::new(),
            pp: Vector::new(),
            vn: Vector::new(),
            orientation_node_ids,
            orientation: Vector::new(),
            orientation_previous: Vector::new(),
        });
        entity_id
    }

    pub fn get_position(&mut self, entity_id: usize) -> Vector {
        self.entities[entity_id].p
    }

    pub fn get_previous_position(&mut self, entity_id: usize) -> Vector {
        self.entities[entity_id].pp
    }

    pub fn get_node_position(&mut self, node_id: usize) -> Vector {
        self.nodes[node_id].p
    }

    pub fn get_node_direction(&mut self, node_id: usize) -> Vector {
        self.nodes[node_id].direction
    }

    pub fn get_vellocity(&mut self, entity_id: usize) -> Vector {
        self.entities[entity_id].v
    }

    pub fn get_orientation(&mut self, entity_id: usize) -> Vector {
        self.entities[entity_id].orientation
    }

    pub fn get_orientation_previous(&mut self, entity_id: usize) -> Vector {
        self.entities[entity_id].orientation_previous
    }

    pub fn get_node_vellocity(&mut self, node_id: usize) -> Vector {
        self.nodes[node_id].v
    }

    pub fn add_bezier(&mut self, str_: String, ratio: f64) {
        let control_points: Vec<Vector> = serde_json::from_str(&str_).unwrap();
        let mut bez = Vec::new();
        for p in &control_points {
            let idx = self.control_points.len();
            bez.push(idx);
            self.control_points.push(*p);
        }
        self.beziers.push(Bezier {
            idxs: bez.clone(),
            z: 0,
            ratio,
        });
        self.redo_beziers();
    }

    pub fn add_bezier_2(&mut self, str_: String, ratio: f64, z: usize) {
        let control_points: Vec<Vector> = serde_json::from_str(&str_).unwrap();
        let mut bez = Vec::new();
        for p in &control_points {
            let idx = self.control_points.len();
            bez.push(idx);
            self.control_points.push(*p);
        }
        self.beziers.push(Bezier {
            idxs: bez.clone(),
            ratio,
            z,
        });
        self.redo_beziers();
    }

    pub fn redo_beziers(&mut self) {
        self.nodes.clear();
        let uu = self.beziers.clone();
        let a = self.control_points[uu[0].idxs[0]];
        self.add_node_2(a.x, a.y, true, uu[0].z);
        for bez_ in &uu {
            let bez = &bez_.idxs;
            let l = bez.len();
            for i in 0..(l - 1) / 3 {
                let idx = i * 3;
                let a = self.control_points[bez[idx]];
                let b = self.control_points[bez[idx + 1]];
                let c = self.control_points[bez[idx + 2]];
                let d = self.control_points[bez[idx + 3]];
                let step = 0.0001;
                let mut t = 0.0;
                while t <= 1.0 {
                    let p1 = lerp(a, b, t);
                    let p2 = lerp(b, c, t);
                    let p3 = lerp(c, d, t);
                    let p4 = lerp(p1, p2, t);
                    let p5 = lerp(p2, p3, t);
                    let mut p6 = lerp(p4, p5, t);
                    let mut rng = rand::thread_rng();
                    p6.x += rng.gen::<f64>() * self.diameter * bez_.ratio
                        - self.diameter * 0.5 * bez_.ratio;
                    p6.y += rng.gen::<f64>() * self.diameter * bez_.ratio
                        - self.diameter * 0.5 * bez_.ratio;
                    let last_p = &self.nodes[self.nodes.len() - 1];
                    if distance_sqrd(last_p.p, p6) >= self.diameter * self.diameter {
                        self.add_node_2(p6.x, p6.y, true, bez_.z);
                    }
                    t += step;
                }
            }
        }
    }

    pub fn set_mouse(&mut self, x: f64, y: f64) {
        self.mouse.x = x;
        self.mouse.y = y;
    }

    pub fn sub_tick(&mut self) {
        let nodes_ptr = &mut self.nodes as *mut Vec<Node>;
        if self.store_data {
            for n in &self.nodes {
                self.data_1.push((self.step, n.p.y, format!("#{}", n.idx)));
                self.data_2.push((self.step, n.dv.y, format!("#{}", n.idx)));
            }
        }

        let mut to_del: Vec<(isize, isize)> = Vec::new();
        for (k, x) in self.grid.iter_mut() {
            if x.is_empty() {
                to_del.push(*k);
            }
            x.clear();
        }
        for k in to_del {
            self.grid.remove(&k);
        }
        // println!("{}", self.grid.len());

        // reset
        for mut n in &mut self.nodes {
            n.v.x = n.dv.x;
            n.v.y = n.dv.y;
            n.dv.x = 0.0;
            n.dv.y = 0.0;
            n.dp.x = 0.0;
            n.dp.y = 0.0;
            n.grid.x = (n.p.x / self.diameter).floor() as isize;
            n.grid.y = (n.p.y / self.diameter).floor() as isize;
            // println!("{} {} | {grid_x} {grid_y}", n.p.x, n.p.y);
            for a in n.grid.x - 1..=n.grid.x + 1 {
                for b in n.grid.y - 1..=n.grid.y + 1 {
                    let ab = (a, b);
                    // println!("{a} {b}");
                    match self.grid.get(&ab) {
                        Some(_) => {}
                        None => {
                            self.grid.insert(ab.clone(), Vec::new());
                        }
                    }
                    self.grid.get_mut(&ab).unwrap().push(n.idx);
                }
            }
        }
        // println!("{grid:?}");
        // speed + gravity
        for mut n in &mut self.nodes {
            n.dv.x += n.p.x - n.pp.x;
            n.dv.y += n.p.y - n.pp.y;
            n.dv.y -= self.gravity;
        }
        //
        // turbo
        //
        unsafe {
            let nodes_1 = &mut (*nodes_ptr);
            let nodes_2 = &mut (*nodes_ptr);
            for mut n in nodes_1.iter_mut() {
                match self.linked.get(&n.idx) {
                    None => {}
                    Some(hset) => {
                        let mut direction = Vector { x: 0.0, y: 0.0 };
                        for idx2 in hset {
                            let n2 = &nodes_2[*idx2];
                            let d = delta(&n2.p, &n.p);
                            direction.x += d.x;
                            direction.y += d.y;
                        }
                        n.direction = normalize_2(direction);
                        if n.direction.x.is_finite() && n.direction.y.is_finite() {
                            n.dv.x +=
                                n.turbo_max_speed * n.turbo_rate * self.diameter * n.direction.x;
                            n.dv.y +=
                                n.turbo_max_speed * n.turbo_rate * self.diameter * n.direction.y;
                        }
                    }
                }
            }
        }
        //
        // collision
        //
        let diam_sqrd = self.diameter * self.diameter;
        let mut pairs = HashMap::new();

        for n1 in &self.nodes {
            for a in n1.grid.x - 1..=n1.grid.x + 1 {
                for b in n1.grid.y - 1..=n1.grid.y + 1 {
                    for n2_idx in self.grid.get(&(a, b)).unwrap() {
                        let n2 = &self.nodes[*n2_idx];
                        if n1.idx >= n2.idx {
                            continue;
                        }
                        if n1.fixed && n2.fixed {
                            continue;
                        }
                        if n1.z != n2.z {
                            continue;
                        }
                        let d_sqrd = distance_sqrd(n1.p, n2.p);
                        if d_sqrd <= diam_sqrd {
                            pairs.insert((n1.idx, n2.idx), d_sqrd);
                        }
                    }
                }
            }
        }

        // for n1 in &self.nodes {
        //     for n2 in &self.nodes {
        //         if n1.idx >= n2.idx {
        //             continue;
        //         }
        //         if n1.fixed && n2.fixed {
        //             continue;
        //         }
        //         if n1.z != n2.z {
        //             continue;
        //         }
        //         let d_sqrd = distance_sqrd(n1.p, n2.p);
        //         if d_sqrd <= diam_sqrd {
        //             pairs.push((n1.idx, n2.idx, d_sqrd));
        //         }
        //     }
        // }

        // println!("pairs: {}", pairs.len());

        unsafe {
            let nodes_1 = &mut (*nodes_ptr);
            let nodes_2 = &mut (*nodes_ptr);
            for (pair, d_sqrd) in pairs {
                let mut n1 = &mut nodes_1[pair.0];
                let mut n2 = &mut nodes_2[pair.1];
                // let d_sqrd = pair.2;
                let dist = d_sqrd.sqrt();
                let delta_position = delta(&n1.p, &n2.p);
                let crdv = if !n1.fixed && !n2.fixed {
                    self.crdv
                } else {
                    self.crdv * 2.0
                };
                let dd = dist - self.diameter;
                let dd_crdv = dd * crdv;
                let crdp_crdv = self.crdp * crdv;
                let u1 = delta_position.x * dd_crdv;
                let u2 = delta_position.y * dd_crdv;
                let u3 = delta_position.x * dd_crdv;
                let u4 = delta_position.y * dd_crdv;
                n1.dv.x += u1;
                n1.dv.y += u2;
                n2.dv.x -= u3;
                n2.dv.y -= u4;
                n1.dp.x += u1 * crdp_crdv;
                n1.dp.y += u2 * crdp_crdv;
                n2.dp.x -= u3 * crdp_crdv;
                n2.dp.y -= u4 * crdp_crdv;

                let crdv2 = if !n1.fixed && !n2.fixed {
                    self.crdv2
                } else {
                    self.crdv2 * 2.0
                };
                let cr = collision_response(&n1, &n2);
                n1.dv.x += cr.x * crdv2;
                n1.dv.y += cr.y * crdv2;
                n2.dv.x -= cr.x * crdv2;
                n2.dv.y -= cr.y * crdv2;
                let dpn = normalize_2(delta_position);
                let r = (dist - self.diameter) / self.diameter;
                n1.dp.x += dpn.x * self.crdp2 * r;
                n1.dp.y += dpn.y * self.crdp2 * r;
                n2.dp.x -= dpn.x * self.crdp2 * r;
                n2.dp.y -= dpn.y * self.crdp2 * r;
                // friction
                let delta_position = delta(&n1.p, &n2.p);
                let delta_velocity = delta(&n1.v, &n2.v);
                let ab = Vector {
                    x: delta_position.y,
                    y: -delta_position.x,
                };
                let ac = delta_velocity;
                let coeff = (ab.x * ac.x + ab.y * ac.y) / (ab.x * ab.x + ab.y * ab.y);
                let dx = ab.x * coeff;
                let dy = ab.y * coeff;
                n1.dv.x += dx * self.friction_ratio;
                n1.dv.y += dy * self.friction_ratio;
                n2.dv.x -= dx * self.friction_ratio;
                n2.dv.y -= dy * self.friction_ratio;
            }
        }
        // links
        unsafe {
            let nodes_1 = &mut (*nodes_ptr);
            let nodes_2 = &mut (*nodes_ptr);
            for l in &self.links {
                let mut n1 = &mut nodes_1[l.a];
                let mut n2 = &mut nodes_2[l.b];
                let dist = distance(n1.p, n2.p);
                let d = delta(&n1.p, &n2.p);
                let dd = dist - l.l;
                let u1 = dd * d.x * l.s;
                let u2 = dd * d.y * l.s;
                let u3 = dd * d.x * l.s;
                let u4 = dd * d.y * l.s;
                n1.dv.x += u1;
                n1.dv.y += u2;
                n2.dv.x -= u3;
                n2.dv.y -= u4;
                n1.dp.x += u1 * l.damping;
                n1.dp.y += u2 * l.damping;
                n2.dp.x -= u3 * l.damping;
                n2.dp.y -= u4 * l.damping;
            }
        }
        // clinks
        unsafe {
            let nodes_1 = &mut (*nodes_ptr);
            let nodes_2 = &mut (*nodes_ptr);
            let nodes_3 = &mut (*nodes_ptr);
            for cl in &self.clinks {
                let mut n1 = &mut nodes_1[cl.a];
                let mut n2 = &mut nodes_2[cl.b];
                let mut n3 = &mut nodes_3[cl.c];
                let angle = find_angle(n1.p, n2.p, n3.p);
                let mut angle_diff = (angle - cl.angle) % 1.0;
                while angle_diff < -0.5 {
                    angle_diff += 1.0;
                }
                while angle_diff > 0.5 {
                    angle_diff -= 1.0;
                }
                let mut sign_ = 1.0;
                if angle_diff < 0.0 {
                    sign_ = -1.0;
                }
                let sl = 0.01;
                angle_diff =
                    sign_ * angle_diff.abs() * angle_diff.abs() * (1.0 - sl) + angle_diff * sl;
                let da = distance(n1.p, n2.p);
                let dc = distance(n3.p, n2.p);
                let ratio = dc / (da + dc);
                let ratio_ = da / (da + dc);
                let a = rotate(n1.p, n2.p, angle_diff * cl.strengh * ratio);
                let c = rotate(n3.p, n2.p, 1.0 - angle_diff * cl.strengh * ratio_);
                let u1 = a.x - n1.p.x;
                let u2 = a.y - n1.p.y;
                let u3 = c.x - n3.p.x;
                let u4 = c.y - n3.p.y;
                n1.dv.x += u1;
                n1.dv.y += u2;
                n3.dv.x += u3;
                n3.dv.y += u4;
                n2.dv.x -= u1 + u3;
                n2.dv.y -= u2 + u4;
                n1.dp.x += u1 * cl.damping;
                n1.dp.y += u2 * cl.damping;
                n3.dp.x += u3 * cl.damping;
                n3.dp.y += u4 * cl.damping;
                n2.dp.x -= (u1 + u3) * cl.damping;
                n2.dp.y -= (u2 + u4) * cl.damping;
            }
        }
        self.focused_node = None;
        let mut d = f64::INFINITY;
        for n in &mut self.nodes {
            if n.fixed {
                n.dv.x = 0.0;
                n.dv.y = 0.0;
            } else {
                let dv_norm = norm(n.dv);
                if dv_norm > self.max_speed {
                    // println!("{dv_norm:?}");
                    let max_ratio = self.max_speed / dv_norm;
                    n.dv.x *= max_ratio;
                    n.dv.y *= max_ratio;
                }

                let dp_norm = norm(n.dp);
                if dp_norm > self.max_speed {
                    // println!("{dv_norm:?}");
                    let max_ratio = self.max_speed / dp_norm;
                    n.dp.x *= max_ratio;
                    n.dp.y *= max_ratio;
                }

                n.p.x += n.dp.x;
                n.p.y += n.dp.y;
                n.pp.x = n.p.x;
                n.pp.y = n.p.y;
                n.p.x += n.dv.x;
                n.p.y += n.dv.y;
            }
            let d2 = distance_sqrd(n.p, self.mouse);
            if d2 < d {
                d = d2;
                self.focused_node = Some(n.idx);
            }
        }

        for entity in self.entities.iter_mut() {
            entity.update(&self.nodes);
        }

        self.step += 1;
    }

    pub fn tick(&mut self) {
        for _ in 0..self.ticker {
            self.sub_tick()
        }
        self.focused_cp = None;
        let mut d = f64::INFINITY;
        for (idx, cp) in self.control_points.iter().enumerate() {
            let d2 = distance_sqrd(*cp, self.mouse);
            if d2 < d {
                d = d2;
                self.focused_cp = Some(idx);
            }
        }
    }

    pub fn update_control_point(&mut self, idx: usize, x: f64, y: f64) {
        self.control_points[idx].x = x;
        self.control_points[idx].y = y;
    }

    pub fn test_assign_nodes(&mut self) {
        self.nodes = Vec::new();
        self.nodes.push(Node {
            p: Vector { x: 1.0, y: 2.0 },
            pp: Vector { x: 3.0, y: 4.0 },
            dp: Vector { x: 5.0, y: 6.0 },
            dv: Vector { x: 7.0, y: 8.0 },
            direction: Vector { x: 14.0, y: 15.0 },
            m: 9.0,
            v: Vector { x: 10.0, y: 11.0 },
            z: 101,
            idx: 102,
            fixed: true,
            turbo_max_speed: 12.0,
            turbo_rate: 13.0,
            grid: VectorIsize { x: 0, y: 0 },
        });
        self.nodes.push(Node {
            p: Vector { x: -1.0, y: -2.0 },
            pp: Vector { x: -3.0, y: -4.0 },
            dp: Vector { x: -5.0, y: -6.0 },
            dv: Vector { x: -7.0, y: -8.0 },
            direction: Vector { x: -14.0, y: -15.0 },
            m: -9.0,
            v: Vector { x: -10.0, y: -11.0 },
            z: 103,
            idx: 104,
            fixed: false,
            turbo_max_speed: -12.0,
            turbo_rate: -13.0,
            grid: VectorIsize { x: 0, y: 0 },
        })
    }

    pub fn add_node(&mut self, x: f64, y: f64, fixed: bool) -> usize {
        self.add_node_2(x, y, fixed, 0)
        // let idx = self.nodes.len();
        // self.nodes.push(Node {
        //     p: Vector { x: x, y: y },
        //     pp: Vector { x: x, y: y },
        //     dv: Vector { x: 0.0, y: 0.0 },
        //     dp: Vector { x: 0.0, y: 0.0 },
        //     v: Vector { x: 0.0, y: 0.0 },
        //     idx,
        //     m: self.mass,
        //     fixed: fixed,
        //     z: 0,
        //     grid: VectorIsize { x: 0, y: 0 },
        // });
        // idx
    }

    pub fn set_turbo_rate(&mut self, id: usize, rate: f64) {
        self.nodes[id].turbo_rate = rate;
    }

    pub fn add_node_2(&mut self, x: f64, y: f64, fixed: bool, z: usize) -> usize {
        let idx = self.nodes.len();
        self.nodes.push(Node {
            p: Vector { x: x, y: y },
            pp: Vector { x: x, y: y },
            dv: Vector { x: 0.0, y: 0.0 },
            dp: Vector { x: 0.0, y: 0.0 },
            v: Vector { x: 0.0, y: 0.0 },
            direction: Vector { x: 0.0, y: 0.0 },
            idx,
            m: self.mass,
            fixed: fixed,
            z,
            turbo_max_speed: 0.0,
            turbo_rate: 0.0,
            grid: VectorIsize { x: 0, y: 0 },
        });
        idx
    }

    pub fn add_node_3(&mut self, config_str: String) -> usize {
        let c: NodeConfig = serde_json::from_str(&config_str).unwrap();
        let idx = self.nodes.len();
        self.nodes.push(Node {
            p: Vector { x: c.x, y: c.y },
            pp: Vector { x: c.x, y: c.y },
            dv: Vector { x: 0.0, y: 0.0 },
            dp: Vector { x: 0.0, y: 0.0 },
            v: Vector { x: 0.0, y: 0.0 },
            direction: Vector { x: 0.0, y: 0.0 },
            idx,
            m: self.mass,
            fixed: c.fixed,
            z: 0,
            turbo_max_speed: c.turbo_max_speed,
            turbo_rate: 0.0,
            grid: VectorIsize { x: 0, y: 0 },
        });
        idx
    }

    pub fn add_link(&mut self, a: usize, b: usize, l: f64, s: f64, damping: f64) -> usize {
        let idx = self.links.len();
        for (i1, i2) in [(a, b), (b, a)] {
            match self.linked.get_mut(&i1) {
                Some(x) => {}
                None => {
                    self.linked.insert(i1, HashSet::new());
                }
            }
            self.linked.get_mut(&i1).unwrap().insert(i2);
        }
        self.links.push(Link {
            a,
            b,
            l,
            s,
            damping,
        });
        idx
    }

    pub fn add_clink(
        &mut self,
        a: usize,
        b: usize,
        c: usize,
        angle: f64,
        strengh: f64,
        damping: f64,
    ) -> usize {
        let idx = self.clinks.len();
        self.clinks.push(Clink {
            a,
            b,
            c,
            angle,
            strengh,
            damping,
        });
        idx
    }

    pub fn set_clink_angle(&mut self, idx: usize, angle: f64) {
        self.clinks[idx].angle = angle;
    }

    pub fn set_link_length(&mut self, idx: usize, length: f64) {
        self.links[idx].l = length;
    }

    pub fn set_node_fixed(&mut self, idx: usize, fixed: bool) {
        self.nodes[idx].fixed = fixed;
    }

    // NODE getters

    pub fn nodes_ptr(&self) -> *const Node {
        self.nodes.as_ptr()
    }

    pub fn node_size(&self) -> usize {
        NODE_SIZE
    }

    pub fn nodes_count(&self) -> usize {
        self.nodes.len()
    }

    pub fn nodes_size(&self) -> usize {
        self.nodes.len() * self.node_size()
    }

    // LINK getters

    pub fn links_ptr(&self) -> *const Link {
        self.links.as_ptr()
    }

    pub fn link_size(&self) -> usize {
        4 * 8
    }

    pub fn links_count(&self) -> usize {
        self.links.len()
    }

    pub fn links_size(&self) -> usize {
        self.links.len() * self.link_size()
    }

    // CONTROL POINTS getters

    pub fn control_points_ptr(&self) -> *const Vector {
        self.control_points.as_ptr()
    }

    pub fn control_point_size(&self) -> usize {
        2 * 8
    }

    pub fn control_points_count(&self) -> usize {
        self.control_points.len()
    }

    pub fn control_points_size(&self) -> usize {
        self.control_points.len() * self.control_point_size()
    }
}
