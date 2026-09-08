-- Site Copy singleton (Admin → Site Copy) + drop the never-rendered Project.category column.

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "category";

-- CreateTable
CREATE TABLE "SiteCopy" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heroStats" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "aboutNote" TEXT NOT NULL DEFAULT '',
    "techMarquee" TEXT[],
    "achievements" JSONB NOT NULL,
    "contactEyebrow" TEXT NOT NULL,
    "contactTitle" TEXT NOT NULL,
    "contactDescription" TEXT NOT NULL,
    "contactResponseTime" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "miniProjects" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteCopy_pkey" PRIMARY KEY ("id")
);

