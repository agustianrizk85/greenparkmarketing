import type { ReactNode } from "react";
import { useAuth } from "./context/AuthContext";
import { Login } from "./components/Login";
import { DesktopShell } from "./components/DesktopShell";
import { MobileApp } from "./components/MobileApp";

// Field roles use the touch-first mobile layout; everyone else gets the
// perencanaan-style war-room desktop shell.
const MOBILE_POSITIONS = ["Talent", "Videografer"];

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Splash>
        <div className="spinner" />
        Memeriksa sesi…
      </Splash>
    );
  }
  if (!user) return <Login />;

  if (MOBILE_POSITIONS.includes(user.position)) {
    return <MobileApp user={user} />;
  }
  return <DesktopShell user={user} />;
}

function Splash({ tone, children }: { tone?: "error"; children: ReactNode }) {
  return <div className={`splash ${tone ?? ""}`}>{children}</div>;
}
