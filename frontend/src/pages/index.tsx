import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ClipLoader } from 'react-spinners';

export default function Home() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // ensure user is logged in before redirecting to learn page
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // redirect to learn page if user is logged in
    if (isLoggedIn) {
        router.replace('/learn');
    } else if (isLoading) {
        // Show loading spinner while checking auth status
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100vw',
                    height: '100vh'
                }}
            >
                <ClipLoader size={50} color={"#123abc"} loading={isLoading} />
            </div>
        );
    }
    else {
        // Redirect to the sign-in page if not logged in
        router.replace('/login');
    }
}
