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
const norm = (v) => {
    return Math.sqrt(v.x * v.x + v.y * v.y)
}


const delta = (a, b) => {
    return {
        x: b.x - a.x,
        y: b.y - a.y,
    }
}


const normalize = (p) => {
    const d = Math.sqrt(p.x * p.x + p.y * p.y);
    return {
        x: p.x / d,
        y: p.y / d,
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


const crossing_segments = (l1, l2) => {
    return areIntersecting (
        l1.a.x,
        l1.a.y,
        l1.b.x,
        l1.b.y,
        l2.a.x,
        l2.a.y,
        l2.b.x,
        l2.b.y,
    )
    // console.log(l1, l2)
    // throw"ee"
    // return doIntersect(l1.a, l1.b, l2.a, l2.b)
}


// Given three collinear points p, q, r, the function checks if 
// point q lies on line segment 'pr' 
function onSegment(p, q, r) 
{ 
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && 
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) 
    return true; 
    
    return false; 
} 
  
// To find orientation of ordered triplet (p, q, r). 
// The function returns following values 
// 0 --> p, q and r are collinear 
// 1 --> Clockwise 
// 2 --> Counterclockwise 
function orientation(p, q, r) 
{ 
  
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/ 
    // for details of below formula. 
    let val = (q.y - p.y) * (r.x - q.x) - 
            (q.x - p.x) * (r.y - q.y); 
    
    if (val == 0) return 0; // collinear 
    
    return (val > 0)? 1: 2; // clock or counterclock wise 
} 
  
// The main function that returns true if line segment 'p1q1' 
// and 'p2q2' intersect. 
function doIntersect(p1, q1, p2, q2) 
{ 
  
    // Find the four orientations needed for general and 
    // special cases 
    let o1 = orientation(p1, q1, p2); 
    let o2 = orientation(p1, q1, q2); 
    let o3 = orientation(p2, q2, p1); 
    let o4 = orientation(p2, q2, q1); 
    
    // General case 
    if (o1 != o2 && o3 != o4) 
        return true; 
    
    // Special Cases 
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1 
    if (o1 == 0 && onSegment(p1, p2, q1)) return true; 
    
    // p1, q1 and q2 are collinear and q2 lies on segment p1q1 
    if (o2 == 0 && onSegment(p1, q2, q1)) return true; 
    
    // p2, q2 and p1 are collinear and p1 lies on segment p2q2 
    if (o3 == 0 && onSegment(p2, p1, q2)) return true; 
    
    // p2, q2 and q1 are collinear and q1 lies on segment p2q2 
    if (o4 == 0 && onSegment(p2, q1, q2)) return true; 
    
    return false; // Doesn't fall in any of the above cases 
} 


// https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon
const NO = 0
const YES = 1
const COLLINEAR = 2
const areIntersecting = (
    v1x1, v1y1, v1x2,  v1y2,
    v2x1, v2y1,  v2x2,  v2y2
) => {
    let d1, d2;
    let a1, a2, b1, b2, c1, c2;

    // Convert vector 1 to a line (line 1) of infinite length.
    // We want the line in linear equation standard form: A*x + B*y + C = 0
    // See: http://en.wikipedia.org/wiki/Linear_equation
    a1 = v1y2 - v1y1;
    b1 = v1x1 - v1x2;
    c1 = (v1x2 * v1y1) - (v1x1 * v1y2);

    // Every point (x,y), that solves the equation above, is on the line,
    // every point that does not solve it, is not. The equation will have a
    // positive result if it is on one side of the line and a negative one 
    // if is on the other side of it. We insert (x1,y1) and (x2,y2) of vector
    // 2 into the equation above.
    d1 = (a1 * v2x1) + (b1 * v2y1) + c1;
    d2 = (a1 * v2x2) + (b1 * v2y2) + c1;

    // If d1 and d2 both have the same sign, they are both on the same side
    // of our line 1 and in that case no intersection is possible. Careful, 
    // 0 is a special case, that's why we don't test ">=" and "<=", 
    // but "<" and ">".
    if (d1 > 0 && d2 > 0) return NO;
    if (d1 < 0 && d2 < 0) return NO;

    // The fact that vector 2 intersected the infinite line 1 above doesn't 
    // mean it also intersects the vector 1. Vector 1 is only a subset of that
    // infinite line 1, so it may have intersected that line before the vector
    // started or after it ended. To know for sure, we have to repeat the
    // the same test the other way round. We start by calculating the 
    // infinite line 2 in linear equation standard form.
    a2 = v2y2 - v2y1;
    b2 = v2x1 - v2x2;
    c2 = (v2x2 * v2y1) - (v2x1 * v2y2);

    // Calculate d1 and d2 again, this time using points of vector 1.
    d1 = (a2 * v1x1) + (b2 * v1y1) + c2;
    d2 = (a2 * v1x2) + (b2 * v1y2) + c2;

    // Again, if both have the same sign (and neither one is 0),
    // no intersection is possible.
    if (d1 > 0 && d2 > 0) return NO;
    if (d1 < 0 && d2 < 0) return NO;

    // If we get here, only two possibilities are left. Either the two
    // vectors intersect in exactly one point or they are collinear, which
    // means they intersect in any number of points from zero to infinite.
    if ((a1 * b2) - (a2 * b1) == 0.0) {
        return COLLINEAR;
    }
    // If they are not collinear, they must intersect in exactly one point.
    return YES;
}



export {
    rotate,
    distance,
    delta,
    find_angle,
    normalize,
    crossing_segments,
    norm,
}
