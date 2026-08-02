# Import all models here so Base.metadata sees every table
# (used by scripts/seed.py and Alembic autogeneration).
from app.models.user import User
from app.models.customer import Customer
from app.models.visit_log import VisitLog
from app.models.product import Product
from app.models.review import Review
from app.models.chat_history import ChatHistory
