import { useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Cursor from "./Cursor";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  return (
    <>
      <Cursor />
      <Header />
      <main className={className}>{children}</main>
      <Footer />
    </>
  );
}
