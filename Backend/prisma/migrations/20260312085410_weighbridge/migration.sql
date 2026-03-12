/*
  Warnings:

  - A unique constraint covering the columns `[Zgp]` on the table `DRIVER_CHECKIN` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[WEIGHBRIDGE] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [TicketNo] VARCHAR(50) NOT NULL,
    [VehicleNo] VARCHAR(20) NOT NULL,
    [TagNo] VARCHAR(50),
    [Transporter] VARCHAR(100),
    [GatePassNo] VARCHAR(50) NOT NULL,
    [Tolerances] DECIMAL(10,2),
    [GrossWeight] DECIMAL(12,2),
    [GrossDate] DATE,
    [GrossTime] VARCHAR(10),
    [TareWeight] DECIMAL(12,2),
    [TareDate] DATE,
    [TareTime] VARCHAR(10),
    [NetWeight] DECIMAL(12,2),
    [Duration] INT,
    [Shift] VARCHAR(20),
    [Created_At] DATETIME2 NOT NULL CONSTRAINT [WEIGHBRIDGE_Created_At_df] DEFAULT CURRENT_TIMESTAMP,
    [Updated_At] DATETIME2 NOT NULL,
    CONSTRAINT [WEIGHBRIDGE_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [WEIGHBRIDGE_TicketNo_key] UNIQUE NONCLUSTERED ([TicketNo]),
    CONSTRAINT [WEIGHBRIDGE_GatePassNo_key] UNIQUE NONCLUSTERED ([GatePassNo])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [WEIGHBRIDGE_VehicleNo_idx] ON [dbo].[WEIGHBRIDGE]([VehicleNo]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [WEIGHBRIDGE_GatePassNo_idx] ON [dbo].[WEIGHBRIDGE]([GatePassNo]);

-- CreateIndex
ALTER TABLE [dbo].[DRIVER_CHECKIN] ADD CONSTRAINT [DRIVER_CHECKIN_Zgp_key] UNIQUE NONCLUSTERED ([Zgp]);

-- AddForeignKey
ALTER TABLE [dbo].[DRIVER_CHECKIN] ADD CONSTRAINT [DRIVER_CHECKIN_Zgp_fkey] FOREIGN KEY ([Zgp]) REFERENCES [dbo].[WEIGHBRIDGE]([GatePassNo]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
