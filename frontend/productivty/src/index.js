/**
 * index.js
 * ----------
 * This is the entry point of the React app.
 *
 * Here we mount <App /> to the DOM and wrap it with "providers".
 *
 * Providers we use:
 * - BrowserRouter (react-router-dom):
 *   Enables client-side routing (moving between pages without full reload).
 *
 * - QueryClientProvider (@tanstack/react-query):
 *   Sets up React Query for fetching/caching server data.
 *   We’re not calling any APIs yet, but setting it up now avoids rework later.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";

// Create ONE QueryClient for the whole app.
// This handles caching and configuration for react-query.
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Enables routing across the app */}
    <BrowserRouter>
      {/* Enables react-query across the app */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);