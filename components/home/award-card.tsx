'use client';

// mms_C2.x — one award card. Shared circular badge background (Award_BG, one asset for
// all 6 cards) + per-award wordmark thumbnail from `lib/awards.ts` (Track B's AWARDS data,
// FR-013/BR-005 hash-anchor navigation via `awardHref`).
// Award_BG (shared, 6 nodes -> 1 asset):
// mm:I2167:9075;214:1019;81:2442
// mm:I2167:9076;214:1019;81:2442
// mm:I2167:9077;214:1019;81:2442
// mm:I2167:9079;214:1019;81:2442
// mm:I2167:9080;214:1019;81:2442
// mm:I2167:9081;214:1019;81:2442
// Per-award wordmark (via lib/awards.ts Award.image):
// mm:I2167:9075;214:1019;214:666;10:951
// mm:I2167:9076;214:1019;214:666;214:654
// mm:I2167:9077;214:1019;214:666;214:655
// mm:I2167:9079;214:1019;214:666;214:656
// mm:I2167:9080;214:1019;214:666;214:657
// mm:I2167:9081;214:1019;214:666;214:653
// "Chi tiết" arrow icon (shared, 6 nodes -> 1 asset):
// mm:I2167:9075;214:1023;186:1441
// mm:I2167:9076;214:1023;186:1441
// mm:I2167:9077;214:1023;186:1441
// mm:I2167:9079;214:1023;186:1441
// mm:I2167:9080;214:1023;186:1441
// mm:I2167:9081;214:1023;186:1441
//
// Description now comes from the shared dictionary via `award.descriptionKey` so it follows
// the language switcher; the title stays untranslated (English proper noun).

import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/locale-provider';
import { awardHref, type Award } from '@/lib/awards';

interface AwardCardProps {
  award: Award;
}

export function AwardCard({ award }: AwardCardProps) {
  const { t } = useI18n();
  const href = awardHref(award.slug);

  return (
    <li className="flex flex-col items-start gap-6">
      <Link
        href={href}
        className="saa-glow relative block aspect-square w-full overflow-hidden rounded-3xl border border-accent"
      >
        <Image
          src="/saa/Award_BG.png"
          alt=""
          fill
          aria-hidden="true"
          // Grid is 3 columns from lg up, 2 below (BR-004), inside a 1512px max container.
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="object-cover mix-blend-screen"
        />
        {/* This image's non-empty alt is the link's ONLY accessible-name source — do not
            pair it with an sr-only label too, or the name doubles (e.g. "X X"). */}
        <Image
          src={award.image}
          alt={award.title}
          width={221}
          height={35}
          className="absolute inset-x-8 top-1/2 h-auto w-[calc(100%-4rem)] -translate-y-1/2"
        />
      </Link>
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-normal text-accent">
          <Link href={href}>{award.title}</Link>
        </h3>
        <p className="line-clamp-2 text-base text-white">{t(award.descriptionKey)}</p>
        <Link
          href={href}
          className="mt-2 flex items-center gap-1 py-4 text-base font-medium text-white hover:text-accent"
        >
          {t('awards.detailLink')}
          <Image src="/saa/Up.svg" alt="" width={24} height={24} aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}
