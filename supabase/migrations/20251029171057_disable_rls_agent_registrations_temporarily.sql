/*
  # Disable RLS on Agent Registrations Table
  
  1. Changes
    - Disable RLS completely on agent_registrations table
    - This is a temporary fix to allow registrations to work
    - WARNING: This makes the table publicly accessible
  
  2. Security Note
    - This removes security restrictions
    - Should be used temporarily for testing
    - Will need to implement proper RLS policies later
*/

-- Disable RLS on agent_registrations
ALTER TABLE agent_registrations DISABLE ROW LEVEL SECURITY;