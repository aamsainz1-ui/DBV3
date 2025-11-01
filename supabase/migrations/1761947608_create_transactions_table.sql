-- Migration: create_transactions_table
-- Created at: 1761947608

CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  type VARCHAR(20) DEFAULT 'income',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- Create index on amount for filtering
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);;