import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

// Generic smoke test for every tool scaffolded from this template.
// The expected page title is derived from src/tool/tool.config.ts, so this
// test stays valid across tools without hard-coding a tool name.
function configuredToolName(): string {
  const cfg = readFileSync(join(process.cwd(), 'src/tool/tool.config.ts'), 'utf-8');
  const m = cfg.match(/name:\s*'([^']+)'/);
  return m ? m[1] : '';
}

test('tool loads with its configured title', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  await page.goto('/');
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
  const name = configuredToolName();
  if (name.length > 0) {
    expect(title).toContain(name);
  }
  expect(errors).toEqual([]);
});

test('tool renders main content area', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('toolbar')).toBeVisible();
});
