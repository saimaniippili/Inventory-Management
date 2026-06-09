# Inventory & Order Management System

A comprehensive, full-stack inventory and order management application built to handle products, customers, and dynamic inventory tracking. The application features a Neo-Brutalist user interface and a robust backend API.

## Technology Stack

![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-000000?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-000000?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-000000?style=for-the-badge&logo=vite&logoColor=white)

![Python](https://img.shields.io/badge/Python-000000?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-000000?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-000000?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-000000?style=for-the-badge&logo=docker&logoColor=white)

## Features

- Product Management: Add, edit, delete, and search products with unique SKUs and automatic stock tracking.
- Customer Management: Manage customer profiles with unique email validation.
- Order Management: Create multi-item orders that automatically deduct from product inventory. Validation prevents ordering items with insufficient stock.
- Analytics Dashboard: View revenue over time, low-stock warnings, and top-level business metrics.
- Export Capabilities: Download order data locally via CSV export.

## Application Architecture

The project is structured as a decoupled full-stack application:
- `/frontend`: A React/Vite Single Page Application (SPA) styled with Tailwind CSS in a Neo-Brutalist design language.
- `/backend`: A FastAPI REST service utilizing SQLAlchemy for ORM-based interactions with a PostgreSQL database.

## Local Development Setup

### Prerequisites
- Docker and Docker Compose installed.

### Instructions

1. Clone the repository.
2. Copy the `.env.example` file to `.env` in the root directory.
3. Start the application stack using Docker Compose:
   ```bash
   docker-compose up --build
   ```
4. Access the applications:
   - Frontend: http://localhost:5173
   - Backend API Docs: http://localhost:8000/docs
   - Database: localhost:5432

## Environment Variables

Configuration is managed securely via environment variables.

- `DATABASE_URL`: Connection string for PostgreSQL.
- `POSTGRES_USER`: Database user.
- `POSTGRES_PASSWORD`: Database password.
- `POSTGRES_DB`: Database name.
