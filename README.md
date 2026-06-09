# Modern Inventory Management System

A full-stack, real-time inventory and order management system built for high performance and beautiful UI. 

## 🚀 Features
* **Dashboard:** Real-time metrics, low stock alerts, and revenue charts.
* **Product Management:** Add, edit, delete, and track stock levels with unique SKUs.
* **Customer Management:** Keep track of customer details with strict email and phone validation.
* **Order Processing:** Create orders, automatically deduct stock, and track delivery status.
* **Security & Rules:** Prevents negative stock, duplicate SKUs, and duplicate emails.

## 💻 Tech Stack
* **Frontend:** React, TypeScript, Vite, TailwindCSS (Dark/Glassmorphism theme)
* **Backend:** Python, FastAPI, SQLAlchemy
* **Database:** PostgreSQL
* **Infrastructure:** Docker & Docker Compose

## 🛠️ How to Run (One-Command Setup)
This project is fully containerized. You do not need to install Python, Node, or PostgreSQL on your computer. You only need Docker!

1. Make sure **Docker Desktop** is open and running.
2. Open a terminal in this project folder.
3. Run the following command:
```bash
docker-compose up --build -d
```
4. Wait about 30 seconds for the containers to start.
5. Open your web browser and go to: **[http://localhost:5173](http://localhost:5173)**

*To stop the system, run:* `docker-compose down`
