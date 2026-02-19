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

def get_students_with_data():
    """
    Fetch all students with their associated data from all sources.
    Joins demographics, qualtrics, linkedin, and clearinghouse data.
    """
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
        WHERE d.uid IS NOT NULL
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
    """

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            results = cur.fetchall()
            return results

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
