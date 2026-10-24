import sqlite3
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(__file__), "salon.db")

# SUPABASE CLIENT INITIALIZATION (Dual-Driver: Supabase Cloud + Local SQLite Fallback)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(" Connected to Supabase Cloud Database!")
    except Exception as e:
        print(f"⚠️ Failed to connect to Supabase: {e}. Falling back to SQLite.")

def is_supabase_enabled():
    return supabase_client is not None

def get_sqlite_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# INITIALIZE LOCAL SQLITE (Seed fallback data)
def init_db():
    conn = get_sqlite_connection()
    cursor = conn.cursor()

    # 1. Services Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS services (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price_inr INTEGER NOT NULL,
            duration_mins INTEGER NOT NULL,
            description TEXT NOT NULL,
            whats_covered TEXT NOT NULL,
            is_trending INTEGER DEFAULT 1,
            suitable_for TEXT NOT NULL
        )
    """)

    # 2. Stylists Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stylists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            specialty TEXT NOT NULL,
            rating REAL DEFAULT 4.9
        )
    """)

    # 3. Appointments Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            service_id TEXT NOT NULL,
            stylist_id TEXT NOT NULL,
            date TEXT NOT NULL,
            time_slot TEXT NOT NULL,
            status TEXT DEFAULT 'confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(service_id) REFERENCES services(id),
            FOREIGN KEY(stylist_id) REFERENCES stylists(id)
        )
    """)

    # Seed Initial Data if empty
    cursor.execute("SELECT COUNT(*) FROM services")
    if cursor.fetchone()[0] == 0:
        services_data = [
            (
                "cut-style",
                "CUT & STYLE",
                "Haircut",
                899,
                45,
                "Precision scissor & clipper fade, customized texture styling, signature wash & blowout with desi soul.",
                "• In-depth style consultation based on face geometry\n• Precision scissor work & skin/taper fade\n• Detoxifying scalp cleanse & botanical hair wash\n• Stress-relieving 5-min scalp acupressure\n• Blow-dry and finish with premium sea salt spray or matte clay",
                1,
                "All hair textures, wavy, straight, curly, and thick desi hair"
            ),
            (
                "beard-grooming",
                "BEARD & GROOMING",
                "Beard",
                299,
                30,
                "Razor-sharp contouring, hot towel treatment, beard sculpting, and essential oil hydration.",
                "• Beard shape mapping & cheek line geometry\n• Hot eucalyptus steam towel wrap to open pores\n• Straight razor crisp edge line-up on cheeks & neck\n• Bulk thinning & length gradation\n• Organic argan & cedarwood beard oil hydration massage",
                1,
                "Stubble, short boxed beards, dense beards, handlebar mustaches"
            ),
            (
                "colour-highlights",
                "COLOUR & HIGHLIGHTS",
                "Color",
                1499,
                90,
                "Caramel balayage, smoky tones, root melts, and bold modern highlights tailored for dark hair textures.",
                "• Skin patch test & shade matching consultation\n• Hand-painted balayage or dimensional foil highlights\n• Bond-protecting developer to preserve hair strength\n• Anti-brass neutralizing toner bath\n• Deep nourishing moisture glaze & blowout styling",
                1,
                "Dark brown, jet black, or virgin hair seeking golden/caramel dimension without brassiness"
            ),
            (
                "head-spa-repair",
                "HEAD SPA & HAIR REPAIR",
                "Treatment",
                799,
                40,
                "Deep clarifying scalp detox, keratin protein infusion, and rejuvenating acupressure massage.",
                "• Clarifying exfoliating scalp scrub\n• Micro-mist warm steam ozone therapy\n• Keratin & biotin hair cuticle repair mask\n• 15-minute shoulder, neck & scalp tension release massage\n• Anti-frizz leave-in serum & cool shot blow dry",
                1,
                "Dry scalp, pollution damage, dandruff control, hair fall prevention"
            ),
            (
                "full-glow-up",
                "FULL GLOW-UP COMBO",
                "Combo",
                1799,
                80,
                "The ultimate chair experience: Cut & Style + Beard Sculpt + Express Scalp Steam.",
                "• Full precision Cut & Style with fade/layers\n• Complete Hot Towel Beard Grooming & Razor Lineup\n• Express botanical scalp steam & wash\n• Signature styling with luxury fragrance mist",
                1,
                "Weekend parties, weddings, groom/groomsmen prep, special shoots"
            )
        ]
        cursor.executemany("""
            INSERT INTO services (id, name, category, price_inr, duration_mins, description, whats_covered, is_trending, suitable_for)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, services_data)

    cursor.execute("SELECT COUNT(*) FROM stylists")
    if cursor.fetchone()[0] == 0:
        stylists_data = [
            ("stylist-kabir", "Kabir Sen", "Master Barber & Fade Specialist", 4.95),
            ("stylist-priya", "Priya Nair", "Colorist & Texture Architect", 4.98),
            ("stylist-rohan", "Rohan Mehta", "Occasion Stylist & Beard Sculptor", 4.92)
        ]
        cursor.executemany("""
            INSERT INTO stylists (id, name, specialty, rating)
            VALUES (?, ?, ?, ?)
        """, stylists_data)

    # Seed initial appointments for today
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    cursor.execute("SELECT COUNT(*) FROM appointments WHERE date = ?", (today_str,))
    if cursor.fetchone()[0] == 0:
        sample_appointments = [
            ("Arjun Verma", "+919811122233", "cut-style", "stylist-kabir", today_str, "11:00 AM"),
            ("Sara Khan", "+919822233344", "colour-highlights", "stylist-priya", today_str, "01:30 PM"),
            ("Vikram Rao", "+919833344455", "beard-grooming", "stylist-rohan", today_str, "04:00 PM")
        ]
        cursor.executemany("""
            INSERT INTO appointments (customer_name, customer_phone, service_id, stylist_id, date, time_slot)
            VALUES (?, ?, ?, ?, ?, ?)
        """, sample_appointments)

    conn.commit()
    conn.close()

# CHAIR SLOTS (10:00 AM to 8:30 PM)
ALL_TIME_SLOTS = [
    "10:00 AM", "10:45 AM", "11:30 AM", "12:15 PM",
    "01:00 PM", "02:00 PM", "02:45 PM", "03:30 PM",
    "04:15 PM", "05:00 PM", "05:45 PM", "06:30 PM",
    "07:15 PM", "08:00 PM"
]

def get_today_free_slots(date_str=None, stylist_id=None):
    """
    Checks appointments on the specified date and calculates free slots.
    Uses Supabase if configured, otherwise SQLite.
    """
    if not date_str:
        date_str = datetime.date.today().strftime("%Y-%m-%d")

    booked_records = []
    stylists = []

    if is_supabase_enabled():
        try:
            # Query Supabase
            q = supabase_client.table("appointments").select("time_slot, stylist_id").eq("date", date_str).neq("status", "cancelled")
            if stylist_id:
                q = q.eq("stylist_id", stylist_id)
            res_app = q.execute()
            booked_records = res_app.data or []

            res_sty = supabase_client.table("stylists").select("id, name, specialty").execute()
            stylists = res_sty.data or []
        except Exception as e:
            print(f"Supabase query failed, falling back to SQLite: {e}")

    # Fallback to SQLite if Supabase returned nothing or is not active
    if not stylists:
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        query = "SELECT time_slot, stylist_id FROM appointments WHERE date = ? AND status != 'cancelled'"
        params = [date_str]
        if stylist_id:
            query += " AND stylist_id = ?"
            params.append(stylist_id)
        cursor.execute(query, params)
        booked_records = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT id, name, specialty FROM stylists")
        stylists = [dict(r) for r in cursor.fetchall()]
        conn.close()

    # Map booked slots by stylist
    booked_by_stylist = {}
    for rec in booked_records:
        s_id = rec.get("stylist_id")
        t_slot = rec.get("time_slot")
        if s_id and t_slot:
            booked_by_stylist.setdefault(s_id, set()).add(t_slot)

    # Calculate free stylists per slot
    available_schedule = []
    for slot in ALL_TIME_SLOTS:
        free_stylists = [s for s in stylists if slot not in booked_by_stylist.get(s["id"], set())]
        if free_stylists:
            available_schedule.append({
                "time_slot": slot,
                "available_stylists": [s["name"] for s in free_stylists],
                "count": len(free_stylists)
            })

    return {
        "date": date_str,
        "source": "supabase" if is_supabase_enabled() else "sqlite",
        "total_free_slots": len(available_schedule),
        "slots": available_schedule
    }

def get_all_services():
    """Returns all salon services from Supabase or SQLite."""
    if is_supabase_enabled():
        try:
            res = supabase_client.table("services").select("*").execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"Supabase get_all_services failed: {e}")

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services")
    services = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return services

def get_service_details(query_str):
    """Searches for a service and returns cost, duration, and what's covered."""
    query_clean = query_str.strip().lower()

    if is_supabase_enabled():
        try:
            res = supabase_client.table("services").select("*").ilike("name", f"%{query_clean}%").limit(1).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            # Try category or ID
            res2 = supabase_client.table("services").select("*").ilike("category", f"%{query_clean}%").limit(1).execute()
            if res2.data and len(res2.data) > 0:
                return res2.data[0]
        except Exception as e:
            print(f"Supabase get_service_details failed: {e}")

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    query_param = f"%{query_clean}%"
    cursor.execute("""
        SELECT * FROM services 
        WHERE LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(id) LIKE ?
        LIMIT 1
    """, (query_param, query_param, query_param))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_trending_items():
    """Returns trending styles, haircuts, colors, and recommendations."""
    trending_services = []
    if is_supabase_enabled():
        try:
            res = supabase_client.table("services").select("*").eq("is_trending", 1).execute()
            if res.data:
                trending_services = res.data
        except Exception as e:
            print(f"Supabase get_trending_items failed: {e}")

    if not trending_services:
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM services WHERE is_trending = 1")
        trending_services = [dict(row) for row in cursor.fetchall()]
        conn.close()

    trends = {
        "source": "supabase" if is_supabase_enabled() else "sqlite",
        "trending_services": trending_services,
        "style_guide": [
            {
                "title": "Drop Fade & Textured Crop (Desi Swag)",
                "gender": "Men / Unisex",
                "vibe": "Edgy, sharp, clean taper around the neckline",
                "recommended_for": "Wavy, straight, or thick hair seeking low daily maintenance"
            },
            {
                "title": "90s Desi Butterfly Layers with Volume",
                "gender": "Women / Long Hair",
                "vibe": "Airy blowout layers, effortless bounce and face framing",
                "recommended_for": "Medium to long hair looking for dramatic bounce without losing length"
            },
            {
                "title": "Caramel Hazelnut Balayage Melt",
                "gender": "All",
                "vibe": "Warm sunlit dimension crafted exclusively for dark hair bases",
                "recommended_for": "Zero brassiness, grows out smoothly with zero harsh root lines"
            },
            {
                "title": "Royal Boxed Beard with Razor Lineup",
                "gender": "Men",
                "vibe": "Sharp geometric angles, cheek gradient, hot towel eucalyptus finish",
                "recommended_for": "Enhancing jawline definition and taming unruly beard growth"
            }
        ]
    }
    return trends

def book_new_appointment(customer_name, customer_phone, service_id, date_str, time_slot, stylist_id="stylist-kabir"):
    """Inserts a confirmed appointment into Supabase and SQLite."""
    appointment_id = None

    if is_supabase_enabled():
        try:
            insert_data = {
                "customer_name": customer_name,
                "customer_phone": customer_phone,
                "service_id": service_id,
                "stylist_id": stylist_id,
                "date": date_str,
                "time_slot": time_slot,
                "status": "confirmed"
            }
            res = supabase_client.table("appointments").insert(insert_data).execute()
            if res.data and len(res.data) > 0:
                appointment_id = res.data[0].get("id")
                print(f"Appointment booked in Supabase! ID: {appointment_id}")
        except Exception as e:
            print(f"Supabase appointment booking error: {e}")

    # Also record in SQLite for local persistence
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO appointments (customer_name, customer_phone, service_id, stylist_id, date, time_slot)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (customer_name, customer_phone, service_id, stylist_id, date_str, time_slot))
    sqlite_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return appointment_id or sqlite_id
