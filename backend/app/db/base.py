# 匯入所有模型，以便 Alembic 可以自動生成遷移腳本
# 這個文件主要用於 Alembic 的自動遷移功能

from app.db.base_class import Base  # noqa
# 在此處匯入所有模型，例如:
# from app.models.user import User  # noqa 