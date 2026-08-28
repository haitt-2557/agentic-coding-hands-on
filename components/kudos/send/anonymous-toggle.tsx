'use client';

// FR-009, US007, BR-006 — "Gửi ẩn danh" checkbox (frame node I662:9637;520:14099, componentId
// 520:14090, "Checkbox Group Send anonymously") + "Nickname ẩn danh" reveal field. Default
// UNCHECKED (frame image happens to show the *checked* state — ID-6 requires the opposite
// default, called out in clarifications.md "Behaviour taken directly from ihQ26W78P2").
// Label text is the shorter "Gửi ẩn danh" (BR-006's own name for this control), not the frame's
// longer "Gửi lời cám ơn và ghi nhận ẩn danh" — see vi.ts's comment on this key for why (D9's
// literal `text=Gửi ẩn danh` locator does not substring-match the longer phrase).
//
// dom-contract.md:
// D9  — exactly ONE input[type="checkbox"], unchecked on load, visible label contains
//       "Gửi ẩn danh".
// D10 — the nickname <label> AND input stay in the DOM at all times, hidden via `hidden`/
//       display:none while unchecked (NOT conditional rendering — a test reads
//       `page.locator('label').allTextContents()` regardless of visibility).

import { useId } from 'react';
import { useI18n } from '@/lib/i18n/locale-provider';
import { FieldErrorText, fieldBorderClass } from './field-error-text';

interface AnonymousToggleProps {
  isAnonymous: boolean;
  nickname: string;
  nicknameError?: string;
  onToggleAnonymous: (checked: boolean) => void;
  onNicknameChange: (value: string) => void;
  onNicknameBlur: () => void;
}

export function AnonymousToggle({
  isAnonymous,
  nickname,
  nicknameError,
  onToggleAnonymous,
  onNicknameChange,
  onNicknameBlur,
}: AnonymousToggleProps) {
  const { t } = useI18n();
  const checkboxId = useId();
  const nicknameId = useId();

  return (
    // mm:I662:9637;520:14099
    <div className="flex w-full max-w-[672px] flex-col items-start gap-4">
      {/* mm:I662:9637;520:14099;520:16272 */}
      <label htmlFor={checkboxId} className="flex items-center gap-4 text-[22px] leading-7 font-bold text-background">
        {/* mm:I662:9637;520:14099;520:14087 */}
        <input
          id={checkboxId}
          type="checkbox"
          checked={isAnonymous}
          onChange={(event) => onToggleAnonymous(event.target.checked)}
          className="h-6 w-6 rounded border border-border-accent bg-white accent-border-accent"
        />
        {t('sendKudos.anonymousLabel')}
      </label>
      {/* mm:I662:9637;520:14099;520:16221 — Frame 533, row: label beside input, gap 16px,
          alignItems center. D10: always in the DOM, hidden via CSS when off */}
      <div className={`flex w-full max-w-[672px] items-center gap-4 ${isAnonymous ? '' : 'hidden'}`} hidden={!isAnonymous}>
        <label
          htmlFor={nicknameId}
          className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[22px] leading-7 font-bold text-background"
        >
          {t('sendKudos.nicknameLabel')}
          <span className="text-badge-danger">*</span>
        </label>
        <div className="flex flex-1 flex-col gap-2">
          {/* mm:I662:9637;520:14099;520:16223 */}
          <input
            id={nicknameId}
            type="text"
            value={nickname}
            placeholder={t('sendKudos.nicknamePlaceholder')}
            onChange={(event) => onNicknameChange(event.target.value)}
            onBlur={onNicknameBlur}
            className={`h-14 w-full rounded-lg border bg-white px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-background placeholder:text-muted-text focus:outline-none ${fieldBorderClass(Boolean(nicknameError))}`}
          />
          {nicknameError && <FieldErrorText text={nicknameError} />}
        </div>
      </div>
    </div>
  );
}
