


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."broadcast_lobby_players"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  topic text;
BEGIN
  topic := 'lobby:' || COALESCE((NEW.lobby_id)::text, (OLD.lobby_id)::text) || ':players';
  PERFORM realtime.broadcast_changes(
    topic,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."broadcast_lobby_players"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."broadcast_table_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'table:' || TG_TABLE_NAME || ':' || COALESCE((NEW.id)::text, (OLD.id)::text),
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."broadcast_table_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."close_empty_lobby"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- wenn keine Spieler mehr, Lobby löschen
  if not exists (select 1 from lobby_players where lobby_id = old.lobby_id) then
    delete from lobbies where id = old.lobby_id;
  end if;
  return null;
end;
$$;


ALTER FUNCTION "public"."close_empty_lobby"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."lobbies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "host_id" "uuid",
    "status" "text" DEFAULT 'waiting'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "started_at" timestamp with time zone,
    CONSTRAINT "lobbies_status_check" CHECK (("status" = ANY (ARRAY['waiting'::"text", 'starting'::"text", 'started'::"text"])))
);


ALTER TABLE "public"."lobbies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lobby_players" (
    "lobby_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "is_host" boolean DEFAULT false,
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lobby_players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."lobbies"
    ADD CONSTRAINT "lobbies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lobby_players"
    ADD CONSTRAINT "lobby_players_pkey" PRIMARY KEY ("lobby_id", "user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_lp_user_lobby" ON "public"."lobby_players" USING "btree" ("user_id", "lobby_id");



CREATE OR REPLACE TRIGGER "lobbies_broadcast_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."lobbies" FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_table_changes"();



CREATE OR REPLACE TRIGGER "lobby_players_broadcast_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."lobby_players" FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_lobby_players"();



CREATE OR REPLACE TRIGGER "trg_close_empty_lobby" AFTER DELETE ON "public"."lobby_players" FOR EACH ROW EXECUTE FUNCTION "public"."close_empty_lobby"();



ALTER TABLE ONLY "public"."lobbies"
    ADD CONSTRAINT "lobbies_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lobby_players"
    ADD CONSTRAINT "lobby_players_lobby_id_fkey" FOREIGN KEY ("lobby_id") REFERENCES "public"."lobbies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lobby_players"
    ADD CONSTRAINT "lobby_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "create lobby as host" ON "public"."lobbies" FOR INSERT WITH CHECK (("auth"."uid"() = "host_id"));



CREATE POLICY "create own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "host delete lobby" ON "public"."lobbies" FOR DELETE USING (("auth"."uid"() = "host_id"));



CREATE POLICY "host updates lobby" ON "public"."lobbies" FOR UPDATE USING (("auth"."uid"() = "host_id")) WITH CHECK (("auth"."uid"() = "host_id"));



CREATE POLICY "hosts update lobby" ON "public"."lobbies" FOR UPDATE USING (("auth"."uid"() = "host_id"));



CREATE POLICY "insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "join lobby" ON "public"."lobby_players" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "leave lobby" ON "public"."lobby_players" FOR DELETE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."lobbies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lobby_players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read lobbies" ON "public"."lobbies" FOR SELECT USING (true);



CREATE POLICY "read lobby players" ON "public"."lobby_players" FOR SELECT USING (true);



CREATE POLICY "read profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "service delete lobby" ON "public"."lobbies" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."lobbies";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."lobby_players";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON FUNCTION "public"."broadcast_lobby_players"() TO "service_role";



GRANT ALL ON FUNCTION "public"."broadcast_table_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."close_empty_lobby"() TO "anon";
GRANT ALL ON FUNCTION "public"."close_empty_lobby"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."close_empty_lobby"() TO "service_role";
























GRANT ALL ON TABLE "public"."lobbies" TO "anon";
GRANT ALL ON TABLE "public"."lobbies" TO "authenticated";
GRANT ALL ON TABLE "public"."lobbies" TO "service_role";



GRANT ALL ON TABLE "public"."lobby_players" TO "anon";
GRANT ALL ON TABLE "public"."lobby_players" TO "authenticated";
GRANT ALL ON TABLE "public"."lobby_players" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "lobby_members_can_read_realtime"
  on "realtime"."messages"
  as permissive
  for select
  to authenticated
using (((topic ~~ 'lobby:%:players'::text) AND (EXISTS ( SELECT 1
   FROM public.lobby_players
  WHERE ((lobby_players.lobby_id = (split_part(messages.topic, ':'::text, 2))::uuid) AND (lobby_players.user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "lobby_members_can_write_realtime"
  on "realtime"."messages"
  as permissive
  for insert
  to authenticated
with check (((topic ~~ 'lobby:%:players'::text) AND (EXISTS ( SELECT 1
   FROM public.lobby_players
  WHERE ((lobby_players.lobby_id = (split_part(messages.topic, ':'::text, 2))::uuid) AND (lobby_players.user_id = ( SELECT auth.uid() AS uid)))))));



