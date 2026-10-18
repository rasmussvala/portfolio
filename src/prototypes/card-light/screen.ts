// A still, full-color ordered dither, after the "dither screen" look: the image is resampled into
// chunky cells, then each channel is cut to a few levels against a Bayer matrix. The colors stay
// the image's own; what changes is the texture, a regular crosshatch in every gradient.
import { fit } from './dither';

// 4×4 Bayer thresholds, centered so they sit between two levels
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export interface ScreenOptions {
	/** CSS pixels per cell */
	cell: number;
	/** Levels per channel: 2 is harsh, 4 is retro, 6+ starts to look like the original */
	levels: number;
}

export function screen(media: HTMLElement, { cell, levels }: ScreenOptions) {
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
		const scale = 1 / cell;
		const w = Math.max(1, Math.ceil(media.clientWidth * scale));
		const h = Math.max(1, Math.ceil(media.clientHeight * scale));
		canvas.width = w;
		canvas.height = h;

		// Downsampling with smoothing averages each cell, like the filter's sampling
		const src = new OffscreenCanvas(w, h).getContext('2d', { willReadFrequently: true })!;
		const bg = getComputedStyle(media).backgroundColor;
		src.fillStyle = bg === 'rgba(0, 0, 0, 0)' ? '#000' : bg;
		src.fillRect(0, 0, w, h);
		src.imageSmoothingEnabled = !img.classList.contains('pixel');
		src.imageSmoothingQuality = 'high';
		const [dx, dy, dw, dh] = fit(img);
		src.drawImage(img, dx * scale, dy * scale, dw * scale, dh * scale);
		const image = src.getImageData(0, 0, w, h);
		const d = image.data;

		const steps = levels - 1;
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const t = BAYER[(y & 3) * 4 + (x & 3)];
				const o = (y * w + x) * 4;
				for (let c = 0; c < 3; c++) {
					const v = (d[o + c] / 255) * steps;
					const base = Math.floor(v);
					d[o + c] = (Math.min(steps, base + (v - base > t ? 1 : 0)) / steps) * 255;
				}
				d[o + 3] = 255;
			}
		}
		canvas.getContext('2d')!.putImageData(image, 0, 0);
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
