'use client';

// mms_B.4.3/C.3.7 (FR-009) — one <button> per hashtag (dom-contract.md F24). Clicking a tag
// sets the shared filter owned upstream by kudos-board.tsx (Phase 5); this component only owns
// the button, not the filter state. The frame draws hashtags as one repeated text blob with a
// genuine double space before the final tag (dom-contract.md S8) — splitting into individual
// buttons already drops that literal text, so the double space is approximated as one extra
// gap unit before the last button when ≥2 tags exist. No exact whitespace-width value exists
// in the extracted design data to use instead of this approximation.

interface KudosHashtagRowProps {
  hashtags: string[];
  onHashtagClick: (hashtag: string) => void;
}

export function KudosHashtagRow({ hashtags, onHashtagClick }: KudosHashtagRowProps) {
  return (
    // mm:335:9459 / mm:256:5158
    <div className="flex w-full flex-wrap items-center gap-1 text-base leading-6 font-bold tracking-[0.5px] text-badge-danger">
      {hashtags.map((hashtag, index) => (
        <button
          key={hashtag}
          type="button"
          onClick={() => onHashtagClick(hashtag)}
          className={index === hashtags.length - 1 && hashtags.length >= 2 ? 'ml-1' : ''}
        >
          {hashtag}
        </button>
      ))}
    </div>
  );
}
