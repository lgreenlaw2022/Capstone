# Backend Overview

## Tech Stack

The backend is built using Flask, Python, and SQLAlchemy with a PostgreSQL database. JWT token authorization.

Deployed on Railway.

## Folder Structure

```
backend/
├── content/              # Contains static content and guides
│   ├── bonus_challenges/
│   |   ├── unit_1/
│   |   └── ... # additional unit folders
│   ├── templates/
|   ├── unit_1/
│   └── ... # additional unit folders
├── migrations/           # schema change version history
├── routes/               # API endpoints
│   ├── auth.py
│   ├── badges.py
│   ├── content.py
│   ├── goals.py
│   ├── leaderboard.py
│   ├── review.py
│   └── user_info_.py
├── seed_data/            # content for the db setup
│   ├── badges.yaml
│   └── ... # additional seed data files
├── services/             # Services for complex logic
│   ├── badge_awarding_service.py
│   ├── goals_service.py
│   └── user_activity_service.py
├── models.py             # Database models
├── app.py                # Flask application setup
├── config.py             # Configuration settings
├── constants.py          # Commonly used values
├── Dockerfile            # Start scripts and deployment configuration
├── requirements.txt      # Python dependencies
├── seed.py               # Scripts to load seed data into db
├── utils.py              # Common helper functions
└── README.md             # This README file
```

## Database setup and seeding

To set up the database and seed it with initial data, run the following commands:

1. Initialize the database

```bash
flask db init
flask db migrate
flask db upgrade
```

2. seed the database

```bash
flask seed
```

### Schema/model changes

Update database schema

```bash
flask db migrate -m "Migration message."
flask db upgrade
```

## Routes

Blueprints are used in the application to organize content. Each blueprint roughly corresponds to a page on the frontend and its associated requests.

Each blueprint is registered with a specific URL prefix (e.g., `/auth`, `/user`, `/goals`), and the endpoints can be accessed by appending the route to the prefix. For example:

- To register a user: `POST /auth/register`
- To get daily goals: `GET /goals/daily`

### Auth

API URL prefix: "auth/"

Handles user authentication and account management.

**Key endpoints**:

- `POST /auth/register`: Registers a new user.
- `POST /auth/login`: Logs in a user and returns a JWT access token.
- `POST /auth/logout`: Logs out a user by clearing the JWT cookies.
- `POST /auth/delete`: Deletes the logged-in user's account.
- `GET /auth/protected`: A protected route to verify JWT authentication.

### Badges

API URL prefix: "badges/"

Handles user badges and achievements.

**Key Endpoints**:

- `GET /badges/user-badges`: Retrieves all badges earned by the user.

### Content

API URL prefix: "content/"

Manages course content, modules, quizzes and user progress through them.

**Key Endpoints**:

- `GET /content/courses/<course_id>/units`: Retrieves all units in a course.
- `GET /content/units/<unit_id>/modules`: Retrieves all modules in a unit.
- `GET /content/modules/<module_id>`: Retrieves the content for a specific module.
- `POST /content/modules/<module_id>/quiz-scores`: Submits the user's quiz score for a module.
- `POST /content/modules/<module_id>/complete`: Marks a module as complete and opens the next module(s).
- `GET /content/modules/<int:module_id>/quiz-questions`: Retrieves quiz questions and options for a specific module.
- `GET /content/code-checks/<int:module_id>`: Retrieves test cases and runtime details for a specific challenge module.
- `GET /content/hints/<int:module_id>`: Retrieves all hints for a specific challenge module.
- `POST /content/hints/<int:hint_id>/buy`: Unlocks a specific hint for the user by deducting gems.
- `POST /content/test-cases/<int:test_case_id>/verify`: Marks a specific test case as verified for the user.
- `GET /content/bonus-code-challenges`: Retrieves all bonus challenges available to the user.
- `POST /content/bonus-challenges/<int:challenge_id>/buy`: Unlocks a bonus challenge for the user by deducting gems.

### Goals

API URL prefix: "goals/"

Manages user goals and rewards.

**Key endpoints**:

- `GET /goals/daily`: Retrieves the user's daily goals with progress details.
- `GET /goals/monthly`: Retrieves the user's monthly goals with progress details.
- `POST /goals/<int:goal_id>/add-gems`: Rewards gems when a goal is completed.
- `POST /goals/add-personal`: Allows users to add personalized goals.
- `GET /goals/should-allow-personal`: Checks if users can add personalized goals (only allowed in the first week of the month).
- `PUT /goals/reward-weekly-completion-goal`: Rewards users for completing the weekly goal quota.

### Leaderboard

API URL prefix: "leaderboard/"

Manages leaderboard rankings and user comparisons.

**Key Endpoints**:

- `GET /leaderboard/days-left`: Retrieves the number of days left in the current week.
- `GET /leaderboard/show-preference`: Retrieves the user's preference for showing the leaderboard.
- `PUT /leaderboard/show-preference`: Updates the user's preference for showing the leaderboard.
- `GET /leaderboard/weekly-rankings`: Retrieves the weekly leaderboard rankings and if applicable, rewards winners each week.
- `GET /leaderboard/weekly-comparison`: Calculates the user's weekly performance (streak, modules, and goals) compared with other users.

### Review

API URL prefix: "review/"

Handles weekly and unit-based review functionality.

**Key Endpoints**:

- `GET /review/weekly-review/questions`: Retrieves weekly review questions for the user.
- `GET /review/weekly-review/status`: Checks if the user has completed the weekly review.
- `POST /review/weekly-review/submit`: Submits the user's weekly review accuracy and rewards XP if the threshold is met.
- `GET /review/unit-review/<unit_id>/questions`: Retrieves review questions for a specific unit.
- `POST /review/units/<unit_id>/submit`: Submits the user's quiz score for a unit review and rewards XP if the accuracy threshold is met.

### User Info

API URL prefix: "user/"

Provides user-specific information for profile and stats.

**Key endpoints**:

- `GET /user/bio-data`: Retrieves the user's bio data (username, email, and account creation date).
- `GET /user/stats`: Retrieves the user's streak, gems, and username.
- `GET /user/xp`: Retrieves the user's total XP.

## Course Content

The course content is stored in html files that are loaded and parsed by the frontend. All module types except quizzes rely on these files: concept guides, recognition guides, and code challenges. Code challenges include the appropriate starter or completed code in a `code.txt` file and its content guide in an `html` file.

Each unit has its own folder within `content/` with files named by the module's order in the unit and its type.

The template folders include basic content structures for each module type to ensure the consistency of new content.

Bonus challenges for all units are in the `bonus_challenges/` folder. Challenges are in folders by unit and include content html and code txt files.

## Seed Data

The seed data in `seed/` includes critical course content and core database data. This includes badges, goals, units, modules, code challenge test cases and hints, and quiz questions. Data is grouped by type in files for clarity.

Data is in a yaml format that matches the required values for the corresponding db model. `seed.py` includes a function that reads data from the seed files and adds the entries to the database.

## Services

### User Service

Handles user-related business logic, such as resetting streaks and rewarding XP.

### Goal Service

Manages goal-related operations, including creating and retrieving goals.

### Badge Service

Handles badge-related logic, such as checking completion status and awarding badges.

## Database Schema

### User

- Represents the users of the application
- Tracks user-specific data such as username, password, email, streak, XP, gems, and relationships to other entities

### Badge

- Represents badges that users can earn
- Includes details such as title, description, type, and criteria for earning the badge

### UserBadge

- Represents the relationship between users and badges
- Tracks which badges a user has earned and when they were earned

### Goal

- Represents goals that users can work toward
- Includes details such as title, metric, requirement, and time period

### UserGoal

- Represents the relationship between users and goals
- Tracks which goals are assigned to a user, when they were assigned, and when they were completed

### Course

- Represents a course in the application
- Allows for the expansion of the application to include multiple courses

### Unit

- Represents a unit within a course
- Tracks the order of units in a course and their relationship to modules

### UserUnit

- Represents the relationship between users and units
- Tracks which units a user has completed

### Module

- Represents a module within a unit
- Includes details such as title, type, order, and target runtime (for challenges)

### UserModule

- Represents the relationship between users and modules
- Tracks which modules a user has completed, whether they are open, and additional details for challenges

### QuizQuestion

- Represents a quiz question within a module
- Includes the question title and its relationship to options

### QuizQuestionOption

- Represents the options for a quiz question
- Tracks the text of the option, whether it is correct, and its type

### UserQuizQuestion

- Represents the relationship between users and quiz questions
- Tracks when a user last practiced a question

### Hint

- Represents hints for modules
- Includes the text of the hint and its order

### UserHint

- Represents the relationship between users and hints
- Tracks whether a user has unlocked a hint

### TestCase

- Represents test cases for coding challenges
- Includes the input for the test case and its relationship to outputs

### TestCaseOutput

- Represents the outputs for a test case
- Tracks the expected output for a given test case

### UserTestCase

- Represents the relationship between users and test cases
- Tracks whether a user's code has been verified for a test case

### DailyUserActivity

- Tracks daily activity for users
- Includes metrics such as XP earned, gems earned, modules completed, and whether the streak was extended
