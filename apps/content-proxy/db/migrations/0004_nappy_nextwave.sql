CREATE TABLE "content_proxy"."content_items_sources" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"publisher_id" varchar(12) NOT NULL,
	"type" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"url" varchar(500) NOT NULL,
	"auto_sync" boolean DEFAULT false NOT NULL,
	"data" jsonb NOT NULL,
	"last_sync_started_at" timestamp DEFAULT now() NOT NULL,
	"last_sync_finished_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items" ADD COLUMN "content_items_source_id" varchar(12);--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items_sources" ADD CONSTRAINT "content_items_sources_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "content_proxy"."publishers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items" ADD CONSTRAINT "content_items_content_items_source_id_content_items_sources_id_fk" FOREIGN KEY ("content_items_source_id") REFERENCES "content_proxy"."content_items_sources"("id") ON DELETE no action ON UPDATE no action;
