import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";
import { Roboto } from 'next/font/google';
import { Roboto_Condensed } from 'next/font/google';
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const roboto = Roboto({
	weight: ['400', '500', '700', '900'],
	style: ['normal', 'italic'],
	subsets: ['latin'],
	display: 'swap',
});

const robotoCondensed = Roboto_Condensed({
	weight: ['400', '600', '700', '800'],
	style: ['normal'],
	subsets: ['latin'],
	display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const isLoginPage = router.pathname === '/login';
	const isRegisterPage = router.pathname === '/register';
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // Ensure user is logged in before redirecting to any page except login and register
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsAuthenticated(true);
        } else {
            if (router.pathname !== '/login' && router.pathname !== '/register') {
                router.push('/login');
            } else {
                setIsAuthenticated(false);
            }
        }
    }, [router]);

    // don't change anything until auth check is complete
    if (isAuthenticated === null) {
        return;
    }

	return (
		<>
			<Head>
				<title>AlgoArena</title>
				<meta name="description" content="EdTech app for technical interview preparation" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<Header showSignUpButton={isLoginPage} showSignInButton={isRegisterPage} />
			<div className="main-layout">
				{isLoginPage || isRegisterPage ? null : <Sidebar />}
				<div className={isLoginPage || isRegisterPage ? 'auth-layout' : 'main-content'}>
					<Component {...pageProps} />
					<Footer />
				</div>
			</div>
		</>
	);
}
