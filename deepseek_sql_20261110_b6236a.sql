-- ========== TYPES ==========
create type public.user_role as enum ('student', 'admin');
create type public.account_status as enum ('pending', 'active', 'suspended');
create type public.payment_status as enum ('pending', 'approved', 'rejected');

-- ========== PROFILES ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  status public.account_status not null default 'pending',
  full_name text,
  email text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Auto-create profile on signup
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== STUDENTS ==========
create sequence public.student_code_seq start 1;

create table public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  student_code text unique not null default (
    'ESCI-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.student_code_seq')::text, 4, '0')
  ),
  date_of_birth date,
  gender text,
  student_phone text,
  parent_name text not null,
  parent_phone text not null,
  whatsapp text,
  house_number text,
  street text,
  village_city text,
  district text,
  postal_code text,
  school_name text not null,
  current_grade smallint not null check (current_grade between 6 and 11),
  student_type text not null default 'new' check (student_type in ('new','existing')),
  guardian_consent boolean not null default false,
  created_at timestamptz default now()
);
alter table public.students enable row level security;

-- ========== CLASSES ==========
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade smallint not null check (grade between 6 and 11),
  description text,
  schedule text,
  monthly_fee numeric(10,2),
  class_link text,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.classes enable row level security;

-- ========== STUDENT_CLASSES ==========
create table public.student_classes (
  student_id uuid references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  primary key (student_id, class_id)
);
alter table public.student_classes enable row level security;

-- ========== PAYMENTS ==========
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id),
  payment_month date not null,
  amount numeric(10,2) not null,
  payment_date date not null,
  reference_no text,
  status public.payment_status not null default 'pending',
  rejection_reason text,
  receipt_path text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
alter table public.payments enable row level security;

-- ========== ANNOUNCEMENTS ==========
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all',
  grade smallint,
  is_published boolean default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.announcements enable row level security;

-- ========== LEARNING_RESOURCES ==========
create table public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  grade smallint not null check (grade between 6 and 11),
  class_id uuid references public.classes(id),
  file_path text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.learning_resources enable row level security;

-- ========== CONTACT_MESSAGES ==========
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  subject text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table public.contact_messages enable row level security;

-- ========== SITE_SETTINGS ==========
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text default 'ESci.lk',
  tagline text default 'මොළේට දැනෙන්න Science',
  teacher_name text default 'Kavisha Herath',
  teacher_photo_url text,
  logo_url text,
  contact_phone text,
  contact_email text,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  bank_branch text,
  youtube_url text,
  facebook_url text,
  whatsapp_channel_url text,
  whatsapp_direct_url text,
  updated_at timestamptz default now()
);
alter table public.site_settings enable row level security;
insert into public.site_settings (id) values (1);

-- ========== HELPER: is_admin ==========
create function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.is_active_student()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'student' and status = 'active'
  );
$$;

-- ========== RLS POLICIES ==========

-- profiles
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = 'student');
create policy "profiles_admin_all" on public.profiles
  for all to authenticated using (public.is_admin());

-- students
create policy "students_select_own" on public.students
  for select to authenticated using (id = (select auth.uid()));
create policy "students_insert_own" on public.students
  for insert to authenticated with check (id = (select auth.uid()));
create policy "students_update_own" on public.students
  for update to authenticated using (id = (select auth.uid()));
create policy "students_admin_all" on public.students
  for all to authenticated using (public.is_admin());

-- classes
create policy "classes_select_authenticated" on public.classes
  for select to authenticated using (true);
create policy "classes_admin_all" on public.classes
  for all to authenticated using (public.is_admin());

-- student_classes
create policy "student_classes_select_own" on public.student_classes
  for select to authenticated using (student_id = (select auth.uid()));
create policy "student_classes_admin_all" on public.student_classes
  for all to authenticated using (public.is_admin());

-- payments
create policy "payments_select_own" on public.payments
  for select to authenticated using (student_id = (select auth.uid()));
create policy "payments_insert_own" on public.payments
  for insert to authenticated with check (student_id = (select auth.uid()));
create policy "payments_admin_all" on public.payments
  for all to authenticated using (public.is_admin());

-- announcements
create policy "announcements_select_published" on public.announcements
  for select to authenticated using (is_published = true);
create policy "announcements_public_select" on public.announcements
  for select to anon using (is_published = true and audience = 'all');
create policy "announcements_admin_all" on public.announcements
  for all to authenticated using (public.is_admin());

-- learning_resources
create policy "resources_select_active_students" on public.learning_resources
  for select to authenticated using (is_active = true and public.is_active_student());
create policy "resources_admin_all" on public.learning_resources
  for all to authenticated using (public.is_admin());

-- contact_messages
create policy "contact_insert_public" on public.contact_messages
  for insert to anon, authenticated with check (true);
create policy "contact_admin_read" on public.contact_messages
  for select to authenticated using (public.is_admin());

-- site_settings
create policy "settings_read_public" on public.site_settings
  for select to anon, authenticated using (true);
create policy "settings_admin_write" on public.site_settings
  for update to authenticated using (public.is_admin());

-- ========== STORAGE ==========
insert into storage.buckets (id, name, public) values
  ('payment-receipts', 'payment-receipts', false),
  ('learning-resources', 'learning-resources', false),
  ('public-assets', 'public-assets', true);

create policy "receipts_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'payment-receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "receipts_select_own" on storage.objects
  for select to authenticated using (
    bucket_id = 'payment-receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "receipts_admin_all" on storage.objects
  for all to authenticated using (bucket_id = 'payment-receipts' and public.is_admin());

create policy "resources_select_active" on storage.objects
  for select to authenticated using (
    bucket_id = 'learning-resources' and public.is_active_student()
  );
create policy "resources_admin_all" on storage.objects
  for all to authenticated using (bucket_id = 'learning-resources' and public.is_admin());

create policy "public_assets_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'public-assets');
create policy "public_assets_admin_write" on storage.objects
  for all to authenticated using (bucket_id = 'public-assets' and public.is_admin());