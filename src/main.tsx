import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, useMutation } from "convex/react";
import { api } from "./convex/_generated/api";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const RegisterPage = lazy(() => import("./pages/Register.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const Attendance = lazy(() => import("./pages/Attendance.tsx"));
const Circulars = lazy(() => import("./pages/Circulars.tsx"));
const Payments = lazy(() => import("./pages/Payments.tsx"));
const Examinations = lazy(() => import("./pages/Examinations.tsx"));
const ELibrary = lazy(() => import("./pages/ELibrary.tsx"));
const Extracurricular = lazy(() => import("./pages/Extracurricular.tsx"));
const Feedback = lazy(() => import("./pages/Feedback.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC]">
      <div className="animate-pulse text-[#0B3B78]/60">Loading…</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in the browser runtime). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[Preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function AppRoutes() {
  const location = useLocation();
  const ensureSeeded = useMutation(api.seed.ensureSeeded);

  useEffect(() => {
    ensureSeeded().catch(() => {});
  }, [ensureSeeded]);

  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/auth"
        element={<AuthPage redirectAfterAuth="/dashboard" />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth redirectImmediately>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth redirectImmediately>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/attendance"
        element={
          <RequireAuth redirectImmediately>
            <Attendance />
          </RequireAuth>
        }
      />
      <Route
        path="/circulars"
        element={
          <RequireAuth redirectImmediately>
            <Circulars />
          </RequireAuth>
        }
      />
      <Route
        path="/payments"
        element={
          <RequireAuth redirectImmediately>
            <Payments />
          </RequireAuth>
        }
      />
      <Route
        path="/examinations"
        element={
          <RequireAuth redirectImmediately>
            <Examinations />
          </RequireAuth>
        }
      />
      <Route
        path="/e-library"
        element={
          <RequireAuth redirectImmediately>
            <ELibrary />
          </RequireAuth>
        }
      />
      <Route
        path="/extracurricular"
        element={
          <RequireAuth redirectImmediately>
            <Extracurricular />
          </RequireAuth>
        }
      />
      <Route
        path="/feedback"
        element={
          <RequireAuth redirectImmediately>
            <Feedback />
          </RequireAuth>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <Suspense fallback={<RouteLoading />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
