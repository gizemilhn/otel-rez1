-- Add new columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tcNumber" TEXT UNIQUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "birthDate" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Create index on tcNumber
CREATE INDEX IF NOT EXISTS "User_tcNumber_idx" ON "User"("tcNumber"); 