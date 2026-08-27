'use client';

// R3 Root Further content (Frame 486 / mms_B4_content) — long-form copy now sourced from the
// i18n dictionary (`rootFurther.*` in `lib/i18n/dictionaries/{vi,en}.ts`) so it follows the
// language switcher, same as the rest of the page chrome. Small ROOT/FURTHER watermark logo
// repeats above the body text at a smaller scale than the hero title.
// mm:3204:10155
// mm:3204:10154

import Image from 'next/image';
import { useI18n } from '@/lib/i18n/locale-provider';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/vi';

const PARAGRAPH_ONE_KEYS: DictionaryKey[] = ['rootFurther.p1', 'rootFurther.p2', 'rootFurther.p3'];
const PARAGRAPH_TWO_KEYS: DictionaryKey[] = ['rootFurther.p4', 'rootFurther.p5'];

export function RootFurtherContent() {
  const { t } = useI18n();

  return (
    <section className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-8 px-6 py-20 sm:px-10 lg:px-0">
      <div className="relative h-[67px] w-[145px] sm:h-[100px] sm:w-[217px] lg:h-[134px] lg:w-[290px]">
        <Image
          src="/saa/Root_Text.png"
          alt=""
          aria-hidden="true"
          width={189}
          height={67}
          className="absolute left-[18%] top-0 h-1/2 w-[65%] object-contain object-left-top"
        />
        <Image
          src="/saa/Further_Text.png"
          alt=""
          aria-hidden="true"
          width={290}
          height={67}
          className="absolute left-0 top-1/2 h-1/2 w-full object-contain object-left-top"
        />
      </div>
      <div className="flex flex-col gap-8 text-justify text-lg font-bold leading-8 text-white sm:text-2xl">
        {PARAGRAPH_ONE_KEYS.map((key) => (
          <p key={key}>{t(key)}</p>
        ))}
      </div>
      <blockquote className="max-w-3xl text-center text-xl font-bold leading-8 text-white">
        <p>&ldquo;{t('rootFurther.quote')}&rdquo;</p>
        <p>{t('rootFurther.quoteGloss')}</p>
      </blockquote>
      <div className="flex flex-col gap-8 text-justify text-lg font-bold leading-8 text-white sm:text-2xl">
        {PARAGRAPH_TWO_KEYS.map((key) => (
          <p key={key}>{t(key)}</p>
        ))}
      </div>
    </section>
  );
}
