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
    <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900">
        Who&apos;s learning?
      </h1>

      <div className="flex flex-wrap justify-center gap-4">
        {adult && (
          <form action={selectProfile}>
            <input type="hidden" name="profile_id" value={adult.id} />
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="flex w-32 flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 hover:border-indigo-400 hover:shadow-sm"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
                {adult.display_name.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium text-zinc-800">
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
              className="flex w-40 flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4"
            >
              <input type="hidden" name="profile_id" value={child.id} />
              <input
                name="display_name"
                defaultValue={child.display_name}
                required
                className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
              <select
                name="age_band"
                defaultValue={child.age_band ?? "8-12"}
                className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
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
                  className="flex-1 rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div
              key={child.id}
              className="flex w-32 flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4"
            >
              <form action={selectProfile} className="contents">
                <input type="hidden" name="profile_id" value={child.id} />
                <input type="hidden" name="next" value={next} />
                <button
                  type="submit"
                  className="flex flex-col items-center gap-2 hover:opacity-80"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-lg font-semibold text-amber-700">
                    {child.display_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-zinc-800">
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
                className="text-xs font-medium text-indigo-600"
              >
                Edit
              </button>
            </div>
          ),
        )}

        <button
          type="button"
          onClick={() => setAddingChild((v) => !v)}
          className="flex w-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 p-4 text-zinc-500 hover:border-indigo-400 hover:text-indigo-600"
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
          className="flex w-full max-w-xs flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Child&apos;s name
            </label>
            <input
              name="display_name"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Age band
            </label>
            <select
              name="age_band"
              defaultValue="8-12"
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            >
              {AGE_BANDS.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Add profile
          </button>
        </form>
      )}
    </div>
  );
}
