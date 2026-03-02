import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/95 backdrop-blur-xl px-5 py-3.5 shadow-2xl">
          <div className="flex items-center gap-3">
            <Cookie className="h-5 w-5 text-neutral-500 shrink-0" />
            <div className="text-sm text-neutral-900">
              <span className="font-semibold">We use cookies</span>
              <span className="hidden sm:inline"> — </span>
              <br className="sm:hidden" />
              <span className="text-neutral-600">
                We use cookies to improve your experience and analyze website usage. You can choose to accept or decline cookies.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleDecline}
              className="rounded-lg border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Accept Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
