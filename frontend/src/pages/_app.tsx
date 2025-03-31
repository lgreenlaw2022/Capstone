import { jwtDecode } from "jwt-decode";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const isLoginPage = router.pathname === "/login";
    const isRegisterPage = router.pathname === "/register";
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );

    // Frontend token validation
    const isTokenValid = (token: string): boolean => {
        try {
            // Decode the token
            const decodedToken: { exp: number } = jwtDecode(token);

            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            return decodedToken.exp > currentTime;
        } catch (error) {
            // If decoding fails, token is invalid
            console.error("Invalid token", error);
            return false;
        }
    };

    // Ensure user is logged in before redirecting to any page except login and register
    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (token && isTokenValid(token)) {
            // Token exists and is valid
            setIsAuthenticated(true);
        } else {
            // Remove invalid token
            localStorage.removeItem("access_token");

            // Redirect to login for protected routes
            if (!isLoginPage && !isRegisterPage) {
                router.push("/login");
            } else {
                setIsAuthenticated(false);
            }
        }
    }, [router]);

    // don't reroute or load page until auth check is complete
    if (isAuthenticated === null) {
		return null;
    }

    return (
        <>
            <Head>
                <title>AlgoArena</title>
                <meta
                    name="description"
                    content="EdTech app for technical interview preparation"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>
            <Header
                showSignUpButton={isLoginPage}
                showSignInButton={isRegisterPage}
            />
            <div className="main-layout">
                {/* Use different page setup for auth pages and internal pages */}
                {isLoginPage || isRegisterPage ? null : <Sidebar />}
                <div
                    className={
                        isLoginPage || isRegisterPage
                            ? "auth-layout"
                            : "main-content"
                    }
                >
                    <Component {...pageProps} />
                    <Footer />
                </div>
            </div>
        </>
    );
}
