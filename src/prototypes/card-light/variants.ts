// Three answers to "give the project images the mark's effect". Each mounts onto every card's
// .media and returns a cleanup, so the picker can swap between them on the same grid.
import { Light } from './light';
import { Stipple } from './stipple';
import { dither } from './dither';
import { screen } from './screen';

type Cleanup = () => void;
const REST = { x: 0.22, y: 0.18 }; // top-left, where the mark's light rests
const local = (e: PointerEvent, el: Element) => {
	const r = el.getBoundingClientRect();
	return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
};
const medias = (root: ParentNode) => [...root.querySelectorAll<HTMLElement>('.card .media')];

/** 1 · Reveal: full color at rest, the card turns into the mark's dots while you point at it */
export function reveal(root: HTMLElement): Cleanup {
	root.dataset.effect = 'reveal';
	const offs: Cleanup[] = medias(root).map((media) => {
		const card = media.closest<HTMLElement>('.card')!;
		const st = new Stipple(media, { scale: Math.min(devicePixelRatio || 1, 2), ambient: 0.2, gain: 1.15, bump: 3, gamma: 0.9 });
		const light = new Light(REST.x, REST.y, () => st.draw(light.x, light.y));
		let prepared: Promise<void> | null = null;
		let inside = false;

		const enter = async (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			inside = true;
			prepared ??= st.prepare();
			await prepared;
			// The pointer may have left while the image was being prepared
			if (!inside) return;
			const p = local(e, media);
			light.jump(p.x, p.y);
			card.classList.add('lit');
		};
		const move = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse' || !st.ready) return;
			const p = local(e, media);
			light.to(p.x, p.y);
		};
		const leave = () => {
			inside = false;
			card.classList.remove('lit');
		};
		card.addEventListener('pointerenter', enter);
		card.addEventListener('pointermove', move);
		card.addEventListener('pointerleave', leave);
		return () => {
			card.removeEventListener('pointerenter', enter);
			card.removeEventListener('pointermove', move);
			card.removeEventListener('pointerleave', leave);
			card.classList.remove('lit');
			light.stop();
			st.destroy();
		};
	});
	return () => {
		offs.forEach((f) => f());
		delete root.dataset.effect;
	};
}

/** 2 · Gallery: every image is always dots, and one light follows the cursor across the whole page */
export function gallery(root: HTMLElement): Cleanup {
	root.dataset.effect = 'gallery';
	const items = medias(root).map((media) => {
		// 1x keeps a page full of live canvases inside the frame budget
		const st = new Stipple(media, { scale: 1, ambient: 0.26, gain: 1.1, bump: 3, gamma: 1.25 });
		const light = new Light(REST.x, REST.y, () => visible.has(media) && st.draw(light.x, light.y));
		st.prepare().then(() => st.draw(light.x, light.y));
		return { media, st, light };
	});

	const visible = new Set<Element>();
	const io = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (e.isIntersecting) {
				visible.add(e.target);
				const it = items.find((i) => i.media === e.target)!;
				it.st.draw(it.light.x, it.light.y);
			} else visible.delete(e.target);
		}
	});
	items.forEach((i) => io.observe(i.media));

	// The light is where the cursor is, so it sits over the card you point at and grazes its neighbours
	const move = (e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return;
		for (const it of items) {
			if (!visible.has(it.media)) continue;
			const p = local(e, it.media);
			it.light.to(Math.max(-0.6, Math.min(1.6, p.x)), Math.max(-0.6, Math.min(1.6, p.y)));
		}
	};
	window.addEventListener('pointermove', move, { passive: true });
	return () => {
		window.removeEventListener('pointermove', move);
		io.disconnect();
		items.forEach((i) => {
			i.light.stop();
			i.st.destroy();
		});
		delete root.dataset.effect;
	};
}

/** 3 · Sheen: the photo stays as is, the mark's light glides over it as a soft highlight */
export function sheen(root: HTMLElement): Cleanup {
	root.dataset.effect = 'sheen';
	const offs: Cleanup[] = medias(root).map((media) => {
		const card = media.closest<HTMLElement>('.card')!;
		media.style.position = 'relative';
		const layer = document.createElement('span');
		layer.className = 'sheen';
		layer.setAttribute('aria-hidden', 'true');
		layer.innerHTML = '<span class="glow"></span><span class="glint"></span>';
		media.append(layer);
		const glow = layer.firstElementChild as HTMLElement;
		const glint = layer.lastElementChild as HTMLElement;

		// Transform-only: the highlight layers are translated, never repainted
		const light = new Light(REST.x, REST.y, () => {
			const t = `translate3d(${light.x * media.clientWidth}px, ${light.y * media.clientHeight}px, 0)`;
			glow.style.transform = t;
			glint.style.transform = t;
		});
		light.onChange();

		const enter = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			const p = local(e, media);
			light.jump(p.x, p.y);
			card.classList.add('lit');
		};
		const move = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			const p = local(e, media);
			light.to(p.x, p.y);
		};
		const leave = () => {
			card.classList.remove('lit');
			light.to(REST.x, REST.y);
		};
		card.addEventListener('pointerenter', enter);
		card.addEventListener('pointermove', move);
		card.addEventListener('pointerleave', leave);
		return () => {
			card.removeEventListener('pointerenter', enter);
			card.removeEventListener('pointermove', move);
			card.removeEventListener('pointerleave', leave);
			card.classList.remove('lit');
			light.stop();
			layer.remove();
			media.style.position = '';
		};
	});
	return () => {
		offs.forEach((f) => f());
		delete root.dataset.effect;
	};
}

/** 4 · Dither: every image is a still 1-bit dither in the mark's colors. Nothing moves. */
export function still(root: HTMLElement): Cleanup {
	root.dataset.effect = 'dither';
	const offs = medias(root).map((media) => dither(media));
	return () => {
		offs.forEach((f) => f());
		delete root.dataset.effect;
	};
}

/** 5 · Screen: full color, cut into chunky cells and a few levels per channel with a Bayer screen */
export function color(root: HTMLElement): Cleanup {
	root.dataset.effect = 'screen';
	const offs = medias(root).map((media) => screen(media, { cell: 1, levels: 4 }));
	return () => {
		offs.forEach((f) => f());
		delete root.dataset.effect;
	};
}

export const variants = [reveal, gallery, sheen, still, color];
