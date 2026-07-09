"use client";

import { useState } from "react";
import type { AgeBand, Profile } from "@/types/profile";
import {
  createChildProfile,
  selectProfile,
  updateChildProfile,
} from "./actions";

const AGE_BANDS: AgeBand[] = ["8-12", "13-17"];

export default function ProfileSwitcher({
  adult,
  childProfiles,
  next,
}: {
  adult: Profile | null;
  childProfiles: Profile[];
  next: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingChild, setAddingChild] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16">
      <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-white">
        Who&apos;s learning?
      </h1>

      <div className="animate-fade-up anim-delay-1 flex flex-wrap justify-center gap-4">
        {adult && (
          <form action={selectProfile}>
            <input type="hidden" name="profile_id" value={adult.id} />
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="glass glass-hover flex w-32 flex-col items-center gap-2 p-4 active:scale-[0.97]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                {adult.display_name.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium text-zinc-200">
                {adult.display_name}
              </span>
            </button>
          </form>
        )}

        {childProfiles.map((child) =>
          editingId === child.id ? (
            <form
              key={child.id}
              action={updateChildProfile}
              className="glass-strong flex w-44 flex-col gap-2 p-4"
            >
              <input type="hidden" name="profile_id" value={child.id} />
              <input
                name="display_name"
                defaultValue={child.display_name}
                required
                className="input-field px-2 py-1.5 text-sm"
              />
              <select
                name="age_band"
                defaultValue={child.age_band ?? "8-12"}
                className="input-field px-2 py-1.5 text-sm"
              >
                {AGE_BANDS.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-2 py-1.5 text-xs font-semibold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex-1 rounded-lg border border-white/15 px-2 py-1.5 text-xs font-medium text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div
              key={child.id}
              className="glass glass-hover flex w-32 flex-col items-center gap-2 p-4"
            >
              <form action={selectProfile} className="contents">
                <input type="hidden" name="profile_id" value={child.id} />
                <input type="hidden" name="next" value={next} />
                <button
                  type="submit"
                  className="flex flex-col items-center gap-2 active:scale-[0.97]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-lg font-bold text-white shadow-[0_0_20px_rgba(251,191,36,0.35)]">
                    {child.display_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-zinc-200">
                    {child.display_name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {child.age_band}
                  </span>
                </button>
              </form>
              <button
                type="button"
                onClick={() => setEditingId(child.id)}
                className="text-xs font-medium text-indigo-300 hover:text-indigo-200"
              >
                Edit
              </button>
            </div>
          ),
        )}

        <button
          type="button"
          onClick={() => setAddingChild((v) => !v)}
          className="flex w-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 p-4 text-zinc-500 transition-colors hover:border-indigo-400/50 hover:text-indigo-300"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-current text-2xl">
            +
          </span>
          <span className="text-sm font-medium">Add child</span>
        </button>
      </div>

      {addingChild && (
        <form
          action={createChildProfile}
          className="glass-strong animate-fade-up flex w-full max-w-xs flex-col gap-3 p-4"
        >
          <div>
            <label className="form-label">Child&apos;s name</label>
            <input name="display_name" required className="input-field mt-1" />
          </div>
          <div>
            <label className="form-label">Age band</label>
            <select
              name="age_band"
              defaultValue="8-12"
              className="input-field mt-1"
            >
              {AGE_BANDS.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Add profile
          </button>
        </form>
      )}
    </div>
  );
}