// A still, 1-bit version of a card's image in the mark's colors. No light, no motion: the image is
// dithered once with error diffusion, which keeps edges and text legible where a random threshold
// (the mark's noise) would turn a screenshot into static.

const DOT = 0xfff5f5f5; // rgb(245, 245, 245), little-endian ABGR
const TILE = 0xff0c0b0b; // rgb(11, 11, 12)

export function dither(media: HTMLElement, scale = 1) {
	const img = media.querySelector('img')!;
	const canvas = document.createElement('canvas');
	canvas.className = 'stipple';
	canvas.setAttribute('aria-hidden', 'true');
	media.style.position = 'relative';
	media.append(canvas);

	// Lazy images: decode() can settle before the image has loaded, so wait for load itself
	const loaded =
		img.complete && img.naturalWidth
			? Promise.resolve()
			: new Promise((r) => img.addEventListener('load', r, { once: true }));

	const draw = async () => {
		await loaded;
		await img.decode().catch(() => {});
		const w = Math.max(1, Math.round(media.clientWidth * scale));
		const h = Math.max(1, Math.round(media.clientHeight * scale));
		canvas.width = w;
		canvas.height = h;

		// Compose what the card shows: the plate tint (or black), then the image where it sits
		const src = new OffscreenCanvas(w, h).getContext('2d', { willReadFrequently: true })!;
		const bg = getComputedStyle(media).backgroundColor;
		src.fillStyle = bg === 'rgba(0, 0, 0, 0)' ? '#000' : bg;
		src.fillRect(0, 0, w, h);
		src.imageSmoothingEnabled = !img.classList.contains('pixel');
		const [dx, dy, dw, dh] = fit(img);
		src.drawImage(img, dx * scale, dy * scale, dw * scale, dh * scale);
		const data = src.getImageData(0, 0, w, h).data;

		const n = w * h;
		const lum = new Float32Array(n);
		for (let i = 0; i < n; i++) {
			const o = i * 4;
			lum[i] = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
		}
		levels(lum);
		sharpen(lum, w, h);

		// Atkinson: spreads only 3/4 of the error, so flat areas go clean black or white and
		// midtones get the open, airy dot pattern the mark has
		const ctx = canvas.getContext('2d')!;
		const out = ctx.createImageData(w, h);
		const px = new Uint32Array(out.data.buffer);
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const i = y * w + x;
				const on = lum[i] > 0.5;
				px[i] = on ? DOT : TILE;
				const e = ((on ? lum[i] - 1 : lum[i]) / 8);
				if (x + 1 < w) lum[i + 1] += e;
				if (x + 2 < w) lum[i + 2] += e;
				if (y + 1 < h) {
					if (x > 0) lum[i + w - 1] += e;
					lum[i + w] += e;
					if (x + 1 < w) lum[i + w + 1] += e;
				}
				if (y + 2 < h) lum[i + 2 * w] += e;
			}
		}
		ctx.putImageData(out, 0, 0);
	};

	// Fires once on observe, which does the first draw
	const ro = new ResizeObserver(() => draw());
	ro.observe(media);
	return () => {
		ro.disconnect();
		canvas.remove();
		media.style.position = '';
	};
}

/** Stretch the 1st–99th percentile to full range, so dim screenshots still use the whole dot range */
function levels(lum: Float32Array) {
	const hist = new Uint32Array(256);
	for (const l of lum) hist[Math.min(255, (l * 255) | 0)]++;
	const cut = lum.length * 0.01;
	let lo = 0,
		hi = 255,
		acc = 0;
	for (; lo < 255 && (acc += hist[lo]) < cut; lo++);
	acc = 0;
	for (; hi > 0 && (acc += hist[hi]) < cut; hi--);
	const a = lo / 255,
		range = Math.max((hi - lo) / 255, 0.2);
	for (let i = 0; i < lum.length; i++) lum[i] = Math.min(1, Math.max(0, (lum[i] - a) / range));
}

/** Unsharp mask, so soft midtone renders (sky against a sand-colored robot) keep their edges */
function sharpen(lum: Float32Array, w: number, h: number, amount = 0.8) {
	const src = lum.slice();
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
			const i = y * w + x;
			lum[i] = Math.min(1, Math.max(0, src[i] + amount * (src[i] - sum / c)));
		}
	}
}

/** Where object-fit and object-position put the image's pixels, relative to the media box */
export function fit(img: HTMLImageElement): [number, number, number, number] {
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
