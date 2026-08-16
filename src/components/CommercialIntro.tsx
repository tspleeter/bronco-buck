"use client";

import { useCallback, useEffect, useState } from "react";
import CommercialModal from "@/components/CommercialModal";

const SEEN_KEY = "bd_commercial_seen";

/**
 * Auto-plays the Buck That Duck commercial for every visitor the first time
 * they land on the site (any page — it's mounted in the root layout). We gate
 * on localStorage so returning visitors aren't forced to rewatch it on every
 * page load; once they've seen (or dismissed) it, the flag is set and it never
 * auto-opens again on that browser. The "See commercial" nav button still opens
 * it on demand any time.
 *
 * Initial render is null on both server and client (open starts false), so
 * there's no hydration mismatch; the modal only mounts after the mount effect
 * flips `open`.
 */
export default function CommercialIntro() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem(SEEN_KEY);
    } catch {
      // Private mode / storage disabled — fail open (show it) rather than crash.
      seen = null;
    }
    if (!seen) setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Ignore — if we can't persist, worst case they see it again next load.
    }
  }, []);

  return <CommercialModal open={open} onClose={handleClose} />;
}
