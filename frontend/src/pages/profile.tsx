import styles from "@/styles/Profile.module.css"
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from "react"

import { logoutUser, deleteUser, getUserBioData } from "@/api/api"


interface UserData {
    username: string;
    email: string;
    created_date: string; // DD-MM-YYYY format
}

export default function Profile() {
    const [userData, setUserData] = useState<UserData>();
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserBioData();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        router.push('/login');
    };

    const handleDelete = async () => {
        try {
            const data = await deleteUser();
            router.push('/register');
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.summaryContainer}>
                <Image src="/assets/profile-icon.svg" height={90} width={90} alt="profile icon" />
                <div className={styles.nameText}>
                    <h3>{userData?.username}</h3>
                    <p>learner since {userData?.created_date}</p>
                </div>
                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <div className={styles.detailsContainer}>
                <h2>Account</h2>
                <div>
                    <p>Username</p>
                    <div className={styles.detailsBox}>
                        <p>{userData?.username}</p>
                    </div>
                </div>
                <div>
                    <p>Email</p>
                    <div className={styles.detailsBox}>
                        <p>{userData?.email}</p>
                    </div>
                </div>
                <button className={styles.deleteButton} onClick={handleDelete}>Delete Account</button>
            </div>
        </div>
    )
}