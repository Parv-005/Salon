import os
import re
import datetime
from database import (
    get_today_free_slots,
    get_all_services,
    get_service_details,
    get_trending_items,
    book_new_appointment
)

# STRICT GUARDRAILS CONFIGURATION
# Allowed topical keywords
SALON_KEYWORDS = [
    "hair", "cut", "haircut", "fade", "beard", "trim", "shave", "colour", "color",
    "highlight", "balayage", "style", "styling", "spa", "wash", "blowout", "shampoo",
    "timing", "time", "slot", "today", "tomorrow", "free", "available", "appointment",
    "book", "booking", "schedule", "cost", "price", "rate", "charge", "cover",
    "included", "whats covered", "trending", "trend", "suggest", "recommend",
    "look", "swag", "salon", "mane riot", "stylist", "barber", "kabir", "priya",
    "rohan", "location", "address", "hours", "open", "close", "service", "menu"
]

# Off-topic forbidden intent patterns
OFF_TOPIC_PATTERNS = [
    r"\b(code|python|javascript|java|c\+\+|html|css|sql|programming|bug|algorithm)\b",
    r"\b(prime minister|president|election|politics|government|parliament|bjp|congress)\b",
    r"\b(stock market|crypto|bitcoin|forex|invest|trading)\b",
    r"\b(recipe|cook|bake|pizza|biryani recipe)\b",
    r"\b(movie|film|actor|bollywood|hollywood|box office|cricket match|ipl score)\b",
    r"\b(who created you|ignore previous instructions|system prompt|jailbreak|DAN mode)\b",
    r"\b(weather forecast|capital of|math problem|solve x|homework)\b"
]

def check_guardrails(user_message: str) -> tuple[bool, str]:
    """
    Evaluates whether the user's message is strictly within the allowed salon scope.
    Returns (is_allowed, explanation_or_rejection).
    """
    msg_lower = user_message.strip().lower()

    # Empty or super short greeting check
    if not msg_lower:
        return False, "Please ask a question regarding Mane Riot salon services, bookings, timings, or pricing."

    greetings = ["hi", "hello", "hey", "hola", "namaste", "good morning", "good evening", "good afternoon"]
    if msg_lower in greetings:
        return True, "greeting"

    # Check for direct off-topic regex triggers
    for pattern in OFF_TOPIC_PATTERNS:
        if re.search(pattern, msg_lower, re.IGNORECASE):
            return False, (
                "⚠️ **Guardrail Notice**: I am the **Mane Riot Customer Executive**. "
                "I am trained exclusively to assist you with salon bookings, today's free timings, "
                "service costs, detailed coverage, and trending hair & beard styles. "
                "\n\nHow can I help you with your haircut, beard grooming, or colour upgrade today?"
            )

    # Check for presence of salon-relevant terminology
    has_salon_keyword = any(kw in msg_lower for kw in SALON_KEYWORDS)

    # General question check that has zero relevance to salon
    if not has_salon_keyword and len(msg_lower.split()) > 3:
        return False, (
            "I can only answer questions related to **Mane Riot Salon** — including our service menu, "
            "pricing, today's free chair slots, what's covered in each session, and trending hairstyles. "
            "\n\nWould you like to check today's available slots or explore our trending cuts?"
        )

    return True, "allowed"


def handle_executive_chat(user_message: str) -> dict:
    """
    Core customer executive brain.
    Checks guardrails, fetches live database data, and crafts an expert response.
    """
    user_msg_clean = user_message.strip()
    is_allowed, reason = check_guardrails(user_msg_clean)

    if not is_allowed:
        return {
            "role": "executive",
            "guardrail_triggered": True,
            "response": reason,
            "suggestions": [
                "Check today's free timings",
                "What's covered in Cut & Style?",
                "What are the trending cuts?",
                "View full pricing & duration"
            ]
        }

    msg_lower = user_msg_clean.lower()
    openai_key = os.getenv("OPENAI_API_KEY")

    # If OpenAI key exists, optionally enrich via LLM with strict system prompt & DB context
    if openai_key and len(openai_key) > 10:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            db_slots = get_today_free_slots()
            db_services = get_all_services()
            db_trends = get_trending_items()

            system_prompt = f"""
            You are the expert Customer Executive at MANE RIOT® — a high-end, brutalist next-generation salon blending global style with authentic desi soul.
            YOUR STRICT GUARDRAILS:
            - You MUST ONLY answer queries about salon services, pricing, estimated duration, what is covered inside each service, today's free timing slots, trending styles, and bookings.
            - If asked about anything else (coding, politics, general world knowledge, personal opinions, competitors), strictly and politely decline and redirect to Mane Riot salon.
            - Keep your tone confident, sharp, professional, authentic, and welcoming.

            LIVE DATABASE CONTEXT:
            Today's Date: {db_slots['date']}
            Available Slots Today: {[s['time_slot'] for s in db_slots['slots']]}
            Services & Pricing: {[f"{s['name']}: Rs.{s['price_inr']} ({s['duration_mins']} mins) - Covers: {s['whats_covered']}" for s in db_services]}
            Trending Styles: {db_trends['style_guide']}
            """

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_msg_clean}
                ],
                max_tokens=450,
                temperature=0.4
            )
            llm_text = response.choices[0].message.content
            return {
                "role": "executive",
                "guardrail_triggered": False,
                "response": llm_text,
                "suggestions": ["Book a slot", "Check beard grooming", "See trending balayage"]
            }
        except Exception as e:
            print(f"LLM fallback triggered: {e}")

    # HIGH-PRECISION DETERMINISTIC CUSTOMER EXECUTIVE ENGINE
    # 1. Greetings
    if reason == "greeting" or msg_lower in ["hi", "hello", "hey"]:
        return {
            "role": "executive",
            "guardrail_triggered": False,
            "response": (
                "👋 **Welcome to MANE RIOT®!** I am your dedicated Customer Executive.\n\n"
                "I can assist you with:\n"
                "• 🕒 **Today's live free chair slots**\n"
                "• 💰 **Estimated costs & duration**\n"
                "• 🔍 **Detailed breakdown of everything covered** in each service\n"
                "• 🔥 **Trending desi & global styles** for hair, beards, and colour\n\n"
                "What would you like to explore today?"
            ),
            "suggestions": [
                "Check today's free timings",
                "What's covered in Cut & Style?",
                "What's trending right now?",
                "Pricing for beard grooming"
            ]
        }

    # 2. What is covered inside / Details on Specific Service
    if any(k in msg_lower for k in ["cover", "include", "whats covered", "what is covered", "what's covered", "detail", "step", "inside", "breakdown"]):
        target_service = None
        if "beard" in msg_lower:
            target_service = get_service_details("beard")
        elif any(w in msg_lower for w in ["colour", "color", "highlight", "balayage"]):
            target_service = get_service_details("colour")
        elif any(w in msg_lower for w in ["spa", "repair"]):
            target_service = get_service_details("spa")
        elif any(w in msg_lower for w in ["combo", "glow"]):
            target_service = get_service_details("combo")
        else:
            target_service = get_service_details("cut")

        if target_service:
            response_text = (
                f"✂️ **{target_service['name']} — Estimated Cost, Time & Coverage**\n\n"
                f"• 💰 **Estimated Cost:** ₹{target_service['price_inr']} (all-inclusive)\n"
                f"• ⏱️ **Estimated Duration:** ~{target_service['duration_mins']} minutes\n"
                f"• 🎯 **Suitable For:** {target_service['suitable_for']}\n\n"
                f"**Everything Covered in this Session:**\n"
                f"{target_service['whats_covered']}\n\n"
                f"Would you like to check today's free timings for this service?"
            )
            return {
                "role": "executive",
                "guardrail_triggered": False,
                "response": response_text,
                "data": target_service,
                "suggestions": [
                    "Check today's free timings",
                    f"Book {target_service['name']}",
                    "What else is trending?",
                    "View other services"
                ]
            }

    # 3. Check Today's Free Timings / Availability
    if any(k in msg_lower for k in ["timing", "free timing", "free slot", "open slot", "slot", "availability", "available today", "today's timing", "today's free", "free today"]):
        slots_data = get_today_free_slots()
        free_slots = slots_data["slots"]
        date_str = slots_data["date"]

        morning_slots = [s["time_slot"] for s in free_slots if "AM" in s["time_slot"]]
        afternoon_slots = [s["time_slot"] for s in free_slots if "PM" in s["time_slot"] and int(s["time_slot"][:2]) in [12, 1, 2, 3, 4]]
        evening_slots = [s["time_slot"] for s in free_slots if "PM" in s["time_slot"] and int(s["time_slot"][:2]) in [5, 6, 7, 8]]

        text_lines = [
            f"📅 **Today's Live Chair Availability ({date_str})**",
            f"We have **{slots_data['total_free_slots']} slots open today** across Master Barber Kabir, Colorist Priya, and Stylist Rohan:\n",
            f"☀️ **Morning Slots:** {', '.join(morning_slots) if morning_slots else 'Fully booked'}",
            f"🌤️ **Afternoon Slots:** {', '.join(afternoon_slots) if afternoon_slots else 'Fully booked'}",
            f"🌙 **Evening Slots:** {', '.join(evening_slots) if evening_slots else 'Fully booked'}",
            "\n💡 *Chair slots are 45 mins. Would you like me to reserve one of these slots for you?*"
        ]

        return {
            "role": "executive",
            "guardrail_triggered": False,
            "response": "\n".join(text_lines),
            "data": slots_data,
            "suggestions": [
                f"Book for {morning_slots[0] if morning_slots else '2:00 PM'}",
                f"Book for {evening_slots[0] if evening_slots else '6:30 PM'}",
                "What's covered in Cut & Style?",
                "Check Colour & Highlights cost"
            ]
        }

    # 4. Estimated Time & Cost of Services / Pricing Inquiries
    if any(k in msg_lower for k in ["cost", "price", "rate", "how much", "duration", "how long", "time taken"]):
        services = get_all_services()
        lines = [
            "💈 **Mane Riot Service Menu — Estimated Cost & Duration**\n"
        ]
        for s in services:
            lines.append(
                f"• **{s['name']}**\n"
                f"   💰 **Cost:** ₹{s['price_inr']}  |  ⏱️ **Duration:** {s['duration_mins']} mins\n"
                f"   📝 *{s['description']}*\n"
            )
        lines.append("💡 *Every service includes consultation, wash, and signature finish. Want to know what is covered inside any specific service?*")

        return {
            "role": "executive",
            "guardrail_triggered": False,
            "response": "\n".join(lines),
            "suggestions": [
                "What's covered in Cut & Style?",
                "What's covered in Beard Grooming?",
                "Check today's free timings",
                "What's trending right now?"
            ]
        }

    # 5. Trending Styles & Recommendations
    if any(k in msg_lower for k in ["trend", "trending", "suggest", "recommend", "best cut", "popular", "modern", "swag", "desi style"]):
        trends = get_trending_items()
        lines = [
            "🔥 **Top Trending Hair & Beard Looks at MANE RIOT**\n",
            "Here is what our chairs are creating most this season:\n"
        ]
        for guide in trends["style_guide"]:
            lines.append(
                f"🌟 **{guide['title']}** ({guide['gender']})\n"
                f"   • **The Vibe:** {guide['vibe']}\n"
                f"   • **Best For:** {guide['recommended_for']}\n"
            )

        lines.append("\n👉 *Bring your moodboard or let our master stylists customize it for your face shape!*")

        return {
            "role": "executive",
            "guardrail_triggered": False,
            "response": "\n".join(lines),
            "suggestions": [
                "Book Drop Fade session",
                "Check Butterfly Layers cost",
                "Check today's free timings"
            ]
        }

    # 6. Booking Direct Intent
    if any(k in msg_lower for k in ["book", "reserve", "appointment"]):
        return {
            "role": "executive",
            "guardrail_triggered": False,
            "response": (
                "⚡ **Let's get your chair locked in!**\n\n"
                "Please let me know:\n"
                "1. **Which service** you'd like (Cut & Style, Beard Grooming, Colour, or Combo)\n"
                "2. **Preferred time slot** (e.g., 2:45 PM, 5:00 PM, 6:30 PM)\n"
                "3. **Your name & WhatsApp number**\n\n"
                "Or click the 'BOOK NOW' button on your screen to open the direct reservation drawer!"
            ),
            "suggestions": [
                "Check today's free timings",
                "Cut & Style at 2:45 PM",
                "Full Glow-up at 5:00 PM"
            ]
        }

    # Fallback within salon scope
    return {
        "role": "executive",
        "guardrail_triggered": False,
        "response": (
            "I'm here to help you with everything at **MANE RIOT**! You can ask me to:\n"
            "• Check **today's free timings**\n"
            "• Get **estimated cost and duration** for any service\n"
            "• Learn **everything covered inside** our cuts, beards, or colours\n"
            "• Suggest **trending desi & global hairstyles** for your look\n\n"
            "What would you like to explore?"
        ),
        "suggestions": [
            "Check today's free timings",
            "What's covered in Cut & Style?",
            "What are the trending cuts?",
            "Full price list"
        ]
    }
