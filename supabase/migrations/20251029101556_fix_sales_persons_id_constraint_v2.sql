/*
  # Fix Sales Persons ID to Accept Auth User IDs

  1. Changes
    - Drop the default gen_random_uuid() for sales_persons.id
    - This allows us to set the id to match the auth user's id

  2. Notes
    - The ID will now be set explicitly when creating sales persons
    - This links the sales_person record to the auth.users record
*/

-- Alter the sales_persons table to remove default ID generation
-- We want to use the auth user's ID instead
ALTER TABLE sales_persons 
  ALTER COLUMN id DROP DEFAULT;