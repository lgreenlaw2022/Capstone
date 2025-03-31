# Capstone

**Project Title**: Mastering Technical Interviews Through Gamified Learning: An Evidence-Based Educational Platform

This repo is a senior capstone project for Minerva University. It will be completed in Spring 2025.

**Deployed App** (on Railway): [https://capstone-production-e274.up.railway.app/login](https://capstone-production-e274.up.railway.app/login)

## Project Abstract

Technical interviews are a critical step in securing a software engineering role. However, technical interview preparation resources are often fragmented and narrowly focused, lacking an effective and cohesive program. This fragmentation leads to inefficient study practices and decreased motivation among users. Further, practice resources like LeetCode questions typically focus on memorizing problem solutions and do not promote deep strategy-based learning. This web application addresses these issues by centralizing study resources—including practice questions, coding challenges, and topic study guides—into a comprehensive curriculum. The website will utilize the principles of science of learning to foster deep and transferable knowledge. By integrating learning techniques such as spaced practice and interleaving, and incorporating gamification elements like points, leaderboards, and badges, the application aims to enhance user engagement and motivation. These feature choices are supported by research demonstrating that well-designed gamification elements increase user engagement and motivation to learn. The deliverable is a full-stack website with an asynchronous learning journey that allows users to track their progress and maximize their time with increased enjoyment. The ultimate goal is to elevate the efficacy and appeal of technical interview preparation through a scientifically grounded, gamified learning experience.

## Tech Stack

**Frontend**: Next.js, React.js, Typescript, CSS

**Backend**: Python (Flask), SQLAlchemy

## Key Features

1. Topic guides, concept quizzes, coding exercises
2. User accounts and progress tracking
3. Exercise and concept progress bars
4. Answer feedback
5. Skill pathways (“unlock” lessons with progress)
6. Personalized daily/weekly goals (includes streaks)
7. Badges
8. Leaderboards
9. Weekly concept reviews (review questions from all completed skills)
10. Gems as rewards to unlock hints and extra code challenges

## Getting Started

### Prerequisites

- Node.js
- Python 3.x
- Flask
- SQLAlchemy

### Installation

1. **Clone the repository**

  ```bash
  git clone https://github.com/your-username/capstone.git
  cd capstone
  ```

2. **Backend setup**

- Navigate to the backend directory:

  ```bash
  cd backend
  ```

- create a virtual environment:

  ```bash
  python -m venv venv
  source venv/bin/activate  # On Windows use venv\Scripts\activate
  ```

- install packages:

  ```bash
  pip install -r requirements.txt
  ```

- seed your local db instance with data (includes course content, badges, and goals)

  ```bash
  flask seed
  ```

- run the backend server:
  ```bash
  flask run
  ```

3. **Frontend Setup**

- Navigate to the frontend directory

  ```bash
  cd ../frontend
  ```

- install the required packages:

  ```bash
  npm install
  ```

- run the frontend development server:

  ```bash
  npm run dev
  ```

4. **Open the application**
   Open http://localhost:3000 with your browser to see the result.
