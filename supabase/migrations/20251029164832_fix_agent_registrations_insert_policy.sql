/*
  # Fix Agent Registrations Insert Policy
  
  1. Changes
    - Update INSERT policy to allow both anonymous (anon) and authenticated users to register
    - This allows agents to register whether they're logged in or not
  
  2. Security
    - Still maintains RLS protection
    - Only admins can view, update, and delete registrations
    - Anyone can submit a registration (which goes to pending status)
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS agent_registrations_insert_policy ON agent_registrations;

-- Create new insert policy that allows both anon and authenticated users
CREATE POLICY "agent_registrations_insert_policy"
  ON agent_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);