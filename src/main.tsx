import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App.tsx";

export function ConditionalAnalytics() {
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  useEffect(() => {
    const checkAnalyticsAvailability = async () => {
      try {
        const response = await fetch("/_vercel/insights/script.js", {
          method: "HEAD",
          cache: "no-cache",
        });

        if (response.ok) {
          setShouldLoadAnalytics(true);
        }
      } catch {
        console.warn(
          "Vercel Analytics not available, likely blocked by ad blocker or something like that. Pesky bugger!"
        );
      }
    };

    const timeoutId = setTimeout(() => {
      setShouldLoadAnalytics(false);
    }, 3000);

    checkAnalyticsAvailability().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, []);

  if (!shouldLoadAnalytics) {
    return null;
  }

  return <Analytics />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <ConditionalAnalytics />
  </StrictMode>
);
