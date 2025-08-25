-- CreateTable
CREATE TABLE "public"."AccountUser" (
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_contact_id" TEXT,

    CONSTRAINT "AccountUser_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountUser_email_key" ON "public"."AccountUser"("email");

-- CreateIndex
CREATE INDEX "AccountUser_account_id_idx" ON "public"."AccountUser"("account_id");

-- AddForeignKey
ALTER TABLE "public"."AccountUser" ADD CONSTRAINT "AccountUser_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccountUser" ADD CONSTRAINT "AccountUser_project_contact_id_fkey" FOREIGN KEY ("project_contact_id") REFERENCES "public"."ProjectContact"("project_contact_id") ON DELETE SET NULL ON UPDATE CASCADE;

