'use client';

// FR-004 — event info line (mms_B2_Thông tin sự kiện). Frame wins on copy: the value here
// is the rendered frame's, not the stale spec/TC ID-14 draft (clarifications.md). The VI/EN
// strings are combined in `lib/i18n/dictionaries` as one line (Track B's dictionary scope
// note) so this component renders it as-is rather than re-splitting per locale.

import { useI18n } from '@/lib/i18n/locale-provider';

export function EventInfo() {
  const { t } = useI18n();

  return (
    <p className="max-w-2xl text-base font-bold text-white">{t('hero.eventInfo')}</p>
  );
}
