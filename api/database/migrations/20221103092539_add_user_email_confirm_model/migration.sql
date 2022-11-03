-- CreateTable
CREATE TABLE "UserEmailConfirm" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "UserEmailConfirm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmailConfirm_userId_key" ON "UserEmailConfirm"("userId");

-- AddForeignKey
ALTER TABLE "UserEmailConfirm" ADD CONSTRAINT "UserEmailConfirm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
