# Backend Overview

## Tech Stack

The backend is built using Flask, Python, and SQLAlchemy

## Folder Structure

```
backend/
├── content/              # Contains static content and guides
│   |__ bonus_challenges/
│   |__ templates/
|   ├── unit_1/
│   ├── unit_2/
│   ├── unit_3/
│   └── ... # additional unit folders
├── routes/               # API endpoints
│   ├── auth.py
│   ├── badges.py
│   ├── content.py
│   ├── goals.py
│   ├── leaderboard.py
│   ├── review.py
│   └── users.py
├── seed_data/            # Scripts to seed the database with initial data
│   ├── seed_content.py
│   ├── seed_goals.py
│   └── seed_users.py
├── services/             # Business logic and services
│   ├── user_service.py
│   ├── goal_service.py
│   └── leaderboard_service.py
├── models.py             # Database models
├── app.py                # Flask application setup
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
└── README.md             # This README file
```

## Database setup and seeding

To set up the database and seed it with initial data, run the following commands:

1. Initialize the database

```
flask db init
flask db migrate
flask db upgrade
```

2. seed the database

```
flask seed
```

## Course Content

## Routes

## Seed Data

## Services and Utilities

### User Service

Handles user-related business logic, such as authentication and user profile management.

### Goal Service

Manages goal-related operations, including creating, updating, and retrieving goals.

### Leaderboard Service

Handles leaderboard-related logic, such as calculating rankings and updating preferences.
