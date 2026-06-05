from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import models, schemas

# --- PRODUCT CRUD ---

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).order_by(models.Product.id.asc()).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity=product.quantity
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    db.delete(db_product)
    db.commit()
    return db_product


# --- CUSTOMER CRUD ---

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).order_by(models.Customer.id.asc()).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    db.delete(db_customer)
    db.commit()
    return db_customer


# --- ORDER CRUD ---

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).order_by(models.Order.id.desc()).offset(skip).limit(limit).all()

def create_order(db: Session, order_data: schemas.OrderCreate):
    customer = get_customer(db, order_data.customer_id)
    if not customer:
        raise ValueError(f"Customer with ID {order_data.customer_id} does not exist.")
    
    total_amount = 0.0
    order_items = []
    
    # We run the stock check and stock deduction inside a single db transaction context.
    # If any check fails, we raise an error and the caller or FastAPI handles rollback or we rollback manually.
    try:
        for item in order_data.items:
            product = get_product(db, item.product_id)
            if not product:
                raise ValueError(f"Product with ID {item.product_id} does not exist.")
            
            if product.quantity < item.quantity:
                raise ValueError(f"Insufficient stock for product '{product.name}'. Requested: {item.quantity}, Available: {product.quantity}.")
            
            product.quantity -= item.quantity
            
            item_total = product.price * item.quantity
            total_amount += item_total
            
            db_order_item = models.OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price=product.price
            )
            order_items.append(db_order_item)
        
        db_order = models.Order(
            customer_id=order_data.customer_id,
            total_amount=total_amount
        )
        db.add(db_order)
        db.flush()
        
        for db_order_item in order_items:
            db_order_item.order_id = db_order.id
            db.add(db_order_item)
            
        db.commit()
        db.refresh(db_order)
        return db_order
        
    except Exception as e:
        db.rollback()
        raise e

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        return None
        
    try:
        # Restore stock for each item in the order
        for item in db_order.items:
            product = get_product(db, item.product_id)
            if product:
                product.quantity += item.quantity
                
        db.delete(db_order)
        db.commit()
        return db_order
    except Exception as e:
        db.rollback()
        raise e
