-- Slide deck, downloadable attachments and demo logins for a project.

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "deck" JSONB,
ADD COLUMN     "demoAccounts" JSONB;

