import { useState } from 'react';
import { formatDateTime } from '../lib/labels';
import type { ApplicationNote } from '../types';

export default function AdminNotes({
  notes,
  busy,
  onAdd,
}: {
  notes: ApplicationNote[];
  busy: boolean;
  onAdd: (body: string) => Promise<void>;
}) {
  const [body, setBody] = useState('');
  const disabled = busy || body.trim().length === 0;

  return (
    <section className="card p-4">
      <h2 className="m-0 text-[15px] font-bold">Private notes</h2>
      <ul className="mt-3 mb-0 grid gap-3 p-0 list-none">
        {notes.length === 0 ? (
          <li className="text-[13px] text-[var(--color-muted)]">No notes yet.</li>
        ) : (
          notes.map((note) => (
            <li key={note.id} className="rounded-xl bg-[#f8faff] p-3">
              <p className="m-0 whitespace-pre-wrap">{note.body}</p>
              <p className="mt-2 mb-0 text-[12px] text-[var(--color-muted)]">
                {note.author} · {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))
        )}
      </ul>
      <form
        className="mt-4 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = body.trim();
          if (!text) return;
          void onAdd(text).then(() => setBody(''));
        }}
      >
        <label className="grid gap-1 text-[13px] font-semibold">
          Add a note
          <textarea
            className="textarea"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={8000}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary justify-self-start" disabled={disabled}>
          {busy ? 'Saving…' : 'Save note'}
        </button>
      </form>
    </section>
  );
}
