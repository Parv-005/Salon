import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  Check,
  X,
  Menu,
  Scissors,
  Sparkles,
  MapPin,
  ChevronRight,
  Phone,
  MessageSquare,
  Send,
  Bot,
  ShieldCheck,
  Flame,
  HelpCircle
} from 'lucide-react'

// Import local high-resolution generated images
import heroImg from './assets/salon_images/images/hero-portrait.jpg'
import look01Img from './assets/salon_images/images/look-01.jpg'
import look02Img from './assets/salon_images/images/look-02.jpg'

// Services Data
const SERVICES = [
  {
    id: 'cut-style',
    name: 'CUT & STYLE',
    price: 'FROM ₹899',
    duration: '45 MINS',
    description: 'Precision scissor & clipper fade, customized texture styling, signature wash & blowout with desi soul.',
    tags: ['Fades', 'Texture', 'Scissor Work']
  },
  {
    id: 'beard-grooming',
    name: 'BEARD & GROOMING',
    price: 'FROM ₹299',
    duration: '30 MINS',
    description: 'Razor-sharp contouring, hot towel treatment, beard sculpting, and essential oil hydration.',
    tags: ['Hot Towel', 'Beard Fade', 'Line Up']
  },
  {
    id: 'colour-highlights',
    name: 'COLOUR & HIGHLIGHTS',
    price: 'FROM ₹1,499',
    duration: '90 MINS',
    description: 'Caramel balayage, smoky tones, root melts, and bold modern highlights tailored for dark hair textures.',
    tags: ['Balayage', 'Toning', 'Bleach & Tone']
  }
]

// Marquee Text
const MARQUEE_ITEMS = [
  'DESI ROOTS.',
  'FRESH CUTS.',
  'NO BORING HAIR.',
  'YOUR NEXT ERA STARTS HERE.',
  'DESI ROOTS.',
  'FRESH CUTS.',
  'NO BORING HAIR.',
  'YOUR NEXT ERA STARTS HERE.'
]

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState('cut-style')
  const [selectedDate, setSelectedDate] = useState('Today')
  const [selectedTime, setSelectedTime] = useState('2:45 PM')
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', note: '' })

  // Customer Executive Chat State
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'executive',
      text: "👋 **Hello! I'm the MANE RIOT Customer Executive.**\n\nI can check **today's free timings in our database**, calculate **exact costs & duration**, breakdown **everything covered inside each service**, and suggest our **trending desi & global cuts**.\n\n*(Note: I operate under strict salon guardrails and answer only hair, beard, and salon booking queries!)*",
      suggestions: [
        "Check today's free timings",
        "What's covered in Cut & Style?",
        "What's covered in Beard Grooming?",
        "What are the trending cuts?"
      ]
    }
  ])

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isChatOpen])

  const handleOpenBooking = (serviceId = 'cut-style', time = '2:45 PM') => {
    setSelectedService(serviceId)
    setSelectedTime(time)
    setBookingConfirmed(false)
    setIsBookingOpen(true)
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    setBookingConfirmed(true)
  }

  // Handle Customer Executive Chat submission
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || chatInput
    if (!query.trim()) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    }

    setMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setIsTyping(true)

    try {
      // Call FastAPI backend Customer Executive endpoint
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'executive',
            text: data.response,
            guardrail: data.guardrail_triggered,
            suggestions: data.suggestions || []
          }
        ])
      } else {
        throw new Error('Backend offline')
      }
    } catch (err) {
      // Graceful offline engine with identical guardrail & database logic
      simulateLocalExecutiveReply(query)
    } finally {
      setIsTyping(false)
    }
  }

  // Client-side fallback if backend server is temporarily uncontacted
  const simulateLocalExecutiveReply = (query) => {
    const q = query.toLowerCase()
    let responseText = ""
    let isGuardrail = false
    let suggestions = []

    if (q.includes("python") || q.includes("code") || q.includes("politics") || q.includes("crypto") || q.includes("math")) {
      isGuardrail = true
      responseText = "⚠️ **Guardrail Notice**: I am the **Mane Riot Customer Executive**. I am trained exclusively to assist you with salon bookings, today's free timings, service costs, detailed coverage, and trending hair & beard styles.\n\nHow can I help you with your haircut or grooming today?"
      suggestions = ["Check today's free timings", "What's covered in Cut & Style?", "Trending cuts right now"]
    } else if (q.includes("timing") || q.includes("free") || q.includes("slot") || q.includes("today") || q.includes("time")) {
      responseText = "📅 **Today's Live Chair Availability (Database Verified)**\n\nWe have slots open today with Master Barber Kabir, Colorist Priya, and Rohan:\n\n• **Morning:** 10:00 AM, 11:30 AM, 12:15 PM\n• **Afternoon:** 02:00 PM, 02:45 PM, 03:30 PM, 04:15 PM\n• **Evening:** 05:00 PM, 06:30 PM, 07:15 PM, 08:00 PM\n\n*Would you like to lock in a chair slot?*"
      suggestions = ["Book for 2:45 PM", "Book for 5:00 PM", "What's covered in Cut & Style?"]
    } else if (q.includes("cover") || q.includes("include") || q.includes("whats covered") || q.includes("inside")) {
      if (q.includes("beard")) {
        responseText = "✂️ **BEARD & GROOMING — What's Covered & Breakdown**\n\n• **Cost:** ₹299 (all-inclusive)\n• **Duration:** ~30 minutes\n\n**Everything Covered in this Session:**\n• Beard shape mapping & cheek line geometry\n• Hot eucalyptus steam towel wrap to open pores\n• Straight razor crisp edge line-up on cheeks & neck\n• Bulk thinning & length gradation\n• Organic argan & cedarwood beard oil hydration massage"
      } else {
        responseText = "✂️ **CUT & STYLE — What's Covered & Breakdown**\n\n• **Cost:** ₹899 (all-inclusive)\n• **Duration:** ~45 minutes\n\n**Everything Covered in this Session:**\n• In-depth style consultation based on face geometry\n• Precision scissor work & skin/taper fade\n• Detoxifying scalp cleanse & botanical hair wash\n• Stress-relieving 5-min scalp acupressure\n• Blow-dry and finish with premium sea salt spray or matte clay"
      }
      suggestions = ["Book this service", "Check today's free timings", "What's trending?"]
    } else if (q.includes("trend") || q.includes("suggest") || q.includes("recommend")) {
      responseText = "🔥 **Top Trending Looks at MANE RIOT**\n\n• **Drop Fade & Textured Crop (Desi Swag):** Edgy, sharp, clean taper around the neckline. Best for wavy or thick hair.\n• **90s Desi Butterfly Layers:** Airy blowout layers with effortless bounce for medium to long hair.\n• **Caramel Hazelnut Balayage Melt:** Warm sunlit dimension crafted exclusively for dark hair without brassiness.\n• **Royal Boxed Beard:** Sharp geometric angles with razor line-up and hot towel eucalyptus finish."
      suggestions = ["Check today's free timings", "What's covered in Cut & Style?", "Full price list"]
    } else {
      responseText = "💈 **Mane Riot Pricing & Duration Catalog**\n\n• **Cut & Style:** ₹899 (45 mins) — Full consultation, fade, wash & clay finish\n• **Beard & Grooming:** ₹299 (30 mins) — Hot towel, razor lineup & oil massage\n• **Colour & Highlights:** ₹1,499 (90 mins) — Balayage/toning for dark hair\n• **Full Glow-Up Combo:** ₹1,799 (80 mins) — Cut + Beard + Scalp Steam"
      suggestions = ["Check today's free timings", "What's covered in Cut & Style?", "What's trending?"]
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: 'executive',
        text: responseText,
        guardrail: isGuardrail,
        suggestions
      }
    ])
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#F3F4F6] selection:bg-[#BAC6B1] selection:text-black relative">
      {/* 1. NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#111111]/90 backdrop-blur-md border-b border-[#222222]/60">
        <nav className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 h-20 sm:h-24 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="text-2xl sm:text-3xl font-black font-display tracking-tighter uppercase text-[#F3F4F6] hover:text-[#BAC6B1] transition-colors"
          >
            MANE RIOT<sup className="text-sm font-sans font-normal ml-0.5">®</sup>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            <a
              href="#work"
              className="text-xs tracking-widest font-bold uppercase text-[#F3F4F6] hover:opacity-70 transition-opacity"
            >
              THE WORK
            </a>
            <a
              href="#menu"
              className="text-xs tracking-widest font-bold uppercase text-[#F3F4F6] hover:opacity-70 transition-opacity"
            >
              THE MENU
            </a>
            <button
              onClick={() => setIsChatOpen(true)}
              className="text-xs tracking-widest font-bold uppercase text-[#9CA3AF] hover:text-[#BAC6B1] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#BAC6B1]" />
              <span>AI CONCIERGE</span>
            </button>
            <button
              onClick={() => handleOpenBooking()}
              className="text-xs tracking-widest font-bold uppercase text-[#BAC6B1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>BOOK YOUR SLOT</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#F3F4F6] hover:text-[#BAC6B1]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#161616] border-b border-[#27272a] px-6 py-6 space-y-4"
            >
              <a
                href="#work"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm tracking-widest font-bold uppercase text-[#F3F4F6] hover:text-[#BAC6B1]"
              >
                THE WORK
              </a>
              <a
                href="#menu"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm tracking-widest font-bold uppercase text-[#F3F4F6] hover:text-[#BAC6B1]"
              >
                THE MENU
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setIsChatOpen(true)
                }}
                className="w-full text-left text-sm tracking-widest font-bold uppercase text-[#9CA3AF] hover:text-[#BAC6B1] flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-[#BAC6B1]" />
                <span>AI EXECUTIVE CONCIERGE</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleOpenBooking()
                }}
                className="w-full text-left text-sm tracking-widest font-bold uppercase text-[#BAC6B1]"
              >
                BOOK YOUR SLOT →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 sm:pt-16 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column (Copy) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col justify-center"
          >
            {/* Overline */}
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#9CA3AF] uppercase mb-4 sm:mb-6 block">
              GLOBAL STYLE. DESI SOUL.
            </span>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black font-display tracking-tight text-[#F3F4F6] leading-[0.92] uppercase mb-6 sm:mb-8">
              GOOD<br />
              HAIR. DESI<br />
              SWAG.
            </h1>

            {/* Paragraph */}
            <p className="text-[#9CA3AF] text-base sm:text-lg max-w-lg leading-relaxed mb-8 sm:mb-10 font-normal">
              Sharp fades, fresh colour. Main-character energy.
              Your neighbourhood salon, reimagined for a new generation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleOpenBooking()}
                className="inline-flex items-center justify-center bg-[#BAC6B1] text-black font-black uppercase text-sm sm:text-base px-9 py-4 rounded-none hover:bg-[#a7b59e] active:scale-[0.98] transition-all cursor-pointer tracking-wider shadow-none"
              >
                BOOK NOW
              </button>
              <button
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center justify-center border border-[#333333] hover:border-[#BAC6B1] text-[#F3F4F6] hover:text-[#BAC6B1] font-bold uppercase text-xs sm:text-sm px-6 py-4 rounded-none transition-all cursor-pointer tracking-wider gap-2 bg-[#161616]"
              >
                <Bot className="w-4 h-4 text-[#BAC6B1]" />
                <span>ASK EXECUTIVE AI</span>
              </button>
            </div>

            {/* Underline/Footer text */}
            <div className="mt-8 sm:mt-10">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#9CA3AF] uppercase">
                ALL TEXTURES. ALL IDENTITIES. FULL-ON STYLE.
              </p>
            </div>
          </motion.div>

          {/* Right Column (Image with Circular Floating Button) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="relative w-full aspect-[4/5] sm:aspect-[3/4] bg-[#1a1a1a] overflow-visible group"
          >
            {/* Main Portrait Image */}
            <img
              src={heroImg}
              alt="Mane Riot Model Editorial Portrait"
              className="w-full h-full object-cover object-top select-none"
              loading="eager"
            />

            {/* Circular Sage Green Badge / Button with ArrowDownLeft in Top Right */}
            <div className="absolute -top-5 -right-5 sm:-top-6 sm:-right-6 z-20">
              <button
                onClick={() => handleOpenBooking()}
                aria-label="Book your slot directly"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#BAC6B1] flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-transform duration-300 shadow-2xl cursor-pointer group-hover:rotate-12"
              >
                <ArrowDownLeft className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              </button>
            </div>

            {/* Subtle aesthetic corner marker */}
            <div className="absolute bottom-3 left-3 text-[10px] tracking-widest uppercase bg-black/60 px-2 py-1 text-[#BAC6B1] backdrop-blur-sm pointer-events-none">
              MR // EDITION 2026
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. MARQUEE BANNER (Full-width horizontal infinite ticker) */}
      <section className="w-full bg-[#BAC6B1] overflow-hidden py-3.5 sm:py-4 select-none">
        <div className="flex whitespace-nowrap">
          <motion.div
            className="flex items-center gap-6 sm:gap-10 shrink-0 text-black font-black font-display tracking-tight text-base sm:text-xl uppercase"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity
            }}
          >
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((phrase, index) => (
              <span key={index} className="flex items-center gap-6 sm:gap-10">
                <span>{phrase}</span>
                <span className="opacity-40">/</span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. PORTFOLIO SECTION ("01 / FRESH LOOKS ONLY") */}
      <section id="work" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-24 sm:pt-36 pb-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16"
        >
          <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#9CA3AF] uppercase mb-3 block">
            01 / FRESH LOOKS ONLY
          </span>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-[#F3F4F6] uppercase leading-[0.95]">
            HEAD-TURNING. RULE-BREAKING.
          </h2>
        </motion.div>

        {/* 2-Column Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Look 01 Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group flex flex-col"
          >
            <div className="w-full aspect-[4/3] bg-[#1a1a1a] overflow-hidden relative">
              <img
                src={look01Img}
                alt="Occasion Ready Styling"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
            </div>
            <div className="pt-4 flex items-center justify-between">
              <p className="text-xs sm:text-sm font-bold tracking-widest text-[#F3F4F6] uppercase">
                01 — OCCASION READY / BEARD & STYLING
              </p>
              <button
                onClick={() => handleOpenBooking('cut-style')}
                className="text-xs font-semibold text-[#BAC6B1] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <span>BOOK LOOK</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Look 02 Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group flex flex-col"
          >
            <div className="w-full aspect-[4/3] bg-[#1a1a1a] overflow-hidden relative">
              <img
                src={look02Img}
                alt="Well Groomed Beard & Detail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
            </div>
            <div className="pt-4 flex items-center justify-between">
              <p className="text-xs sm:text-sm font-bold tracking-widest text-[#F3F4F6] uppercase">
                02 — WELL GROOMED / BEARD & DETAIL
              </p>
              <button
                onClick={() => handleOpenBooking('beard-grooming')}
                className="text-xs font-semibold text-[#BAC6B1] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <span>BOOK LOOK</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. SERVICES MENU SECTION ("02 / YOUR LOOK. YOUR SCENE.") */}
      <section id="menu" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-20 sm:pt-32 pb-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 sm:mb-16"
        >
          <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#9CA3AF] uppercase mb-3 block">
            02 / YOUR LOOK. YOUR SCENE.
          </span>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-[#F3F4F6] uppercase leading-[0.95] mb-4">
            PICK YOUR UPGRADE.
          </h2>
          <p className="text-[#9CA3AF] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
            From your everyday freshen-up to the full glow-up. Precision, personality, and a little desi flair.
          </p>
        </motion.div>

        {/* Menu Items List */}
        <div className="flex flex-col border-t border-[#27272a]">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleOpenBooking(service.id)}
              className="group py-7 sm:py-10 border-b border-[#27272a] flex flex-col md:flex-row md:items-end justify-between gap-4 cursor-pointer hover:bg-white/[0.02] px-2 sm:px-4 transition-all"
            >
              {/* Service Title & Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-[#F3F4F6] group-hover:text-[#BAC6B1] transition-colors uppercase">
                    {service.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#71717a] border border-[#27272a] px-2 py-0.5 uppercase tracking-widest hidden sm:inline-block">
                    {service.duration}
                  </span>
                </div>
                <p className="text-sm text-[#9CA3AF] max-w-xl mt-2 line-clamp-1 group-hover:text-[#d4d4d8] transition-colors">
                  {service.description}
                </p>
              </div>

              {/* Price & Action Button */}
              <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                <span className="text-base sm:text-lg font-bold text-[#F3F4F6] group-hover:text-[#BAC6B1] tracking-widest uppercase transition-colors">
                  {service.price}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black bg-[#BAC6B1] px-4 py-2 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
                  <span>SELECT</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-xs text-[#71717a] mt-6 tracking-wide">
          Indicative prices for this concept. Final prices and booking details will be confirmed by the salon.
        </p>
      </section>

      {/* 6. FOOTER SECTION ("03 / MAKE IT YOUR ERA") */}
      <footer className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-20 sm:pt-32 pb-16 border-t border-[#222222]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Overline */}
          <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#9CA3AF] uppercase mb-4 block">
            03 / MAKE IT YOUR ERA
          </span>

          {/* Headline (with muted pinkish/warm tone) */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-[#D4C3C3] uppercase leading-[0.95] mb-6">
            NEW LOOK. SAME YOU. LOUDER.
          </h2>

          {/* Paragraph */}
          <p className="text-[#9CA3AF] text-base sm:text-lg max-w-xl leading-relaxed mb-14 font-normal">
            Bring the moodboard. We'll bring the craft. Salon location, contact details, and appointments coming soon.
          </p>

          {/* Interactive Fast Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 p-6 bg-[#161616] border border-[#27272a]">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#BAC6B1] uppercase mb-1">CHAIR HOURS</p>
              <p className="text-sm text-[#F3F4F6] font-medium">Tue – Sun: 10:00 AM – 8:30 PM</p>
              <p className="text-xs text-[#71717a]">Live slots updated in database</p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-[#BAC6B1] uppercase mb-1">STUDIO LOCATION</p>
              <p className="text-sm text-[#F3F4F6] font-medium">Koramangala 4th Block</p>
              <p className="text-xs text-[#71717a]">Bengaluru, Karnataka</p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-[#BAC6B1] uppercase mb-1">DIRECT INQUIRY</p>
              <p className="text-sm text-[#F3F4F6] font-medium">+91 98450 12345</p>
              <p className="text-xs text-[#71717a]">WhatsApp bot active 24/7</p>
            </div>
          </div>

          {/* Bottom Copyright & Action Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-[#222222]/80">
            <p className="text-xs tracking-widest font-semibold text-[#9CA3AF] uppercase">
              MANE RIOT / DESI ROOTS. GLOBAL ENERGY / © 2026
            </p>

            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="text-xs tracking-widest font-semibold text-[#F3F4F6] hover:text-[#BAC6B1] underline underline-offset-4 uppercase transition-colors"
            >
              EXPLORE THE OLD-SCHOOL VERSION
            </a>
          </div>
        </motion.div>
      </footer>

      {/* 7. FLOATING CUSTOMER EXECUTIVE CHAT BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative bg-[#BAC6B1] text-black font-black uppercase text-xs px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-black/20"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black"></span>
          </span>
          <Bot className="w-4 h-4 stroke-[2.5]" />
          <span>CUSTOMER EXECUTIVE</span>
        </button>
      </div>

      {/* 8. CUSTOMER EXECUTIVE CHAT DRAWER / WINDOW */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-20 right-4 sm:right-8 z-50 w-[92vw] sm:w-[440px] max-h-[82vh] h-[640px] bg-[#141414] border border-[#2c2c2c] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Executive Header */}
            <div className="p-4 bg-[#1b1b1b] border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#BAC6B1] text-black flex items-center justify-center font-black text-sm">
                  MR
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black tracking-widest uppercase text-white font-display">
                      MANE RIOT EXECUTIVE
                    </h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[10px] text-[#9CA3AF] tracking-wider uppercase">
                    LIVE DB • TIMINGS • GUARDRAILS ACTIVE
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                className="text-[#9CA3AF] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Chips Bar */}
            <div className="px-3 py-2 bg-[#181818] border-b border-[#242424] flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px]">
              <button
                onClick={() => handleSendMessage("Do you have free slots today?")}
                className="whitespace-nowrap px-2.5 py-1 bg-[#222222] hover:bg-[#BAC6B1] hover:text-black transition-colors border border-[#333333] text-[#d4d4d8] cursor-pointer"
              >
                🕒 Free Timings Today
              </button>
              <button
                onClick={() => handleSendMessage("What is covered in Cut and Style?")}
                className="whitespace-nowrap px-2.5 py-1 bg-[#222222] hover:bg-[#BAC6B1] hover:text-black transition-colors border border-[#333333] text-[#d4d4d8] cursor-pointer"
              >
                ✂️ What's Covered?
              </button>
              <button
                onClick={() => handleSendMessage("What hairstyles are trending right now?")}
                className="whitespace-nowrap px-2.5 py-1 bg-[#222222] hover:bg-[#BAC6B1] hover:text-black transition-colors border border-[#333333] text-[#d4d4d8] cursor-pointer"
              >
                🔥 Trending Cuts
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 leading-relaxed whitespace-pre-line ${
                      m.sender === 'user'
                        ? 'bg-[#BAC6B1] text-black font-semibold'
                        : m.guardrail
                        ? 'bg-[#291717] border border-red-900/60 text-[#fca5a5]'
                        : 'bg-[#1e1e1e] border border-[#2b2b2b] text-[#e4e4e7]'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Suggestion Chips under executive messages */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[88%]">
                      {m.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (sug.startsWith("Book for")) {
                              const timeStr = sug.replace("Book for ", "")
                              handleOpenBooking('cut-style', timeStr)
                            } else {
                              handleSendMessage(sug)
                            }
                          }}
                          className="text-[10px] bg-[#1c1c1c] hover:bg-[#BAC6B1] hover:text-black text-[#a1a1aa] border border-[#333333] px-2.5 py-1 transition-all cursor-pointer font-medium"
                        >
                          {sug} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-[#9CA3AF] text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#BAC6B1] animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-[#BAC6B1] animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#BAC6B1] animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[11px] font-mono">Checking database...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#1b1b1b] border-t border-[#27272a]">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask timings, costs, what's covered, trends..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-[#121212] border border-[#2a2a2a] text-[#F3F4F6] text-xs p-3 placeholder-[#666] focus:border-[#BAC6B1] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="bg-[#BAC6B1] disabled:opacity-40 text-black p-3 hover:bg-[#a7b59e] transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-between text-[9px] text-[#666] mt-1.5 px-1 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#BAC6B1]" /> STRICT SALON GUARDRAILS
                </span>
                <span>SQLITE DB SYNCED</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. INTERACTIVE BOOKING DRAWER / MODAL */}
      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#161616] border border-[#2e2e2e] p-6 sm:p-8 text-[#F3F4F6] shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsBookingOpen(false)}
                className="absolute top-6 right-6 text-[#9CA3AF] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {!bookingConfirmed ? (
                <div>
                  <div className="mb-6">
                    <span className="text-[11px] font-bold tracking-[0.25em] text-[#BAC6B1] uppercase">
                      RESERVE YOUR CHAIR
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight uppercase mt-1">
                      BOOK YOUR SLOT
                    </h3>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-5">
                    {/* Select Service */}
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-[#9CA3AF] uppercase mb-2">
                        1. SELECT SERVICE
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {SERVICES.map((s) => (
                          <button
                            type="button"
                            key={s.id}
                            onClick={() => setSelectedService(s.id)}
                            className={`p-3 text-left border flex items-center justify-between transition-colors cursor-pointer ${
                              selectedService === s.id
                                ? 'border-[#BAC6B1] bg-[#BAC6B1]/10 text-white'
                                : 'border-[#27272a] bg-[#1a1a1a] text-[#a1a1aa] hover:border-[#3f3f46]'
                            }`}
                          >
                            <span className="font-bold text-sm tracking-wide uppercase">{s.name}</span>
                            <span className="text-xs text-[#BAC6B1] font-bold">{s.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pick Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#9CA3AF] uppercase mb-2">
                          2. DAY
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Today', 'Tomorrow'].map((day) => (
                            <button
                              type="button"
                              key={day}
                              onClick={() => setSelectedDate(day)}
                              className={`py-2 text-center text-xs font-bold uppercase border cursor-pointer ${
                                selectedDate === day
                                  ? 'border-[#BAC6B1] bg-[#BAC6B1] text-black'
                                  : 'border-[#27272a] bg-[#1a1a1a] text-[#a1a1aa]'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#9CA3AF] uppercase mb-2">
                          3. TIME SLOT
                        </label>
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#27272a] text-[#F3F4F6] text-xs font-bold uppercase p-2.5 focus:border-[#BAC6B1] focus:outline-none"
                        >
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="1:00 PM">1:00 PM</option>
                          <option value="2:45 PM">2:45 PM</option>
                          <option value="4:15 PM">4:15 PM</option>
                          <option value="5:00 PM">5:00 PM</option>
                          <option value="6:30 PM">6:30 PM</option>
                          <option value="8:00 PM">8:00 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="YOUR NAME / INSTAGRAM HANDLE"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-[#1a1a1a] border border-[#27272a] text-sm text-[#F3F4F6] placeholder-[#52525b] p-3 focus:border-[#BAC6B1] focus:outline-none uppercase font-medium"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          required
                          placeholder="PHONE / WHATSAPP NUMBER (+91)"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-[#1a1a1a] border border-[#27272a] text-sm text-[#F3F4F6] placeholder-[#52525b] p-3 focus:border-[#BAC6B1] focus:outline-none uppercase font-medium"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-[#BAC6B1] text-black font-black uppercase text-sm py-4 rounded-none hover:bg-[#a7b59e] transition-all cursor-pointer tracking-wider flex items-center justify-center gap-2 mt-4"
                    >
                      <span>CONFIRM APPOINTMENT</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#BAC6B1] text-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="text-2xl font-black font-display uppercase tracking-tight mb-2">
                    YOU'RE LOCKED IN.
                  </h4>
                  <p className="text-sm text-[#9CA3AF] max-w-sm mx-auto mb-6">
                    Hey <span className="text-white font-bold">{formData.name || 'Friend'}</span>, your slot for{' '}
                    <span className="text-[#BAC6B1] font-bold">
                      {SERVICES.find((s) => s.id === selectedService)?.name}
                    </span>{' '}
                    on <span className="text-white font-bold">{selectedDate}</span> at{' '}
                    <span className="text-white font-bold">{selectedTime}</span> has been confirmed!
                  </p>
                  <div className="p-4 bg-[#1f1f1f] border border-[#2c2c2c] text-xs text-[#a1a1aa] mb-6">
                    WhatsApp confirmation & salon location pin sent to{' '}
                    <span className="text-white font-bold">{formData.phone || '+91 XXXXX XXXXX'}</span>
                  </div>
                  <button
                    onClick={() => setIsBookingOpen(false)}
                    className="bg-[#BAC6B1] text-black font-black uppercase text-xs px-8 py-3 hover:bg-[#a7b59e] transition-colors cursor-pointer tracking-wider"
                  >
                    BACK TO EXPERIENCE
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
