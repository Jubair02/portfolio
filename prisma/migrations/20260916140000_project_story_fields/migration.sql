-- Key features, challenges/learnings, video, architecture, feedback and per-project SEO.

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "architectureImage" TEXT,
ADD COLUMN     "architectureNote" TEXT,
ADD COLUMN     "challenges" TEXT,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "feedbackAuthor" TEXT,
ADD COLUMN     "feedbackQuote" TEXT,
ADD COLUMN     "feedbackRole" TEXT,
ADD COLUMN     "learnings" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "videoUrl" TEXT;

