-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressCity" TEXT,
ADD COLUMN     "addressNumber" TEXT,
ADD COLUMN     "addressState" TEXT,
ADD COLUMN     "addressStreet" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "id" DROP DEFAULT;
