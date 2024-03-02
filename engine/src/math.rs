use crate::node::Node;
use crate::Vector;

pub fn delta(a: &Vector, b: &Vector) -> Vector {
    Vector {
        x: b.x - a.x,
        y: b.y - a.y,
    }
}
pub fn distance_sqrd(a: Vector, b: Vector) -> f64 {
    let dp = delta(&a, &b);
    dp.x * dp.x + dp.y * dp.y
}
pub fn distance(a: Vector, b: Vector) -> f64 {
    distance_sqrd(a, b).sqrt()
}
pub fn norm_sqrd(v: Vector) -> f64 {
    v.x * v.x + v.y * v.y
}
pub fn norm(v: Vector) -> f64 {
    norm_sqrd(v).sqrt()
}
pub fn normalize(p: Vector, d: f64) -> Vector {
    Vector {
        x: p.x / d,
        y: p.y / d,
    }
}
pub fn normalize_2(p: Vector) -> Vector {
    let d = (p.x * p.x + p.y * p.y).sqrt();
    Vector {
        x: p.x / d,
        y: p.y / d,
    }
}
pub fn dot(a: Vector, b: Vector) -> f64 {
    a.x * b.x + a.y * b.y
}
pub fn cross(p1: Vector, p2: Vector) -> f64 {
    p1.x * p2.y - p1.y * p2.x
}
pub fn radians(x: f64) -> f64 {
    x / 180.0 * std::f64::consts::PI
}
pub fn degrees(x: f64) -> f64 {
    x * (180.0 / std::f64::consts::PI)
}
pub fn angle(p1: Vector, p2: Vector) -> f64 {
    let cross_ = cross(p1, p2);
    let l = norm(p1) * norm(p2);
    let angle = (cross_ / l).asin();
    degrees(angle)
}

pub fn collision_response(p1: &Node, p2: &Node) -> Vector {
    // https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
    let delta_velocity = delta(&p1.v, &p2.v);
    let delta_position = delta(&p1.p, &p2.p);
    let mass_factor = 2.0 * p2.m / (p2.m + p1.m);
    let dot_vp = dot(delta_velocity, delta_position);
    let n_sqrd = norm_sqrd(delta_position);
    let factor = mass_factor * dot_vp / n_sqrd;
    Vector {
        x: delta_position.x * factor,
        y: delta_position.y * factor,
    }
}

pub fn find_angle(p2: Vector, p1: Vector, p3: Vector) -> f64 {
    let diff_x1 = p2.x - p1.x;
    let diff_y1 = p2.y - p1.y;
    let diff_x2 = p3.x - p1.x;
    let diff_y2 = p3.y - p1.y;
    let theta1 = diff_y1.atan2(diff_x1);
    let theta2 = diff_y2.atan2(diff_x2);
    let mut diffTheta = theta2 - theta1;
    if diffTheta < 0.0 {
        diffTheta += 2.0 * std::f64::consts::PI;
    }
    let angleDeg = (diffTheta * 180.0 / std::f64::consts::PI) % 360.0;
    angleDeg / 360.0
}

pub fn rotate(p1: Vector, p2: Vector, angle: f64) -> Vector {
    // Rotates p1 around p2
    // angle must be in range [0.0;1.0].
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    let angle_rad = angle * std::f64::consts::PI * 2.0;
    let cos_ = angle_rad.cos();
    let sin_ = angle_rad.sin();
    return Vector {
        x: p2.x + dx * cos_ - dy * sin_,
        y: p2.y + dy * cos_ + dx * sin_,
    };
}
