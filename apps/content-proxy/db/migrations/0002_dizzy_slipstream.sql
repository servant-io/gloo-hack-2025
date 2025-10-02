CREATE TABLE "content_proxy"."content_items" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"publisher_id" varchar(12) NOT NULL,
	"type" varchar(10) NOT NULL,
	"name" varchar(200) NOT NULL,
	"short_description" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500) NOT NULL,
	"content_url" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_proxy"."publishers" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_proxy"."content_items" ADD CONSTRAINT "content_items_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "content_proxy"."publishers"("id") ON DELETE no action ON UPDATE no action;