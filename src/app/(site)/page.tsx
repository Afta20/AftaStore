import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AftaStore | Afta",
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
