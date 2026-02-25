/*
  Warnings:

  - A unique constraint covering the columns `[Mobile]` on the table `GUARD_MASTER` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[GUARD_MASTER] ADD [OTP] NVARCHAR(1000),
[OTP_Expiry] DATETIME2;

-- CreateIndex
ALTER TABLE [dbo].[GUARD_MASTER] ADD CONSTRAINT [GUARD_MASTER_Mobile_key] UNIQUE NONCLUSTERED ([Mobile]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
