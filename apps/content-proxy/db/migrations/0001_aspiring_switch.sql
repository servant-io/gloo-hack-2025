CREATE TABLE "content_proxy"."events" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"metric_schema_version_id" varchar NOT NULL,
	"data" jsonb NOT NULL,
	"ts" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_proxy"."metric_schema_versions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_name" varchar NOT NULL,
	"revision" varchar(36),
	"schema" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_proxy"."metrics" (
	"name" varchar(255) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_proxy"."events" ADD CONSTRAINT "events_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "content_proxy"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."events" ADD CONSTRAINT "events_metric_schema_version_id_metric_schema_versions_id_fk" FOREIGN KEY ("metric_schema_version_id") REFERENCES "content_proxy"."metric_schema_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."metric_schema_versions" ADD CONSTRAINT "metric_schema_versions_metric_name_metrics_name_fk" FOREIGN KEY ("metric_name") REFERENCES "content_proxy"."metrics"("name") ON DELETE no action ON UPDATE no action;