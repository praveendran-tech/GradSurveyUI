import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD")
}

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = None
    try:
        conn = psycopg.connect(**DB_CONFIG, row_factory=dict_row)
        yield conn
    finally:
        if conn:
            conn.close()

def get_students_with_data(limit=None, offset=None, name_filter=None, major_filter=None, school_filter=None, term_filter=None):
    """
    Fetch students with their associated data from all sources.
    Joins demographics, qualtrics, linkedin, and clearinghouse data.
    Supports pagination and filtering at the database level for efficiency.
    """
    # Build WHERE clause dynamically based on filters
    where_clauses = ["d.uid IS NOT NULL"]
    params = []

    if name_filter:
        where_clauses.append("LOWER(d.payload->>'name') LIKE LOWER(%s)")
        params.append(f"%{name_filter}%")

    if major_filter:
        where_clauses.append("LOWER(d.payload->>'major1_major') LIKE LOWER(%s)")
        params.append(f"%{major_filter}%")

    if school_filter:
        where_clauses.append("LOWER(d.payload->>'major1_coll') LIKE LOWER(%s)")
        params.append(f"%{school_filter}%")

    if term_filter:
        where_clauses.append("d.term = %s")
        params.append(term_filter)

    where_clause = " AND ".join(where_clauses)

    # Build pagination clause with parameterized values
    pagination_clause = ""
    if limit is not None:
        params.append(limit)
        pagination_clause = f"LIMIT %s"
        if offset is not None:
            params.append(offset)
            pagination_clause += f" OFFSET %s"

    query = f"""
    WITH student_base AS (
        SELECT DISTINCT
            d.uid::text as uid,
            d.term,
            d.payload->>'name' as name,
            d.payload->>'email_address' as email,
            d.payload->>'major1_major' as major,
            d.payload->>'major1_coll' as school
        FROM src.src_demographics d
        WHERE {where_clause}
    )
    SELECT
        sb.uid,
        sb.term,
        sb.name,
        sb.email,
        sb.major,
        sb.school,

        -- Qualtrics data
        json_agg(DISTINCT jsonb_build_object(
            'id', qr.id,
            'survey_id', qr.survey_id,
            'response_id', qr.response_id,
            'recorded_at', qr.recorded_at,
            'payload', qr.payload,
            'source_file', qr.source_file
        )) FILTER (WHERE qr.id IS NOT NULL) as qualtrics_data,

        -- LinkedIn data
        json_agg(DISTINCT jsonb_build_object(
            'id', lp.id,
            'position_key', lp.position_key,
            'payload', lp.payload,
            'source_file', lp.source_file
        )) FILTER (WHERE lp.id IS NOT NULL) as linkedin_data,

        -- ClearingHouse data
        json_agg(DISTINCT jsonb_build_object(
            'id', cr.id,
            'record_key', cr.record_key,
            'payload', cr.payload,
            'source_file', cr.source_file
        )) FILTER (WHERE cr.id IS NOT NULL) as clearinghouse_data

    FROM student_base sb
    LEFT JOIN src.src_qualtrics_response qr
        ON sb.uid = qr.student_key::text
    LEFT JOIN src.src_linkedin_position lp
        ON sb.uid = lp.student_key::text
    LEFT JOIN src.src_clearinghouse_record cr
        ON sb.uid = cr.student_key::text
    GROUP BY sb.uid, sb.term, sb.name, sb.email, sb.major, sb.school
    ORDER BY sb.name
    {pagination_clause}
    """

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            results = cur.fetchall()
            return results

def get_total_student_count(name_filter=None, major_filter=None, school_filter=None, term_filter=None):
    """Get total count of students matching filters"""
    where_clauses = ["d.uid IS NOT NULL"]
    params = []

    if name_filter:
        where_clauses.append("LOWER(d.payload->>'name') LIKE LOWER(%s)")
        params.append(f"%{name_filter}%")

    if major_filter:
        where_clauses.append("LOWER(d.payload->>'major1_major') LIKE LOWER(%s)")
        params.append(f"%{major_filter}%")

    if school_filter:
        where_clauses.append("LOWER(d.payload->>'major1_coll') LIKE LOWER(%s)")
        params.append(f"%{school_filter}%")

    if term_filter:
        where_clauses.append("d.term = %s")
        params.append(term_filter)

    where_clause = " AND ".join(where_clauses)

    query = f"""
    SELECT COUNT(DISTINCT d.uid)
    FROM src.src_demographics d
    WHERE {where_clause}
    """

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            result = cur.fetchone()
            return result['count'] if result else 0

def get_student_by_uid(uid: str):
    """Fetch a single student by UID with all associated data"""
    query = """
    WITH student_base AS (
        SELECT DISTINCT
            d.uid::text as uid,
            d.term,
            d.payload->>'name' as name,
            d.payload->>'email_address' as email,
            d.payload->>'major1_major' as major,
            d.payload->>'major1_coll' as school
        FROM src.src_demographics d
        WHERE d.uid::text = %s
    )
    SELECT
        sb.uid,
        sb.term,
        sb.name,
        sb.email,
        sb.major,
        sb.school,

        -- Qualtrics data
        json_agg(DISTINCT jsonb_build_object(
            'id', qr.id,
            'survey_id', qr.survey_id,
            'response_id', qr.response_id,
            'recorded_at', qr.recorded_at,
            'payload', qr.payload,
            'source_file', qr.source_file
        )) FILTER (WHERE qr.id IS NOT NULL) as qualtrics_data,

        -- LinkedIn data
        json_agg(DISTINCT jsonb_build_object(
            'id', lp.id,
            'position_key', lp.position_key,
            'payload', lp.payload,
            'source_file', lp.source_file
        )) FILTER (WHERE lp.id IS NOT NULL) as linkedin_data,

        -- ClearingHouse data
        json_agg(DISTINCT jsonb_build_object(
            'id', cr.id,
            'record_key', cr.record_key,
            'payload', cr.payload,
            'source_file', cr.source_file
        )) FILTER (WHERE cr.id IS NOT NULL) as clearinghouse_data

    FROM student_base sb
    LEFT JOIN src.src_qualtrics_response qr
        ON sb.uid = qr.student_key::text
    LEFT JOIN src.src_linkedin_position lp
        ON sb.uid = lp.student_key::text
    LEFT JOIN src.src_clearinghouse_record cr
        ON sb.uid = cr.student_key::text
    GROUP BY sb.uid, sb.term, sb.name, sb.email, sb.major, sb.school
    """

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (uid,))
            result = cur.fetchone()
            return result
