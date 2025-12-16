CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"public_token" text,
	"trashed_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documents_public_token_unique" UNIQUE("public_token")
);
--> statement-breakpoint
CREATE TABLE "document_members" (
	"document_id" text NOT NULL,
	"user_id" text NOT NULL,
	"invited_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_members_document_user_unique" UNIQUE("document_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "document_stars" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_stars_document_user_unique" UNIQUE("document_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_members" ADD CONSTRAINT "document_members_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_members" ADD CONSTRAINT "document_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_members" ADD CONSTRAINT "document_members_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_stars" ADD CONSTRAINT "document_stars_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_stars" ADD CONSTRAINT "document_stars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "documents_ownerId_idx" ON "documents" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "documents_publicToken_idx" ON "documents" USING btree ("public_token");--> statement-breakpoint
CREATE INDEX "documents_trashedAt_idx" ON "documents" USING btree ("trashed_at");--> statement-breakpoint
CREATE INDEX "document_members_userId_idx" ON "document_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_members_documentId_idx" ON "document_members" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_stars_userId_idx" ON "document_stars" USING btree ("user_id");