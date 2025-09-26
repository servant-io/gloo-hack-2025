CREATE SCHEMA "content_proxy";
--> statement-breakpoint
CREATE TABLE "content_proxy"."profiles" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_ip" varchar(39),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
