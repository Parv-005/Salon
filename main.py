import os
from fastapi import FastAPI, Query, Response, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from database import (
    init_db,
    get_today_free_slots,
    get_all_services,
    get_service_details,
    get_trending_items,
    book_new_appointment
)
from executive import handle_executive_chat

load_dotenv()

# Initialize SQLite database with seed data
init_db()

app = FastAPI(
    title="MANE RIOT Salon & Customer Executive API",
    description="Backend API providing slot availability, service catalogs, trending hair trends, and Customer Executive AI with strict guardrails.",
    version="1.0.0"
)

# Enable CORS for Vite frontend and local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "barber_bot_verify_token")

# Request Models
class ChatRequest(BaseModel):
    message: str

class BookingRequest(BaseModel):
    customer_name: str
    customer_phone: str
    service_id: str
    date: str
    time_slot: str
    stylist_id: Optional[str] = "stylist-kabir"

@app.get("/")
def root():
    return {
        "brand": "MANE RIOT®",
        "tagline": "Global Style. Desi Soul.",
        "status": "online",
        "docs_url": "/docs"
    }

# 1. Meta Webhook Verification Endpoint (WhatsApp / Messenger)
@app.get("/webhook")
async def verify_webhook(
    mode: str = Query(None, alias="hub.mode"),
    token: str = Query(None, alias="hub.verify_token"),
    challenge: str = Query(None, alias="hub.challenge")
):
    if mode == "subscribe" and token == VERIFY_TOKEN:
        print("Webhook verified successfully!")
        return Response(content=challenge, media_type="text/plain", status_code=200)
    return Response(content="Verification failed", status_code=403)

# 2. Meta Webhook Incoming Message Handler (Calls Customer Executive)
@app.post("/webhook")
async def handle_whatsapp_incoming(request: Request):
    try:
        body = await request.json()
        print("Received webhook payload:", body)

        # Extract message text if from WhatsApp Cloud API format
        entry = body.get("entry", [])
        if entry:
            changes = entry[0].get("changes", [])
            if changes:
                value = changes[0].get("value", {})
                messages = value.get("messages", [])
                if messages:
                    msg_obj = messages[0]
                    user_text = msg_obj.get("text", {}).get("body", "")
                    from_number = msg_obj.get("from", "")

                    # Process through Customer Executive with guardrails
                    executive_reply = handle_executive_chat(user_text)
                    print(f"Executive reply to {from_number}: {executive_reply['response']}")

        return {"status": "success", "processed": True}
    except Exception as e:
        print("Error processing webhook:", e)
        return {"status": "error", "detail": str(e)}

# 3. Customer Executive Chat Endpoint (Used by Web Frontend & Mobile Apps)
@app.post("/api/chat")
async def executive_chat_endpoint(chat_req: ChatRequest):
    """
    Acts as the Mane Riot Customer Executive.
    - Validates strict guardrails (salon topics only).
    - Queries database for today's free timings.
    - Calculates estimated costs & durations.
    - Defines everything covered inside the requested service.
    - Suggests trending styles & haircuts.
    """
    if not chat_req.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    result = handle_executive_chat(chat_req.message)
    return result

# 4. Check Today's Free Timings Endpoint
@app.get("/api/slots/today")
async def get_today_slots_endpoint(date: Optional[str] = None):
    """Fetches real-time available chair slots from the database."""
    return get_today_free_slots(date_str=date)

# 5. Service Catalog (Cost, Duration, and Everything Covered)
@app.get("/api/services")
async def get_services_catalog_endpoint():
    """Returns the full salon service catalog with itemized breakdown of what is covered."""
    return get_all_services()

@app.get("/api/services/{service_id}")
async def get_single_service_endpoint(service_id: str):
    """Returns detailed information and what's covered for a specific service."""
    service = get_service_details(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found.")
    return service

# 6. Trending Styles & Recommendations Endpoint
@app.get("/api/trending")
async def get_trending_endpoint():
    """Returns top trending hairstyles, beard shapes, and colour trends with style guide."""
    return get_trending_items()

# 7. Direct Appointment Booking Endpoint
@app.post("/api/book")
async def book_appointment_endpoint(book_req: BookingRequest):
    """Books a salon chair slot in the database."""
    appointment_id = book_new_appointment(
        customer_name=book_req.customer_name,
        customer_phone=book_req.customer_phone,
        service_id=book_req.service_id,
        date_str=book_req.date,
        time_slot=book_req.time_slot,
        stylist_id=book_req.stylist_id or "stylist-kabir"
    )
    return {
        "status": "confirmed",
        "booking_id": f"MR-{appointment_id:04d}",
        "details": book_req.model_dump()
    }