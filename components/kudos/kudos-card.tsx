// mms_B.3/B.4/C.3/C.4 (design/kudos-content.md §3.3, §5.3–§5.4) — the shared card shell for
// both the HIGHLIGHT carousel and the ALL KUDOS feed (dom-contract.md §12 seam; Phase 5 and
// Phase 7 both compose this). One component, a `variant` prop, zero forked files (phase-04 Risk
// Assessment row 4). Message text is a prop of the record, never derived from `record.variant`
// — that field only documents which department spelling a record was transcribed from
// (design defect #15) and is not a reliable renderer switch (job card, second callout).
// Stays hookless/server-renderable — all interactivity lives in the client children below.

import Image from 'next/image';
import type { KudosRecord } from '@/lib/kudos/kudos-records';
import { KudosCardPeople } from './kudos-card-people';
import { KudosCardActions } from './kudos-card-actions';
import { KudosHashtagRow } from './kudos-hashtag-row';

interface KudosCardProps {
  record: KudosRecord;
  variant: 'highlight' | 'post';
  viewerId: string;
  onHashtagClick: (hashtag: string) => void;
}

const NOOP_ON_COPIED = () => {};

export function KudosCard({ record, variant, viewerId, onHashtagClick }: KudosCardProps) {
  const isHighlight = variant === 'highlight';
  const message = isHighlight ? record.highlightMessage : record.message;

  return (
    // mm:2940:13465 (highlight) / mm:3127:21871 (post)
    <article
      className={
        isHighlight
          ? 'flex w-full max-w-[528px] flex-col gap-4 rounded-2xl border-4 border-accent bg-kudos-card-ground pt-6 px-6 pb-4'
          // `min-h`, not `h`. 749px is the frame's post-card height at 1440, where the card is
          // 680px wide and the content fits it exactly — so `min-h-[749px]` still resolves to
          // exactly 749px there and desktop stays pixel-identical. A hard `h-[749px]` broke once
          // the attachment row gained `flex-wrap`: at narrow widths the thumbnails take two rows
          // and the message body wraps to more lines, so content exceeded the fixed height,
          // overflowed the flex container, and painted over the action bar — which intercepted
          // pointer events and made the heart and Copy Link buttons unclickable (TC 7a7ec63e,
          // 0adfd7ce) even though they were rendered and visible.
          : 'flex min-h-[749px] w-full max-w-[680px] flex-col gap-4 rounded-3xl bg-kudos-card-ground pt-10 px-10 pb-4'
      }
    >
      {/* mm:335:9442 / mm:256:4857 */}
      <KudosCardPeople record={record} />
      {/* mm:335:9447 / mm:256:5192 */}
      <div className="h-px w-full bg-accent" />
      {/* mm:335:9448 / mm:256:5645 */}
      <div className="flex w-full flex-1 flex-col items-end gap-4">
        {/* mm:335:9449 / mm:256:5229 */}
        <p className="w-full text-left text-base leading-6 font-bold tracking-[0.5px] text-muted-text">
          {record.timestamp}
        </p>
        {isHighlight ? (
          // mm:1810:19718
          <p className="w-full text-center text-base leading-6 font-bold tracking-[0.5px] text-background">
            {record.category}
          </p>
        ) : (
          // mm:2234:33038
          <div className="flex w-full items-center justify-between">
            {/* mm:2234:33039 */}
            <p className="flex-1 text-center text-base leading-6 font-bold tracking-[0.5px] text-background">
              {record.category}
            </p>
            {/* mm:2234:33040 */}
            <Image src="/saa/Pen.svg" alt="" width={32} height={32} aria-hidden="true" />
          </div>
        )}
        {/* mm:662:12221 / mm:662:11382 */}
        <div className="w-full rounded-xl border border-accent bg-kudos-message-tint px-6 py-4">
          {/* mm:662:12223 / mm:256:5156 */}
          <p
            className={`text-justify text-xl leading-8 font-bold text-background ${isHighlight ? 'line-clamp-3' : 'line-clamp-5'}`}
          >
            {message}
          </p>
        </div>
        {!isHighlight && (
          // mm:256:5176
          <div className="flex w-full flex-wrap items-center gap-4">
            {record.attachments.map((attachment, index) => (
              // mm:256:5177..256:5181
              <div
                key={`${record.id}-attachment-${index}`}
                className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[18px] border border-border-accent bg-white"
              >
                <Image src={attachment} alt="" width={88} height={88} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
        {/* mm:335:9459 / mm:256:5158 */}
        <KudosHashtagRow hashtags={record.hashtags} onHashtagClick={onHashtagClick} />
      </div>
      {/* mm:335:9460 / mm:256:7496 */}
      <div className="h-px w-full bg-accent" />
      {/* mm:335:9461 / mm:256:5194 */}
      <KudosCardActions
        record={record}
        viewerId={viewerId}
        showDetailButton={isHighlight}
        onCopied={NOOP_ON_COPIED}
      />
    </article>
  );
}
