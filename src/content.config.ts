import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
	loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string(),
				group: z.enum(['personal', 'university']),
				/** Game, Web, Graphics, Package, 3D, ML, Physics */
				kind: z.string(),
				year: z.number().int(),
				/** One line */
				blurb: z.string(),
				/** Course code for university work, e.g. TNCG15 */
				course: z.string().optional(),
				/** Extra context, e.g. "Game jam" or "Bachelor's thesis" */
				note: z.string().optional(),
				image: image().optional(),
				/**
				 * How the image is shown. 'bleed' fills the card (strong, art-directed images).
				 * 'plate' floats a screenshot on a tinted background (UI shots that look dated full-bleed).
				 */
				treatment: z.enum(['bleed', 'plate']).default('bleed'),
				/** Tint behind a 'plate' image */
				plate: z.string().optional(),
				/** object-position for bleed images that need a custom crop */
				focus: z.string().optional(),
				pixel: z.boolean().default(false),
				featured: z.boolean().default(false),
				links: z
					.object({
						live: z.url().optional(),
						code: z.url().optional(),
					})
					.default({}),
			})
			.refine((p) => p.treatment !== 'plate' || p.plate, {
				message: "A 'plate' image needs a plate color",
				path: ['plate'],
			}),
});

export const collections = { projects };
