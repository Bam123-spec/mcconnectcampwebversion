-- Achievements Clean Up & Seed
-- This script resets the achievements table to the core 11 badges.

-- 1. Remove all current mappings (to avoid foreign key violations)
TRUNCATE TABLE user_achievements CASCADE;
DELETE FROM achievements;

-- 2. Insert the 11 core achievements
-- Requirements is a JSONB column that stores information like { "type": "club_count", "target": 1 }

INSERT INTO achievements (id, title, description, icon, category, rarity, color, bg_color, requirements)
VALUES
-- Clubs
(gen_random_uuid(), 'First Step', 'Join your first club on campus.', '👣', 'Clubs', 'Common', '#6D28D9', '#EBE9FE', '{"type": "club_count", "target": 1}'),
(gen_random_uuid(), 'Club Hopper', 'Join at least 3 various clubs.', '🎒', 'Clubs', 'Rare', '#6D28D9', '#EBE9FE', '{"type": "club_count", "target": 3}'),
(gen_random_uuid(), 'Officer', 'Hold an official club officer role.', '🎖️', 'Clubs', 'Epic', '#F59E0B', '#FEF3C7', '{"type": "officer_role"}'),

-- Events
(gen_random_uuid(), 'Show Up', 'Register for your first event.', '🎟️', 'Events', 'Common', '#10B981', '#D1FAE5', '{"type": "event_count", "target": 1}'),
(gen_random_uuid(), 'Regulars', 'Register for 5 different events.', '⭐', 'Events', 'Rare', '#10B981', '#D1FAE5', '{"type": "event_count", "target": 5}'),

-- Social / Chat
(gen_random_uuid(), 'Icebreaker', 'Send your first message in a group.', '🧊', 'Chat', 'Common', '#3B82F6', '#DBEAFE', '{"type": "message_count", "target": 1}'),
(gen_random_uuid(), 'Conversationalist', 'Send 50 messages to keep the chat alive.', '💬', 'Chat', 'Rare', '#3B82F6', '#DBEAFE', '{"type": "message_count", "target": 50}'),

-- Profile
(gen_random_uuid(), 'Welcome', 'Complete your profile with a bio and avatar.', '👋', 'Special', 'Common', '#8B5CF6', '#EDE9FE', '{"type": "profile_complete"}'),
(gen_random_uuid(), 'Connected', 'Make your first friend on the platform.', '🤝', 'Social', 'Common', '#EC4899', '#FCE7F3', '{"type": "friend_count", "target": 1}'),

-- Special
(gen_random_uuid(), 'Early Adopter', 'One of the first to join the community.', '🚀', 'Special', 'Legendary', '#F59E0B', '#FEF3C7', '{"type": "early_adopter"}'),
(gen_random_uuid(), 'Pioneer', 'Start a discussion by creating your first post.', '🚩', 'Special', 'Rare', '#EF4444', '#FEE2E2', '{"type": "post_count", "target": 1}');
