-- Comprehensive Seed Data for EventCraft Platform
-- This file populates the database with realistic sample data for development and demo purposes

-- Sample Users (Providers)
INSERT INTO users (id, name, email, type, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Elena Rodriguez', 'elena@elegantmoments.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Delicious Catering Co', 'info@deliciouscatering.ca', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Picture Perfect Photography', 'hello@pictureperfect.ca', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Bloom & Blossom Florists', 'orders@bloomblossom.ca', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Sounds of Celebration', 'bookings@soundscelebration.ca', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Divine Decorations', 'creative@divinedecorations.ca', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Gourmet Halal Catering', 'info@gourmethalalcatering.ca', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Vancouver Wedding Venues', 'venues@vancouverweddings.ca', 'provider', NOW());

-- Insert sample providers
INSERT INTO providers (
    id, user_id, business_name, provider_type, phone, location_city, location_province,
    location_lat, location_lng, description, tags, is_active, subscription_status
) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Elegant Venues Toronto',
    'venue',
    '+1-416-555-0101',
    'Toronto',
    'Ontario',
    43.6532,
    -79.3832,
    'Luxury wedding venues in the heart of Toronto. Our elegant ballrooms and gardens provide the perfect backdrop for your special day.',
    ARRAY['luxury', 'downtown', 'ballroom', 'garden', 'parking'],
    true,
    'active'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Delicious Catering Co',
    'catering',
    '+1-416-555-0102',
    'Toronto',
    'Ontario',
    43.6532,
    -79.3832,
    'Full-service catering specializing in fusion cuisine. We cater to all dietary restrictions and preferences.',
    ARRAY['fusion', 'vegetarian', 'vegan', 'gluten-free', 'kosher'],
    true,
    'active'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'Picture Perfect Photography',
    'photographer',
    '+1-416-555-0103',
    'Toronto',
    'Ontario',
    43.6532,
    -79.3832,
    'Award-winning wedding photographers capturing your most precious moments with artistic flair and professional expertise.',
    ARRAY['artistic', 'candid', 'traditional', 'destination', 'engagement'],
    true,
    'active'
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440004',
    'Bloom & Blossom Florists',
    'florist',
    '+1-416-555-0104',
    'Toronto',
    'Ontario',
    43.6532,
    -79.3832,
    'Creating stunning floral arrangements for weddings and events. From bridal bouquets to ceremony decorations.',
    ARRAY['bridal-bouquets', 'centerpieces', 'ceremony-decor', 'seasonal', 'exotic'],
    true,
    'active'
),
(
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440005',
    'Sounds of Celebration',
    'music',
    '+1-416-555-0105',
    'Toronto',
    'Ontario',
    43.6532,
    -79.3832,
    'Professional DJ and live music services for weddings and special events. Custom playlists and lighting.',
    ARRAY['dj', 'live-band', 'bollywood', 'top-40', 'lighting', 'sound-system'],
    true,
    'active'
),
(
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440006',
    'Divine Decorations',
    'decorator',
    '+1-416-555-0106',
    'Toronto',
    'Ontario',
    43.6532,
    -79.3832,
    'Transform your venue with our elegant decoration services. Specializing in South Asian and modern themes.',
    ARRAY['south-asian', 'modern', 'traditional', 'mandap', 'draping', 'lighting'],
    true,
    'active'
),
(
    '660e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440007',
    'Gourmet Halal Catering',
    'catering',
    '+1-416-555-0107',
    'Toronto',
    'Ontario',
    43.6532,
    -79.3832,
    'Premium halal catering services with authentic flavors from around the world. Perfect for multicultural celebrations.',
    ARRAY['halal', 'pakistani', 'indian', 'mediterranean', 'buffet', 'plated'],
    true,
    'active'
),
(
    '660e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440008',
    'Vancouver Wedding Venues',
    'venue',
    '+1-604-555-0108',
    'Vancouver',
    'British Columbia',
    49.2827,
    -123.1207,
    'Breathtaking wedding venues in Vancouver with mountain and ocean views. Indoor and outdoor options available.',
    ARRAY['mountain-view', 'ocean-view', 'outdoor', 'indoor', 'garden', 'waterfront'],
    true,
    'active'
);

-- Insert sample user (regular user for testing)
INSERT INTO users (id, name, email, type, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'John Smith', 'john.smith@example.com', 'user', NOW()),
('550e8400-e29b-41d4-a716-446655440101', 'Sarah Ahmed', 'sarah.ahmed@example.com', 'user', NOW());

-- Insert sample event
INSERT INTO events (id, user_id, event_type, prompt, created_at, checklist_json) VALUES
(
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440100',
    'Wedding',
    'A 3-day desi wedding with 200 guests, halal food, in Toronto in July',
    NOW(),
    '[
        {
            "step_title": "Book a Venue",
            "description": "Find and reserve a wedding venue in Toronto that can accommodate 200 guests",
            "tags": ["venue"]
        },
        {
            "step_title": "Hire a Caterer",
            "description": "Choose a halal caterer offering authentic cuisine for your wedding celebration",
            "tags": ["catering", "halal"]
        },
        {
            "step_title": "Book Photography & Videography",
            "description": "Capture your special moments with professional photographers and videographers",
            "tags": ["photographer", "videographer"]
        },
        {
            "step_title": "Arrange Flowers & Decorations",
            "description": "Design beautiful floral arrangements and decorations for all wedding events",
            "tags": ["florist", "decorator"]
        },
        {
            "step_title": "Plan Music & Entertainment",
            "description": "Book DJ or live music for all three days of celebrations",
            "tags": ["music", "dj"]
        }
    ]'::jsonb
);

-- Insert sample tasks for the event
INSERT INTO tasks (id, event_id, step_title, description, order_number, matching_provider_ids) VALUES
(
    '880e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    'Book a Venue',
    'Find and reserve a wedding venue in Toronto that can accommodate 200 guests',
    1,
    ARRAY['660e8400-e29b-41d4-a716-446655440001']::UUID[]
),
(
    '880e8400-e29b-41d4-a716-446655440002',
    '770e8400-e29b-41d4-a716-446655440001',
    'Hire a Caterer',
    'Choose a halal caterer offering authentic cuisine for your wedding celebration',
    2,
    ARRAY['660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002']::UUID[]
),
(
    '880e8400-e29b-41d4-a716-446655440003',
    '770e8400-e29b-41d4-a716-446655440001',
    'Book Photography & Videography',
    'Capture your special moments with professional photographers and videographers',
    3,
    ARRAY['660e8400-e29b-41d4-a716-446655440003']::UUID[]
),
(
    '880e8400-e29b-41d4-a716-446655440004',
    '770e8400-e29b-41d4-a716-446655440001',
    'Arrange Flowers & Decorations',
    'Design beautiful floral arrangements and decorations for all wedding events',
    4,
    ARRAY['660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440006']::UUID[]
),
(
    '880e8400-e29b-41d4-a716-446655440005',
    '770e8400-e29b-41d4-a716-446655440001',
    'Plan Music & Entertainment',
    'Book DJ or live music for all three days of celebrations',
    5,
    ARRAY['660e8400-e29b-41d4-a716-446655440005']::UUID[]
);

-- Insert sample leads
INSERT INTO leads (id, provider_id, event_id, user_id, step_id, message, status, created_at) VALUES
(
    '990e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440100',
    '880e8400-e29b-41d4-a716-446655440001',
    'Hi! I''m interested in booking your venue for my wedding in July. We''re expecting about 200 guests for a 3-day celebration. Could you please share your availability and pricing?',
    'new',
    NOW() - INTERVAL '2 days'
),
(
    '990e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440007',
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440100',
    '880e8400-e29b-41d4-a716-446655440002',
    'We need halal catering for our wedding celebration. The menu should include Pakistani and Mediterranean dishes. Please send me your packages and pricing.',
    'contacted',
    NOW() - INTERVAL '1 day'
);