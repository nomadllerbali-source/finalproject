/*
  # Add Demo Website Content
  
  1. Demo Packages
    - Bali Highlights Tour (5 Days/4 Nights)
    - Adventure Paradise (7 Days/6 Nights)
    - Cultural Immersion (6 Days/5 Nights)
    - Beach & Relaxation (4 Days/3 Nights)
    - Romantic Getaway (5 Days/4 Nights)
  
  2. Demo Promotions
    - Early Bird Special (20% off)
    - Group Travel Discount (15% off)
    - Summer Paradise Deal (25% off)
  
  3. Notes
    - All packages set as active and featured
    - Promotions have valid date ranges
    - Using stock image URLs from Pexels
*/

-- Insert demo packages
INSERT INTO public.packages (
  title,
  description,
  duration,
  price_from,
  image_url,
  highlights,
  inclusions,
  exclusions,
  is_featured,
  is_active,
  display_order
) VALUES
(
  'Bali Highlights Tour',
  'Discover the best of Bali with this comprehensive tour covering temples, rice terraces, waterfalls, and pristine beaches. Perfect for first-time visitors who want to experience the island''s most iconic destinations.',
  '5 Days / 4 Nights',
  899,
  'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg',
  '["Visit iconic Tanah Lot Temple", "Explore Tegalalang Rice Terraces", "Swim at Tegenungan Waterfall", "Sunset dinner at Jimbaran Beach", "Traditional Balinese dance performance"]'::jsonb,
  'Airport transfers, Accommodation in 4-star hotels, Daily breakfast, All entrance fees, English-speaking guide, Air-conditioned vehicle',
  'International flights, Travel insurance, Personal expenses, Lunch and dinner (except specified), Tips and gratuities',
  true,
  true,
  1
),
(
  'Adventure Paradise',
  'For thrill-seekers and adventure lovers! Experience the adrenaline rush with white water rafting, volcano trekking, jungle swings, and snorkeling in crystal-clear waters. An action-packed week in paradise.',
  '7 Days / 6 Nights',
  1299,
  'https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg',
  '["Mount Batur sunrise trek", "White water rafting at Ayung River", "Jungle swing & waterfall tour", "Snorkeling at Nusa Penida", "ATV ride through rice fields", "Zip-lining adventure"]'::jsonb,
  'Airport transfers, 6 nights accommodation, Daily breakfast, All activity equipment, Professional guides, Transportation, Travel insurance during activities',
  'International flights, Main meals (lunch/dinner), Personal travel insurance, Personal expenses, Tips',
  true,
  true,
  2
),
(
  'Cultural Immersion',
  'Dive deep into authentic Balinese culture with temple ceremonies, traditional cooking classes, village visits, and artisan workshops. Learn the ancient arts and traditions that make Bali magical.',
  '6 Days / 5 Nights',
  1099,
  'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg',
  '["Attend a traditional temple ceremony", "Balinese cooking class with local family", "Visit master silver smiths in Celuk", "Learn traditional dance", "Explore ancient Besakih Temple", "Wood carving workshop in Ubud"]'::jsonb,
  'Boutique hotel accommodation, Daily breakfast and cultural lunch experiences, All workshop materials, Cultural guide, Private transportation, Welcome dinner',
  'International flights, Some dinners, Travel insurance, Personal shopping, Tips',
  true,
  true,
  3
),
(
  'Beach & Relaxation',
  'Unwind and recharge on Bali''s most beautiful beaches. This laid-back package includes beachfront accommodation, spa treatments, yoga sessions, and plenty of time to simply relax by the ocean.',
  '4 Days / 3 Nights',
  699,
  'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg',
  '["Beachfront resort accommodation", "60-minute Balinese massage", "Sunset yoga sessions", "Beach club day pass", "Seafood BBQ dinner on the beach"]'::jsonb,
  'Airport transfers, 3 nights beachfront resort, Daily breakfast, One spa treatment, Daily yoga class, One dinner',
  'International flights, Travel insurance, Lunch and other dinners, Water sports activities, Personal expenses',
  true,
  true,
  4
),
(
  'Romantic Getaway',
  'Create unforgettable memories with your loved one. This romantic package features private dinners, couples spa treatments, scenic tours, and luxury accommodations perfect for honeymoons or anniversaries.',
  '5 Days / 4 Nights',
  1499,
  'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg',
  '["Private villa with pool", "Couples massage overlooking rice fields", "Romantic candlelit beach dinner", "Private sunset cruise", "Champagne breakfast in bed", "Professional photoshoot"]'::jsonb,
  'Airport transfers in luxury vehicle, 4 nights private villa, Daily breakfast, Two romantic dinners, Couples spa treatment, Private tours, Photographer for 2 hours',
  'International flights, Travel insurance, Lunches, Personal expenses, Additional meals',
  true,
  true,
  5
),
(
  'Island Hopping Adventure',
  'Explore multiple islands around Bali! Visit the famous Nusa Islands with their stunning cliffs and beaches, plus the serene Gili Islands for snorkeling and beach relaxation.',
  '8 Days / 7 Nights',
  1599,
  'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg',
  '["Nusa Penida full day tour", "Nusa Lembongan cycling & snorkeling", "Gili Trawangan 2-night stay", "Underwater sculptures snorkel tour", "Beach hopping by boat", "Sunset at Gili Meno"]'::jsonb,
  'All boat transfers between islands, 7 nights accommodation, Daily breakfast, Snorkeling equipment, All entrance fees, Island guides',
  'International flights, Main meals (lunch/dinner), Travel insurance, Diving certification courses, Personal expenses',
  true,
  true,
  6
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo promotions
INSERT INTO public.promotions (
  title,
  description,
  image_url,
  discount_percentage,
  valid_from,
  valid_until,
  is_active,
  display_order
) VALUES
(
  'Early Bird Special',
  'Book 60 days in advance and save 20% on any package! Limited time offer for forward planners. Valid for all our Bali tour packages.',
  'https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg',
  20,
  '2024-01-01',
  '2025-12-31',
  true,
  1
),
(
  'Group Travel Discount',
  'Traveling with friends or family? Get 15% off when you book for 4 or more people. The more, the merrier!',
  'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg',
  15,
  '2024-01-01',
  '2025-12-31',
  true,
  2
),
(
  'Summer Paradise Deal',
  'Make this summer unforgettable! Enjoy 25% off on selected packages during June-August. Beach season special!',
  'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg',
  25,
  '2024-06-01',
  '2025-08-31',
  true,
  3
),
(
  'Honeymoon Package Special',
  'Celebrate your love in paradise! Special 30% discount on our Romantic Getaway package for newlyweds. Proof of marriage required.',
  'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
  30,
  '2024-01-01',
  '2025-12-31',
  true,
  4
)
ON CONFLICT (id) DO NOTHING;