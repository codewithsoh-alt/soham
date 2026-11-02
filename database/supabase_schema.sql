-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- Daily Activity Tracker — Multi-User Student Workspace
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    category_id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#0d6efd', -- Hex color for UI badges
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories RLS Policies:
-- Users can see their own custom categories, or global categories (where user_id IS NULL)
DROP POLICY IF EXISTS "Users can read own and global categories" ON public.categories;
CREATE POLICY "Users can read own and global categories"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can create own categories" ON public.categories;
CREATE POLICY "Users can create own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- Default Global Categories (available to all students)
INSERT INTO public.categories (user_id, name, color, description) VALUES
    (NULL, 'Study', '#0d6efd', 'Academic studies, homework, revisions'),
    (NULL, 'College', '#6f42c1', 'Lectures, labs, submissions, college events'),
    (NULL, 'Exercise', '#198754', 'Gym, workouts, sports, running'),
    (NULL, 'Personal', '#0dcaf0', 'Habits, chores, reading, errands'),
    (NULL, 'Work', '#fd7e14', 'Part-time jobs, projects, internships'),
    (NULL, 'Other', '#6c757d', 'Miscellaneous tasks')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 3. ACTIVITIES TABLE (Core Entity)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activities (
    activity_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    activity_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' 
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    status VARCHAR(15) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'COMPLETED')),
    category_id BIGINT REFERENCES public.categories(category_id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_time_window CHECK (start_time IS NULL OR end_time IS NULL OR start_time <= end_time)
);

-- Performance & Isolation Indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities(user_id, activity_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Strict Isolation: Users can ONLY see, add, edit, or delete their OWN activities
DROP POLICY IF EXISTS "Students can only access their own activities" ON public.activities;
CREATE POLICY "Students can only access their own activities"
    ON public.activities FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger to automatically update updated_at on record changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_activities_updated_at ON public.activities;
CREATE TRIGGER trigger_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. AUTOMATIC WELCOME TASK ON NEW USER SIGN UP (TRIGGER)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_welcome_task()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert exactly one welcome activity for the freshly registered student
    INSERT INTO public.activities (
        user_id,
        title,
        description,
        activity_date,
        start_time,
        end_time,
        priority,
        status
    ) VALUES (
        NEW.id,
        'Welcome to Daily Activity Tracker! Click to complete or schedule your study sessions.',
        'Get started by exploring your dashboard or creating new activities with "+ Add Activity".',
        CURRENT_DATE,
        '09:00:00',
        '10:00:00',
        'MEDIUM',
        'PENDING'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook into auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_welcome_task();
