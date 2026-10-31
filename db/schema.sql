CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(90) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(120) NOT NULL,
  role VARCHAR(120) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Applied' CHECK (status IN ('Wishlist','Applied','Interview','Offer','Rejected')),
  url TEXT,
  notes VARCHAR(1000) NOT NULL DEFAULT '',
  applied_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS applications_user_updated_idx ON applications(user_id, updated_at DESC);
