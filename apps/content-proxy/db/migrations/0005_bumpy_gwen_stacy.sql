ALTER TABLE "content_proxy"."content_items" ALTER COLUMN "short_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items" ALTER COLUMN "thumbnail_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items_sources" ALTER COLUMN "last_sync_started_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items_sources" ALTER COLUMN "last_sync_started_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items_sources" ALTER COLUMN "last_sync_finished_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items_sources" ALTER COLUMN "last_sync_finished_at" DROP NOT NULL;
