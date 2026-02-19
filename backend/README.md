# Graduate Outcomes Data Management - Backend API

FastAPI backend for the Graduate Outcomes Data Management System.

## Setup

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Configure environment variables:**
Create a `.env` file in the backend directory with your database credentials:
```env
DB_HOST=grad-outcomes-db.chc8eewosgc5.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=grad_outcomes_db
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

3. **Run the server:**
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Students
- `GET /api/students` - Get all students with optional filters
  - Query params: `name`, `major`, `school`, `term`
- `GET /api/students/{uid}` - Get specific student by UID
- `POST /api/students/{uid}/master` - Save master data for student

### Filters
- `GET /api/filters/majors` - Get list of unique majors
- `GET /api/filters/schools` - Get list of unique schools
- `GET /api/filters/terms` - Get list of unique terms

## API Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
