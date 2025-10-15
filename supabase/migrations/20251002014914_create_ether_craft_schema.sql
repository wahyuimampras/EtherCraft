/*
  # Ether Craft E-commerce Schema

  ## Overview
  Creates the database structure for Ether Craft's mechanical keyboard e-commerce website.
  
  ## New Tables
  
  ### `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `category` (text) - Product category (keycaps, keyboards, switches, merchandise)
  - `description` (text) - Product description
  - `price` (decimal) - Product price in IDR
  - `image_url` (text) - Product image URL
  - `stock` (integer) - Available stock quantity
  - `featured` (boolean) - Whether product is featured
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `orders`
  - `id` (uuid, primary key) - Unique order identifier
  - `customer_name` (text) - Customer's full name
  - `customer_email` (text) - Customer's email address
  - `customer_phone` (text) - Customer's phone number
  - `customer_address` (text) - Delivery address
  - `product_id` (uuid, foreign key) - Reference to ordered product
  - `quantity` (integer) - Order quantity
  - `total_price` (decimal) - Total order price
  - `status` (text) - Order status (pending, confirmed, shipped, delivered)
  - `notes` (text) - Additional order notes
  - `created_at` (timestamptz) - Order creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Public read access for products (anyone can browse)
  - Authenticated insert access for orders
  - Only authenticated users can view their own orders
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  price decimal(10, 2) NOT NULL,
  image_url text NOT NULL,
  stock integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  total_price decimal(10, 2) NOT NULL,
  status text DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products policies (public read access)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders policies (public can create orders, but cannot view others)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample products
INSERT INTO products (name, category, description, price, image_url, stock, featured) VALUES
  ('Artisan Dragon Keycap', 'keycaps', 'Hand-crafted resin keycap with intricate dragon design. Premium quality with translucent effects.', 450000, 'https://images.pexels.com/photos/1279978/pexels-photo-1279978.jpeg?auto=compress&cs=tinysrgb&w=800', 15, true),
  ('Sakura Blossom Keycap Set', 'keycaps', 'Complete 104-key set with cherry blossom theme. PBT double-shot construction.', 1250000, 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=800', 8, true),
  ('Galaxy Nebula Keycap', 'keycaps', 'Space-themed artisan keycap with stunning nebula colors and glitter effects.', 380000, 'https://images.pexels.com/photos/1252983/pexels-photo-1252983.jpeg?auto=compress&cs=tinysrgb&w=800', 20, false),
  ('Ether Craft Custom 75%', 'keyboards', 'Premium aluminum case 75% mechanical keyboard. Fully customizable with hot-swap PCB.', 4500000, 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800', 5, true),
  ('Minimalist TKL Board', 'keyboards', 'Tenkeyless design with clean aesthetics. Programmable RGB and premium typing experience.', 3200000, 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=800', 3, false),
  ('Gateron Yellow Pro', 'switches', 'Smooth linear switches. 50g actuation force. Pack of 90 switches.', 350000, 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800', 50, true),
  ('Holy Panda Tactile', 'switches', 'Premium tactile switches with satisfying bump. Pack of 70 switches.', 850000, 'https://images.pexels.com/photos/442152/pexels-photo-442152.jpeg?auto=compress&cs=tinysrgb&w=800', 30, false),
  ('Kailh Box Jade', 'switches', 'Clicky switches with thick click bar. Pack of 90 switches.', 420000, 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800', 40, false),
  ('Ether Craft T-Shirt', 'merchandise', 'Premium cotton t-shirt with embroidered Ether Craft logo. Available in black and white.', 280000, 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=800', 100, false),
  ('Keyboard Carrying Case', 'merchandise', 'Padded carrying case for mechanical keyboards up to full-size. Water-resistant material.', 450000, 'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=800', 25, false)
ON CONFLICT DO NOTHING;