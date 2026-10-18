// Redraws a card's image the way the mark draws its planet: 1-bit dots on a dark tile, thresholded
// against static noise, lit by a point light. The photo has no 3D shape, so its luminance becomes
// both the albedo and a bump map (normals from the brightness gradient), which is what makes the
// light rake across edges instead of just brightening a circle.

export interface StippleOptions {
	/** Device pixels per CSS pixel. 2 matches the mark on retina; 1 is four times cheaper. */
	scale: number;
	/** Light that reaches everywhere, so the image stays readable away from the light */
	ambient: number;
	/** Strength of the point light */
	gain: number;
	/** Height of the bump map: 0 is flat, higher rakes harder across edges */
	bump: number;
	/** Tone curve on the image's luminance: below 1 lifts shadows, above 1 deepens them */
	gamma: number;
}

const DOT = 0xfff5f5f5; // rgb(245, 245, 245), little-endian ABGR
const TILE = 0xff0c0b0b; // rgb(11, 11, 12)

export class Stipple {
	media: HTMLElement;
	img: HTMLImageElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	opts: StippleOptions;
	w = 0;
	h = 0;
	albedo = new Float32Array(0);
	nx = new Float32Array(0);
	ny = new Float32Array(0);
	nz = new Float32Array(0);
	noise = new Float32Array(0);
	out!: ImageData;
	px!: Uint32Array;
	ready = false;

	constructor(media: HTMLElement, opts: StippleOptions) {
		this.media = media;
		this.img = media.querySelector('img')!;
		this.opts = opts;
		this.canvas = document.createElement('canvas');
		this.canvas.className = 'stipple';
		this.canvas.setAttribute('aria-hidden', 'true');
		this.ctx = this.canvas.getContext('2d')!;
		media.style.position = 'relative';
		media.append(this.canvas);
	}

	async prepare() {
		const { img, media, opts } = this;
		// Lazy images: decode() can settle before the image has loaded, so wait for load itself
		if (!img.complete || !img.naturalWidth) await new Promise((r) => img.addEventListener('load', r, { once: true }));
		await img.decode().catch(() => {});
		const cw = media.clientWidth;
		const ch = media.clientHeight;
		const w = Math.max(1, Math.round(cw * opts.scale));
		const h = Math.max(1, Math.round(ch * opts.scale));
		this.w = this.canvas.width = w;
		this.h = this.canvas.height = h;

		// Compose what the card shows: the plate tint (or black), then the image where it sits
		const src = new OffscreenCanvas(w, h).getContext('2d', { willReadFrequently: true })!;
		const bg = getComputedStyle(media).backgroundColor;
		src.fillStyle = bg === 'rgba(0, 0, 0, 0)' ? '#000' : bg;
		src.fillRect(0, 0, w, h);
		src.imageSmoothingEnabled = !img.classList.contains('pixel');
		const [dx, dy, dw, dh] = fit(img);
		src.drawImage(img, dx * opts.scale, dy * opts.scale, dw * opts.scale, dh * opts.scale);
		const data = src.getImageData(0, 0, w, h).data;

		const n = w * h;
		const lum = new Float32Array(n);
		for (let i = 0; i < n; i++) {
			const o = i * 4;
			const l = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
			lum[i] = Math.pow(l, opts.gamma);
		}

		// Normals from a Sobel gradient of a lightly blurred luminance
		const soft = blur(lum, w, h);
		this.albedo = lum;
		this.nx = new Float32Array(n);
		this.ny = new Float32Array(n);
		this.nz = new Float32Array(n);
		const k = opts.bump * opts.scale;
		for (let y = 0; y < h; y++) {
			const y0 = Math.max(y - 1, 0) * w,
				y1 = y * w,
				y2 = Math.min(y + 1, h - 1) * w;
			for (let x = 0; x < w; x++) {
				const x0 = Math.max(x - 1, 0),
					x2 = Math.min(x + 1, w - 1);
				const gx = soft[y0 + x2] + 2 * soft[y1 + x2] + soft[y2 + x2] - soft[y0 + x0] - 2 * soft[y1 + x0] - soft[y2 + x0];
				const gy = soft[y2 + x0] + 2 * soft[y2 + x] + soft[y2 + x2] - soft[y0 + x0] - 2 * soft[y0 + x] - soft[y0 + x2];
				const ax = -gx * k,
					ay = -gy * k;
				const len = Math.hypot(ax, ay, 1);
				const i = y1 + x;
				this.nx[i] = ax / len;
				this.ny[i] = ay / len;
				this.nz[i] = 1 / len;
			}
		}

		// Static noise as the dither threshold, so dots never shimmer
		this.noise = new Float32Array(n);
		for (let i = 0; i < n; i++) this.noise[i] = Math.random();
		this.out = this.ctx.createImageData(w, h);
		this.px = new Uint32Array(this.out.data.buffer);
		this.ready = true;
	}

	/** Light at card-local (u, v), where (0, 0) is top-left and (1, 1) bottom-right */
	draw(u: number, v: number) {
		if (!this.ready) return;
		const { w, h, albedo, nx, ny, nz, noise, px } = this;
		const { ambient, gain } = this.opts;
		const inv = 1 / h; // distances in card heights, so the falloff doesn't depend on size
		const lxp = u * w,
			lyp = v * h;
		const lh = 0.55,
			lh2 = lh * lh;

		for (let y = 0; y < h; y++) {
			const dy = (lyp - y) * inv;
			const dy2 = dy * dy;
			let i = y * w;
			for (let x = 0; x < w; x++, i++) {
				const dx = (lxp - x) * inv;
				const d2 = dx * dx + dy2;
				const il = 1 / Math.sqrt(d2 + lh2);
				const lx = dx * il,
					ly = dy * il,
					lz = lh * il;
				const a = albedo[i];
				const ndl = nx[i] * lx + ny[i] * ly + nz[i] * lz;
				const fall = 1 / (1 + 2.2 * d2);
				// Blinn-Phong highlight toward a viewer straight in front
				const hz = lz + 1;
				const ih = 1 / Math.sqrt(lx * lx + ly * ly + hz * hz);
				let s = (nx[i] * lx + ny[i] * ly + nz[i] * hz) * ih;
				s = s > 0 ? s : 0;
				s *= s;
				s *= s;
				s *= s;
				s *= s;
				s *= s; // ^32
				const intensity = a * (ambient + gain * (ndl > 0 ? ndl : 0) * fall) + 0.45 * s * fall * (0.25 + 0.75 * a);
				px[i] = intensity > noise[i] ? DOT : TILE;
			}
		}
		this.ctx.putImageData(this.out, 0, 0);
	}

	destroy() {
		this.canvas.remove();
		this.media.style.position = '';
	}
}

/** Where object-fit and object-position put the image's pixels, relative to the media box */
function fit(img: HTMLImageElement): [number, number, number, number] {
	const cs = getComputedStyle(img);
	const bw = img.offsetWidth,
		bh = img.offsetHeight;
	const nw = img.naturalWidth || bw,
		nh = img.naturalHeight || bh;
	let dw = bw,
		dh = bh;
	if (cs.objectFit === 'cover' || cs.objectFit === 'contain') {
		const s = cs.objectFit === 'cover' ? Math.max(bw / nw, bh / nh) : Math.min(bw / nw, bh / nh);
		dw = nw * s;
		dh = nh * s;
	}
	const [px, py] = cs.objectPosition.split(' ').map((p) => (p.endsWith('%') ? parseFloat(p) / 100 : NaN));
	const ox = (bw - dw) * (Number.isNaN(px) ? 0.5 : px);
	const oy = (bh - dh) * (Number.isNaN(py) ? 0.5 : py);
	return [img.offsetLeft + ox, img.offsetTop + oy, dw, dh];
}

/** 3×3 box blur, so the bump map follows shapes rather than JPEG noise */
function blur(src: Float32Array, w: number, h: number) {
	const out = new Float32Array(src.length);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			let sum = 0,
				c = 0;
			for (let j = -1; j <= 1; j++) {
				const yy = y + j;
				if (yy < 0 || yy >= h) continue;
				for (let k = -1; k <= 1; k++) {
					const xx = x + k;
					if (xx < 0 || xx >= w) continue;
					sum += src[yy * w + xx];
					c++;
				}
			}
			out[y * w + x] = sum / c;
		}
	}
	return out;
}
