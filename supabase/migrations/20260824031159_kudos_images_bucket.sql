-- F014_SendKudosWishes — private Storage bucket for kudos image attachments (phase-01).
-- INT-002, BR-005; clarifications.md decision 4 and the "Assumptions made explicit for the
-- unresolved items" note: bucket is private (nothing renders these images this run), per-file
-- cap 5 MiB, jpg/png only.
--
-- Path convention (fixed here, restated in phase-05): `{auth.uid()}/{filename}` — the first
-- path segment MUST equal the uploading user's uid, which both storage policies below enforce
-- via `storage.foldername(name)[1]`.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kudos-images', 'kudos-images', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy kudos_images_bucket_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'kudos-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy kudos_images_bucket_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'kudos-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
