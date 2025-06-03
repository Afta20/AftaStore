// src/app/layout.tsx
"use client";
import './globals.css'; 
import './css/style.css';
import './css/euclid-circular-a-font.css';

import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
