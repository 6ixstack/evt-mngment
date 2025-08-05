-- Comprehensive Seed Data for EventCraft Platform
-- This file populates the database with realistic sample data for development and demo purposes

-- Sample Users (Providers)
INSERT INTO users (id, name, email, type, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Elena Rodriguez', 'elena@elegantmoments.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Michael Chen', 'michael@grandballroom.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Sarah Johnson', 'sarah@savorydelights.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'David Park', 'david@bloomblossom.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Lisa Wang', 'lisa@harmonystings.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'James Thompson', 'james@premiertransport.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Maria Gonzalez', 'maria@celestialdecor.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Robert Kim', 'robert@gourmethaven.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Jennifer Liu', 'jennifer@dreamvideography.com', 'provider', NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'Tom Wilson', 'tom@luxuryvenues.com', 'provider', NOW());

-- Sample Providers
INSERT INTO providers (id, user_id, business_name, provider_type, phone, location_city, location_province, location_lat, location_lng, description, tags, logo_url, sample_images, is_active, subscription_status) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Elegant Moments Photography', 'photographer', '+1-416-555-0101', 'Toronto', 'Ontario', 43.6532, -79.3832, 'Professional wedding and event photography with a focus on capturing authentic emotions and timeless memories. Over 10 years of experience with 500+ successful events.', '{"wedding", "portrait", "candid", "professional", "artistic"}', 'https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=150&h=150&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=300&fit=crop"}', true, 'active'),

('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'The Grand Ballroom', 'venue', '+1-604-555-0102', 'Vancouver', 'British Columbia', 49.2827, -123.1207, 'Luxurious event venue with capacity for 300 guests, featuring crystal chandeliers, marble floors, and panoramic city views. Perfect for weddings, galas, and corporate events.', '{"luxury", "ballroom", "downtown", "elegant", "large-capacity"}', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=150&h=150&fit=crop', '{"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop"}', true, 'active'),

('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Savory Delights Catering', 'catering', '+1-514-555-0103', 'Montreal', 'Quebec', 45.5017, -73.5673, 'Award-winning catering service specializing in international cuisine and dietary accommodations. From intimate gatherings to grand celebrations, we create culinary experiences.', '{"international", "halal", "vegan", "gluten-free", "award-winning"}', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=150&h=150&fit=crop', '{"https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop"}', true, 'active'),

('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Bloom & Blossom Florals', 'florist', '+1-403-555-0104', 'Calgary', 'Alberta', 51.0447, -114.0719, 'Creative floral designs using fresh, seasonal flowers sourced from local growers. Specializing in bridal bouquets, centerpieces, and venue decorations.', '{"seasonal", "local", "bridal", "centerpieces", "eco-friendly"}', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop', '{"https://images.unsplash.com/photo-1470390356535-d19bbf47bacb?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1521543907174-6e4de42b4449?w=400&h=300&fit=crop"}', true, 'active'),

('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Harmony Strings Quartet', 'music', '+1-613-555-0105', 'Ottawa', 'Ontario', 45.4215, -75.6972, 'Professional classical quartet available for ceremonies, cocktail hours, and receptions. Extensive repertoire from classical to contemporary arrangements.', '{"classical", "quartet", "ceremony", "cocktail-hour", "professional"}', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop', '{"https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop"}', true, 'active'),

('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Premier Transportation', 'transportation', '+1-780-555-0106', 'Edmonton', 'Alberta', 53.5461, -113.4938, 'Luxury vehicle rentals including limousines, party buses, and vintage cars. Professional chauffeurs ensure safe and stylish transportation for your special day.', '{"luxury", "limousine", "party-bus", "vintage", "professional-drivers"}', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=150&h=150&fit=crop', '{"https://images.unsplash.com/photo-1571687949921-1306bfb24b72?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1519641760746-93d6e4e4b689?w=400&h=300&fit=crop"}', true, 'active'),

('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Celestial Decor Studio', 'decorator', '+1-204-555-0107', 'Winnipeg', 'Manitoba', 49.8951, -97.1384, 'Transforming venues into magical spaces with custom lighting, draping, and thematic decorations. Specializing in both modern and traditional aesthetics.', '{"lighting", "draping", "modern", "traditional", "custom-design"}', 'https://images.unsplash.com/photo-1578874691223-64558a3ca096?w=150&h=150&fit=crop', '{"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400&h=300&fit=crop"}', true, 'active'),

('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'Gourmet Haven Catering', 'catering', '+1-902-555-0108', 'Halifax', 'Nova Scotia', 44.6488, -63.5752, 'Coastal-inspired cuisine featuring fresh Atlantic seafood and locally-sourced ingredients. Specializing in elegant plated dinners and interactive food stations.', '{"seafood", "local-ingredients", "coastal", "plated-dinners", "interactive"}', 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=150&h=150&fit=crop', '{"https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop"}', true, 'active'),

('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 'Dream Videography', 'videographer', '+1-250-555-0109', 'Victoria', 'British Columbia', 48.4284, -123.3656, 'Cinematic wedding videography capturing your love story with artistic flair. Same-day highlight reels and full ceremony documentation available.', '{"cinematic", "same-day-edit", "artistic", "documentary", "highlight-reels"}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', '{"https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"}', true, 'active'),

('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'Luxury Venues Collection', 'venue', '+1-306-555-0110', 'Saskatoon', 'Saskatchewan', 52.1579, -106.6702, 'Exclusive collection of premium venues including historic mansions, modern lofts, and garden estates. Each location offers unique character and full-service amenities.', '{"historic", "modern", "garden", "exclusive", "full-service"}', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=150&h=150&fit=crop', '{"https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1465929639680-64ee080eb3ed?w=400&h=300&fit=crop"}', true, 'active');

-- Sample Regular Users
INSERT INTO users (id, name, email, type, created_at) VALUES
('450e8400-e29b-41d4-a716-446655440001', 'Amanda Thompson', 'amanda.thompson@email.com', 'user', NOW()),
('450e8400-e29b-41d4-a716-446655440002', 'Jason Miller', 'jason.miller@email.com', 'user', NOW()),
('450e8400-e29b-41d4-a716-446655440003', 'Rachel Green', 'rachel.green@email.com', 'user', NOW());

-- Sample Events
INSERT INTO events (id, user_id, event_type, prompt, created_at, checklist_json) VALUES
('750e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', 'Wedding', 'Planning a romantic outdoor wedding for 150 guests in Toronto. We want a rustic yet elegant feel with lots of greenery and string lights. Budget is around $45,000.', NOW(), '{"steps": [{"title": "Venue Selection", "completed": false}, {"title": "Catering Menu", "completed": false}, {"title": "Photography", "completed": false}]}'),
('750e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440002', 'Corporate Event', 'Annual company retreat for 75 employees. Need team building activities, catering, and professional photography. Vancouver location preferred.', NOW(), '{"steps": [{"title": "Venue Booking", "completed": false}, {"title": "Team Building Activities", "completed": false}]}'),
('750e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', 'Birthday Party', 'Planning a milestone 30th birthday celebration for 50 friends. Looking for a trendy venue in Montreal with great music and cocktails.', NOW(), '{"steps": [{"title": "Venue Selection", "completed": false}, {"title": "Music & Entertainment", "completed": false}]}');

-- Sample Tasks
INSERT INTO tasks (id, event_id, step_title, description, order_number, matching_provider_ids) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Choose Your Perfect Venue', 'Find a beautiful outdoor or garden venue that can accommodate 150 guests with options for both ceremony and reception.', 1, '{"650e8400-e29b-41d4-a716-446655440002", "650e8400-e29b-41d4-a716-446655440010"}'),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'Capture Every Moment', 'Book a skilled photographer who specializes in romantic, candid wedding photography to document your special day.', 2, '{"650e8400-e29b-41d4-a716-446655440001"}'),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'Create Beautiful Florals', 'Design and arrange bridal bouquet, ceremony decorations, and reception centerpieces with seasonal flowers.', 3, '{"650e8400-e29b-41d4-a716-446655440004"}'),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 'Select Corporate Venue', 'Find a professional venue suitable for team building activities and presentations for 75 attendees.', 1, '{"650e8400-e29b-41d4-a716-446655440002"}'),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003', 'Book Trendy Party Venue', 'Secure a modern, stylish venue in Montreal perfect for cocktail parties and celebrations.', 1, '{"650e8400-e29b-41d4-a716-446655440002"}');

-- Sample Leads
INSERT INTO leads (id, provider_id, event_id, user_id, step_id, message, status, created_at) VALUES
('950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'Hi Elena! We love your portfolio and would like to discuss photography for our wedding on June 15th, 2024. We are planning for 150 guests in Toronto. Could we schedule a consultation?', 'new', NOW() - INTERVAL '2 days'),
('950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440003', 'Hello David, we are interested in your floral arrangements for our June wedding. We love the rustic, garden style. What packages do you offer for bridal bouquets and centerpieces?', 'contacted', NOW() - INTERVAL '1 day'),
('950e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440004', 'Sarah, we need catering for our corporate retreat. Looking for breakfast, lunch, and coffee breaks for 75 people. Do you have corporate packages available?', 'booked', NOW() - INTERVAL '3 days');

-- Sample Provider Views (for analytics)
INSERT INTO provider_views (provider_id, user_id, ip_address, created_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', '192.168.1.100', NOW() - INTERVAL '1 hour'),
('650e8400-e29b-41d4-a716-446655440001', NULL, '192.168.1.101', NOW() - INTERVAL '2 hours'),
('650e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440002', '192.168.1.102', NOW() - INTERVAL '3 hours'),
('650e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', '192.168.1.103', NOW() - INTERVAL '4 hours'),
('650e8400-e29b-41d4-a716-446655440004', '450e8400-e29b-41d4-a716-446655440001', '192.168.1.104', NOW() - INTERVAL '5 hours');