CREATE TYPE "public"."org_plan" AS ENUM('starter', 'pro', 'business', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."org_role" AS ENUM('owner', 'admin', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "fleet_alert_history" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"alert_type" text NOT NULL,
	"severity" text NOT NULL,
	"vehicles_affected" integer DEFAULT 0 NOT NULL,
	"managed_at" timestamp,
	"managed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "org_role" DEFAULT 'viewer' NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"joined_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"plan" "org_plan" DEFAULT 'starter' NOT NULL,
	"billing_email" text,
	"max_vehicles" integer DEFAULT 25 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plate" text NOT NULL,
	"label" text,
	"assigned_user_id" text,
	"status" "vehicle_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "fleet_alert_history" ADD CONSTRAINT "fleet_alert_history_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_alert_history" ADD CONSTRAINT "fleet_alert_history_managed_by_user_id_fk" FOREIGN KEY ("managed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_member" ADD CONSTRAINT "org_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_member" ADD CONSTRAINT "org_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fleet_alert_org_idx" ON "fleet_alert_history" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "fleet_alert_created_idx" ON "fleet_alert_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "org_member_org_idx" ON "org_member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_member_user_idx" ON "org_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vehicle_org_idx" ON "vehicle" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "vehicle_assigned_user_idx" ON "vehicle" USING btree ("assigned_user_id");