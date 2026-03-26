from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import database
import report as report_module
from datetime import datetime
import io

app = FastAPI(title="Graduate Outcomes Data Management API")

# CORS configuration - allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class MasterDataCreate(BaseModel):
    term: str
    selected_source: str  # 'qualtrics' | 'linkedin' | 'clearinghouse' | 'manual'
    # Fields used only for manual / edited entries (ignored for source-based saves)
    outcome_status: Optional[str] = None
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    continuing_education_institution: Optional[str] = None
    military_branch: Optional[str] = None
    military_rank: Optional[str] = None
    # Legacy camelCase fields (frontend compat)
    current_activity: Optional[str] = None
    employment_status: Optional[str] = None
    current_employer: Optional[str] = None
    current_position: Optional[str] = None
    current_institution: Optional[str] = None

@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Graduate Outcomes Data Management API", "status": "running"}

@app.get("/api/students")
def get_all_students(
    name: Optional[str] = None,
    major: Optional[List[str]] = Query(default=None),
    school: Optional[str] = None,
    term: Optional[List[str]] = Query(default=None),
    uid: Optional[str] = None,
    sources: Optional[List[str]] = Query(default=None),
    limit: Optional[int] = 20,
    offset: Optional[int] = 0
):
    """
    Get students with their associated data from all sources.
    Optionally filter by name, major, school, term, uid, or data sources.
    Supports pagination with limit and offset.
    All filtering and pagination happens at the database level for efficiency.
    """
    try:
        # Get total count with filters
        total_count = database.get_total_student_count(
            name_filter=name,
            major_filter=major,
            school_filter=school,
            term_filter=term,
            uid_filter=uid,
            sources_filter=sources
        )

        # Get paginated students with filters
        students = database.get_students_with_data(
            limit=limit,
            offset=offset,
            name_filter=name,
            major_filter=major,
            school_filter=school,
            term_filter=term,
            uid_filter=uid,
            sources_filter=sources
        )

        return {
            "count": len(students),
            "total": total_count,
            "offset": offset,
            "limit": limit,
            "has_more": offset + limit < total_count,
            "students": students
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
    - For qualtrics/linkedin/clearinghouse: fetches source data from DB and extracts all fields.
    - For manual: uses the fields provided in the request body.
    Returns extracted fields so the frontend can update local state.
    """
    try:
        if master_data.selected_source in ('qualtrics', 'linkedin', 'clearinghouse'):
            result = database.save_master_from_source(
                student_id=uid,
                graduation_term=master_data.term,
                source_name=master_data.selected_source,
            )
        else:
            database.save_master_record(
                student_id=uid,
                graduation_term=master_data.term,
                outcome_data=master_data.dict(exclude={"term"}),
            )
            result = master_data.dict(exclude={"term"})

        return {"message": "Master data saved successfully", "uid": uid, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving master data: {str(e)}")

@app.delete("/api/students/{uid}/master")
def delete_master_data(uid: str, term: str):
    """Delete the master record for a student."""
    try:
        database.delete_master_record(student_id=uid, graduation_term=term)
        return {"message": "Master record deleted", "uid": uid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting master record: {str(e)}")


@app.get("/api/filters/majors")
def get_unique_majors():
    try:
        return {"majors": database.get_distinct_values("major1_major")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/filters/schools")
def get_unique_schools():
    try:
        return {"schools": database.get_distinct_values("major1_coll")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/filters/terms")
def get_unique_terms():
    try:
        return {"terms": database.get_distinct_terms()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/export")
def export_master_records(
    major: Optional[List[str]] = Query(default=None),
    school: Optional[str] = None,
    term: Optional[List[str]] = Query(default=None),
):
    """Return all records from analytics.master_graduate_outcomes for CSV export."""
    try:
        records = database.get_master_records(
            term_filter=term,
            major_filter=major,
            school_filter=school,
        )
        # Serialise timestamps to ISO strings
        for r in records:
            if r.get("record_updated_at"):
                r["record_updated_at"] = r["record_updated_at"].isoformat()
            if r.get("record_created_at"):
                r["record_created_at"] = r["record_created_at"].isoformat()
        return {"count": len(records), "records": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")


@app.get("/api/report/data")
def get_report_data(
    major: Optional[List[str]] = Query(default=None),
    school: Optional[str] = None,
    term: Optional[List[str]] = Query(default=None),
):
    """Return aggregated JSON statistics for the report preview."""
    try:
        data = report_module.aggregate_report_data(
            major_filter=major,
            school_filter=school,
            term_filter=term,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report error: {str(e)}")


@app.get("/api/report/download")
def download_report(
    major: Optional[List[str]] = Query(default=None),
    school: Optional[str] = None,
    term: Optional[List[str]] = Query(default=None),
):
    """Generate and stream a DOCX report file."""
    try:
        data = report_module.aggregate_report_data(
            major_filter=major,
            school_filter=school,
            term_filter=term,
        )
        docx_bytes = report_module.generate_report_docx(data)

        major_part = ("_".join(major) if major else "AllMajors").replace(" ", "_")
        term_part = ("_".join(term) if term else "AllTerms").replace(" ", "_")
        date_part = datetime.now().strftime("%Y%m%d")
        filename = f"GradOutcomesReport_{major_part}_{term_part}_{date_part}.docx"

        return StreamingResponse(
            io.BytesIO(docx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


@app.get("/api/dashboard")
def get_dashboard_data(
    major: Optional[List[str]] = Query(default=None),
    school: Optional[str] = None,
    term: Optional[List[str]] = Query(default=None),
):
    """Return comprehensive longitudinal dashboard data."""
    try:
        data = report_module.aggregate_dashboard_data(
            major_filter=major,
            school_filter=school,
            term_filter=term,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")


@app.get("/api/dashboard/majors")
def get_major_comparison(
    major: Optional[List[str]] = Query(default=None),
    school: Optional[str] = None,
    term: Optional[List[str]] = Query(default=None),
):
    """Per-major outcome stats for the Major Analytics dashboard tab."""
    try:
        data = report_module.aggregate_major_comparison(
            major_filter=major,
            school_filter=school,
            term_filter=term,
        )
        return {"majors": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Major analytics error: {str(e)}")
