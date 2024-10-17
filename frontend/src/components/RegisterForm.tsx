import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Form.module.css';

import { registerUser } from '../api/api';

interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface Errors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
}

export default function RegisterForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Errors>({});

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

    // check and set errors for each field
    const validateForm = () => {
        const newErrors: Errors = {};
        let isValid = true;

        if (!formData.username) {
            newErrors.username = 'Username is required';
            isValid = false;
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long';
            isValid = false;
        }

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // Intercept submission and validate inputs before submitting
        e.preventDefault();
        if (validateForm()) {
            try {
                const data = await registerUser(formData.username, formData.email, formData.password);
                console.log('User registered:', data);
                router.push('/login');
            } catch (error) {
                if (error instanceof Error) {
                    setErrors({ ...errors, form: `${error.message}` });
                } else {
                    setErrors({ ...errors, form: 'An unexpected error occurred. Please try again.' });
                }
            }
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
                {errors.form && <div className={styles.error}>{errors.form}</div>}
                <button type="submit" className={styles.submitButton}>Sign up</button>
            </form>
        </div>
    );
}