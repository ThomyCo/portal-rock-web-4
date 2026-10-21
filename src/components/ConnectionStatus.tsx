import { useEffect, useState } from "react";
export function ConnectionStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false);
    addEventListener("online", on);
    addEventListener("offline", off);
    return () => {
      removeEventListener("online", on);
      removeEventListener("offline", off);
    };
  }, []);
  return online ? null : (
    <div className="connection-status" role="status">
      Sin conexión. Conservaremos lo que escribas hasta que regreses.
    </div>
  );
}
