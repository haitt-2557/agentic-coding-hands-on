'use client';

// FR-001..FR-013, US001..US009 — client shell for `/kudos/send` (frame `1612:5056`). Owns all
// draft/image/error state plus DEC-001 (phase-03's frozen integration contract: phase-08 wires
// `profiles`/`hashtags`/`onSubmit` in from the real auth-gated page). Composes the eight
// section components below in the frame's own field order (ID-3): Người nhận -> Danh hiệu ->
// message -> Hashtag -> Image -> anonymous checkbox -> footer.
//
// Renders `onSubmit`'s `{ ok:false, error }` inline; does NOT navigate, touch Supabase, or
// write sessionStorage on success — phase-08 owns the redirect+toast flow (phase-06's frozen
// contract). The one exception is "Hủy" (D13): resetting local state and leaving the page is
// this component's own concern, not the submit-success flow phase-08 owns, so it navigates
// itself via `next/navigation`'s `useRouter` (existing project convention, see
// lib/prelaunch/use-prelaunch-countdown.ts).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { canSubmit, validateDraft, validateField, HASHTAG_MAX, IMAGE_MAX } from '@/lib/kudos/send/validation';
import type { KudosDraft, KudosFieldName, KudosSendFormProps, SubmitKudosInput } from '@/lib/kudos/send/types';
import { useI18n } from '@/lib/i18n/locale-provider';
import { RecipientField } from './recipient-field';
import { TitleField } from './title-field';
import { MessageEditor } from './message-editor';
import { HashtagPicker } from './hashtag-picker';
import { ImageAttachments } from './image-attachments';
import { AnonymousToggle } from './anonymous-toggle';
import { FormFooter } from './form-footer';

const EMPTY_DRAFT: KudosDraft = {
  recipientId: null,
  title: '',
  message: '',
  hashtagIds: [],
  isAnonymous: false,
  nickname: '',
};

export function KudosSendForm({ profiles, hashtags, onSubmit }: KudosSendFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [draft, setDraft] = useState<KudosDraft>(EMPTY_DRAFT);
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<KudosFieldName, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateDraft<K extends keyof KudosDraft>(key: K, value: KudosDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleBlur(field: KudosFieldName) {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, draft) }));
  }

  function handleToggleHashtag(hashtagId: string) {
    setDraft((prev) => {
      const isSelected = prev.hashtagIds.includes(hashtagId);
      if (isSelected) return { ...prev, hashtagIds: prev.hashtagIds.filter((id) => id !== hashtagId) };
      if (prev.hashtagIds.length >= HASHTAG_MAX) return prev;
      return { ...prev, hashtagIds: [...prev.hashtagIds, hashtagId] };
    });
  }

  function handleAddImage(file: File) {
    setImages((prev) => (prev.length < IMAGE_MAX ? [...prev, file] : prev));
  }

  function handleRemoveImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancel() {
    setDraft(EMPTY_DRAFT);
    setImages([]);
    setErrors({});
    setSubmitError(null);
    router.push('/kudos');
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    if (!canSubmit(draft)) {
      setErrors(validateDraft(draft));
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const input: SubmitKudosInput = {
        recipientId: draft.recipientId as string,
        title: draft.title,
        message: draft.message,
        hashtagIds: draft.hashtagIds,
        isAnonymous: draft.isAnonymous,
        nickname: draft.isAnonymous ? draft.nickname : null,
        images,
      };
      const result = await onSubmit(input);
      if (!result.ok) {
        setSubmitError(result.error);
        if (result.field) setErrors((prev) => ({ ...prev, [result.field as KudosFieldName]: result.error }));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      className="flex w-full max-w-[672px] flex-col items-start gap-6 py-10"
    >
      {/* mm:I1612:5057;520:9870 */}
      <h1 className="text-2xl leading-8 font-bold text-background">{t('sendKudos.pageTitle')}</h1>

      <RecipientField
        profiles={profiles}
        recipientId={draft.recipientId}
        error={errors.recipientId}
        onSelect={(id) => updateDraft('recipientId', id)}
        onBlur={() => handleBlur('recipientId')}
      />

      <TitleField
        value={draft.title}
        error={errors.title}
        onChange={(value) => updateDraft('title', value)}
        onBlur={() => handleBlur('title')}
      />

      <MessageEditor
        value={draft.message}
        error={errors.message}
        onChange={(value) => updateDraft('message', value)}
        onBlur={() => handleBlur('message')}
      />

      <HashtagPicker
        hashtags={hashtags}
        selectedIds={draft.hashtagIds}
        error={errors.hashtagIds}
        onToggle={handleToggleHashtag}
        onBlur={() => handleBlur('hashtagIds')}
      />

      <ImageAttachments files={images} onAdd={handleAddImage} onRemove={handleRemoveImage} />

      <AnonymousToggle
        isAnonymous={draft.isAnonymous}
        nickname={draft.nickname}
        nicknameError={errors.nickname}
        onToggleAnonymous={(checked) => updateDraft('isAnonymous', checked)}
        onNicknameChange={(value) => updateDraft('nickname', value)}
        onNicknameBlur={() => handleBlur('nickname')}
      />

      {submitError && (
        <p role="alert" className="text-sm font-bold text-badge-danger">
          {submitError}
        </p>
      )}

      <FormFooter
        canSubmit={canSubmit(draft)}
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
        onSubmit={() => void handleSubmit()}
      />
    </form>
  );
}
