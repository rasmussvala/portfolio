// A light position on the same critically damped spring as the mark (damping 1.0, response 0.4s).
// Coordinates are card-local: (0, 0) top-left, (1, 1) bottom-right.

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const W = (2 * Math.PI) / 0.4;

export class Light {
	x: number;
	y: number;
	vx = 0;
	vy = 0;
	tx: number;
	ty: number;
	onChange: () => void;

	constructor(x: number, y: number, onChange: () => void) {
		this.x = this.tx = x;
		this.y = this.ty = y;
		this.onChange = onChange;
	}

	/** Snap without animating, e.g. to where the pointer entered */
	jump(x: number, y: number) {
		this.x = this.tx = x;
		this.y = this.ty = y;
		this.vx = this.vy = 0;
		this.onChange();
	}

	to(x: number, y: number) {
		this.tx = x;
		this.ty = y;
		if (reduced.matches) return this.jump(x, y);
		active.add(this);
		if (!raf) {
			last = performance.now();
			raf = requestAnimationFrame(tick);
		}
	}

	step(dt: number) {
		const ax = -2 * W * this.vx - W * W * (this.x - this.tx);
		const ay = -2 * W * this.vy - W * W * (this.y - this.ty);
		this.vx += ax * dt;
		this.vy += ay * dt;
		this.x += this.vx * dt;
		this.y += this.vy * dt;
	}

	get settled() {
		return (
			Math.abs(this.x - this.tx) < 0.001 && Math.abs(this.y - this.ty) < 0.001 && Math.abs(this.vx) + Math.abs(this.vy) < 0.01
		);
	}

	stop() {
		active.delete(this);
	}
}

// One frame loop for every moving light
const active = new Set<Light>();
let raf = 0;
let last = 0;

function tick(now: number) {
	let remaining = Math.min((now - last) / 1000, 0.1);
	last = now;
	while (remaining > 0) {
		const dt = Math.min(remaining, 1 / 240);
		remaining -= dt;
		for (const l of active) l.step(dt);
	}
	for (const l of active) {
		l.onChange();
		if (l.settled) active.delete(l);
	}
	raf = active.size ? requestAnimationFrame(tick) : 0;
}
