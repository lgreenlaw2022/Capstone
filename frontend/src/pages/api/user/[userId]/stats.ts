import type { NextApiRequest, NextApiResponse } from 'next';
import axiosInstance from '../../../../api/axiosInstance';

type UserStats = {
  streak: number;
  gems: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserStats | { error: string }>
) {
  const { userId } = req.query;

  try {
    const response = await axiosInstance.get(`/user/${userId}/stats`);
    res.status(200).json(response.data);
  } catch (error) {
    // TODO: decide what to do about types
    const err = error as any;
    res.status(err.response?.status || 500).json({ error: err.message });
  }
}