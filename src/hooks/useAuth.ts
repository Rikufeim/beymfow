"use client";
import { useEffect, useState } from "react";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Try NextAuth session endpoint if exists
        const r = await fetch("/api/auth/session", { credentials: "include" });
        if (!cancelled && r.ok) {
          const data = await r.json();
          const ok = !!data?.user;
          setLoggedIn(ok);
          setUser(ok ? data.user : null);
        } else {
          // Fallback: look for global user injected by your app (optional)
          // @ts-ignore
          const u = typeof window !== "undefined" ? (window.__USER || null) : null;
          setLoggedIn(!!u);
          setUser(u);
        }
      } catch {
        setLoggedIn(false);
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { loading, loggedIn, user };
}
