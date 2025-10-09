CREATE TABLE "content_proxy"."content_pricing" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"content_item_id" varchar(12) NOT NULL,
	"licensing_agreement_id" varchar(12) NOT NULL,
	"pricing_model" varchar(20) NOT NULL,
	"token_cost_per_byte" integer,
	"token_cost_per_request" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_proxy"."licensing_agreements" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"publisher_id" varchar(12) NOT NULL,
	"name" varchar(200) NOT NULL,
	"monetary_rate_per_byte" numeric(10, 8),
	"monetary_rate_per_request" numeric(10, 4),
	"effective_date" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_proxy"."token_balances" (
	"profile_id" varchar(36) PRIMARY KEY NOT NULL,
	"token_balance" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_proxy"."usage_transactions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar(36),
	"content_item_id" varchar(12) NOT NULL,
	"profile_id" varchar(36) NOT NULL,
	"licensing_agreement_id" varchar(12) NOT NULL,
	"tokens_charged" integer,
	"bytes_transferred" integer,
	"monetary_cost_calculated" numeric(10, 4),
	"transaction_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_proxy"."content_pricing" ADD CONSTRAINT "content_pricing_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "content_proxy"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."content_pricing" ADD CONSTRAINT "content_pricing_licensing_agreement_id_licensing_agreements_id_fk" FOREIGN KEY ("licensing_agreement_id") REFERENCES "content_proxy"."licensing_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."licensing_agreements" ADD CONSTRAINT "licensing_agreements_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "content_proxy"."publishers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."token_balances" ADD CONSTRAINT "token_balances_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "content_proxy"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."usage_transactions" ADD CONSTRAINT "usage_transactions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content_proxy"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."usage_transactions" ADD CONSTRAINT "usage_transactions_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "content_proxy"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."usage_transactions" ADD CONSTRAINT "usage_transactions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "content_proxy"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_proxy"."usage_transactions" ADD CONSTRAINT "usage_transactions_licensing_agreement_id_licensing_agreements_id_fk" FOREIGN KEY ("licensing_agreement_id") REFERENCES "content_proxy"."licensing_agreements"("id") ON DELETE no action ON UPDATE no action;