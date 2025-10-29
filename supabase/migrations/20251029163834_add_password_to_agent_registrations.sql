/*
  # Add password field to agent_registrations table
  
  1. Changes
    - Add password_hash column to agent_registrations table
    - This allows agents to register with a password that will be used to create their auth account
  
  2. Security
    - Password hash is stored securely
    - Only used during account creation process
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_registrations' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE agent_registrations 
    ADD COLUMN password_hash text NOT NULL DEFAULT '';
  END IF;
END $$;