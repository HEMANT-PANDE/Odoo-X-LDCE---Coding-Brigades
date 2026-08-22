-- AlterTable
ALTER TABLE "cities" ADD COLUMN "lat" DECIMAL(9,6),
ADD COLUMN "lng" DECIMAL(9,6);

-- CreateIndex
CREATE UNIQUE INDEX "activities_city_id_name_key" ON "activities"("city_id", "name");
