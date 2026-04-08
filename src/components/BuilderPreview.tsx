"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBuild } from "@/lib/api";
import { useSavedBuilds } from "@/components/SavedBuildsProvider";

export default function BuilderPreview() {
  const router = useRouter();
  const { addSavedBuild } = useSavedBuilds();

  const [bodyColor, setBodyColor] = useState("orange");
  const [maneColor, setManeColor] = useState("black");
  const [base, setBase] = useState("classic");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    try {
      setLoading(true);
      setError("");

      const result = await createBuild({
        bodyColor,
        maneColor,
        base,
      });

      if (!result || !result.id) {
        throw new Error("No ID returned from API");
      }

      addSavedBuild(result.id);
      router.push(`/saved/${result.id}`);
    } catch {
      setError("Failed to save build.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Build Your Bronco Buck</h2>

          <div className="mb-5">
            <label className="block text-sm mb-2">Body Color</label>
            <select
              value={bodyColor}
              onChange={(e) => setBodyColor(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="orange">Orange</option>
              <option value="white">White</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="black">Black</option>
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-sm mb-2">Mane Color</label>
            <select
              value={maneColor}
              onChange={(e) => setManeColor(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="black">Black</option>
              <option value="brown">Brown</option>
              <option value="white">White</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2">Base</label>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="classic">Classic</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full border rounded px-4 py-3 font-semibold"
          >
            {loading ? "Saving..." : "Save & Share Build"}
          </button>

          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>

        <div className="rounded-2xl border p-6 shadow-sm text-center">
          <h3 className="text-xl font-semibold mb-4">Preview</h3>
          <p>
            <strong>Body:</strong> {bodyColor}
          </p>
          <p>
            <strong>Mane:</strong> {maneColor}
          </p>
          <p>
            <strong>Base:</strong> {base}
          </p>
        </div>
      </div>
    </div>
  );
}