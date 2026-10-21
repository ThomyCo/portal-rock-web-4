create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

create type public.user_role as enum ('member', 'moderator', 'admin');
create type public.content_status as enum ('published', 'hidden', 'removed');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type public.place_kind as enum ('birthplace', 'venue', 'studio', 'store', 'scene');
