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
		// normal pen
		this.penmode = 'pen';
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

	// eraser
	eraser() {
		this.penmode = 'eraser';
		this.ctx.globalCompositeOperation = "destination-out";
	}

	pen() {
		this.penmode = 'pen';
		this.ctx.globalCompositeOperation = "source-over";
	}

	getPenMode() {
		return this.penmode;
	}

	// set screen color
	setScreenColor(c) {
		this.ctx.fillStyle = c;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	// set line color
	setLineColor(c) {
		this.lineColor = c;
		this.ctx.strokeStyle = this.lineColor;		
	}

	// set line width
	setLineWidth(c) {
		this.lineWidth = c;
		this.ctx.lineWidth = this.lineWidth;		
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
		this.setAngle(0);
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

	// set pen color, old compatability
	setPc(x) {
		switch (x) {
			case 0: this.setLineColor("black"); break;
			case 1: this.setLineColor("blue"); break;
			case 2: this.setLineColor("green"); break;
			case 3: this.setLineColor("cyan"); break;
			case 4: this.setLineColor("red"); break;
			case 5: this.setLineColor("magenta"); break;
			case 6: this.setLineColor("yellow"); break;
			case 7: this.setLineColor("white"); break;
			case 8: this.setLineColor("brown"); break;
			case 9: this.setLineColor("rgb(197,136,18)"); break;
			case 10: this.setLineColor("rgb(100,162,64)"); break;
			case 11: this.setLineColor("rgb(120,87,187)"); break;
			case 12: this.setLineColor("rgb(255,149,119)"); break;
			case 13: this.setLineColor("rgb(144,113,208)"); break;
			case 14: this.setLineColor("rgb(255,163,0)"); break;
			case 15: this.setLineColor("rgb(183,183,183)"); break;			
		}
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
		this.ctx.beginPath();
		this.ctx.fillRect(x + this.cx, y + this.cy, this.lineWidth, this.lineWidth);
		this.ctx.stroke();
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

	_equalPixel(a, b) {
		return ((a[0] == b[0]) && (a[1] == b[1]) && (a[2] == b[2]) && (a[3] == b[3]));
	}

	// draw a line
	draw(x1, y1, x2, y2) {
		this.ctx.beginPath();
		if (this.penmode == 'pen') {
			this.ctx.globalCompositeOperation = "source-over";
			this.ctx.strokeStyle = this.lineColor;
		} else {
			this.ctx.globalCompositeOperation = "destination-out";
		}		
		this.ctx.lineWidth = this.lineWidth;
		this.ctx.moveTo(x1 + this.cx, this.cy + y1);
		this.ctx.lineTo(x2 + this.cx, this.cy + y2);
		this.ctx.stroke();
	}

	// fill rec
	fillRec(width, height) {
		let xx, yy;
		xx = this.cx + this.x;
		yy = this.cy + this.y;
		this.ctx.fillStyle = this.lineColor;
		this.ctx.fillRect(xx, yy, width, height);
	}

	// wait in milliseconds
	async wait(ms) {
		await sleep(ms);
	}

	square(width) {
		this.fillRec(width, width);
	}

	// fill from current pixel
	fill() {
		let _x = this.x + this.cx;
		let _y = this.y + this.cy;
		let p = this.ctx.getImageData(_x, _y, 1, 1);
		let q = new Queue();
		let c;
		q.enqueue({x: _x, y: _y});			
		while (!q.isEmpty()) {
			let cur = q.dequeue();
			this.dotxy(cur.x - this.cx, cur.y - this.cy);
			if (cur.x > 0) {
				c = this.ctx.getImageData(cur.x - 1, cur.y, 1, 1);
				if (this._equalPixel(c, p)) {
					q.enqueue({x: cur.x - 1, y: cur.y});
				}
			}
			if (cur.x < this.width) {
				c = this.ctx.getImageData(cur.x + 1, cur.y, 1, 1);
				if (this._equalPixel(c, p)) {
					q.enqueue({x: cur.x + 1, y: cur.y});
				}
			}			
			if (cur.y < this.height) {
				c = this.ctx.getImageData(cur.x, cur.y + 1, 1, 1);
				if (this._equalPixel(c, p)) {
					q.enqueue({x: cur.x, y: cur.y + 1});
				}
			}	
			if (cur.y > 0) {
				c = this.ctx.getImageData(cur.x, cur.y - 1, 1, 1);
				if (this._equalPixel(c, p)) {
					q.enqueue({x: cur.x, y: cur.y - 1});
				}
			}					
		}
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
			this.drawTo(nx, ny);
		}
		this.x = nx;
		this.y = ny;
		this.setTurtle(this.x, this.y);
	}

	// setX
	moveToX(nx) {
		if (this.pendown) {
			this.drawTo(nx, this.y);
		}
		this.x = nx;
		this.setTurtle(this.x, this.y);
	}

	// setX
	moveToY(ny) {
		if (this.pendown) {
			this.drawTo(this.x, ny);
		}
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

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = {
		LogoCanvas
	}
}
