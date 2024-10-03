import LoginAdvertisement from "@/components/LoginAdvertisement"
import styles from "@/styles/Login.module.css"

export default function Login() {
    return (
        <div className={styles.container}>
            <LoginAdvertisement />
            <div></div>
        </div>
    )
}