-- First, let's check if task_templates table exists and create it if not
-- Task Templates table for reusable task templates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_templates') THEN
        CREATE TABLE public.task_templates (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL CHECK (category IN ('gst', 'itr', 'roc', 'other')),
            is_recurring BOOLEAN NOT NULL DEFAULT false,
            recurrence_pattern TEXT CHECK (recurrence_pattern IN ('monthly', 'yearly', 'custom')),
            deadline TEXT,
            subtasks JSONB DEFAULT '[]'::jsonb,
            price NUMERIC,
            is_payable_task BOOLEAN NOT NULL DEFAULT false,
            payable_task_type TEXT CHECK (payable_task_type IN ('payable_task_1', 'payable_task_2')),
            assigned_employee_id UUID,
            client_id UUID REFERENCES public.clients(id),
            created_by UUID REFERENCES public.profiles(id),
            is_deleted BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Enable RLS on task_templates
        ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

        -- RLS policies for task_templates
        CREATE POLICY "Authenticated users can view templates" ON public.task_templates
        FOR SELECT USING (is_deleted = false);

        CREATE POLICY "Authenticated users can create templates" ON public.task_templates
        FOR INSERT WITH CHECK (true);

        CREATE POLICY "Authenticated users can update templates" ON public.task_templates
        FOR UPDATE USING (is_deleted = false);

        CREATE POLICY "Authenticated users can delete templates" ON public.task_templates
        FOR DELETE USING (is_deleted = false);
    END IF;
END $$;

-- Create default payment configurations if they don't exist
INSERT INTO public.payment_configurations (config_name, gateway_type, is_active) 
VALUES 
    ('Razorpay Primary', 'razorpay', true),
    ('Stripe Primary', 'stripe', false)
ON CONFLICT DO NOTHING;

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add payment_configuration_id to quotations if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotations' AND column_name = 'payment_configuration_id') THEN
        ALTER TABLE public.quotations ADD COLUMN payment_configuration_id UUID REFERENCES public.payment_configurations(id);
    END IF;

    -- Add search_vector for full-text search if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'search_vector') THEN
        ALTER TABLE public.tasks ADD COLUMN search_vector tsvector;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'search_vector') THEN
        ALTER TABLE public.clients ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- Create search indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_search_vector ON public.tasks USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_clients_search_vector ON public.clients USING gin(search_vector);

-- Update search vectors with triggers
CREATE OR REPLACE FUNCTION update_task_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.client_name, '') || ' ' ||
        COALESCE(NEW.category, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_client_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.name, '') || ' ' ||
        COALESCE(NEW.email, '') || ' ' ||
        COALESCE(NEW.phone, '') || ' ' ||
        COALESCE(NEW.client_code, '') || ' ' ||
        COALESCE(NEW.business_type, '') || ' ' ||
        COALESCE(NEW.industry, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for search vector updates
DROP TRIGGER IF EXISTS trigger_update_task_search_vector ON public.tasks;
CREATE TRIGGER trigger_update_task_search_vector
    BEFORE INSERT OR UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_task_search_vector();

DROP TRIGGER IF EXISTS trigger_update_client_search_vector ON public.clients;
CREATE TRIGGER trigger_update_client_search_vector
    BEFORE INSERT OR UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_client_search_vector();

-- Function to generate series numbers
CREATE OR REPLACE FUNCTION generate_series_number(series_type TEXT, prefix TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
    current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    -- Get the next number for this series type and year
    SELECT COALESCE(MAX(
        CASE 
            WHEN series_type = 'task' THEN 
                CAST(SUBSTRING(id FROM '[0-9]+$') AS INTEGER)
            WHEN series_type = 'quote' THEN 
                CAST(SUBSTRING(quotation_number FROM '[0-9]+$') AS INTEGER)
            WHEN series_type = 'payment' THEN 
                CAST(SUBSTRING(payment_id FROM '[0-9]+$') AS INTEGER)
        END
    ), 0) + 1 INTO next_number
    FROM (
        SELECT id::TEXT as id, '' as quotation_number, '' as payment_id FROM tasks WHERE series_type = 'task'
        UNION ALL
        SELECT '' as id, quotation_number, '' as payment_id FROM quotations WHERE series_type = 'quote'
        UNION ALL
        SELECT '' as id, '' as quotation_number, payment_id FROM payments WHERE series_type = 'payment'
    ) series_data;

    -- Format the number with leading zeros
    formatted_number := LPAD(next_number::TEXT, 4, '0');
    
    -- Return formatted series number
    RETURN CASE 
        WHEN series_type = 'task' THEN 'TSK-' || current_year || '-' || formatted_number
        WHEN series_type = 'quote' THEN COALESCE(prefix, 'QUO') || '-' || current_year || '-' || formatted_number
        WHEN series_type = 'payment' THEN 'PAY-' || current_year || '-' || formatted_number
        ELSE prefix || '-' || current_year || '-' || formatted_number
    END;
END;
$$ LANGUAGE plpgsql;