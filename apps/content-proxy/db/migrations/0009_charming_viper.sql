ALTER TABLE "content_proxy"."events" DROP CONSTRAINT "events_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "content_proxy"."events" DROP CONSTRAINT "events_metric_schema_version_id_metric_schema_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "content_proxy"."profile_api_key_lkp" DROP CONSTRAINT "profile_api_key_lkp_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "content_proxy"."profile_api_key_lkp" DROP CONSTRAINT "profile_api_key_lkp_api_key_id_api_keys_id_fk";
--> statement-breakpoint
ALTER TABLE "content_proxy"."publisher_api_key_lkp" DROP CONSTRAINT "publisher_api_key_lkp_publisher_id_publishers_id_fk";
--> statement-breakpoint
ALTER TABLE "content_proxy"."publisher_api_key_lkp" DROP CONSTRAINT "publisher_api_key_lkp_api_key_id_api_keys_id_fk";
--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items" DROP CONSTRAINT "content_items_publisher_id_publishers_id_fk";
--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items" DROP CONSTRAINT "content_items_content_items_source_id_content_items_sources_id_fk";
--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items_sources" DROP CONSTRAINT "content_items_sources_publisher_id_publishers_id_fk";
--> statement-breakpoint
ALTER TABLE "content_proxy"."events" ADD CONSTRAINT "events_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "content_proxy"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."events" ADD CONSTRAINT "events_metric_schema_version_id_metric_schema_versions_id_fk" FOREIGN KEY ("metric_schema_version_id") REFERENCES "content_proxy"."metric_schema_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."profile_api_key_lkp" ADD CONSTRAINT "profile_api_key_lkp_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "content_proxy"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."profile_api_key_lkp" ADD CONSTRAINT "profile_api_key_lkp_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "content_proxy"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."publisher_api_key_lkp" ADD CONSTRAINT "publisher_api_key_lkp_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "content_proxy"."publishers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."publisher_api_key_lkp" ADD CONSTRAINT "publisher_api_key_lkp_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "content_proxy"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items" ADD CONSTRAINT "content_items_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "content_proxy"."publishers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items" ADD CONSTRAINT "content_items_content_items_source_id_content_items_sources_id_fk" FOREIGN KEY ("content_items_source_id") REFERENCES "content_proxy"."content_items_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items_sources" ADD CONSTRAINT "content_items_sources_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "content_proxy"."publishers"("id") ON DELETE cascade ON UPDATE no action;