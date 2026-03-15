alter table sessions add column if not exists expires_at timestamp with time zone not null;
