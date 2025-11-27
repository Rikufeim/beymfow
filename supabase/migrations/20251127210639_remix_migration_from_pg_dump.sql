CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: handle_new_user_credits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_credits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_usage (user_id, generations_used)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: prompts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prompts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seller_id uuid NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    prompt_content text NOT NULL,
    thumbnail_url text,
    rating numeric(2,1) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT prompts_category_check CHECK ((category = ANY (ARRAY['Business'::text, 'Creative'::text, 'Crypto'::text, 'Image'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL
);


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    status text NOT NULL,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    generations_used integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    daily_credits_reset_at timestamp with time zone DEFAULT now()
);


--
-- Name: prompts prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);


--
-- Name: user_usage user_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_usage
    ADD CONSTRAINT user_usage_pkey PRIMARY KEY (id);


--
-- Name: user_usage user_usage_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_usage
    ADD CONSTRAINT user_usage_user_id_key UNIQUE (user_id);


--
-- Name: prompts update_prompts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON public.prompts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_subscriptions update_user_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_usage update_user_usage_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON public.user_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_usage user_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_usage
    ADD CONSTRAINT user_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions No deletes to subscriptions for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No deletes to subscriptions for authenticated users" ON public.user_subscriptions FOR DELETE TO authenticated USING (false);


--
-- Name: user_subscriptions No inserts to subscriptions for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No inserts to subscriptions for authenticated users" ON public.user_subscriptions FOR INSERT TO authenticated WITH CHECK (false);


--
-- Name: user_subscriptions No updates to subscriptions for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No updates to subscriptions for authenticated users" ON public.user_subscriptions FOR UPDATE TO authenticated USING (false) WITH CHECK (false);


--
-- Name: prompts Public can view prompt listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view prompt listings" ON public.prompts FOR SELECT USING (true);


--
-- Name: prompts Sellers can create prompts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Sellers can create prompts" ON public.prompts FOR INSERT WITH CHECK ((auth.uid() = seller_id));


--
-- Name: prompts Sellers can delete own prompts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Sellers can delete own prompts" ON public.prompts FOR DELETE USING ((auth.uid() = seller_id));


--
-- Name: prompts Sellers can update own prompts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Sellers can update own prompts" ON public.prompts FOR UPDATE USING ((auth.uid() = seller_id));


--
-- Name: prompts Sellers can view their own prompts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Sellers can view their own prompts" ON public.prompts FOR SELECT USING ((auth.uid() = seller_id));


--
-- Name: user_roles Service role can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage roles" ON public.user_roles TO service_role USING (true) WITH CHECK (true);


--
-- Name: user_subscriptions Service role can manage subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions TO service_role USING (true) WITH CHECK (true);


--
-- Name: user_usage Users can insert their own usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own usage" ON public.user_usage FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_usage Users can update their own usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own usage" ON public.user_usage FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_subscriptions Users can view their own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_usage Users can view their own usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own usage" ON public.user_usage FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: prompts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


