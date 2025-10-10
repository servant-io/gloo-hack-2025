CREATE TABLE "content_proxy"."publisher_api_key_lkp" (
	"publisher_id" varchar NOT NULL,
	"api_key_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_proxy"."publisher_api_key_lkp" ADD CONSTRAINT "publisher_api_key_lkp_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "content_proxy"."publishers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."publisher_api_key_lkp" ADD CONSTRAINT "publisher_api_key_lkp_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "content_proxy"."api_keys"("id") ON DELETE no action ON UPDATE no action;