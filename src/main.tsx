import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/generic/ErrorBoundary.tsx";
import "./index.css";

const script = document.createElement("script");
script.defer = true;
script.src = "https://static.cloudflareinsights.com/beacon.min.js";
script.setAttribute(
  "data-cf-beacon",
  '{"token": "d7ccf8e68a924adeb024b8a831be15e3"}'
);
document.head.appendChild(script);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
