'use client';

// FR-008, US006, BR-005, SM-001 — Image attachments (frame node I1612:5057;520:9896). Not
// required (row F `required: false`). Accepts .jpg/.png; max 5; add button hides at 5 and
// reappears on removal.
//
// dom-contract.md:
// D11 — exactly ONE input[type="file"]; must have a real bounding box at opacity-0 (not
//       sr-only/hidden/display:none) so Playwright's visibility check still passes.
// D12 — add button's visible text contains "Thêm"; removed from the DOM entirely at 5 images.
//
// The 5 identical MM_MEDIA_Sample Image thumbnails on the frame are the design's own "already
// full" illustration, not a static asset to import here — this component renders real object-URL
// previews of the files the user picked, per "use Figma content as mock data, do not invent
// data" (there is no user file to preview until one is selected).

import { useEffect, useState } from 'react';
import { IMAGE_MAX, isAcceptedImage } from '@/lib/kudos/send/validation';
import { useI18n } from '@/lib/i18n/locale-provider';

interface ImageAttachmentsProps {
  files: File[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
}

export function ImageAttachments({ files, onAdd, onRemove }: ImageAttachmentsProps) {
  const { t } = useI18n();
  const [previews, setPreviews] = useState<string[]>([]);
  const [formatError, setFormatError] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    // Synchronizing local preview state with an external system (the browser's object-URL
    // registry) that must be created/revoked in the same effect for cleanup to pair correctly —
    // same justified pattern as lib/i18n/locale-provider.tsx and kudos-toast.tsx.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!isAcceptedImage(file)) {
      setFormatError(t('sendKudos.imageFormatError'));
      return;
    }
    setFormatError(null);
    onAdd(file);
  }

  const canAddMore = files.length < IMAGE_MAX;

  return (
    // mm:I662:9637;520:9896 — Frame 537, row, gap 16px, alignItems center
    <div className="flex w-full max-w-[672px] items-center gap-4">
      {/* mm:I662:9637;520:9897 */}
      <label className="shrink-0 whitespace-nowrap text-[22px] leading-7 font-bold text-background">{t('sendKudos.imageLabel')}</label>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-4">
          {files.map((file, index) => (
            // mm:I1612:5057;662:9197 (Image instance)
            <div key={`${file.name}-${index}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px] border border-border-accent bg-white">
              {previews[index] && (
                // Object URL preview of a user-picked File, not a project asset — next/image
                // cannot resolve blob: URLs, so a plain <img> is the correct tool here.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previews[index]} alt="" className="h-full w-full rounded object-cover" />
              )}
              {/* mm:I1612:5057;662:9197;662:9287 */}
              <button
                type="button"
                aria-label={t('sendKudos.imageRemoveLabel')}
                onClick={() => onRemove(index)}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-badge-danger text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          {canAddMore && (
            // mm:I1612:5057;662:9132
            <div className="relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg border border-border-accent bg-white px-2 py-1 text-[11px] leading-4 font-bold tracking-[0.5px] text-muted-text">
              <span>{t('sendKudos.imageAddButton')}</span>
              <span>{t('sendKudos.imageMaxHint')}</span>
              {/* mm:I1612:5057;520:9896 — D11: real bounding box, opacity-0, not sr-only */}
              <input
                type="file"
                accept="image/jpeg,image/png"
                aria-label={t('sendKudos.imageAddButton')}
                onChange={handleFileChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          )}
        </div>
        {formatError && (
          <p role="alert" className="text-sm font-bold text-badge-danger">
            {formatError}
          </p>
        )}
      </div>
    </div>
  );
}
