CREATE TABLE "content_proxy"."api_keys" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "content_proxy"."profile_api_key_lkp" (
	"profile_id" varchar NOT NULL,
	"api_key_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_proxy"."profiles" ADD COLUMN "first_name" varchar(255);--> statement-breakpoint
ALTER TABLE "content_proxy"."profiles" ADD COLUMN "last_name" varchar(255);--> statement-breakpoint
ALTER TABLE "content_proxy"."profiles" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "content_proxy"."profiles" ADD COLUMN "type" varchar(255);--> statement-breakpoint
ALTER TABLE "content_proxy"."profile_api_key_lkp" ADD CONSTRAINT "profile_api_key_lkp_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "content_proxy"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."profile_api_key_lkp" ADD CONSTRAINT "profile_api_key_lkp_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "content_proxy"."api_keys"("id") ON DELETE no action ON UPDATE no action;