import { useEffect, useState } from "react";
import { auth, ensureAnon } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setReady(true));
    ensureAnon().catch(console.error);
    return () => unsub();
  }, []);

  if (!ready) return <div>Loading...</div>;
  return <>{children}</>
}

export default AuthProvider;
