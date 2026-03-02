import "./App.css";
import AppRoutes from "./routes";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Spinner } from "./components/ui/spinner";
import Logo from "./components/logo";
import { useLocation } from "react-router-dom";
import { isAuthRoute } from "./routes/routes";
import { useSocket } from "./hooks/use-socket";
import CallOverlay from "./components/call/call-overlay";
import { usePeer } from "./hooks/use-peer";
import { Toaster } from "sonner";

function App() {
  const { pathname } = useLocation();
  const { user, isAuthStatus, isAuthStatusLoading } = useAuth();
  const { onlineUsers } = useSocket();
  const isAuth = isAuthRoute(pathname);

  // Initialize PeerJS and call listeners
  usePeer();

  console.log(onlineUsers, "onlineUsers");

  useEffect(() => {
    isAuthStatus();
  }, [isAuthStatus]);

  if (isAuthStatusLoading && !user && !isAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Logo imgClass="size-20" showText={false} />
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
      <CallOverlay />
      <Toaster position="top-center" />
    </>
  );
}

export default App;
