-- Clear existing data (optional, be careful in production)
-- TRUNCATE TABLE products RESTART IDENTITY CASCADE;

-- Insert sample data if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
        INSERT INTO products (name, description, price, quantity, created_at, updated_at) VALUES
            ('Laptop', 'High performance laptop', 999.99, 10, NOW(), NOW()),
            ('Smartphone', 'Latest smartphone model', 699.99, 20, NOW(), NOW()),
            ('Headphones', 'Wireless noise-cancelling', 199.99, 30, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
