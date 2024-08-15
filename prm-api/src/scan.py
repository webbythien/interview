import asyncio
import time
import traceback
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
import os
Base = declarative_base()

# Define your models here
class Order(Base):
    __tablename__ = 'order'
    id = Column(Integer, primary_key=True)
    status = Column(Integer)
    expire = Column(DateTime)

class OrderDetail(Base):
    __tablename__ = 'order_detail'
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('order.id'))
    product_id = Column(Integer, ForeignKey('product.id'))
    amount = Column(Integer)
    status = Column(Integer)

class Payment(Base):
    __tablename__ = 'payment'
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('order.id'))
    status = Column(Integer)

class Product(Base):
    __tablename__ = 'product'
    id = Column(Integer, primary_key=True)
    amount = Column(Integer)

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def scan_product_payment():
    db: Session = SessionLocal()
    try:
        while True:
            print(f"\n===============================")
            orders: list[Order] = (
                db.query(Order)
                .filter(Order.status == 2, Order.expire < datetime.now())
                .all()
            )

            for order in orders:
                print(f"\norder_id = {order.id} ")
                order.status = 0
                payment: Payment = db.query(Payment).filter(Payment.order_id == order.id).first()
                if payment:
                    payment.status = 0
                order_details: list[OrderDetail] = (
                    db.query(OrderDetail).filter(OrderDetail.order_id == order.id).all()
                )
                for order_detail in order_details:
                    product: Product = (
                        db.query(Product)
                        .filter(Product.id == order_detail.product_id)
                        .first()
                    )
                    if product:
                        print(f"\n product id plus amount = {product.id} ")
                        product.amount += order_detail.amount
                        order_detail.status = 0
            db.commit()
            time_sleep = 60*5
            print(f"\nSleep {time_sleep} seconds")
            time.sleep(time_sleep)
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(scan_product_payment())
