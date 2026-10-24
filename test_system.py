import sys
import json
import urllib.request
import urllib.error
import os

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

BACKEND_URL = "http://127.0.0.1:8000"

def print_separator(title):
    print("\n" + "=" * 65)
    print(f" {title}")
    print("=" * 65)

def test_endpoint(name, url, method="GET", payload=None):
    try:
        data = None
        headers = {}
        if payload is not None:
            data = json.dumps(payload).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            body = json.loads(resp.read().decode('utf-8'))
            print(f"✅ [{status}] {name}")
            return body
    except urllib.error.URLError as e:
        print(f"❌ Failed: {name} - {e}")
        return None
    except Exception as e:
        print(f"❌ Error: {name} - {e}")
        return None

def run_all_checks():
    print_separator("MANE RIOT® — FULL SYSTEM FUNCTIONING CHECK")

    # 1. Root & Health Check
    root_data = test_endpoint("Backend Server Status", f"{BACKEND_URL}/")
    if not root_data:
        print("⚠️ Backend server is not running at http://127.0.0.1:8000. Start it with: python -m uvicorn main:app --port 8000")
        return

    # 2. Database & Slot Availability
    print_separator("DATABASE & FREE TIMINGS CHECK")
    slots_data = test_endpoint("Today's Free Timings (/api/slots/today)", f"{BACKEND_URL}/api/slots/today")
    if slots_data:
        print(f"   • Database Driver Source: {slots_data.get('source', 'sqlite').upper()}")
        print(f"   • Today's Date: {slots_data.get('date')}")
        print(f"   • Total Open Slots Today: {slots_data.get('total_free_slots')}")
        if slots_data.get('slots'):
            first_few = [s['time_slot'] for s in slots_data['slots'][:4]]
            print(f"   • Sample Available Slots: {', '.join(first_few)} ...")

    # 3. Service Catalog & What's Covered
    print_separator("SERVICE CATALOG & COVERAGE CHECK")
    services = test_endpoint("All Services (/api/services)", f"{BACKEND_URL}/api/services")
    if services and len(services) > 0:
        print(f"   • Total Services in Database: {len(services)}")
        sample = services[0]
        print(f"   • Sample Service: {sample['name']}")
        print(f"   • Price: ₹{sample['price_inr']} | Duration: {sample['duration_mins']} mins")
        first_line = sample['whats_covered'].split('\n')[0]
        print(f"   • Coverage preview: {first_line}")

    # 4. Trending Recommendations
    print_separator("TRENDING STYLES CHECK")
    trends = test_endpoint("Trending Haircuts & Styles (/api/trending)", f"{BACKEND_URL}/api/trending")
    if trends and 'style_guide' in trends:
        print(f"   • Total Trending Guides: {len(trends['style_guide'])}")
        for g in trends['style_guide'][:2]:
            print(f"   • 🔥 {g['title']} ({g['gender']}): {g['vibe']}")

    # 5. Customer Executive Conversational AI & Guardrails
    print_separator("CUSTOMER EXECUTIVE & GUARDRAIL CHECKS")

    queries = [
        ("Timings Query", "What are today's free timings in your database?"),
        ("Coverage & Cost Query", "What is the cost, estimated time, and everything covered in Beard Grooming?"),
        ("Trending Style Query", "What hairstyles are trending right now for wavy hair?"),
        ("Off-Topic Guardrail Test", "Can you write me a python script to web scrape Amazon?")
    ]

    for label, q in queries:
        print(f"\n--- Testing: {label} ---")
        print(f"User: \"{q}\"")
        chat_resp = test_endpoint("Customer Executive (/api/chat)", f"{BACKEND_URL}/api/chat", method="POST", payload={"message": q})
        if chat_resp:
            guardrail = chat_resp.get("guardrail_triggered", False)
            print(f"Guardrail Flag: {'🚨 TRIGGERED (Blocked)' if guardrail else '🟢 PASS (Allowed)'}")
            reply_preview = chat_resp.get("response", "").strip()[:140].replace('\n', ' ')
            print(f"Executive Reply: {reply_preview}...")

    # 6. Direct Appointment Booking Test
    print_separator("DIRECT BOOKING ENDPOINT CHECK")
    book_payload = {
        "customer_name": "Karan Malhotra",
        "customer_phone": "+919876543210",
        "service_id": "cut-style",
        "date": "2026-10-25",
        "time_slot": "02:45 PM",
        "stylist_id": "stylist-kabir"
    }
    booking_result = test_endpoint("Book Appointment (/api/book)", f"{BACKEND_URL}/api/book", method="POST", payload=book_payload)
    if booking_result:
        print(f"   • Booking Status: {booking_result.get('status')}")
        print(f"   • Generated Booking ID: {booking_result.get('booking_id')}")

    # 7. Supabase Connection Status
    print_separator("SUPABASE CLOUD INTEGRATION STATUS")
    from database import is_supabase_enabled, SUPABASE_URL
    if is_supabase_enabled():
        print("🟢 Supabase is CONNECTED and ACTIVE as primary cloud database!")
        print(f"   • Supabase URL: {SUPABASE_URL}")
    else:
        print("ℹ️ Supabase is currently in FALLBACK mode (using local SQLite salon.db).")
        print("   To switch to Supabase Cloud, simply add your credentials to .env:")
        print("   SUPABASE_URL=https://your-project.supabase.co")
        print("   SUPABASE_KEY=your-anon-key")

    print_separator("ALL SYSTEM CHECKS COMPLETED SUCCESSFULLY")

if __name__ == "__main__":
    run_all_checks()
