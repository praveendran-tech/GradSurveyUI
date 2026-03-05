import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager
import os
from dotenv import load_dotenv

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
    conn = None
    try:
        conn = psycopg.connect(**DB_CONFIG, row_factory=dict_row)
        yield conn
    finally:
        if conn:
            conn.close()


def _build_demo_where(name_filter, major_filter, school_filter, term_filter,
                      uid_filter, sources_filter=None):
    """Build WHERE clause and params for the demographics table."""
    clauses = ["d.uid IS NOT NULL"]
    params = []
    if name_filter:
        clauses.append("LOWER(d.payload->>'name') LIKE LOWER(%s)")
        params.append(f"%{name_filter}%")
    if major_filter:
        clauses.append("LOWER(d.payload->>'major1_major') LIKE LOWER(%s)")
        params.append(f"%{major_filter}%")
    if school_filter:
        clauses.append("LOWER(d.payload->>'major1_coll') LIKE LOWER(%s)")
        params.append(f"%{school_filter}%")
    if term_filter:
        clauses.append("d.term = %s")
        params.append(term_filter)
    if uid_filter:
        clauses.append("d.uid::text LIKE %s")
        params.append(f"%{uid_filter}%")

    # Source filtering: student must match at least one selected source (OR logic)
    if sources_filter:
        source_clauses = []
        if 'qualtrics' in sources_filter:
            source_clauses.append(
                "EXISTS (SELECT 1 FROM src.src_qualtrics_response qf "
                "WHERE qf.student_key::text = d.uid::text)"
            )
        if 'linkedin' in sources_filter:
            source_clauses.append(
                "EXISTS (SELECT 1 FROM src.src_linkedin_position lf "
                "WHERE lf.student_key::text = d.uid::text)"
            )
        if 'clearinghouse' in sources_filter:
            source_clauses.append(
                "EXISTS (SELECT 1 FROM src.src_clearinghouse_record cf "
                "WHERE cf.student_key::text = d.uid::text)"
            )
        if 'no-source' in sources_filter:
            source_clauses.append(
                "(NOT EXISTS (SELECT 1 FROM src.src_qualtrics_response qf "
                "WHERE qf.student_key::text = d.uid::text) "
                "AND NOT EXISTS (SELECT 1 FROM src.src_linkedin_position lf "
                "WHERE lf.student_key::text = d.uid::text) "
                "AND NOT EXISTS (SELECT 1 FROM src.src_clearinghouse_record cf "
                "WHERE cf.student_key::text = d.uid::text))"
            )
        if source_clauses:
            clauses.append(f"({' OR '.join(source_clauses)})")

    return " AND ".join(clauses), params


def _fetch_source_data(cur, uids):
    """
    Given a list of UIDs, fetch qualtrics/linkedin/clearinghouse rows in 3
    targeted IN queries and return them grouped by UID.
    """
    if not uids:
        return {}, {}, {}

    placeholders = ",".join(["%s"] * len(uids))

    cur.execute(f"""
        SELECT id, student_key::text AS uid, survey_id, response_id,
               recorded_at, payload, source_file
        FROM src.src_qualtrics_response
        WHERE student_key::text IN ({placeholders})
    """, uids)
    qualtrics_by_uid = {}
    for row in cur.fetchall():
        qualtrics_by_uid.setdefault(row["uid"], []).append({
            "id": row["id"],
            "survey_id": row["survey_id"],
            "response_id": row["response_id"],
            "recorded_at": row["recorded_at"],
            "payload": row["payload"],
            "source_file": row["source_file"],
        })

    cur.execute(f"""
        SELECT id, student_key::text AS uid, position_key, payload, source_file
        FROM src.src_linkedin_position
        WHERE student_key::text IN ({placeholders})
    """, uids)
    linkedin_by_uid = {}
    for row in cur.fetchall():
        linkedin_by_uid.setdefault(row["uid"], []).append({
            "id": row["id"],
            "position_key": row["position_key"],
            "payload": row["payload"],
            "source_file": row["source_file"],
        })

    cur.execute(f"""
        SELECT id, student_key::text AS uid, record_key, payload, source_file
        FROM src.src_clearinghouse_record
        WHERE student_key::text IN ({placeholders})
    """, uids)
    clearinghouse_by_uid = {}
    for row in cur.fetchall():
        clearinghouse_by_uid.setdefault(row["uid"], []).append({
            "id": row["id"],
            "record_key": row["record_key"],
            "payload": row["payload"],
            "source_file": row["source_file"],
        })

    return qualtrics_by_uid, linkedin_by_uid, clearinghouse_by_uid


def get_students_with_data(limit=None, offset=None, name_filter=None,
                           major_filter=None, school_filter=None,
                           term_filter=None, uid_filter=None,
                           sources_filter=None):
    """
    1. Fetch the paginated student list from demographics (master table).
    2. Fetch qualtrics, linkedin, clearinghouse data for those UIDs in 3
       targeted queries (no joins, no aggregation in SQL).
    3. Merge in Python.
    """
    where_clause, params = _build_demo_where(
        name_filter, major_filter, school_filter, term_filter, uid_filter, sources_filter
    )

    pagination_clause = ""
    pagination_params = []
    if limit is not None:
        pagination_params.append(limit)
        pagination_clause = "LIMIT %s"
        if offset is not None:
            pagination_params.append(offset)
            pagination_clause += " OFFSET %s"

    demo_query = f"""
        SELECT DISTINCT
            d.uid::text AS uid,
            d.term,
            d.payload->>'name'            AS name,
            d.payload->>'email_address'   AS email,
            d.payload->>'major1_major'    AS major,
            d.payload->>'major1_coll'     AS school
        FROM src.src_demographics d
        WHERE {where_clause}
        ORDER BY name NULLS LAST
        {pagination_clause}
    """

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Step 1 — demographics (master list)
            cur.execute(demo_query, params + pagination_params)
            students = [dict(row) for row in cur.fetchall()]

            if not students:
                return []

            uids = [s["uid"] for s in students]

            # Steps 2-4 — source tables, matched on UID only
            qualtrics_by_uid, linkedin_by_uid, clearinghouse_by_uid = \
                _fetch_source_data(cur, uids)

            # Step 5 — merge
            for student in students:
                uid = student["uid"]
                student["qualtrics_data"]     = qualtrics_by_uid.get(uid, [])
                student["linkedin_data"]       = linkedin_by_uid.get(uid, [])
                student["clearinghouse_data"]  = clearinghouse_by_uid.get(uid, [])

            return students


def get_total_student_count(name_filter=None, major_filter=None,
                            school_filter=None, term_filter=None,
                            uid_filter=None, sources_filter=None):
    """Count of distinct students in demographics matching the filters."""
    where_clause, params = _build_demo_where(
        name_filter, major_filter, school_filter, term_filter, uid_filter, sources_filter
    )

    query = f"""
        SELECT COUNT(DISTINCT d.uid)
        FROM src.src_demographics d
        WHERE {where_clause}
    """

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            result = cur.fetchone()
            return result["count"] if result else 0


def get_distinct_values(payload_field: str) -> list:
    """Return sorted distinct non-null values for a demographics payload field."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT DISTINCT payload->>%s AS val
                FROM src.src_demographics
                WHERE payload->>%s IS NOT NULL
                  AND payload->>%s <> ''
                ORDER BY val
            """, (payload_field, payload_field, payload_field))
            return [row["val"] for row in cur.fetchall()]


def get_distinct_terms() -> list:
    """Return distinct terms from demographics, newest first."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT term
                FROM src.src_demographics
                WHERE term IS NOT NULL AND term <> ''
                ORDER BY term DESC
            """)
            return [row["term"] for row in cur.fetchall()]


def _v(val):
    """Return val if non-empty string, else None."""
    if val is None:
        return None
    s = str(val).strip()
    return s if s else None


def _map_outcome_status(raw: str) -> str:
    """Map raw STATUS string to canonical outcome label."""
    s = raw.lower()
    if 'employed full' in s:
        return 'Employed full-time'
    if 'employed part' in s:
        return 'Employed part-time'
    if 'continuing education' in s or 'accepted into' in s or 'applied to graduate' in s:
        return 'Continuing education'
    if 'own business' in s or 'starting my own' in s:
        return 'Starting a business'
    if 'armed forces' in s:
        return 'Serving in the U.S. Armed Forces'
    if 'participating in a service' in s or 'volunteer' in s:
        return 'Volunteering or service program'
    if 'not seeking' in s:
        return 'NOT seeking'
    if 'seeking' in s:
        return 'Unplaced'
    return raw


def _extract_qualtrics(payload: dict) -> dict:
    """Extract master table fields from a Qualtrics response payload."""
    raw_status = _v(payload.get('STATUS')) or ''
    outcome = _map_outcome_status(raw_status) if raw_status else None

    # Parse employer city/state/country from "City, ST, Country"
    city_str = payload.get('EMP_CITY1_1') or ''
    emp_city = emp_state = emp_country = None
    if city_str:
        parts = [p.strip() for p in city_str.split(',')]
        emp_city    = _v(parts[0]) if len(parts) > 0 else None
        emp_state   = _v(parts[1]) if len(parts) > 1 else None
        emp_country = _v(parts[2]) if len(parts) > 2 else None

    # Institution: strip address suffix
    raw_inst = payload.get('CONTEDU_INST_1') or ''
    cont_inst = _v(raw_inst.split(',')[0]) if raw_inst else None

    return {
        'outcome_status':                  outcome,
        'employer_name':                   _v((payload.get('EMP_ORG_1') or '').split(',')[0]),
        'job_title':                       _v(payload.get('EMP_TITLE')),
        'employment_modality':             _v(payload.get('EMP_TYPE')),
        'employer_city':                   emp_city,
        'employer_state':                  emp_state,
        'employer_country':                emp_country,
        'continuing_education_institution': cont_inst,
        'continuing_education_program':    _v(payload.get('CONTEDU_PROGRAM')),
        'continuing_education_degree':     _v(payload.get('CONTEDU_DEGREE')),
        'business_name':                   _v(payload.get('STBUS_ORG')),
        'business_description':            _v(payload.get('STBUS_PURPOSE')),
        'volunteer_organization':          _v((payload.get('VOL_ORG_1') or '').split(',')[0]),
        'volunteer_role':                  _v(payload.get('VOL_ROLE')),
        'military_branch':                 _v(payload.get('MIL_BRANCH')),
        'military_rank':                   _v(payload.get('MIL_RANK')),
    }


def _extract_linkedin(payload: dict) -> dict:
    """Extract master table fields from a LinkedIn position payload.
    The LinkedIn payload already mirrors the master table column names."""
    raw_status = _v(payload.get('status')) or ''
    outcome = _map_outcome_status(raw_status) if raw_status else None

    return {
        'outcome_status':                  outcome or _v(raw_status),
        'employer_name':                   _v(payload.get('name_of_employer')),
        'job_title':                       _v(payload.get('job_title')),
        'employment_modality':             _v(payload.get('modality_(hybrid_etc.if_known)')),
        'employer_city':                   _v(payload.get('employer_city')),
        'employer_state':                  _v(payload.get('employer_state')),
        'employer_country':                _v(payload.get('employer_country')),
        'continuing_education_institution': _v(payload.get('continuing_education_institution')),
        'continuing_education_program':    _v(payload.get('continuing_education_program')),
        'continuing_education_degree':     _v(payload.get('continuing_education_degree')),
        'business_name':                   _v(payload.get('name_of_started_business')),
        'business_description':            _v(payload.get('started_business_description')),
        'business_city':                   _v(payload.get('started_business_city')),
        'business_state':                  _v(payload.get('started_business_state')),
        'business_country':                _v(payload.get('started_business_country')),
        'volunteer_organization':          _v(payload.get('volunteer_organization')),
        'volunteer_role':                  _v(payload.get('volunteer_role')),
        'volunteer_city':                  _v(payload.get('volunteer_city')),
        'volunteer_state':                 _v(payload.get('volunteer_state')),
        'military_branch':                 _v(payload.get('joined_military_branch')),
        'military_rank':                   _v(payload.get('military_rank')),
        'linkedin_profile_url':            _v(payload.get('linkedin_url')),
    }


def _extract_clearinghouse(payload: dict) -> dict:
    """Extract master table fields from a Clearinghouse record payload."""
    return {
        'outcome_status':                  'Continuing education',
        'continuing_education_institution': _v(payload.get('Institution Name') or payload.get('institution')),
        'enrollment_status':               _v(payload.get('Enrollment Status') or payload.get('status')),
    }


def _upsert_master(cur, student_id, graduation_term, demo, source_name, fields):
    """Run the actual INSERT ... ON CONFLICT upsert into master_graduate_outcomes."""
    cur.execute("""
        INSERT INTO analytics.master_graduate_outcomes (
            student_id, graduation_term, full_name, email_address, primary_major,
            data_source,
            outcome_status,
            employer_name, job_title, employment_modality,
            employer_city, employer_state, employer_country,
            continuing_education_institution, continuing_education_program,
            continuing_education_degree, continuing_education_city,
            continuing_education_state, continuing_education_country,
            business_name, business_position_title, business_description,
            business_city, business_state, business_country,
            volunteer_organization, volunteer_role,
            volunteer_city, volunteer_state,
            military_branch, military_rank,
            linkedin_profile_url,
            record_created_at, record_updated_at
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s,
            NOW(), NOW()
        )
        ON CONFLICT (student_id, graduation_term) DO UPDATE SET
            full_name                       = EXCLUDED.full_name,
            email_address                   = EXCLUDED.email_address,
            primary_major                   = EXCLUDED.primary_major,
            data_source                     = EXCLUDED.data_source,
            outcome_status                  = EXCLUDED.outcome_status,
            employer_name                   = EXCLUDED.employer_name,
            job_title                       = EXCLUDED.job_title,
            employment_modality             = EXCLUDED.employment_modality,
            employer_city                   = EXCLUDED.employer_city,
            employer_state                  = EXCLUDED.employer_state,
            employer_country                = EXCLUDED.employer_country,
            continuing_education_institution = EXCLUDED.continuing_education_institution,
            continuing_education_program    = EXCLUDED.continuing_education_program,
            continuing_education_degree     = EXCLUDED.continuing_education_degree,
            continuing_education_city       = EXCLUDED.continuing_education_city,
            continuing_education_state      = EXCLUDED.continuing_education_state,
            continuing_education_country    = EXCLUDED.continuing_education_country,
            business_name                   = EXCLUDED.business_name,
            business_position_title         = EXCLUDED.business_position_title,
            business_description            = EXCLUDED.business_description,
            business_city                   = EXCLUDED.business_city,
            business_state                  = EXCLUDED.business_state,
            business_country                = EXCLUDED.business_country,
            volunteer_organization          = EXCLUDED.volunteer_organization,
            volunteer_role                  = EXCLUDED.volunteer_role,
            volunteer_city                  = EXCLUDED.volunteer_city,
            volunteer_state                 = EXCLUDED.volunteer_state,
            military_branch                 = EXCLUDED.military_branch,
            military_rank                   = EXCLUDED.military_rank,
            linkedin_profile_url            = EXCLUDED.linkedin_profile_url,
            record_updated_at               = NOW()
    """, (
        student_id, graduation_term,
        demo['name'], demo['email'], demo['major'],
        source_name,
        fields.get('outcome_status'),
        fields.get('employer_name'),
        fields.get('job_title'),
        fields.get('employment_modality'),
        fields.get('employer_city'),
        fields.get('employer_state'),
        fields.get('employer_country'),
        fields.get('continuing_education_institution'),
        fields.get('continuing_education_program'),
        fields.get('continuing_education_degree'),
        fields.get('continuing_education_city'),
        fields.get('continuing_education_state'),
        fields.get('continuing_education_country'),
        fields.get('business_name'),
        fields.get('business_position_title'),
        fields.get('business_description'),
        fields.get('business_city'),
        fields.get('business_state'),
        fields.get('business_country'),
        fields.get('volunteer_organization'),
        fields.get('volunteer_role'),
        fields.get('volunteer_city'),
        fields.get('volunteer_state'),
        fields.get('military_branch'),
        fields.get('military_rank'),
        fields.get('linkedin_profile_url'),
    ))


def _fetch_demo(cur, student_id, graduation_term):
    cur.execute("""
        SELECT payload->>'name'          AS name,
               payload->>'email_address' AS email,
               payload->>'major1_major'  AS major
        FROM src.src_demographics
        WHERE uid::text = %s AND term = %s
        LIMIT 1
    """, (student_id, graduation_term))
    demo = cur.fetchone()
    if not demo:
        cur.execute("""
            SELECT payload->>'name'          AS name,
                   payload->>'email_address' AS email,
                   payload->>'major1_major'  AS major
            FROM src.src_demographics
            WHERE uid::text = %s
            LIMIT 1
        """, (student_id,))
        demo = cur.fetchone()
    if not demo:
        raise ValueError(f"Student {student_id} not found in demographics")
    return demo


def save_master_from_source(student_id: str, graduation_term: str,
                            source_name: str) -> dict:
    """
    Fetch the source data for a student, extract all relevant fields,
    and upsert into analytics.master_graduate_outcomes.
    Returns the extracted fields dict for the frontend to update local state.
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            demo = _fetch_demo(cur, student_id, graduation_term)

            if source_name == 'qualtrics':
                cur.execute("""
                    SELECT payload FROM src.src_qualtrics_response
                    WHERE student_key::text = %s
                    ORDER BY recorded_at DESC NULLS LAST
                    LIMIT 1
                """, (student_id,))
                row = cur.fetchone()
                if not row:
                    raise ValueError(f"No Qualtrics data for student {student_id}")
                fields = _extract_qualtrics(row['payload'])

            elif source_name == 'linkedin':
                cur.execute("""
                    SELECT payload FROM src.src_linkedin_position
                    WHERE student_key::text = %s
                    LIMIT 1
                """, (student_id,))
                row = cur.fetchone()
                if not row:
                    raise ValueError(f"No LinkedIn data for student {student_id}")
                fields = _extract_linkedin(row['payload'])

            elif source_name == 'clearinghouse':
                cur.execute("""
                    SELECT payload FROM src.src_clearinghouse_record
                    WHERE student_key::text = %s
                    LIMIT 1
                """, (student_id,))
                row = cur.fetchone()
                if not row:
                    raise ValueError(f"No Clearinghouse data for student {student_id}")
                fields = _extract_clearinghouse(row['payload'])

            else:
                raise ValueError(f"Unknown source: {source_name}")

            _upsert_master(cur, student_id, graduation_term, demo, source_name, fields)
        conn.commit()

    return {**fields, 'data_source': source_name, 'student_name': demo['name']}


def save_master_record(student_id: str, graduation_term: str, outcome_data: dict):
    """
    Upsert manual / edited data into analytics.master_graduate_outcomes.
    outcome_data keys use the same snake_case names as the DB columns
    (or legacy camelCase aliases accepted below).
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            demo = _fetch_demo(cur, student_id, graduation_term)
            # Accept both camelCase (legacy frontend) and snake_case keys
            fields = {
                'outcome_status':     _v(outcome_data.get('outcome_status') or
                                         outcome_data.get('currentActivity') or
                                         outcome_data.get('current_activity') or
                                         outcome_data.get('employmentStatus') or
                                         outcome_data.get('employment_status')),
                'employer_name':      _v(outcome_data.get('employer_name') or
                                         outcome_data.get('currentEmployer') or
                                         outcome_data.get('current_employer')),
                'job_title':          _v(outcome_data.get('job_title') or
                                         outcome_data.get('currentPosition') or
                                         outcome_data.get('current_position')),
                'continuing_education_institution': _v(
                                         outcome_data.get('continuing_education_institution') or
                                         outcome_data.get('currentInstitution') or
                                         outcome_data.get('current_institution')),
                'military_branch':    _v(outcome_data.get('military_branch')),
                'military_rank':      _v(outcome_data.get('military_rank')),
            }
            source = _v(outcome_data.get('selected_source') or
                        outcome_data.get('selectedSource') or 'manual')
            _upsert_master(cur, student_id, graduation_term, demo, source, fields)
        conn.commit()


def get_master_records(term_filter=None, major_filter=None, school_filter=None) -> list:
    """Fetch records from analytics.master_graduate_outcomes with optional filters."""
    clauses = []
    params = []
    if term_filter:
        clauses.append("graduation_term = %s")
        params.append(term_filter)
    if major_filter:
        clauses.append("LOWER(primary_major) LIKE LOWER(%s)")
        params.append(f"%{major_filter}%")

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT student_id, graduation_term, full_name, email_address, primary_major,
                       data_source, outcome_status,
                       employer_name, job_title, employment_modality,
                       employer_city, employer_state, employer_country,
                       continuing_education_institution, continuing_education_program,
                       continuing_education_degree,
                       business_name, business_description,
                       volunteer_organization, volunteer_role,
                       military_branch, military_rank,
                       linkedin_profile_url,
                       record_created_at, record_updated_at
                FROM analytics.master_graduate_outcomes
                {where}
                ORDER BY full_name NULLS LAST
            """, params)
            return [dict(row) for row in cur.fetchall()]


def get_student_by_uid(uid: str):
    """
    Fetch a single student by exact UID.
    Demographics is the source of truth; source data matched on UID.
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT
                    d.uid::text AS uid,
                    d.term,
                    d.payload->>'name'           AS name,
                    d.payload->>'email_address'  AS email,
                    d.payload->>'major1_major'   AS major,
                    d.payload->>'major1_coll'    AS school
                FROM src.src_demographics d
                WHERE d.uid::text = %s
            """, (uid,))
            student = cur.fetchone()

            if not student:
                return None

            student = dict(student)
            q, l, c = _fetch_source_data(cur, [uid])
            student["qualtrics_data"]    = q.get(uid, [])
            student["linkedin_data"]     = l.get(uid, [])
            student["clearinghouse_data"] = c.get(uid, [])
            return student
