-- Add timezone column to events table
-- Stores IANA timezone string for single-tz events (e.g. "America/New_York")
-- or "departure|||arrival" for dual-tz events (flights, trains, ferries, drives)
alter table events add column timezone text;
