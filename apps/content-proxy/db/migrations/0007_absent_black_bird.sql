ALTER TABLE "content_proxy"."content_items_sources" RENAME COLUMN "data" TO "instructions";--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items_sources" ADD COLUMN "status_code" integer;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items_sources" ADD COLUMN "response" jsonb;