import sys
import os

# Add the app directory to the path so we can import local modules
sys.path.append("/app")

from database import SessionLocal, engine
import models
import schemas
import crud
from datetime import datetime, timedelta
import random

def seed_database():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(models.Product).first():
        print("Database already has data. Skipping seed.")
        return

    print("Seeding database...")

    # 1. Add Products
    products_data = [
        {"name": "Wireless Noise-Canceling Headphones", "sku": "AUD-001", "price": 12999.00, "quantity": 45},
        {"name": "Mechanical Gaming Keyboard", "sku": "KEY-002", "price": 8500.00, "quantity": 12},
        {"name": "Ultra-Wide 34-inch Monitor", "sku": "MON-003", "price": 35000.00, "quantity": 5},
        {"name": "Ergonomic Office Chair", "sku": "FUR-004", "price": 15500.00, "quantity": 8},
        {"name": "Bluetooth Desk Speakers", "sku": "AUD-005", "price": 4200.00, "quantity": 30},
        {"name": "USB-C Hub (7-in-1)", "sku": "ACC-006", "price": 2100.00, "quantity": 100},
        {"name": "1TB NVMe SSD", "sku": "STO-007", "price": 7800.00, "quantity": 25},
        {"name": "Wireless Mouse (Rechargeable)", "sku": "MOU-008", "price": 2999.00, "quantity": 50},
        {"name": "1080p Webcam with Mic", "sku": "VID-009", "price": 3499.00, "quantity": 15},
        {"name": "Standing Desk Converter", "sku": "FUR-010", "price": 12000.00, "quantity": 3}, # Low stock
    ]
    
    products = []
    for p in products_data:
        prod = models.Product(**p)
        db.add(prod)
        products.append(prod)
    
    # 2. Add Customers
    customers_data = [
        {"full_name": "Rohan Sharma", "email": "rohan.s@example.in", "phone_number": "9876543210"},
        {"full_name": "Priya Patel", "email": "priya.p@techcorp.co", "phone_number": "9988776655"},
        {"full_name": "Amit Kumar", "email": "amit.k@gmail.com", "phone_number": "9123456780"},
        {"full_name": "Sneha Gupta", "email": "sneha.design@studio.net", "phone_number": "9898989898"},
        {"full_name": "Vikram Singh", "email": "vikram.s@logistics.com", "phone_number": "9555555555"},
    ]
    
    customers = []
    for c in customers_data:
        cust = models.Customer(**c)
        db.add(cust)
        customers.append(cust)
    
    db.commit()

    # 3. Add Orders
    statuses = ["Pending", "Processing", "Delivered"]
    
    for i in range(12):
        customer = random.choice(customers)
        status = random.choice(statuses)
        
        num_items = random.randint(1, 3)
        order_items = []
        total_amount = 0
        
        for _ in range(num_items):
            product = random.choice(products)
            qty = random.randint(1, 2)
            if product.quantity >= qty:
                order_items.append(
                    models.OrderItem(
                        product_id=product.id,
                        quantity=qty,
                        price_at_time=product.price
                    )
                )
                total_amount += product.price * qty
                product.quantity -= qty # deduct stock
        
        if order_items:
            order = models.Order(
                customer_id=customer.id,
                total_amount=total_amount,
                status=status
            )
            # Randomize date over last 30 days
            days_ago = random.randint(0, 30)
            order.created_at = datetime.utcnow() - timedelta(days=days_ago)
            
            db.add(order)
            db.commit()
            db.refresh(order)
            
            for item in order_items:
                item.order_id = order.id
                db.add(item)
            
            db.commit()

    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
