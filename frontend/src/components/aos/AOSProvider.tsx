"use client";

import { useEffect, ReactNode } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface Props {
  children: ReactNode;
}

export default function AOSProvider({ children }: Props) {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 100,
    });
  }, []);

  return <>{children}</>;
}
