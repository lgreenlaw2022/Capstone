from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from .enums import MetricType, TimePeriodType, ModuleType, QuizType

# Initialize SQLAlchemy for database operations
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)  # hashed passwords
    email = db.Column(db.String(100), nullable=False, unique=True)
    created_date = db.Column(db.DateTime, default=datetime.now(datetime.timezone.utc))  # Set upon creation
    # TODO: consider if this is redundant with the DailyUserActivity table
    streak = db.Column(db.Integer, default=0)
    gems = db.Column(db.Integer, default=0)
    # TODO: uncomment once functionality is added
    # dark_mode = db.Column(db.Boolean, default=False)  # UI preference
    leaderboard_on = db.Column(db.Boolean, default=True)  # Show leaderboard
    # TODO: consider if this should be stored in the DailyUserActivity table
    weekly_review_done = db.Column(db.Boolean, default=False)  # complete/incomplete

    # need to add the relationships to all the other tables
    # eg. user.badges + cascade delete

class Badge(db.Model):
    __tablename__ = "badges"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False)
    image_src = db.Column(db.String(255), nullable=False)  # Path or URL to badge image

class UserBadge(db.Model):
    __tablename__ = "user_badges"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    badge_id = db.Column(db.Integer, db.ForeignKey("badges.id"), primary_key=True)
    date_earned = db.Column(db.DateTime)

    user = db.relationship("User", back_populates="badges")
    badge = db.relationship("Badge", back_populates="users")

class Goal(db.Model):
    __tablename__ = "goals"

    id = db.Column(db.Integer, primary_key=True)
    metric = db.Column(db.Enum(MetricType), nullable=False)
    requirement = db.Column(
        db.Integer, nullable=False
    )  # The amount required to complete the quest
    time_period = db.Column(db.Enum(TimePeriodType), nullable=False)
    # TODO: consider if a start_date is needed here if I will give all users a goal

class UserGoal(db.Model):
    # need to decide when I may want to reap goals, maybe after 1 month
    # to do this I'll need some delete/cascade rules
    __tablename__ = "user_goals"
    
    # TODO: when developing queries, check if these columns are in the right tables for efficiency
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey("goals.id"), primary_key=True)
    date_earned = db.Column(db.DateTime)
    start_date = db.Column(db.Date, nullable=False) 

    user = db.relationship("User", back_populates="goals")
    goal = db.relationship("Goal", back_populates="users")

# Course Table
# This table will hold the broad technical interview course. It allows the website to expand to additional courses.
class Course(db.Model):
    __tablename__ = "courses"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)

    units = db.relationship("Unit", back_populates="course")

# Unit Table
class Unit(db.Model):
    __tablename__ = "units"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    order = db.Column(db.Integer, nullable=False)  # order in course, TODO: decide about this

    course = db.relationship("Course", back_populates="units")
    modules = db.relationship("Module", back_populates="unit")

class UserUnit(db.Model):
    __tablename__ = "user_units"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    unit_id = db.Column(db.Integer, db.ForeignKey("unit.id"), primary_key=True)
    # TODO: consider if I want to lock units until the previous unit is completed
    completed = db.Column(db.Boolean, default=False)

    user = db.relationship("User", back_populates="units")
    unit = db.relationship("Unit", back_populates="users")

# Module Table
class Module(db.Model):
    __tablename__ = "modules"

    id = db.Column(db.Integer, primary_key=True)    
    unit_id = db.Column(db.Integer, db.ForeignKey("units.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    module_type = db.Column(db.Enum(ModuleType), nullable=False)
    # this is the path to the json file containing the module text content
    content_file_path = db.Column(db.String(255), nullable=False)
    order = db.Column(db.Integer, nullable=False)  # order in unit

    # TODO: figure out what delete to use here
    unit = db.relationship("Unit", back_populates="modules")
    # TODO: work on how to handle hints
    hints = db.relationship(
        "Hint", back_populates="modules", cascade="all, delete-orphan"
    )  # Cascade delete

class UserModule(db.Model):
    __tablename__ = "user_modules"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"), primary_key=True)
    completed = db.Column(db.Boolean, default=False)
    open = db.Column(db.Boolean, default=False) # flag for if the user can start the module

    user = db.relationship("User", back_populates="modules")
    module = db.relationship("Module", back_populates="users")

class QuizQuestion(db.Model):
    __tablename__ = "quiz_questions"
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey("module.id"), index=True, nullable=False)
    title = db.Column(db.String(100), nullable=False)

    module = db.relationship("Module", back_populates="quiz")
    options = db.relationship(
        "QuizQuestionOption", back_populates="question", cascade="all, delete-orphan"
    )

# TODO: consider renaming this to QuizQuestionOption
class QuizOption(db.Model):
    # This table is for the options of the multiple choice quiz questions
    # necessary to have a separate table since I don't know how many options there will be (variable)
    __tablename__ = "quiz_options"

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("quiz_questions.id"), index=True, nullable=False)
    # TODO: can the code text be stored in a Text column?
    option_text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False, default=False)
    # TODO: should this be stored in QuizQuestion
    # TODO: it doesn't make sense that this is using the QuizType enum
    option_type = db.Column(db.Enum(QuizType), nullable=False)

    # Relationships
    question = db.relationship("QuizQuestion", back_populates="options")

class UserQuizQuestion(db.Model):
    __tablename__ = "user_quiz_questions"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("questions.id"), primary_key=True)
    # used to determine when review is needed
    last_practiced_date = db.Column(db.DateTime)

    user = db.relationship("User", back_populates="question")
    question = db.relationship("QuizQuestion", back_populates="users")

class Hint(db.Model):
    __tablename__ = "hints"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    order = db.Column(db.Integer, nullable=False) # order in which hints appear
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"))

    challenge = db.relationship("Module", back_populates="hints")

    # Check constraint ensuring that the associated module is of type 'CHALLENGE'
    __table_args__ = (
        db.CheckConstraint(
            "module_id IN (SELECT id FROM modules WHERE module_type = 'challenge')",
            name="check_hint_module_is_challenge",
        ),
    )

class DailyUserActivity(db.Model):
    __tablename__ = "daily_user_activity"

    # these values are used to help with assessing goal completion
    # values will be regularly reaped for storage
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    date = db.Column(db.Date, default=date.today)
    gems_earned = db.Column(db.Integer, default=0) # gems earned on this day, not total
    modules_completed = db.Column(db.Integer, default=0)
