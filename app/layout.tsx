"use client";

import "./globals.css";
import { ReactNode, useEffect } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = "en";
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Beetle Animation</title>
        <meta
          name="description"
          content="15-second educational animation about beetles (kumbang)."
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
