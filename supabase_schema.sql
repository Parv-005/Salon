-- =====================================================================
-- MANE RIOT® — Supabase PostgreSQL Database Schema
-- Paste and run this script in your Supabase Project -> SQL Editor
-- =====================================================================

-- 1. Services Table
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price_inr INTEGER NOT NULL,
    duration_mins INTEGER NOT NULL,
    description TEXT NOT NULL,
    whats_covered TEXT NOT NULL,
    is_trending INTEGER DEFAULT 1,
    suitable_for TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Stylists Table
CREATE TABLE IF NOT EXISTS stylists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    rating NUMERIC DEFAULT 4.9,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_id TEXT REFERENCES services(id),
    stylist_id TEXT REFERENCES stylists(id),
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) with Public Read / Insert Policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow Public Anon Read Access for services & stylists
CREATE POLICY "Public Read Services" ON services FOR SELECT USING (true);
CREATE POLICY "Public Read Stylists" ON stylists FOR SELECT USING (true);

-- Allow Public Read & Insert for appointments (for booking & checking availability)
CREATE POLICY "Public Read Appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "Public Insert Appointments" ON appointments FOR INSERT WITH CHECK (true);

-- =====================================================================
-- SEED INITIAL DATA
-- =====================================================================

INSERT INTO services (id, name, category, price_inr, duration_mins, description, whats_covered, is_trending, suitable_for)
VALUES
(
    'cut-style',
    'CUT & STYLE',
    'Haircut',
    899,
    45,
    'Precision scissor & clipper fade, customized texture styling, signature wash & blowout with desi soul.',
    '• In-depth style consultation based on face geometry
• Precision scissor work & skin/taper fade
• Detoxifying scalp cleanse & botanical hair wash
• Stress-relieving 5-min scalp acupressure
• Blow-dry and finish with premium sea salt spray or matte clay',
    1,
    'All hair textures, wavy, straight, curly, and thick desi hair'
),
(
    'beard-grooming',
    'BEARD & GROOMING',
    'Beard',
    299,
    30,
    'Razor-sharp contouring, hot towel treatment, beard sculpting, and essential oil hydration.',
    '• Beard shape mapping & cheek line geometry
• Hot eucalyptus steam towel wrap to open pores
• Straight razor crisp edge line-up on cheeks & neck
• Bulk thinning & length gradation
• Organic argan & cedarwood beard oil hydration massage',
    1,
    'Stubble, short boxed beards, dense beards, handlebar mustaches'
),
(
    'colour-highlights',
    'COLOUR & HIGHLIGHTS',
    'Color',
    1499,
    90,
    'Caramel balayage, smoky tones, root melts, and bold modern highlights tailored for dark hair textures.',
    '• Skin patch test & shade matching consultation
• Hand-painted balayage or dimensional foil highlights
• Bond-protecting developer to preserve hair strength
• Anti-brass neutralizing toner bath
• Deep nourishing moisture glaze & blowout styling',
    1,
    'Dark brown, jet black, or virgin hair seeking golden/caramel dimension without brassiness'
),
(
    'head-spa-repair',
    'HEAD SPA & HAIR REPAIR',
    'Treatment',
    799,
    40,
    'Deep clarifying scalp detox, keratin protein infusion, and rejuvenating acupressure massage.',
    '• Clarifying exfoliating scalp scrub
• Micro-mist warm steam ozone therapy
• Keratin & biotin hair cuticle repair mask
• 15-minute shoulder, neck & scalp tension release massage
• Anti-frizz leave-in serum & cool shot blow dry',
    1,
    'Dry scalp, pollution damage, dandruff control, hair fall prevention'
),
(
    'full-glow-up',
    'FULL GLOW-UP COMBO',
    'Combo',
    1799,
    80,
    'The ultimate chair experience: Cut & Style + Beard Sculpt + Express Scalp Steam.',
    '• Full precision Cut & Style with fade/layers
• Complete Hot Towel Beard Grooming & Razor Lineup
• Express botanical scalp steam & wash
• Signature styling with luxury fragrance mist',
    1,
    'Weekend parties, weddings, groom/groomsmen prep, special shoots'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stylists (id, name, specialty, rating)
VALUES
('stylist-kabir', 'Kabir Sen', 'Master Barber & Fade Specialist', 4.95),
('stylist-priya', 'Priya Nair', 'Colorist & Texture Architect', 4.98),
('stylist-rohan', 'Rohan Mehta', 'Occasion Stylist & Beard Sculptor', 4.92)
ON CONFLICT (id) DO NOTHING;
