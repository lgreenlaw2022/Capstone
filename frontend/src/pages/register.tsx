import LoginAdvertisement from "@/components/LoginAdvertisement"
import RegisterForm from "@/components/RegisterForm"
import styles from "../styles/Auth.module.css"

export default function Register() {
    return (
        <div className={styles.authContainer}>
            <LoginAdvertisement />
            <RegisterForm />
        </div>
    )
}