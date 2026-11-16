CREATE TABLE "court_days" (
	"court_id" integer NOT NULL,
	"date" text NOT NULL,
	"version" integer NOT NULL,
	CONSTRAINT "court_days_court_id_date_pk" PRIMARY KEY("court_id","date")
);
--> statement-breakpoint
ALTER TABLE "court_days" ADD CONSTRAINT "court_days_court_id_courts_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."courts"("id") ON DELETE no action ON UPDATE no action;