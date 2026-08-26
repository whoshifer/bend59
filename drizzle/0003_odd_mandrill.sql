ALTER TABLE "products" ADD COLUMN "modal_title" varchar(160) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "modal_description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "modal_image_url" varchar(500) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "modal_image_alt" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "modal_layout" varchar(24) DEFAULT 'text-only' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "modal_image_aspect" varchar(24) DEFAULT 'landscape' NOT NULL;--> statement-breakpoint
ALTER TABLE "series" ADD COLUMN "card_layout" varchar(24) DEFAULT 'image-top' NOT NULL;--> statement-breakpoint
ALTER TABLE "series" ADD COLUMN "image_aspect" varchar(24) DEFAULT 'landscape' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "logo_mode" varchar(24) DEFAULT 'mark' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "logo_url" varchar(500) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "logo_alt" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "brand_text" varchar(160) DEFAULT 'BEND' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_note_title" varchar(160) DEFAULT 'От заявки до спецификации' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_note_text" text DEFAULT 'Работаем с застройщиками и электромонтажными организациями. Подберём состав поставки для объекта.' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "footer_description" text DEFAULT 'Электрические полотенцесушители для комплектации объектов.' NOT NULL;