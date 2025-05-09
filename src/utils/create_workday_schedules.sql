
-- First check if the table exists and drop it if needed
DROP TABLE IF EXISTS workday_schedules;

-- Create the workday_schedules table with the simplified structure
CREATE TABLE workday_schedules (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  start_date DATE,
  end_date DATE,
  monday_hours NUMERIC(5,2),
  tuesday_hours NUMERIC(5,2),
  wednesday_hours NUMERIC(5,2),
  thursday_hours NUMERIC(5,2),
  friday_hours NUMERIC(5,2)
);

-- Insert some default schedules for testing
INSERT INTO workday_schedules (type, start_date, end_date, monday_hours, tuesday_hours, wednesday_hours, thursday_hours, friday_hours)
VALUES 
('Standard', '2025-01-01', '2025-12-31', 8, 8, 8, 8, 7),
('Reduced', '2025-01-01', '2025-12-31', 6, 6, 6, 6, 5);
