-- CreateTable
CREATE TABLE "UserPasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "UserPasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPasswordReset_userId_key" ON "UserPasswordReset"("userId");

-- AddForeignKey
ALTER TABLE "UserPasswordReset" ADD CONSTRAINT "UserPasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
