-- The hero headline used to be hard-coded in the Hero component. Text wrapped
-- in ** ** renders with the brand gradient.
ALTER TABLE "Hero" ADD COLUMN "headline" TEXT NOT NULL DEFAULT 'I build **fast, elegant** web experiences.';
