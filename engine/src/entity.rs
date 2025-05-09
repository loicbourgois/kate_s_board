use crate::math::delta;
use crate::math::normalize_2;
use crate::node::Node;
use crate::vector::Vector;

pub struct Entity {
    pub id: usize,
    pub node_ids: Vec<usize>,
    pub p: Vector,  // position
    pub pp: Vector, // previous position
    pub v: Vector,  // velocity
    pub vn: Vector, // velocity normal
    pub orientation_node_ids: Vec<usize>,
    pub orientation: Vector,
    pub orientation_previous: Vector,
}

impl Entity {
    pub fn update(&mut self, nodes: &Vec<Node>) {
        self.pp = self.p;
        self.p.x = 0.0;
        self.p.y = 0.0;
        for id in &self.node_ids {
            let n = &nodes[*id];
            self.p.x += n.p.x;
            self.p.y += n.p.y;
        }
        self.p.x /= self.node_ids.len() as f64;
        self.p.y /= self.node_ids.len() as f64;
        self.v.x = self.p.x - self.pp.x;
        self.v.y = self.p.y - self.pp.y;
        self.vn = normalize_2(self.v);
        let n0 = &nodes[self.orientation_node_ids[0]];
        let n1 = &nodes[self.orientation_node_ids[1]];
        let n2 = &nodes[self.orientation_node_ids[2]];
        self.orientation_previous = self.orientation;
        self.orientation = normalize_2(delta(
            &Vector {
                x: (n1.p.x + n2.p.x) * 0.5,
                y: (n1.p.y + n2.p.y) * 0.5,
            },
            &n0.p,
        ));
    }
}
