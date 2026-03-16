import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elite Builder Lab",
  description:
    "Configurable basketball player builder inspired by modern pro-hoops games."
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-navy-900 text-slate-100 antialiased">
        {props.children}
      </body>
    </html>
  );
}

