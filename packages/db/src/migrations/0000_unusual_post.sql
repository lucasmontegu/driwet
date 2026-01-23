CREATE TYPE "public"."fleet_plan" AS ENUM('starter', 'pro', 'business', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."fleet_role" AS ENUM('owner', 'admin', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "alert_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"external_id" text,
	"alert_type" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"instructions" text,
	"source" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"polygon" jsonb,
	"notified_at" timestamp,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"team_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text,
	"active_team_id" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fleet" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"plan" "fleet_plan" DEFAULT 'starter' NOT NULL,
	"billing_email" text,
	"max_vehicles" integer DEFAULT 25 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fleet_alert_history" (
	"id" text PRIMARY KEY NOT NULL,
	"fleet_id" text NOT NULL,
	"alert_type" text NOT NULL,
	"severity" text NOT NULL,
	"vehicles_affected" integer DEFAULT 0 NOT NULL,
	"managed_at" timestamp,
	"managed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fleet_member" (
	"id" text PRIMARY KEY NOT NULL,
	"fleet_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "fleet_role" DEFAULT 'viewer' NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"joined_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" text PRIMARY KEY NOT NULL,
	"fleet_id" text NOT NULL,
	"plate" text NOT NULL,
	"label" text,
	"assigned_user_id" text,
	"status" "vehicle_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"platform" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_location" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"notify_alerts" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_route" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"origin_name" text NOT NULL,
	"origin_latitude" numeric(10, 7) NOT NULL,
	"origin_longitude" numeric(10, 7) NOT NULL,
	"destination_name" text NOT NULL,
	"destination_latitude" numeric(10, 7) NOT NULL,
	"destination_longitude" numeric(10, 7) NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"saved_route_id" text,
	"origin_name" text NOT NULL,
	"origin_latitude" numeric(10, 7) NOT NULL,
	"origin_longitude" numeric(10, 7) NOT NULL,
	"destination_name" text NOT NULL,
	"destination_latitude" numeric(10, 7) NOT NULL,
	"destination_longitude" numeric(10, 7) NOT NULL,
	"distance_km" numeric(8, 2),
	"duration_minutes" integer,
	"weather_condition" text,
	"outcome" text DEFAULT 'completed' NOT NULL,
	"alerts_avoided_count" integer DEFAULT 0 NOT NULL,
	"estimated_savings" numeric(10, 2) DEFAULT '0',
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"weather_snapshots" jsonb,
	"max_risk_encountered" text,
	"alerts_encountered" jsonb
);
--> statement-breakpoint
CREATE TABLE "api_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"provider" text NOT NULL,
	"endpoint" text NOT NULL,
	"call_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_weather_analysis" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"saved_route_id" text,
	"polyline" text NOT NULL,
	"segments" jsonb NOT NULL,
	"overall_risk" text NOT NULL,
	"alerts" jsonb DEFAULT '[]'::jsonb,
	"analyzed_at" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safe_places_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"radius_km" numeric(5, 2) NOT NULL,
	"places" jsonb NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weather_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"data" jsonb NOT NULL,
	"source" text NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_history" ADD CONSTRAINT "alert_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_alert_history" ADD CONSTRAINT "fleet_alert_history_fleet_id_fleet_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_alert_history" ADD CONSTRAINT "fleet_alert_history_managed_by_users_id_fk" FOREIGN KEY ("managed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_member" ADD CONSTRAINT "fleet_member_fleet_id_fleet_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_member" ADD CONSTRAINT "fleet_member_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_fleet_id_fleet_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_token" ADD CONSTRAINT "push_token_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_location" ADD CONSTRAINT "user_location_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_route" ADD CONSTRAINT "saved_route_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_history" ADD CONSTRAINT "trip_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_history" ADD CONSTRAINT "trip_history_saved_route_id_saved_route_id_fk" FOREIGN KEY ("saved_route_id") REFERENCES "public"."saved_route"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_weather_analysis" ADD CONSTRAINT "route_weather_analysis_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_weather_analysis" ADD CONSTRAINT "route_weather_analysis_saved_route_id_saved_route_id_fk" FOREIGN KEY ("saved_route_id") REFERENCES "public"."saved_route"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alert_history_userId_idx" ON "alert_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "alert_history_externalId_idx" ON "alert_history" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "alert_history_createdAt_idx" ON "alert_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "alert_history_severity_idx" ON "alert_history" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invitations_organizationId_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "members_organizationId_idx" ON "members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "members_userId_idx" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_uidx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "teamMembers_teamId_idx" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "teamMembers_userId_idx" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "teams_organizationId_idx" ON "teams" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "chat_session_userId_idx" ON "chat_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_session_updatedAt_idx" ON "chat_session" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "fleet_alert_fleet_idx" ON "fleet_alert_history" USING btree ("fleet_id");--> statement-breakpoint
CREATE INDEX "fleet_alert_created_idx" ON "fleet_alert_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "fleet_member_fleet_idx" ON "fleet_member" USING btree ("fleet_id");--> statement-breakpoint
CREATE INDEX "fleet_member_user_idx" ON "fleet_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vehicle_fleet_idx" ON "vehicle" USING btree ("fleet_id");--> statement-breakpoint
CREATE INDEX "vehicle_assigned_user_idx" ON "vehicle" USING btree ("assigned_user_id");--> statement-breakpoint
CREATE INDEX "push_token_userId_idx" ON "push_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_token_token_idx" ON "push_token" USING btree ("token");--> statement-breakpoint
CREATE INDEX "user_location_userId_idx" ON "user_location" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_location_coords_idx" ON "user_location" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "saved_route_userId_idx" ON "saved_route" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trip_history_userId_idx" ON "trip_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trip_history_savedRouteId_idx" ON "trip_history" USING btree ("saved_route_id");--> statement-breakpoint
CREATE INDEX "trip_history_startedAt_idx" ON "trip_history" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "trip_history_outcome_idx" ON "trip_history" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "api_usage_date_provider_idx" ON "api_usage" USING btree ("date","provider");--> statement-breakpoint
CREATE INDEX "route_weather_analysis_userId_idx" ON "route_weather_analysis" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "route_weather_analysis_analyzedAt_idx" ON "route_weather_analysis" USING btree ("analyzed_at");--> statement-breakpoint
CREATE INDEX "safe_places_cache_coords_idx" ON "safe_places_cache" USING btree ("latitude","longitude","radius_km");--> statement-breakpoint
CREATE INDEX "weather_cache_coords_idx" ON "weather_cache" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "weather_cache_expires_idx" ON "weather_cache" USING btree ("expires_at");