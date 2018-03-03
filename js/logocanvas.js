'use strict';

class LogoCanvas {
	// canvas = HTML5 canvas
	constructor(canvas, turtle) {
		this.turtle = turtle;
		this.canvas = canvas;
		let pos = cumulativeOffset(this.canvas);
		this.canvas_left = pos.left + $(turtle).width() / 1.5;
		this.canvas_top = pos.top - $(turtle).height() * 2 - 3;
		this.ctx = canvas.getContext("2d");
		this.lineWidth = 1;
		this.lineColor = "black";
		this.ctx.lineWidth = this.lineWidth;
		this.ctx.strokeStyle = this.lineColor;
		// turtle (0, 0)
		this.x = 0;
		this.y = 0;
		this.fontsize = 20;
		this.ctx.font = "20px Arial";
		this.pendown = true;
		this.width = canvas.width;
		this.height = canvas.height;
		// center mapping
		this.cx = this.width / 2;
		this.cy = this.height / 2;
		// facing north, clock-wise
		this.angle = 0;
		this.error = '';
		this.setTurtle(0, 0);
		this.setTurtleAngle(this.angle);
	}

	// error messages;
	getErr() {
		return this.error;
	}

	// absolute angle
	setAngle(ang) {
		this.angle = ang;
		this.setTurtleAngle(this.angle);
	}

	// turn right
	rt(ang) {
		this.angle += ang;
		this.setTurtleAngle(this.angle);
	}

	// turn left
	lt(ang) {
		this.rt(-ang);
		this.setTurtleAngle(this.angle);
	}

	// set screen color
	setScreenColor(c) {
		this.ctx.fillStyle = c;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	// set line color
	setLineColor(c) {
		this.lineColor = c;
	}

	// set line width
	setLineWidth(c) {
		this.lineWidth = c;
	}

	// get line color
	getLineColor() {
		return this.lineColor;
	}

	// get line width
	getLineWidth() {
		return this.lineWidth;
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
		this.setTurtleAngle(this.angle);
	}

	// set turtle
	setTurtle(x, y) {
		this.turtle.css("left", this.canvas_left + x + this.cx);
		this.turtle.css("top", this.canvas_top + y + this.cy);
		this.setTurtleAngle(this.angle);
	}

	// drawText
	drawText(text) {
		if (this.pendown) {
			this.ctx.save();
			this.ctx.translate(this.x + this.cx, this.y + this.cy);
			this.ctx.rotate(this.angle * Math.PI / 180);
			this.ctx.textAlign = 'left';
			this.ctx.font = this.fontsize + "px Arial";		
			this.ctx.fillStyle = this.getLineColor();
			this.ctx.fillText(text, 0, 10);
			this.ctx.restore();
		}
	}

	// set turtle angle
	setTurtleAngle(ang) {
	    this.turtle.css({
	        "-webkit-transform": "rotate(" + ang + "deg)",
	        "-moz-transform": "rotate(" + ang + "deg)",
	        "transform": "rotate(" + ang + "deg)" /* For modern browsers(CSS3)  */
	    });				
	}

	// set font size
	setFontSize(x) {
		this.fontsize = x;
		this.ctx.font = x + "px Arial";
	}

	// get font size
	getFontSize() {
		return this.fontsize;
	}

	// show turtle
	st() {
		this.turtle.show();
	}

	// hide turtle
	ht() {
		this.turtle.hide();	
	}

	// draw a dot
	dot() {
		this.dotxy(this.x, this.y);
	}

	// draw a dot at (x, y)
	dotxy(x, y) {
		this.ctx.fillRect(x + this.cx, y + this.cy, this.lineWidth, this.lineWidth);
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

	// circle
	circle(r) {		
		let x = this.x + this.cx;
		let y = this.y + this.cy;
		this.ctx.beginPath();
		this.ctx.arc(x, y, r, 0, Math.PI * 2, true);
		this.ctx.stroke();
	}	

	// draw a line
	draw(x1, y1, x2, y2) {
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.lineColor;
		this.ctx.lineWidth = this.lineWidth;
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
		if (this.pendown) {
			this.drawTo(nx, ny)
		}
		this.x = nx;
		this.y = ny;
		this.setTurtle(this.x, this.y);
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