const min_dim = (context) => {
    return Math.min(context.canvas.width, context.canvas.height)
}


class Graphics {
    constructor(canvas_id) {
        this.canvas_id = canvas_id;
        this.context = document.getElementById(canvas_id).getContext("2d")
        this.draw_center = [0, 0]
        this.draw_zoom = 1.0
    }
    resize_canvas() {
        this.context.canvas.width = window.innerWidth 
        this.context.canvas.height = window.innerHeight 
    }
    context_coordinates_2(p) {
        return {
            x: ((p.x - (this.context.canvas.width - min_dim(this.context))*0.5) / min_dim(this.context) - 0.5) / this.draw_zoom + this.draw_center[0],
            y: ((p.y - this.context.canvas.height + (this.context.canvas.height - min_dim(this.context))*0.5) / min_dim(this.context) * (-1) - 0.5) / this.draw_zoom + this.draw_center[1]
        }
    }
    line (p1, p2, color, line_width) {
        const context = this.context
        const cc1 = this.context_coordinates( p1)
        const cc2 = this.context_coordinates( p2)
        context.beginPath();
        context.moveTo(cc1.x, cc1.y);
        context.lineTo(cc2.x, cc2.y);
        context.strokeStyle = color;
        context.lineWidth = line_width?line_width:2;
        context.stroke();
    }
    clear = () => {
        this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height)
    }
    clear_partial = () => {
        // this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height)
        this.context.fillStyle = '#00000010';
        this.context.fillRect(0,0,this.context.canvas.width, this.context.canvas.height);
    }
    context_coordinates = (p) => {
        const context = this.context
        const draw_center = this.draw_center
        const draw_zoom = this.draw_zoom
        return {
            x: min_dim(context) * ((p.x - draw_center[0]) * draw_zoom + 0.5) + (context.canvas.width - min_dim(context))*0.5,
            y: context.canvas.height - min_dim(context) * ((p.y - draw_center[1]) * draw_zoom + 0.5) - (context.canvas.height - min_dim(context))*0.5,
        }
    }
    fill_circle (p, diameter, color) {
        const context = this.context
        const cc = this.context_coordinates(p)
        const radius = diameter * min_dim(context) * 0.5 * this.draw_zoom;
        context.beginPath();
        context.arc(cc.x, cc.y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
    }
    text (p, txt) {
        const context = this.context
        context.font = "12px Arial";
        const cc = this.context_coordinates(p)
        context.fillStyle = "#eee";
        context.fillText(txt, cc.x, cc.y); 
        context.font = "11px Arial";
        // const cc = context_coordinates(context, p)
        // context.fillStyle = "#222";
        // context.fillText(txt, cc.x, cc.y); 
    }
}


export {
    Graphics,
}
