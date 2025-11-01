CREATE TABLE export_settings (
    id SERIAL PRIMARY KEY,
    auto_export_enabled BOOLEAN DEFAULT true,
    export_time VARCHAR(10) DEFAULT '00:30',
    notification_email VARCHAR(255),
    last_export_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);