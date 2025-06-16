from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr


@as_declarative()
class Base:
    """
    SQLAlchemy 基礎類別
    
    所有模型都應繼承此類別，以獲得自動生成的 __tablename__ 屬性和其他共用功能
    """
    id: Any
    __name__: str
    
    # 自動生成表名稱，使用小寫類名
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower() 