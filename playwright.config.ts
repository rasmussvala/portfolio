import { defineConfig, devices } from '@playwright/test';

const port = 4322;

// Tests run against the built site, served the way GitHub Pages serves it (under /portfolio/)
export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: `http://localhost:${port}/portfolio/`,
		trace: 'on-first-retry',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: `npm run build && npx astro preview --port ${port} --ignore-lock`,
		url: `http://localhost:${port}/portfolio/`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
