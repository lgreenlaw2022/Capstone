import styles from "@/styles/Profile.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { logoutUser, deleteUser, getUserBioData } from "@/api/api";
import Loading from "@/components/Loading";

interface UserData {
    username: string;
    email: string;
    created_date: string; // DD-MM-YYYY format
}

export default function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchUserData = async () => {
            try {
                const data = await getUserBioData();
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        router.push("/login");
    };

    const handleDelete = async () => {
        if (
            !confirm(
                "Are you sure you want to delete your account? This action cannot be undone."
            )
        ) {
            return;
        }
        try {
            const data = await deleteUser();
            router.push("/register");
        } catch (error) {
            setError("Error deleting account. Please try again.");
            console.error("Error deleting user:", error);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className={styles.profileContainer}>
            <div className={styles.summaryContainer}>
                <Image
                    src="/assets/profile-icon.svg"
                    height={90}
                    width={90}
                    alt="profile icon"
                />
                <div className={styles.nameText}>
                    <h3>{userData?.username}</h3>
                    <p>learner since {userData?.created_date}</p>
                </div>
                <button type="button" onClick={handleLogout}>
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
                <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={handleDelete}
                >
                    Delete Account
                </button>
                <p className={styles.error}>{error}</p>
            </div>
        </div>
    );
}
