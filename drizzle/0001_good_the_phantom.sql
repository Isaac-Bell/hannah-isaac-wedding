CREATE TABLE "invitation_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_hash" text NOT NULL,
	"code_fingerprint" text NOT NULL,
	"succeeded" boolean DEFAULT false NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "invitation_sessions" ADD CONSTRAINT "invitation_sessions_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitation_attempts_requester_time_idx" ON "invitation_attempts" USING btree ("requester_hash","attempted_at");--> statement-breakpoint
CREATE INDEX "invitation_attempts_code_time_idx" ON "invitation_attempts" USING btree ("code_fingerprint","attempted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "invitation_sessions_token_hash_idx" ON "invitation_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "invitation_sessions_invitation_id_idx" ON "invitation_sessions" USING btree ("invitation_id");--> statement-breakpoint
CREATE INDEX "invitation_sessions_expires_at_idx" ON "invitation_sessions" USING btree ("expires_at");