"use client";

export default function CopyLinkButton() {
  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied");
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full rounded-xl border px-4 py-3 font-semibold shadow-sm hover:bg-black hover:text-white transition"
    >
      Copy Link
    </button>
  );
}