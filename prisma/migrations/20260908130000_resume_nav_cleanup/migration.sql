-- Résumé PDF support (MediaAsset.resourceType), editable navigation (SiteCopy.navItems),
-- and removal of never-rendered columns (About.*, SiteSettings.resumeUrl).

-- AlterTable
ALTER TABLE "About" DROP COLUMN "education",
DROP COLUMN "location",
DROP COLUMN "personalInfo",
DROP COLUMN "resumeUrl",
DROP COLUMN "yearsOfExperience";

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "resourceType" TEXT NOT NULL DEFAULT 'image';

-- AlterTable
ALTER TABLE "SiteCopy" ADD COLUMN     "navItems" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "resumeUrl";


-- Backfill: rows saved before navItems existed keep the navigation the site shipped with.
UPDATE "SiteCopy"
SET "navItems" = '[{"label":"About","href":"#about"},{"label":"Skills","href":"#skills"},{"label":"Work","href":"#work"},{"label":"Experience","href":"#experience"},{"label":"Services","href":"#services"},{"label":"Contact","href":"#contact"}]'::jsonb
WHERE "navItems" = '[]'::jsonb;
