-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "authorLogin" TEXT,
ADD COLUMN     "authorAvatarUrl" TEXT;

-- CreateIndex
CREATE INDEX "PullRequest_authorLogin_idx" ON "PullRequest"("authorLogin");
