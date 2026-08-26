"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Consent = "accepted" | "rejected";

type CookieConsentProps = {
  title: string;
  text: string;
  acceptLabel: string;
  rejectLabel: string;
  policyHref: string;
  analyticsEnabled: boolean;
};

const COOKIE_NAME = "bend_cookie_consent";
const COOKIE_VERSION = "1";

function readConsent(): Consent | null {
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];
  if (value === `${COOKIE_VERSION}:accepted`) return "accepted";
  if (value === `${COOKIE_VERSION}:rejected`) return "rejected";
  return null;
}

export function CookieConsent({ title, text, acceptLabel, rejectLabel, policyHref, analyticsEnabled }: CookieConsentProps) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent | null>(null);
  const recorded = useRef(false);

  const recordVisit = useCallback(async () => {
    if (!analyticsEnabled || recorded.current) return;
    recorded.current = true;
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [analyticsEnabled]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const saved = readConsent();
    // Cookie is available only in the browser after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(saved);
    if (saved === "accepted") void recordVisit();
  }, [pathname, recordVisit]);

  const choose = async (decision: Consent) => {
    document.cookie = `${COOKIE_NAME}=${COOKIE_VERSION}:${decision}; Path=/; Max-Age=15552000; SameSite=Lax`;
    setConsent(decision);
    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, consentVersion: COOKIE_VERSION }),
      keepalive: true,
    }).catch(() => undefined);
    if (decision === "accepted") void recordVisit();
  };

  if (pathname.startsWith("/admin") || consent !== null) return null;

  return (
    <aside className="cookie-banner" aria-label={title} aria-describedby="cookie-banner-text">
      <div>
        <p className="cookie-banner-title">{title}</p>
        <p id="cookie-banner-text" className="cookie-banner-text">
          {text} {policyHref ? <a href={policyHref}>Открыть информацию о cookie</a> : null}
        </p>
      </div>
      <div className="cookie-banner-actions">
        <button type="button" className="button cookie-consent-action" onClick={() => void choose("rejected")}>
          {rejectLabel}
        </button>
        <button type="button" className="button cookie-consent-action" onClick={() => void choose("accepted")}>
          {acceptLabel}
        </button>
      </div>
    </aside>
  );
}
