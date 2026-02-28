BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Security_Logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT,
    [ip] NVARCHAR(1000),
    [latitude] FLOAT(53),
    [longitude] FLOAT(53),
    [distance] FLOAT(53),
    [reason] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Security_Logs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Security_Logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
