import type { NextApiRequest, NextApiResponse } from 'next';
import axiosInstance from '../../api/axiosInstance';

type Data = {
    message?: string;
    error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const response = await axiosInstance.post('/auth/register', {
            username,
            email,
            password,
        });

        if (response.status !== 201) {
            return res.status(response.status).json({ error: response.data.error });
        }

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}