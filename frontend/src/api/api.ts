import axiosInstance from './axiosInstance';
import axios from 'axios';


export const getUserBioData = async () => {
    try {
        const response = await axiosInstance.get('/user/bio-data');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching user stats:', error.message);
        } else {
            console.error('Unknown error fetching user stats:', error);
        }
        throw error;
    }
};

export const getUserStats = async () => {
    try {
        const response = await axiosInstance.get('/user/stats');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching user stats:', error.message);
        } else {
            console.error('Unknown error fetching user stats:', error);
        }
        throw error;
    }
};

export const getUserXp = async () => {
    try {
        const response = await axiosInstance.get('/user/xp');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching user xp:', error.message);
        } else {
            console.error('Unknown error fetching user xp:', error);
        }
        throw error;
    }
};

export const registerUser = async (username: string, email: string, password: string) => {
    try {
        await logoutUser(); // Ensure users are logged out before registering
        const response = await axiosInstance.post('/auth/register', { username, email, password });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // throw the error message if the backend returns a known 400 error
            throw new Error(error.response.data.error);
        } else {
            console.error('Unknown error registering user.', error);
            return { error: 'Unknown error occurred' };
        }
    }
};

export const loginUser = async (userIdentifier: string, password: string) => {
    try {
        await logoutUser(); // Ensure no user is logged in already
        const response = await axiosInstance.post('/auth/login', { userIdentifier, password });
        const data = response.data;
        localStorage.setItem('access_token', data.access_token);
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error logging in user:', error.message);
        } else {
            console.error('Unknown error logging in user:', error);
        }
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.log('No access token found, user is already logged out');
            return;
        }

        const response = await axiosInstance.post('/auth/logout');
        localStorage.removeItem('access_token');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error logging out user:', error.message);
        } else {
            console.error('Unknown error logging out user:', error);
        }
        throw error;
    }
};


export const deleteUser = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await axiosInstance.post('/auth/delete');

        localStorage.removeItem('access_token');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error deleting user:', error.message);
        } else {
            console.error('Unknown error deleting out user:', error);
        }
    }
};
          
// Function to get units in the prep course (id 1)
export const getUnitsInPrepCourse = async () => {
    try {
        const response = await axiosInstance.get('content/courses/1/units');
        // considering caching the response
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching units in prep course:', error.message);
        } else {
            console.error('Unknown error fetching units in prep course:', error);
        }
        throw error;
    }
};

export const getModulesInUnit = async (unitId: number) => {
    try {
        const response = await axiosInstance.get(`content/units/${unitId}/modules`);
        return response.data;
    } catch (error) {
        // Extract the error message handlign since its common
        if (error instanceof Error) {
            console.error('Error fetching modules:', error.message);
        } else {
            console.error('Unknown error fetching modules:', error);
        }
        throw error;
    }
};

export const getModuleContent = async (moduleId: number) => {
    try {
        const response = await axiosInstance.get(`content/modules/${moduleId}`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching module content:', error.message);
        } else {
            console.error('Unknown error fetching module content:', error);
        }
        throw error;
    }
};

export const getQuizQuestions = async (moduleId: number) => {
    try {
        const response = await axiosInstance.get(`content/modules/${moduleId}/quiz-questions`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching quiz data:', error.message);
        } else {
            console.error('Unknown error fetching quiz data:', error);
        }
        return [];
    }
}

export const getModuleTitle = async (moduleId: number) => {
    try {
        const response = await axiosInstance.get(`/content/modules/${moduleId}/title`);
        return response.data;
    } catch (error) {
        console.error('Error fetching module title:', error);
        throw error;
    }
};

export const getUnitTitle = async (unitId: number) => {
    try {
        const response = await axiosInstance.get(`/content/units/${unitId}/title`);
        return response.data;
    } catch (error) {
        console.error('Error fetching unit title:', error);
        throw error;
    }
}

export const submitQuizScore = async (moduleId: number, accuracy: number) => {
    try {
        const response = await axiosInstance.post(`content/modules/${moduleId}/quiz-scores`, {
            accuracy: accuracy
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error submitting quiz data:', error.message);
        } else {
            console.error('Unknown error submitting quiz data:', error);
        }
    }
}

export const submitCompleteModule = async (moduleId: number) => {
    try {
        const response = await axiosInstance.post(`content/modules/${moduleId}/complete`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error submitting complete module:', error.message);
        } else {
            console.error('Unknown error submitting complete module:', error);
        }
    }
}

export const getCodeChallenge = async (moduleId: number) => {
    try {
        const response = await axiosInstance.get(`/content/code-challenges/${moduleId}`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching code challenge:', error.message);
        } else {
            console.error('Unknown error fetching code challenge:', error);
        }
        throw error;
    }
};

export const getBonusCodingChallenges = async () => {
    try {
        console.log('Fetching coding challenges');
        const response = await axiosInstance.get('/content/bonus-code-challenges');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching bonus coding challenges:', error.message);
        } else {
            console.error('Unknown error fetching bonus coding challenges:', error);
        }
        throw error;
    }
}

export const getCompletedUserUnits = async () => {
    try {
        const response = await axiosInstance.get('/content/units/completed');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching completed units:', error.message);
        } else {
            console.error('Unknown error fetching completed units:', error);
        }
        throw error;
    }
}

export const getBadges = async () => {
    try {
        const response = await axiosInstance.get('/badges/user-badges');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching badges:', error.message);
        } else {
            console.error('Unknown error fetching badges:', error);
        }
        throw error;
    }
}

export const getWeeklyReviewStatus = async () => {
    try {
        const response = await axiosInstance.get('/review/weekly-review/status');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching weekly review status:', error.message);
        } else {
            console.error('Unknown error fetching weekly review status:', error);
        }
        throw error;
    }
}

export const getWeeklyReviewQuestions = async () => {
    try {
        const response = await axiosInstance.get('/review/weekly-review/questions');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching weekly review questions:', error.message);
        } else {
            console.error('Unknown error fetching weekly review questions:', error);
        }
        throw error;
    }
}

export const submitWeeklyReviewScore = async (accuracy: number) => {
    try {
        const response = await axiosInstance.post('review/weekly-review/submit', {
            accuracy: accuracy
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error submitting weekly review score:', error.message);
        } else {
            console.error('Unknown error submitting weekly review score:', error);
        }
        throw error;
    }
}

export const getUnitQuestions = async (unitId: number) => {
    try {
        console.log('Fetching unit questions');
        const response = await axiosInstance.get(`/review/unit-review/${unitId}/questions`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching unit questions:', error.message);
        } else {
            console.error('Unknown error fetching unit questions:', error);
        }
        throw error;
    }
}

export const submitUnitReviewScore = async (unitId: number, accuracy: number) => {
    try {
        const response = await axiosInstance.post(`/review/units/${unitId}/submit`, {
            accuracy: accuracy
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error submitting unit review score:', error.message);
        } else {
            console.error('Unknown error submitting unit review score:', error);
        }
        throw error;
    }
}

export const getLeaderboard = async () => {
    try {
        console.log('Fetching leaderboard');
        const response = await axiosInstance.get('/leaderboard/weekly-rankings');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching leaderboard:', error.message);
        } else {
            console.error('Unknown error fetching leaderboard:', error);
        }
        throw error;
    }
}

export const getLeaderboardDaysLeft = async () => {
    try {
        const response = await axiosInstance.get('/leaderboard/days-left');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching leaderboard days left:', error.message);
        } else {
            console.error('Unknown error fetching leaderboard days left:', error);
        }
        throw error;
    }
}

export const getComparisonStats = async () => {
    try {
        const response = await axiosInstance.get('/leaderboard/weekly-comparison');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching comparison stats:', error.message);
        } else {
            console.error('Unknown error fetching comparison stats:', error);
        }
        throw error;
    }
}

export const getNumGoalsCompletedThisWeek = async () => {
    try {
        const response = await axiosInstance.get('/goals/week-completed-count');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching num goals completed this week:', error.message);
        } else {
            console.error('Unknown error fetching num goals completed this week:', error);
        }
        throw error;
    }
}

export const getDailyGoals = async () => {
    try {
        const response = await axiosInstance.get('/goals/daily');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching daily goals:', error.message);
        } else {
            console.error('Unknown error fetching daily goals:', error);
        }
        throw error;
    }
}

export const getWeeklyGoals = async () => {
    try {
        const response = await axiosInstance.get('/goals/weekly');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching weekly goals:', error.message);
        } else {
            console.error('Unknown error fetching weekly goals:', error);
        }
        throw error;
    }
}

export const getMonthlyGoals = async () => {
    try {
        const response = await axiosInstance.get('/goals/monthly');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching monthly goals:', error.message);
        } else {
            console.error('Unknown error fetching monthly goals:', error);
        }
        throw error;
    }
}

export const addGoalReward = async (goalId: number) => {
    try {
        const response = await axiosInstance.post(`/goals/${goalId}/add-gems`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching goal reward:', error.message);
        } else {
            console.error('Unknown error fetching goal reward:', error);
        }
        throw error;
    }
}

export const getUserChallengeHints = async (moduleId: number) => {
    try {
        const response = await axiosInstance.get(`/content/hints/${moduleId}`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching user challenge hints:', error.message);
        } else {
            console.error('Unknown error fetching user challenge hints:', error);
        }
        throw error;
    }
};

export const buyHint = async (hintId: number) => {
    try {
        const response = await axiosInstance.post(`/content/hints/${hintId}/buy`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 400) {
                // Return a message for users
                return { error: "Insufficient funds" };
            }
            console.error('Error buying hint:', error.response.data.error);
        } else {
            console.error('Unknown error buying hint:', error);
        }
        throw error;
    }
}

export const getUserChallengeTestCases = async (moduleId: number) => {
    try {
        const response = await axiosInstance.get(`/content/test-cases/${moduleId}`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching user challenge test cases:', error.message);
        } else {
            console.error('Unknown error fetching user challenge test cases:', error);
        }
        throw error;
    }
};


export const submitTestCase = async (testCaseId: number) => {
    try {
        const response = await axiosInstance.post(`/content/test-cases/${testCaseId}/verify`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error verifying user challenge test case:', error.message);
        } else {
            console.error('Unknown error verifying user challenge test case:', error);
        }
        throw error
    }
}

export const submitRuntimeResponse = async (moduleId: number, runtime: string) => {
    try {
        const response = await axiosInstance.post(`/content/modules/${moduleId}/runtime/submit`, {
            runtime: runtime
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error submitting runtime response:', error.message);
        } else {
            console.error('Unknown error submitting runtime response:', error);
        }
        throw error;
    }
}