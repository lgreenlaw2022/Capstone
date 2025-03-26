# AlgoArena Frontend

## Technologies Used

-   React
-   Next.js
-   TypeScript
-   CSS
-   Axios for API requests

## Project Structure

```
frontend/
│
├── public/assets/          # icons and images
│   └── ... (icons)
├── src/
│   ├── api/
│   │   ├── api.ts         # Main API service
│   │   └── axiosInstance.ts  # Axios configuration
│   ├── components/        # Reusable React components
│   │   └── ... (components)
│   ├── pages/              # application pages
│   │   ├── learn/
│   │   │   ├── challenge/
│   │   │   ├── challenge-solution/
│   │   │   ├── concept-guide/
│   │   │   ├── quiz/
│   │   │   └── index.tsx
│   │   ├── review/
│   │   │   ├── [unitld].tsx
│   │   │   ├── index.tsx
│   │   │   └── weekly.tsx
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── badges.tsx
│   │   ├── goals.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── profile.tsx
│   │   ├── register.tsx
│   │   └── stats.tsx
│   ├── styles/             # CSS modules
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions and helpers
│
└── ...configuration files
```

## Key Pages

### Authentication

`/login`: User authentication interface

-   Allows users to sign in with email and password
-   Handles JWT token generation and storage

`/register`: New user registration

-   Collects user information
-   Creates new user account
-   Redirects to login after successful registration

### User Profile

`/profile`: User profile management

-   View personal information and account details

### Learning Paths

`/learn/index.tsx`

-   Landing page of the app
-   Directory of units and their modules
-   Open modules from this page

`/learn/challenge/[moduleId.tsx]`

-   Presents a coding challenge
-   Provides hints
-   Test cases check completion

`/learn/challenge-solution/[moduleId].tsx`

-   View detailed solution guides for a challenge

`/learn/concept-guide.[moduleId.tsx]`

-   Loads in-depth technical concept explanations (eg. Linked Lists)
-   Alternatively displays a recognition guide with techniques for recognizing problem strategies

`/learn/quiz/[moduleId].tsx`

-   Runs a quiz with multiple choice questions for the designated concept guide or recognition guide

### Review and Practice Material

`/review`:

-   Includes base page, [unitId] subpage, and weekly review subpage page
-   `index.tsx` displays options for a weekly review quiz, unit review quizzes, and bonus challenges
-   `[unitId].tsx` opens a review quiz for selected unit
-   `weekly.tsx` opens a quiz with questions from all practiced units, updates weekly

### Badges

`/badges.tsx`:

-   Display earned achievement and unit completion badges

### Goals

`/goals.tsx`:

-   Track progress towards daily and monthly goals
-   Set personalized goals
-   Earn gems for completed goals

### Stats

`stats/tsx`:

-   Optionally join and track ranking on a weekly XP leaderboard
-   View total XP earned
-   Compare practice habits against other users

## Making API requests

We use Axios for centralized API management. All API interactions are configured in `src/api/axiosInstance.ts`

### Basic Request Pattern

```typescript
// Example API GET call structure
export const getDailyGoals = async () => {
    try {
        const response = await axiosInstance.get('/goals/daily');
        return response.data;
    } catch (error) {
        // Log and rethrow error
        console.error('Error fetching goals', error);
        throw error;
    }
}

// Example API POST call structure
export const addGoalReward = async (goalId: number) => {
    try {
        const response = await axiosInstance.post(`/goals/${goalId}/add-gems`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching goal reward:', error.message);
        } else {
            console.error('Unknown error fetching goal reward:', error);
        throw error;
    }
}
```

### Using API calls

```typescript
import { getDailyGoals, addGoalReward } from "@/api/api";

// GET
const dailyData = await getDailyGoals();
// POST
await addGoalReward(goal.goalId);
```

## Authentication

The application uses JWT for authentication:

-   Token stored in localStorage
-   Frontend validation checks token expiration
-   Protected routes redirect to login if unauthorized
