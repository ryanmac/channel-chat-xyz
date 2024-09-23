-- scripts/schemaConfig.sql
-- Init schema configuration
-- This script is used to initialize the schema configuration.

INSERT INTO "Badge" (id, name, "createdAt")
VALUES 
  (gen_random_uuid(), 'founding', NOW()),
  (gen_random_uuid(), 'close', NOW()),
  (gen_random_uuid(), 'did-it', NOW()),
  (gen_random_uuid(), 'activator', NOW()),
  (gen_random_uuid(), 'chad', NOW()),
  (gen_random_uuid(), 'giga-chad', NOW()),
  (gen_random_uuid(), 'chatterbox', NOW()),
  (gen_random_uuid(), 'viral', NOW()),
  (gen_random_uuid(), 'loyal-fan', NOW()),
  (gen_random_uuid(), 'early-bird', NOW()),
  (gen_random_uuid(), 'night-owl', NOW()),
  (gen_random_uuid(), 'multi-channel', NOW()),
  (gen_random_uuid(), 'curious-mind', NOW()),
  (gen_random_uuid(), 'insight-seeker', NOW()),
  (gen_random_uuid(), 'conversation-starter', NOW()),
  (gen_random_uuid(), 'fact-checker', NOW()),
  (gen_random_uuid(), 'trendsetter', NOW()),
  (gen_random_uuid(), 'ai-whisperer', NOW());

INSERT INTO "ConfigurationSetting" (key, value, description)
VALUES
  ('CREDITS_PER_DOLLAR', 1000, 'The number of credits a user receives for each dollar spent.'),
  ('MEMORY_BOOST_COST', 10000, 'The cost in credits to purchase a memory boost.'),
  ('TOKENS_BOOST_COST', 10000, 'The cost in credits to purchase a tokens boost.'),
  ('FINE_TUNING_BOOST_COST', 10000, 'The cost in credits to purchase a fine tuning boost.'),
  ('DEFAULT_ACTIVATION_GOAL', 10, 'The default dollars required to activate a channel.'),
  ('DEFAULT_ACTIVATION_CREDITS', 1000, 'The default amount of credits a channel receives when activated.'),
  ('DEFAULT_MEMORY_BOOST_COST', 10000, 'The default cost in credits to purchase a memory boost.'),
  ('DEFAULT_TOKENS_BOOST_COST', 10000, 'The default cost in credits to purchase a tokens boost.');