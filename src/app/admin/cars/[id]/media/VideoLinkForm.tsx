"use client";

import { useActionState } from "react";
import type { VideoLinkState } from "./actions";

type Props = {
  action: (prev: VideoLinkState, formData: FormData) => Promise<VideoLinkState>;
};

// Adding a video by link is cheaper than uploading it: YouTube pays the
// bandwidth, and our Cloudinary credits stay for photos.
export default function VideoLinkForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-5">
      <h2 className="font-sign text-2xl font-bold">Add a YouTube video</h2>
      <p className="mt-1 text-sm text-muted">
        Recommended for walk-around videos. Paste a normal YouTube link (watch, share or Shorts) and we&apos;ll add it
        to the gallery.
      </p>

      {state?.error && (
        <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-red-800">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-green-900">
          Video added to the gallery.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          name="url"
          type="url"
          placeholder="https://youtu.be/XXXXXXXXXXX"
          aria-label="YouTube link"
          className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-road"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-marking px-5 py-2.5 font-sign text-lg font-semibold text-road hover:bg-marking-dark disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add video"}
        </button>
      </div>
    </form>
  );
}
