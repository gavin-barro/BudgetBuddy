-- Drop the table if it exists (cascades to drop indexes and constraints)
DROP TABLE IF EXISTS accounts CASCADE;

-- Drop the ENUM type if it exists
DROP TYPE IF EXISTS account_type CASCADE;

-- Create ENUM type for account types
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'credit', 'other');

-- Create the accounts table
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type account_type NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient querying by user
CREATE INDEX idx_accounts_user_id ON accounts(user_id);