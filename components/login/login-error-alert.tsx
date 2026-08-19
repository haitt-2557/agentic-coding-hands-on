'use client';

// Login error alert — `role="alert"` rendered directly below the button. The frame
// draws no error region (design defect #2, clarifications.md); the copy itself is
// fixed by spec item 2.2.1's validationNote and asserted character-for-character by
// the E2E (accessible-name freeze, plan.md).
// mm:spec-2.2.1

import { useI18n } from '@/lib/i18n/locale-provider';

export function LoginErrorAlert() {
  const { t } = useI18n();

  return (
    <p role="alert" className="text-sm font-bold text-badge-danger">
      {t('login.error')}
    </p>
  );
}
