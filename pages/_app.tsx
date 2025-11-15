import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./layout";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WishlistProvider } from "@/contexts/WishlistContext";

const queryClient = new QueryClient();

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          
          <WishlistProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          </WishlistProvider>
        </SessionProvider>
      </QueryClientProvider>
    </>
  )
}
