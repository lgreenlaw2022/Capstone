import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ClipLoader } from 'react-spinners';

export default function Home() {
	const router = useRouter();
	const isLoggedIn = true; // TODO: Replace this with actual authentication logic

	useEffect(() => {
		if (isLoggedIn) {
			router.replace('/learn'); // Redirect to the main page if logged in
		} else {
			// TODO: if I want to always redirect to login or learn exclusively, change next.config.js
			router.replace('/login'); // Redirect to the sign-in page if not logged in
		}
	}, [isLoggedIn, router]);

	// TODO: Add a custom loading spinner or message
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
          <ClipLoader color="#3498db" size={40} />
        </div>
	);
}
