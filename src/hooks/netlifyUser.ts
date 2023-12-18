import netlifyIdentity, { User } from "netlify-identity-widget";
import { useEffect, useState } from "react";

export const useNetlifyUser = () => {
  const [user, setUser] = useState<null | User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    const handleError = (err: Error) => {
      setError(err);
      setLoading(false);
    };

    const getUser = (user?: User | null) => {
      setUser(user || null);
      setLoading(false);
    };

    netlifyIdentity.on("login", getUser);
    netlifyIdentity.on("logout", getUser);
    netlifyIdentity.on("init", getUser);
    netlifyIdentity.on("error", handleError);

    getUser(netlifyIdentity.currentUser());

    return () => {
      netlifyIdentity.off("login", getUser);
      netlifyIdentity.off("logout", getUser);
      netlifyIdentity.off("init", getUser);
      netlifyIdentity.off("error", handleError);
    };
  }, []);

  return { user, loading, error };
};