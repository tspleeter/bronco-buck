"use client";

import { useState } from "react";
import CommercialModal from "@/components/CommercialModal";

/**
 * "See commercial" CTA. When `floating`, it pins itself at the top of the
 * viewport (rendered globally in the layout so it shows on every page).
 * Opens the shared `CommercialModal` video player for the Buck That Duck spot.
 * Video asset: /public/assets/buck-commercial.mp4 (poster: buck-commercial-poster.jpg)
 */
export default function SeeCommercialButton({ floating = false }: { floating?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={"see-commercial-btn" + (floating ? " see-commercial-btn--floating" : "")}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="See the Buck That Duck commercial"
      >
        <span className="see-commercial-btn__icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="see-commercial-btn__label">See commercial</span>
      </button>

      <CommercialModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
