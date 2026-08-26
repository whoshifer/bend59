CREATE TABLE "analytics_daily" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" date NOT NULL,
	"path" varchar(500) NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"decision" varchar(20) NOT NULL,
	"consent_version" varchar(40) DEFAULT '1' NOT NULL,
	"receipt_hash" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cookie_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"banner_title" varchar(160) DEFAULT 'Настройки cookie' NOT NULL,
	"banner_text" text DEFAULT 'Используем только необходимые cookie. С вашего согласия ведём обезличенную статистику посещений, чтобы улучшать сайт.' NOT NULL,
	"accept_label" varchar(80) DEFAULT 'Разрешить статистику' NOT NULL,
	"reject_label" varchar(80) DEFAULT 'Только необходимые' NOT NULL,
	"policy_href" varchar(500) DEFAULT '#cookies' NOT NULL,
	"analytics_enabled" boolean DEFAULT true NOT NULL,
	"retention_days" integer DEFAULT 180 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "analytics_daily_day_path_idx" ON "analytics_daily" USING btree ("day","path");--> statement-breakpoint
CREATE INDEX "consent_events_created_at_idx" ON "consent_events" USING btree ("created_at");