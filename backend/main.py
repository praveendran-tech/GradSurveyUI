from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import database
from datetime import datetime

app = FastAPI(title="Graduate Outcomes Data Management API")

# CORS configuration - allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class MasterDataCreate(BaseModel):
    selected_source: str
    current_activity: Optional[str] = None
    employment_status: Optional[str] = None
    current_employer: Optional[str] = None
    current_position: Optional[str] = None
    enrollment_status: Optional[str] = None
    current_institution: Optional[str] = None
    military_branch: Optional[str] = None
    military_rank: Optional[str] = None

@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Graduate Outcomes Data Management API", "status": "running"}

@app.get("/api/students")
def get_all_students(
    name: Optional[str] = None,
    major: Optional[str] = None,
    school: Optional[str] = None,
    term: Optional[str] = None,
    limit: Optional[int] = 50,
    offset: Optional[int] = 0
):
    """
    Get all students with their associated data from all sources.
    Optionally filter by name, major, school, or term.
    Supports pagination with limit and offset.
    """
    try:
        students = database.get_students_with_data()

        # Apply filters if provided
        if name:
            students = [s for s in students if name.lower() in s['name'].lower()]

        if major:
            students = [s for s in students if s['major'] and major.lower() in s['major'].lower()]

        if school:
            students = [s for s in students if s['school'] and school.lower() in s['school'].lower()]

        if term:
            students = [s for s in students if s['term'] and term == s['term']]

        total_count = len(students)

        # Apply pagination
        paginated_students = students[offset:offset + limit]

        return {
            "count": len(paginated_students),
            "total": total_count,
            "offset": offset,
            "limit": limit,
            "has_more": offset + limit < total_count,
            "students": paginated_students
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/students/{uid}")
def get_student(uid: str):
    """Get a single student by UID with all associated data"""
    try:
        student = database.get_student_by_uid(uid)

        if not student:
            raise HTTPException(status_code=404, detail=f"Student with UID {uid} not found")

        return student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/students/{uid}/master")
def save_master_data(uid: str, master_data: MasterDataCreate):
    """
    Save or update master data for a student.
    This is called when user selects a data source or manually enters data.
    """
    try:
        # TODO: Implement master data table creation and insert/update
        # For now, return success
        return {
            "message": "Master data saved successfully",
            "uid": uid,
            "data": master_data.dict(),
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving master data: {str(e)}")

@app.get("/api/filters/majors")
def get_unique_majors():
    """Get list of unique majors for filter dropdown"""
    try:
        students = database.get_students_with_data()
        majors = sorted(set(s['major'] for s in students if s['major']))
        return {"majors": majors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/filters/schools")
def get_unique_schools():
    """Get list of unique schools for filter dropdown"""
    try:
        students = database.get_students_with_data()
        schools = sorted(set(s['school'] for s in students if s['school']))
        return {"schools": schools}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/filters/terms")
def get_unique_terms():
    """Get list of unique terms for filter dropdown"""
    try:
        students = database.get_students_with_data()
        terms = sorted(set(s['term'] for s in students if s['term']), reverse=True)
        return {"terms": terms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
