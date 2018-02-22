'use strict';

class LogoCanvas {
	// canvas = HTML5 canvas
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.ctx.lineWidth = 0.1;
		// turtle (0, 0)
		this.x = 0;
		this.y = 0;
		this.pendown = true;
		this.width = canvas.width;
		this.height = canvas.height;
		// center mapping
		this.cx = this.width / 2;
		this.cy = this.height / 2;
		// facing north, clock-wise
		this.angle = 0;
		this.error = '';
	}

	// error messages;
	getErr() {
		return this.error;
	}

	// turn right
	rt(ang) {
		this.angle += ang;
	}

	// turn left
	lt(ang) {
		this.rt(-ang);
	}

	// clear error
	clearError() {
		this.error = '';
	}

	// go home
	home() {
		this.moveTo(0, 0);
	}

	// go home and reset
	cs() {
		this.home();
		this.angle = 0;
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	// pen up
	pu() {
		this.pendown = false;
	}

	// pen down
	pd() {
		this.pendown = true;
	}

	// move forward
	fd(len) {		
		let x = this.x;
		let y = this.y;
		let a = this.angle * Math.PI / 180;
		let sx = len * Math.sin(a);
		let sy = len * Math.cos(a);
		this.moveTo(x + sx, y - sy);
	}

	// draw a line
	draw(x1, y1, x2, y2) {
		this.ctx.moveTo(x1 + this.cx, this.cy + y1);
		this.ctx.lineTo(x2 + this.cx, this.cy + y2);
		this.ctx.stroke();
	}

	// drawto
	drawTo(x2, y2) {
		this.draw(this.x, this.y, x2, y2);
	}

	// move backward
	bk(x) {
		this.fd(-x);
	}

	// moveTo
	moveTo(nx, ny) {
		let ox = nx + this.cx;
		let oy = ny + this.cy;
		ox = ox % this.width;
		oy = oy % this.height;
		nx = ox - this.cx;
		ny = oy - this.cy;
		if (this.pendown) {
			this.drawTo(nx, ny)
		}
		this.x = nx;
		this.y = ny;
	}

	// get x
	getX() {
		return this.x;
	} 

	// set x
	setX(v) {
		this.x = v;
	}

	// get y
	getY() {
		return this.y;
	}

	// set y
	setY(v) {
		this.y = v;
	}

	// pendown
	isPendown() {
		return this.pendown;
	}

	// width
	getWidth() {
		return this.width;
	}

	// height
	getHeight() {
		return this.height;
	}

	// angle
	getAngle() {
		return this.angle;
	}
}