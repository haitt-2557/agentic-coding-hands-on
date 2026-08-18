import type { Page } from '@playwright/test';

// Shared `beforeEach` for every "Homepage SAA - Valid Environment" spec file. The homepage
// reads its role/locale from localStorage before falling back to env defaults
// (lib/session/session-provider.tsx, lib/i18n/locale-provider.tsx), so each test starts from
// an explicitly seeded baseline rather than whatever a previous test happened to leave.
// Tests that need another role re-seed with their own `addInitScript`, which runs after this.
export async function seedDefaultSession({ page }: { page: Page }) {
  await page.addInitScript(() => {
    localStorage.setItem('saa.locale', 'vi');
    localStorage.setItem('saa.mock-role', 'guest');
    localStorage.setItem('saa.mock-unread', '0');
  });
}
