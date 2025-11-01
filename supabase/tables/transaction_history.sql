CREATE TABLE transaction_history (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    transaction_date DATE NOT NULL,
    transaction_time TIME NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    description TEXT,
    source_type VARCHAR(50) DEFAULT 'transfer_search'
);