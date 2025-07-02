"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface Me {
  id: string;
  firstName: string;
  premium: boolean;
}

/** globalne (pojedyncze) pobranie bieżącego usera  */
export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await axios.get<{ user: Me }>(
          `${API_URL}/api/v1/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMe(data.user);
      } catch {
        /* token nie zaakceptowany → wyloguj */
        localStorage.removeItem("token");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { me, loading };
}
