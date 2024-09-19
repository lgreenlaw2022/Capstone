import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <div className="main-layout">
        <Sidebar />
        <Component {...pageProps} />
		<Footer />
      </div>
    </>
  );
}
