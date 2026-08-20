'use client';

// mms_C_Menu list — sticky left category nav with scroll-synced active state (scrollspy).
// Renders AWARDS in order (BR-001) and owns `activeSlug` alone via one IntersectionObserver
// over each section's DOM id — no lifted state, no context, no client wrapper around the
// list (clarifications.md "scroll-synced (scrollspy)" decision + phase-02 contract). Items
// stay real `<a href="#slug">` so keyboard activation works; click does
// `preventDefault()` + `scrollIntoView({ behavior })` from `prefers-reduced-motion` and never
// writes `location.hash` / `history.pushState` (BR-003).
// mm:313:8459

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { AWARDS } from '@/lib/awards';

// mm:186:1433 / mm:186:1501 — no distinct hover/pressed variant exists on these nav-item
// components in MoMorph (checked via get_node on both component ids and
// get_related_design_items on 313:8460; only a default and the C.1 "active" state are
// exposed). ID-10 ("Mục menu được highlight khi hover") + the promoted spec's `nav-hover`
// state have no Figma value to read, so this reuses the exact hover/focus-visible pattern
// already shared by every other rounded nav-style control in this codebase
// (components/layout/site-header.tsx inactive links, components/ui/{notification-bell,
// account-menu,language-switcher}.tsx) rather than inventing a new value.
const FOCUS_CLASSES = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';
const ACTIVE_CLASSES = `border-b border-accent text-accent [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] ${FOCUS_CLASSES}`;
const INACTIVE_CLASSES = `border-b border-transparent text-white hover:bg-secondary-button-bg ${FOCUS_CLASSES}`;

export function AwardCategoryNav() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const visibleRatios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleRatios.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleRatios.delete(entry.target.id);
          }
        }
        if (visibleRatios.size === 0) {
          return;
        }
        const [topSlug] = [...visibleRatios.entries()].sort((a, b) => b[1] - a[1])[0];
        setActiveSlug(topSlug);
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    observerRef.current = observer;

    for (const award of AWARDS) {
      const section = document.getElementById(award.slug);
      if (section) {
        observer.observe(section);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, slug: string) {
    event.preventDefault();
    const section = document.getElementById(slug);
    if (!section) {
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    // mm:313:8459
    <nav className="flex w-full flex-row gap-2 overflow-x-auto lg:sticky lg:top-24 lg:w-[178px] lg:shrink-0 lg:flex-col lg:gap-4 lg:overflow-visible">
      {AWARDS.map((award) => {
        const isActive = award.slug === activeSlug;
        return (
          // mm:313:8460 (C.1) .. mm:313:8465 (C.6)
          <a
            key={award.slug}
            href={`#${award.slug}`}
            onClick={(event) => handleClick(event, award.slug)}
            aria-current={isActive ? 'location' : undefined}
            className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded px-4 py-4 text-sm font-bold tracking-[0.25px] ${
              isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES
            }`}
          >
            {/* mm:186:1745 (MM_MEDIA_Target) */}
            <Image src="/saa/Target.svg" alt="" width={24} height={24} aria-hidden="true" />
            {award.title}
          </a>
        );
      })}
    </nav>
  );
}
