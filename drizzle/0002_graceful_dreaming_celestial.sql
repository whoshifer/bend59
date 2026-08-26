ALTER TABLE "cookie_settings" ALTER COLUMN "policy_href" SET DEFAULT '/privacy';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text DEFAULT '' NOT NULL;