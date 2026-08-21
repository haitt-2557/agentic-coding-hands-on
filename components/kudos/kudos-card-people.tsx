// mms_B.3.1/B.3.2/B.3.5/B.3.6 (design/kudos-content.md §3.3, §5.3) — sender ⇄ receiver identity
// block shared by both card variants. Stays hookless/server-renderable per the phase overview;
// the only interactive piece (the star-tier tooltip) is delegated to its own client child.
// Avatars and names are focusable triggers that navigate nowhere yet (FR-017, clarifications
// "Triggers real, destinations deferred" — the profile page has no frame of its own to build).
// Badge pills are raster artwork behind live text (design defect #18): New Hero has no exported
// artwork (media map entry is null) and renders on the `--new-hero-ground` token instead
// (clarifications second pass). Super Hero's duplicate `Super ` text layer is dropped —
// only "Super Hero" is ever rendered (design defect #16).

import Image from 'next/image';
import type { KudosRecord } from '@/lib/kudos/kudos-records';
import { StarTierTooltip } from './star-tier-tooltip';

const BADGE_ASSET: Record<string, string | null> = {
  'New Hero': null,
  'Rising Hero': '/saa/Badge_Rising_Hero.png',
  'Super Hero': '/saa/Badge_Super_Hero.png',
  'Legend Hero': '/saa/Badge_Legend_Hero.png',
};

function BadgePill({ badge }: { badge: string }) {
  const asset = BADGE_ASSET[badge] ?? null;
  return (
    // mm:335:9443;3106:17694 / mm:335:9446;3106:17694
    <div
      className={`relative h-[19px] w-[109px] shrink-0 overflow-hidden rounded-badge border-[0.5px] border-accent ${asset ? '' : 'bg-new-hero-ground'}`}
    >
      {asset && <Image src={asset} alt="" fill className="object-cover" />}
      <span className="absolute inset-0 flex items-center justify-center text-[11px] leading-none font-bold text-white [text-shadow:0_1px_1.5px_#000]">
        {badge}
      </span>
    </div>
  );
}

interface PersonBlockProps {
  name: string;
  dept: string;
  badge: string;
  kudosReceived: number;
  avatarSrc: string;
}

function PersonBlock({ name, dept, badge, kudosReceived, avatarSrc }: PersonBlockProps) {
  return (
    <div className="flex w-full min-w-0 max-w-[235px] flex-col items-center gap-2">
      {/* mm:335:9443;256:4734 / mm:335:9446;256:4734 */}
      <button
        type="button"
        className="block h-16 w-16 shrink-0 overflow-hidden rounded-full border-[1.869px] border-foreground"
      >
        <Image src={avatarSrc} alt="" width={64} height={64} className="h-full w-full object-cover" />
      </button>
      {/* mm:335:9443;256:4735 / mm:335:9446;256:4735 */}
      <button
        type="button"
        className="w-full min-w-0 text-center text-base leading-6 font-bold tracking-[0.15px] text-background"
      >
        {name}
      </button>
      <div className="flex items-center gap-2">
        {/* mm:335:9443;256:4751 / mm:335:9446;256:4751 */}
        <span className="text-sm leading-5 font-bold tracking-[0.1px] text-muted-text">{dept}</span>
        <StarTierTooltip kudosReceived={kudosReceived} />
      </div>
      <BadgePill badge={badge} />
    </div>
  );
}

interface KudosCardPeopleProps {
  record: KudosRecord;
}

export function KudosCardPeople({ record }: KudosCardPeopleProps) {
  return (
    // mm:335:9442 / mm:256:4857
    <div className="flex w-full items-center justify-between gap-6">
      <PersonBlock
        name={record.senderName}
        dept={record.senderDept}
        badge={record.senderBadge}
        kudosReceived={record.senderKudosReceived}
        avatarSrc="/saa/Avatar_Sender.png"
      />
      {/* mm:335:9445 / mm:256:5147 */}
      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center text-background">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2.9043 20.4797V4.47974L21.9043 12.4797M4.9043 17.4797L16.7543 12.4797L4.9043 7.47974V10.9797L10.9043 12.4797L4.9043 13.9797M4.9043 17.4797V7.47974V13.9797V17.4797Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <PersonBlock
        name={record.receiverName}
        dept={record.receiverDept}
        badge={record.receiverBadge}
        kudosReceived={record.receiverKudosReceived}
        avatarSrc="/saa/Avatar_Receiver.png"
      />
    </div>
  );
}
