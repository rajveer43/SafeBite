import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/auth_context";
import { DarkModeProvider } from "./contexts/theme_context";
import { ToastProvider } from "./components/common/toast";
import ErrorBoundary from "./components/common/error-boundary";
import "./index.css";

// eslint-disable-next-line react/only-export-components
function ErrorBoundaryWrapper() {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname}>
      <App />
    </ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DarkModeProvider>
          <ToastProvider>
            <ErrorBoundaryWrapper />
          </ToastProvider>
        </DarkModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
