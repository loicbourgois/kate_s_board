const rotate = (p1, p2, angle) => {
    // Rotates p1 around p2
    // angle must be in range [0.0;1.0].
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    const angle_rad = angle * Math.PI * 2.0
    let cos_ = Math.cos(angle_rad);
    let sin_ = Math.sin(angle_rad);
    return {
      x: p2.x + dx * cos_ - dy * sin_,
      y: p2.y + dy * cos_ + dx * sin_,
    }
}



const delta = (a, b) => {
    return {
        x: b.x - a.x,
        y: b.y - a.y,
    }
}


const distance = (a, b) => {
    const d = delta(a, b)
    return Math.sqrt(d.x * d.x + d.y * d.y)
}


const find_angle = (p2, p1, p3) => {
    let diff_x1 = p2.x - p1.x;
    let diff_y1 = p2.y - p1.y;
    let diff_x2 = p3.x - p1.x;
    let diff_y2 = p3.y - p1.y;
    let theta1 = Math.atan2(diff_y1, diff_x1);
    let theta2 = Math.atan2(diff_y2, diff_x2);
    let diffTheta = theta2 - theta1;
    if (diffTheta < 0.0) {
        diffTheta += 2.0 * Math.PI;
    }
    let angleDeg = (diffTheta * 180.0 / Math.PI) % 360.0;
    return angleDeg / 360.0
}


export {
    rotate,
    distance,
    delta,
    find_angle,
}