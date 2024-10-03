import React, { useState, useEffect } from 'react';
import styles from '../styles/RegisterForm.module.css';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    // handle form input changes and update the component state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // clear the error when the user types again
        setErrors({ ...errors, [name]: '' });
    };

    // update the matching error immediately when the user changes the password
    useEffect(() => {
        if (formData.password !== formData.confirmPassword) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: 'Passwords do not match',
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: '',
            }));
        }
    }, [formData.password, formData.confirmPassword]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = { ...errors };
        let isValid = true;

        if (!formData.username) {
            newErrors.username = 'Username is required';
            isValid = false;
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long';
            isValid = false;
        }

        // TODO: the email will need to be unique
        if (!formData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email address';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        // Intercept submission and validate inputs before submitting
        e.preventDefault();
        if (validateForm()) {
            // TODO: Handle form submission
            console.log('Form submitted', formData);
        }
    };

    return (
        <div className={styles.form}>
            <div className={styles.title}>Sign up</div>
            <form className={styles.formFields} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.label}>Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={styles.input}
                    />
                    {errors.username && <span className={styles.error}>{errors.username}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                    />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={styles.input}
                    />
                    {errors.password && <span className={styles.error}>{errors.password}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={styles.input}
                    />
                    {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
                </div>

                <button type="submit" className={styles.submitButton}>Sign up</button>
            </form>
        </div>
    );
}