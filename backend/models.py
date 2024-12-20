from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint
from datetime import datetime, timezone
from enums import BadgeType, MetricType, TimePeriodType, ModuleType, QuizType, EventType
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


def current_datetime():
    return datetime.now(timezone.utc)


def current_date():
    return datetime.now(timezone.utc).date()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)  # hashed passwords
    email = db.Column(db.String(100), nullable=False, unique=True)
    created_date = db.Column(db.DateTime, default=current_datetime)  # Set upon creation
    # TODO: monitor if I want to index these
    streak = db.Column(db.Integer, default=0)
    gems = db.Column(db.Integer, default=0)
    xp = db.Column(db.Integer, default=0)
    # TODO: uncomment once functionality is added
    # dark_mode = db.Column(db.Boolean, default=False)  # UI preference
    leaderboard_on = db.Column(db.Boolean, default=True)  # Show leaderboard
    weekly_review_done = db.Column(db.Boolean, default=False)  # complete/incomplete

    __table_args__ = (
        CheckConstraint("gems >= 0", name="check_gems_non_negative"),
        CheckConstraint("xp >= 0", name="check_xp_non_negative"),
    )

    # need to add the relationships to all the other tables
    # eg. user.badges + cascade delete
    badges = db.relationship(
        "UserBadge", back_populates="user", cascade="all, delete-orphan"
    )
    activities = db.relationship(
        "DailyUserActivity", back_populates="user", cascade="all, delete-orphan"
    )
    goals = db.relationship(
        "UserGoal", back_populates="user", cascade="all, delete-orphan"
    )
    units = db.relationship(
        "UserUnit", back_populates="user", cascade="all, delete-orphan"
    )
    modules = db.relationship(
        "UserModule", back_populates="user", cascade="all, delete-orphan"
    )
    quiz_questions = db.relationship(
        "UserQuizQuestion", back_populates="user", cascade="all, delete-orphan"
    )
    user_hints = db.relationship(
        "UserHint", back_populates="user", cascade="all, delete-orphan"
    )

    # Set and check for password using Werkzeug functions.
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


class Badge(db.Model):
    __tablename__ = "badges"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False, unique=True, index=True)
    description = db.Column(db.Text)
    type = db.Column(db.Enum(BadgeType), nullable=False)
    criteria_expression = db.Column(
        db.String(255)
    )  # Store criteria expression eg. streak >= 7
    event_type = db.Column(
        db.Enum(EventType),
        default=EventType.STREAK_ACHIEVEMENT,
        nullable=False,
        index=True,
    )  # Store event trigger type

    users = db.relationship(
        "UserBadge", back_populates="badge", cascade="all, delete-orphan"
    )


class UserBadge(db.Model):
    __tablename__ = "user_badges"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    badge_id = db.Column(db.Integer, db.ForeignKey("badges.id"), primary_key=True)
    date_earned = db.Column(db.DateTime, default=current_datetime, nullable=False)

    user = db.relationship("User", back_populates="badges")
    badge = db.relationship("Badge", back_populates="users")


class Goal(db.Model):
    __tablename__ = "goals"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    metric = db.Column(db.Enum(MetricType), nullable=False)
    requirement = db.Column(
        db.Integer, nullable=False
    )  # The amount required to complete the quest
    time_period = db.Column(db.Enum(TimePeriodType), nullable=False)
    # TODO: consider if a start_date is needed here if I will give all users a goal

    users = db.relationship("UserGoal", back_populates="goal")


class UserGoal(db.Model):
    # need to decide when I may want to reap goals, maybe after 1 month
    # to do this I'll need some delete/cascade rules
    __tablename__ = "user_goals"

    # TODO: when developing queries, check if these columns are in the right tables for efficiency
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey("goals.id"), primary_key=True)
    date_assigned = db.Column(db.Date, default=current_date, primary_key=True)
    date_completed = db.Column(db.Date, nullable=True)

    user = db.relationship("User", back_populates="goals")
    goal = db.relationship("Goal", back_populates="users")


# This table will hold the broad technical interview course. It allows the website to expand to additional courses.
class Course(db.Model):
    __tablename__ = "courses"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)

    units = db.relationship("Unit", back_populates="course")  # not cascade deleting


class Unit(db.Model):
    __tablename__ = "units"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    order = db.Column(
        db.Integer, nullable=False
    )  # order in course, TODO: decide about this

    course = db.relationship("Course", back_populates="units")
    modules = db.relationship("Module", back_populates="unit")
    users = db.relationship(
        "UserUnit", back_populates="unit", cascade="all, delete-orphan"
    )


class UserUnit(db.Model):
    __tablename__ = "user_units"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    unit_id = db.Column(db.Integer, db.ForeignKey("units.id"), primary_key=True)
    completed = db.Column(db.Boolean, default=False)

    user = db.relationship("User", back_populates="units")
    unit = db.relationship("Unit", back_populates="users")


class Module(db.Model):
    __tablename__ = "modules"

    id = db.Column(db.Integer, primary_key=True)
    unit_id = db.Column(db.Integer, db.ForeignKey("units.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    module_type = db.Column(db.Enum(ModuleType), nullable=False, index=True)
    order = db.Column(db.Integer)  # order in unit

    # TODO: figure out what delete to use here
    unit = db.relationship("Unit", back_populates="modules")
    users = db.relationship(
        "UserModule", back_populates="module", cascade="all, delete-orphan"
    )
    quiz_questions = db.relationship(
        "QuizQuestion", back_populates="module", cascade="all, delete-orphan"
    )
    # TODO: work on how to handle hints
    hints = db.relationship(
        "Hint", back_populates="module", cascade="all, delete-orphan"
    )  # Cascade delete


class UserModule(db.Model):
    __tablename__ = "user_modules"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"), primary_key=True)
    completed = db.Column(db.Boolean, default=False)
    open = db.Column(
        db.Boolean, default=False
    )  # flag for if the user can start the module
    completed_date = db.Column(db.DateTime, nullable=True)  # used to help with review

    user = db.relationship("User", back_populates="modules")
    module = db.relationship("Module", back_populates="users")


class QuizQuestion(db.Model):
    __tablename__ = "quiz_questions"
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(
        db.Integer, db.ForeignKey("modules.id"), index=True, nullable=False
    )
    title = db.Column(db.String(100), nullable=False)
    # TODO: add explanation?

    module = db.relationship("Module", back_populates="quiz_questions")
    users = db.relationship(
        "UserQuizQuestion", back_populates="quiz_question", cascade="all, delete-orphan"
    )
    options = db.relationship(
        "QuizQuestionOption", back_populates="question", cascade="all, delete-orphan"
    )


class QuizQuestionOption(db.Model):
    # This table is for the options of the multiple choice quiz questions
    # necessary to have a separate table since I don't know how many options there will be (variable)
    __tablename__ = "quiz_question_options"

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(
        db.Integer, db.ForeignKey("quiz_questions.id"), index=True, nullable=False
    )
    # TODO: check how code snippets should be stored
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
    question_id = db.Column(
        db.Integer, db.ForeignKey("quiz_questions.id"), primary_key=True
    )
    # used to determine when review is needed
    last_practiced_date = db.Column(db.DateTime)
    # TODO: maybe track if they got it right or wrong

    user = db.relationship("User", back_populates="quiz_questions")
    quiz_question = db.relationship("QuizQuestion", back_populates="users")


class Hint(db.Model):
    __tablename__ = "hints"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    order = db.Column(db.Integer, nullable=False)  # order in which hints appear
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"), nullable=False)

    module = db.relationship("Module", back_populates="hints")
    user_hints = db.relationship(
        "UserHint", back_populates="hint", cascade="all, delete-orphan"
    )

    # Check constraint ensuring that the associated module is of type 'CHALLENGE'
    def __init__(self, text, order, module_id):
        self.text = text
        self.order = order
        self.module_id = module_id
        self.validate_module_type()

    def validate_module_type(self):
        module = Module.query.get(self.module_id)
        if module and module.module_type not in [
            ModuleType.CHALLENGE,
            ModuleType.BONUS_CHALLENGE,
        ]:
            raise ValueError(
                "Associated module must be of type 'CHALLENGE' or 'BONUS_CHALLENGE'"
            )


class UserHint(db.Model):
    __tablename__ = "user_hints"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    hint_id = db.Column(db.Integer, db.ForeignKey("hints.id"), primary_key=True)
    unlocked = db.Column(db.Boolean, default=False)

    hint = db.relationship("Hint", back_populates="user_hints")
    user = db.relationship("User", back_populates="user_hints")


class DailyUserActivity(db.Model):
    __tablename__ = "daily_user_activity"

    # these values are used to help with assessing goal completion
    # values will be regularly reaped for storage
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    date = db.Column(db.Date, default=current_date, primary_key=True)
    xp_earned = db.Column(db.Integer, default=0)  # xp earned on this day, not total
    gems_earned = db.Column(db.Integer, default=0)  # gems earned on this day, not total
    modules_completed = db.Column(db.Integer, default=0)
    streak_extended = db.Column(db.Boolean, default=False)

    user = db.relationship("User", back_populates="activities")
