/*
  Warnings:

  - You are about to drop the column `Token` on the `DRIVER_CHECKIN` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [DRIVER_CHECKIN_Token_idx] ON [dbo].[DRIVER_CHECKIN];

-- DropIndex
ALTER TABLE [dbo].[DRIVER_CHECKIN] DROP CONSTRAINT [DRIVER_CHECKIN_Token_key];

-- AlterTable
ALTER TABLE [dbo].[DRIVER_CHECKIN] DROP COLUMN [Token];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
