'use client';

// mms_B.4.4/C.4 (BR-001/BR-002/BR-007) — heart toggle, Copy Link and the highlight-only
// "Xem chi tiết" trigger (FR-016, deferred destination per clarifications.md "Triggers real,
// destinations deferred"). dom-contract.md F26/F27/F29/F30 are binding: the heart button's
// entire text content must be the count digits and nothing else (icon + label live outside the
// text node), aria-pressed is always present per this run's job card, and a rejected clipboard
// write must fail silently — no toast, no unhandled rejection.
//
// The toast is mounted here, one instance per card, rather than lifted to a page-level shell:
// kudos-card.tsx is required to stay hookless (server-renderable), so it cannot hold the
// message state itself, and lifting it into the 'use client' shell (kudos-board.tsx, Phase 5)
// is not needed — this mirrors the sibling decision already made for heart state ("nothing is
// lifted... lifting it would invite a shared-state bug the tests would not catch"). `onCopied`
// is still called on every successful copy so a caller may observe it if it ever needs to.

import { useState } from 'react';
import type { KudosRecord } from '@/lib/kudos/kudos-records';
import { formatHeartCount } from '@/lib/kudos/kudos-records';
import { KudosToast } from './kudos-toast';

const COPY_TOAST_MESSAGE = 'Link copied — ready to share!';

interface KudosCardActionsProps {
  record: KudosRecord;
  viewerId: string;
  showDetailButton: boolean;
  onCopied: (message: string) => void;
}

export function KudosCardActions({ record, viewerId, showDetailButton, onCopied }: KudosCardActionsProps) {
  const [liked, setLiked] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const isOwnKudos = record.senderId === viewerId;
  const displayedCount = record.heartCount + (liked ? 1 : 0);

  const heartLabel = isOwnKudos
    ? 'Không thể like kudos của chính bạn'
    : liked
      ? 'Bỏ tim kudos này (like)'
      : 'Thả tim kudos này (like)';

  async function handleCopy() {
    // `navigator.clipboard` is absent entirely on insecure origins and in some embedded
    // webviews. Optional-chaining it (`clipboard?.writeText`) meant `await undefined` resolved
    // cleanly, so the success toast fired while nothing had been copied — a false confirmation
    // telling the user their link was on the clipboard when it was not. Absence is handled the
    // same way as denial: silently, with no toast (BR-007).
    if (!navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/kudos#${record.id}`);
      setCopyMessage(COPY_TOAST_MESSAGE);
      onCopied(COPY_TOAST_MESSAGE);
    } catch {
      // BR-007: a denied clipboard permission must fail silently.
    }
  }

  return (
    <>
      {/* mm:335:9461 / mm:256:5194 */}
      <div className="flex w-full items-center justify-between gap-6">
        {/* mm:335:9463 + 335:9464 / mm:256:5175 + 256:5171 */}
        <button
          type="button"
          aria-label={heartLabel}
          aria-pressed={liked}
          disabled={isOwnKudos}
          onClick={() => setLiked((current) => !current)}
          className={`flex items-center gap-2 text-2xl leading-8 font-bold ${liked ? 'text-badge-danger' : 'text-muted-text'} disabled:cursor-not-allowed`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M12.3364 21.1076L10.8864 19.7876C5.73643 15.1176 2.33643 12.0276 2.33643 8.25757C2.33643 5.16757 4.75643 2.75757 7.83643 2.75757C9.57643 2.75757 11.2464 3.56757 12.3364 4.83757C13.4264 3.56757 15.0964 2.75757 16.8364 2.75757C19.9164 2.75757 22.3364 5.16757 22.3364 8.25757C22.3364 12.0276 18.9364 15.1176 13.7864 19.7876L12.3364 21.1076Z"
              fill="currentColor"
            />
          </svg>
          {formatHeartCount(displayedCount)}
        </button>
        <div className="flex items-center gap-6">
          {/* mm:335:9465 / mm:256:5216 */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 rounded p-4 text-base leading-6 font-bold tracking-[0.15px] text-background"
          >
            Copy Link
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M10.9619 13.1547C11.3719 13.5447 11.3719 14.1847 10.9619 14.5747C10.5719 14.9647 9.93189 14.9647 9.54189 14.5747C7.5919 12.6247 7.5919 9.4547 9.54189 7.5047L13.0819 3.9647C15.0319 2.0147 18.2019 2.0147 20.1519 3.9647C22.1019 5.9147 22.1019 9.0847 20.1519 11.0347L18.6619 12.5247C18.6719 11.7047 18.5419 10.8847 18.2619 10.1047L18.7319 9.6247C19.9119 8.4547 19.9119 6.5547 18.7319 5.3847C17.5619 4.2047 15.6619 4.2047 14.4919 5.3847L10.9619 8.9147C9.7819 10.0847 9.7819 11.9847 10.9619 13.1547ZM13.7819 8.9147C14.1719 8.5247 14.8119 8.5247 15.2019 8.9147C17.1519 10.8647 17.1519 14.0347 15.2019 15.9847L11.6619 19.5247C9.71189 21.4747 6.54189 21.4747 4.59189 19.5247C2.64189 17.5747 2.64189 14.4047 4.59189 12.4547L6.08189 10.9647C6.07189 11.7847 6.20189 12.6047 6.48189 13.3947L6.01189 13.8647C4.83189 15.0347 4.83189 16.9347 6.01189 18.1047C7.18189 19.2847 9.08189 19.2847 10.2519 18.1047L13.7819 14.5747C14.9619 13.4047 14.9619 11.5047 13.7819 10.3347C13.3719 9.9447 13.3719 9.3047 13.7819 8.9147Z"
                fill="currentColor"
              />
            </svg>
          </button>
          {showDetailButton && (
            // mm:335:9663
            <button
              type="button"
              className="flex items-center gap-2 rounded p-4 text-base leading-6 font-bold tracking-[0.15px] text-background"
            >
              Xem chi tiết
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <KudosToast message={copyMessage} />
    </>
  );
}
