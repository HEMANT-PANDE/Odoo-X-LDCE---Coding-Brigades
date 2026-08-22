-- Add profile preferences and saved destinations.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';

CREATE TABLE IF NOT EXISTS "saved_destinations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_destinations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "saved_destinations_user_id_city_id_key"
  ON "saved_destinations"("user_id", "city_id");
CREATE INDEX IF NOT EXISTS "saved_destinations_user_id_idx"
  ON "saved_destinations"("user_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'saved_destinations_user_id_fkey') THEN
    ALTER TABLE "saved_destinations" ADD CONSTRAINT "saved_destinations_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'saved_destinations_city_id_fkey') THEN
    ALTER TABLE "saved_destinations" ADD CONSTRAINT "saved_destinations_city_id_fkey"
      FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
