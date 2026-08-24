'use client';

// FR-005/FR-006, US004, ALG-001 — 6 markdown-lite format buttons wrapping the message
// textarea's current selection (frame node I1612:5057;520:9877) + the "Tiêu chuẩn cộng đồng"
// link (node I1612:5057;3053:11619 — no spec row, no web frame; clarifications.md decision 5 /
// design defect #3: focusable trigger, destination deferred, F013 precedent).
//
// dom-contract.md D8 — exactly 6 toolbar buttons; the bold button's visible text contains a
// capital "B" AND carries aria-label="Bold"; no button earlier in DOM order on this page may
// contain a capital "B" — satisfied by field order (this toolbar renders before Hashtag/chips).
// No icon asset exists for these (componentSetId 178:1020 is a vector icon set with no
// mm_media_* export) — rendered as literal glyphs styled to hint at each transform, avoiding a
// new icon/editor dependency per clarifications decision 5 ("markdown-lite, no new dependency").

import Image from 'next/image';
import type { MarkdownKind } from '@/lib/kudos/send/validation';
import { useI18n } from '@/lib/i18n/locale-provider';

interface MessageToolbarProps {
  onFormat: (kind: MarkdownKind) => void;
}

const BUTTON_CLASS =
  'flex h-10 items-center justify-center gap-2 rounded-none border border-border-accent px-4 py-[10px] text-base leading-6 font-bold tracking-[0.15px] text-background hover:bg-kudos-message-tint';

export function MessageToolbar({ onFormat }: MessageToolbarProps) {
  const { t } = useI18n();

  return (
    // mm:I1612:5057;520:9877
    <div className="flex h-10 w-full items-center justify-end">
      {/* mm:I1612:5057;520:9881 */}
      <button
        type="button"
        aria-label={t('sendKudos.toolbarBoldLabel')}
        onClick={() => onFormat('bold')}
        className={`${BUTTON_CLASS} rounded-tl-lg font-bold`}
      >
        B
      </button>
      {/* mm:I1612:5057;662:11119 */}
      <button
        type="button"
        aria-label={t('sendKudos.toolbarItalicLabel')}
        onClick={() => onFormat('italic')}
        className={`${BUTTON_CLASS} italic`}
      >
        i
      </button>
      {/* mm:I1612:5057;662:11213 */}
      <button
        type="button"
        aria-label={t('sendKudos.toolbarStrikeLabel')}
        onClick={() => onFormat('strike')}
        className={`${BUTTON_CLASS} line-through`}
      >
        s
      </button>
      {/* mm:I1612:5057;662:10376 */}
      <button
        type="button"
        aria-label={t('sendKudos.toolbarNumberedListLabel')}
        onClick={() => onFormat('numberedList')}
        className={BUTTON_CLASS}
      >
        1.
      </button>
      {/* mm:I1612:5057;662:10507 */}
      <button
        type="button"
        aria-label={t('sendKudos.toolbarLinkLabel')}
        onClick={() => onFormat('link')}
        className={BUTTON_CLASS}
      >
        <Image src="/saa/Link.svg" alt="" width={20} height={20} aria-hidden="true" />
      </button>
      {/* mm:I1612:5057;662:10647 */}
      <button
        type="button"
        aria-label={t('sendKudos.toolbarQuoteLabel')}
        onClick={() => onFormat('quote')}
        className={BUTTON_CLASS}
      >
        &ldquo;
      </button>
      {/* mm:I1612:5057;3053:11619 — destination deferred, see file header */}
      <a
        href="#"
        onClick={(event) => event.preventDefault()}
        className="ml-2 w-[336px] rounded-tr-lg border border-border-accent px-4 py-[10px] text-right text-base leading-6 font-bold tracking-[0.15px] text-[#e46060] hover:underline"
      >
        {t('sendKudos.communityStandardsLink')}
      </a>
    </div>
  );
}
