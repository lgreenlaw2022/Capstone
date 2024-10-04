import LoginAdvertisement from "@/components/LoginAdvertisement"
import LoginForm from "@/components/LoginForm"
import styles from "@/styles/Auth.module.css"

export default function Login() {
    return (
        <div className={styles.authContainer}>
            <LoginAdvertisement />
            <LoginForm />
        </div>
    )
}