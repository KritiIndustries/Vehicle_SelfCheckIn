BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Driver_Temp_Upload] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Session_Id] VARCHAR(100) NOT NULL,
    [Doc_Type] VARCHAR(50) NOT NULL,
    [Image_Path] VARCHAR(255) NOT NULL,
    [Is_Selfie] BIT NOT NULL CONSTRAINT [Driver_Temp_Upload_Is_Selfie_df] DEFAULT 0,
    [Created_At] DATETIME2 NOT NULL CONSTRAINT [Driver_Temp_Upload_Created_At_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Driver_Temp_Upload_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Driver_Temp_Upload_Session_Id_idx] ON [dbo].[Driver_Temp_Upload]([Session_Id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
