import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AftaStore | Afta",
  description: "E-commerce website built with Next.js and Tailwind CSS",
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
