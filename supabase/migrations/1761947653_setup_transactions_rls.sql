-- Migration: setup_transactions_rls
-- Created at: 1761947653

-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read all transactions
CREATE POLICY "Allow anonymous read transactions" ON transactions
FOR SELECT USING (true);

-- Allow anonymous users to insert transactions  
CREATE POLICY "Allow anonymous insert transactions" ON transactions
FOR INSERT WITH CHECK (true);

-- Allow anonymous users to update transactions
CREATE POLICY "Allow anonymous update transactions" ON transactions
FOR UPDATE USING (true);

-- Allow anonymous users to delete transactions
CREATE POLICY "Allow anonymous delete transactions" ON transactions
FOR DELETE USING (true);;