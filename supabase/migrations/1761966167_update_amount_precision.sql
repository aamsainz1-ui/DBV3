-- Migration: update_amount_precision
-- Created at: 1761966167

ALTER TABLE transaction_history 
ALTER COLUMN amount TYPE NUMERIC(15,2);;