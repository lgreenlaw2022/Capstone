import LoginAdvertisement from "@/components/LoginAdvertisement"
import RegisterForm from "@/components/RegisterForm"
import styles from "../styles/Login.module.css"

export default function Register() {
    return (
        <div className={styles.loginContainer}>
            <LoginAdvertisement />
            <RegisterForm />
        </div>
    )
}