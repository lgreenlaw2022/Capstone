import React, { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';

interface FormData {
    usernameOrEmail: string;
    password: string;
}

interface Errors {
    usernameOrEmail?: string;
    password?: string;
}

export default function LoginForm() {
    const [formData, setFormData] = useState<FormData>({
        usernameOrEmail: '',
        password: '',
    });

    const [errors, setErrors] = useState<Errors>({});

    // handle form input changes and update the component state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // clear the error when the user types again
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = (): boolean => {
        const newErrors: Errors = {}; // Reset errors to an empty object
        let isValid = true;

        if (!formData.usernameOrEmail) {
            newErrors.usernameOrEmail = 'Username or Email is required';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // override submission and check for empty inputs first
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            // TODO: Handle form submission
            console.log('Form submitted', formData);
        }
    };

    return (
        <div className={styles.form}>
            <div className={styles.title}>Sign in</div>
            <form className={styles.formFields} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="usernameOrEmail" className={styles.label}>Username or Email</label>
                    <input
                        type="text"
                        id="usernameOrEmail"
                        name="usernameOrEmail"
                        value={formData.usernameOrEmail}
                        onChange={handleChange}
                        className={styles.input}
                    />
                    {errors.usernameOrEmail && (
                        <span className={styles.error}>
                            {errors.usernameOrEmail}
                        </span>
                    )}
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
                    {errors.password && (
                        <span className={styles.error}>
                            {errors.password}
                        </span>
                    )}
                </div>

                <button type="submit" className={styles.submitButton}>Login</button>
            </form>
        </div>
    );
}