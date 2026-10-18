import { expect, test, type Page } from '@playwright/test';

const personal = ['Travel Cost Estimator', 'Lightfall', 'Simple Snake', 'Simple Pong', 'Blender Donut'];
const university = [
	'Cheddar Chase',
	'Password Validator',
	'Bank Card Form',
	'Web Golf',
	'Global Illumination',
	'Course Picker',
	'Animated Short',
	'Procedural Planet',
	'Chatbot',
	'Particle System',
	'Curling Simulation',
	'Singing Game',
];
const featured = [
	'Travel Cost Estimator',
	'Lightfall',
	'Cheddar Chase',
	'Password Validator',
	'Bank Card Form',
	'Global Illumination',
	'Animated Short',
	'Web Golf',
	'Course Picker',
];

// Where each card's title takes you: the live project, or its code when there is nothing live
const primaryLinks: Record<string, string> = {
	'Travel Cost Estimator': 'https://travel-cost-estimator.vercel.app/',
	Lightfall: 'https://rasmussvala.itch.io/lightfall',
	'Simple Snake': 'https://rasmussvala.itch.io/simple-snake',
	'Simple Pong': 'https://rasmussvala.itch.io/simple-pong',
	'Blender Donut': 'https://youtube.com/shorts/pAsDB4-6lps',
	'Cheddar Chase': 'https://rasmussvala.itch.io/cheddar-chase',
	'Password Validator': 'https://www.npmjs.com/package/react-native-password-validator',
	'Bank Card Form': 'https://www.npmjs.com/package/react-native-bank-card-form',
	'Web Golf': 'https://webgolf.vercel.app/',
	'Global Illumination': 'https://github.com/rasmussvala/TNGC15-Global-Illumination',
	'Course Picker': 'https://litheval.vercel.app/',
	'Animated Short': 'https://youtu.be/ffHXlyJ5MhI',
	'Procedural Planet': 'https://proceduralplanet.vercel.app/',
	Chatbot: 'https://github.com/rasmussvala/TNM108-Machine-Learning-for-Social-Media/tree/main/Project',
	'Particle System': 'https://github.com/rasmussvala/TNM094-Particle-System',
	'Singing Game': 'https://spookypannkaka.itch.io/sjungande-phadderister',
};

const cardTitles = (page: Page) => page.getByRole('article').getByRole('heading', { level: 3 }).allInnerTexts();

const markPixels = (page: Page) => page.locator('rs-mark canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL());

test.beforeEach(async ({ page }) => {
	await page.goto('./');
});

test('intro shows name, role and the Today paragraphs', async ({ page }) => {
	await expect(page.getByRole('heading', { level: 1, name: 'Rasmus Svala' })).toBeVisible();
	await expect(page.getByText('Software Engineer', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();
	await expect(page.getByText(/^I write software for medical imaging at Sectra\./)).toBeVisible();
	await expect(page.getByText(/^Before that I studied Media Technology and Engineering \(M\.Sc\.\)/)).toBeVisible();
});

test('nav links to Work, GitHub and LinkedIn, and there is no footer', async ({ page }) => {
	const nav = page.getByRole('navigation', { name: 'Main' });
	await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '#work');
	await expect(nav.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/rasmussvala');
	await expect(nav.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
		'href',
		'https://www.linkedin.com/in/rasmus-svala/',
	);
	await expect(page.getByRole('link', { name: 'GitHub' })).toHaveCount(1);
	await expect(page.getByRole('contentinfo')).toHaveCount(0);
});

test('the filter shows counts and filters the grid', async ({ page }) => {
	const filter = page.getByRole('radiogroup', { name: 'Filter projects' });
	await expect(filter.getByRole('radio', { name: 'All 17' })).toBeChecked();
	await expect(filter.getByRole('radio', { name: 'Personal 5' })).toBeVisible();
	await expect(filter.getByRole('radio', { name: 'University 12' })).toBeVisible();

	expect((await cardTitles(page)).sort()).toEqual([...personal, ...university].sort());

	await filter.getByText('University').click();
	expect((await cardTitles(page)).sort()).toEqual([...university].sort());

	await filter.getByText('Personal').click();
	expect((await cardTitles(page)).sort()).toEqual([...personal].sort());

	await filter.getByText('All').click();
	await expect(page.getByRole('article')).toHaveCount(17);
});

test('the filter works with the keyboard', async ({ page }) => {
	const filter = page.getByRole('radiogroup', { name: 'Filter projects' });
	await filter.getByRole('radio', { name: 'All 17' }).focus();

	await page.keyboard.press('ArrowRight');
	await expect(filter.getByRole('radio', { name: 'Personal 5' })).toBeChecked();
	await expect(page.getByRole('article')).toHaveCount(5);

	await page.keyboard.press('ArrowRight');
	await expect(filter.getByRole('radio', { name: 'University 12' })).toBeChecked();
	await expect(page.getByRole('article')).toHaveCount(12);
});

test('featured projects come first', async ({ page }) => {
	const titles = await cardTitles(page);
	expect(titles.slice(0, featured.length).sort()).toEqual([...featured].sort());
});

test('each card links to its live project or its code', async ({ page }) => {
	for (const [title, href] of Object.entries(primaryLinks)) {
		const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
		await expect(card.getByRole('link', { name: title, exact: true })).toHaveAttribute('href', href);
	}

	// A card with both shows the code as a secondary link
	const travel = page.getByRole('article').filter({ hasText: 'Travel Cost Estimator' });
	await expect(travel.getByRole('link', { name: 'Code' })).toHaveAttribute(
		'href',
		'https://github.com/rasmussvala/Travel-Cost-Estimator',
	);

	const curling = page.getByRole('article').filter({ hasText: 'Curling Simulation' });
	await expect(curling.getByRole('heading', { name: 'Curling Simulation' })).toBeVisible();
	await expect(curling.getByRole('link')).toHaveCount(0);
});

test('every project image loads, and images below the fold are lazy', async ({ page }) => {
	const images = page.getByRole('article').locator('img');
	await expect(images).toHaveCount(17);

	const viewport = page.viewportSize()!.height;
	for (const img of await images.all()) {
		const top = await img.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
		if (top > viewport) await expect(img).toHaveAttribute('loading', 'lazy');
	}

	for (const img of await images.all()) {
		await img.scrollIntoViewIfNeeded();
		await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
	}
});

test('dragging the mark with a mouse moves its light', async ({ page }) => {
	const mark = page.locator('rs-mark');
	const box = (await mark.boundingBox())!;
	const before = await markPixels(page);

	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width, box.y + box.height, { steps: 8 });
	await page.mouse.up();

	await expect.poll(() => markPixels(page)).not.toBe(before);
});

test.describe('on a phone', () => {
	test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

	// Swipe up from a point, the way a finger scrolls the page
	const swipeUp = async (page: Page, x: number, y: number) => {
		const client = await page.context().newCDPSession(page);
		await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
		for (let i = 1; i <= 10; i++) {
			await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + i * 3, y: y - i * 20 }] });
		}
		await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	};

	test('dragging the mark moves its light without scrolling the page', async ({ page }) => {
		const box = (await page.locator('rs-mark').boundingBox())!;
		const before = await markPixels(page);

		await swipeUp(page, box.x + box.width / 2, box.y + box.height / 2);

		await expect.poll(() => markPixels(page)).not.toBe(before);
		expect(await page.evaluate(() => window.scrollY)).toBe(0);
	});

	test('dragging anywhere else scrolls the page', async ({ page }) => {
		await swipeUp(page, 200, 500);
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
	});

	test('there is no horizontal scroll', async ({ page }) => {
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow).toBe(0);
	});
});

test.describe('with reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('the page renders and the mark still responds', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1, name: 'Rasmus Svala' })).toBeVisible();
		await expect(page.getByRole('article')).toHaveCount(17);

		const box = (await page.locator('rs-mark').boundingBox())!;
		const before = await markPixels(page);
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.down();
		await page.mouse.move(box.x, box.y, { steps: 4 });
		await page.mouse.up();
		await expect.poll(() => markPixels(page)).not.toBe(before);
	});
});

test.describe('in dark mode', () => {
	test.use({ colorScheme: 'dark' });

	test('the page background is dark', async ({ page }) => {
		const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		expect(bg).toBe('rgb(0, 0, 0)');
	});
});

test('there are no console errors on load', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(e.message));
	await page.reload({ waitUntil: 'networkidle' });
	expect(errors).toEqual([]);
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('the grid and filter still work', async ({ page }) => {
		await expect(page.getByRole('article')).toHaveCount(17);
		await page.getByRole('radiogroup', { name: 'Filter projects' }).getByText('Personal').click();
		await expect(page.getByRole('article')).toHaveCount(5);
	});
});
