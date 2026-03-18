-- CreateTable
CREATE TABLE `GUARD_MASTER` (
    `Guard_Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Mobile` VARCHAR(191) NOT NULL,
    `Active` BOOLEAN NOT NULL DEFAULT true,
    `OTP` VARCHAR(191) NULL,
    `OTP_Expiry` DATETIME(3) NULL,
    `Created_At` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Updated_At` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GUARD_MASTER_Mobile_key`(`Mobile`),
    PRIMARY KEY (`Guard_Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Security_Logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `ip` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `distance` DOUBLE NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DRIVER_CHECKIN` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Do_No` VARCHAR(191) NOT NULL,
    `Vehicle_No` VARCHAR(191) NOT NULL,
    `Driver_Name` VARCHAR(191) NOT NULL,
    `Mobile` VARCHAR(191) NOT NULL,
    `Licence_Expiry_Date` DATETIME(3) NULL,
    `Insurance_Number` VARCHAR(191) NULL,
    `Insurance_Expiry_Date` DATETIME(3) NULL,
    `Chassis_Number` VARCHAR(191) NULL,
    `Rc_Expiry_Date` DATETIME(3) NULL,
    `Fitness_Expiry_Date` DATETIME(3) NULL,
    `Status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `Zgp` VARCHAR(191) NULL,
    `ReportIn_Time` DATETIME(3) NULL,
    `Entry_Time` DATETIME(3) NULL,
    `Exit_Time` DATETIME(3) NULL,
    `Latitude` DECIMAL(65, 30) NULL,
    `Longitude` DECIMAL(65, 30) NULL,
    `Created_At` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Updated_At` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DRIVER_CHECKIN_Zgp_key`(`Zgp`),
    INDEX `DRIVER_CHECKIN_Do_No_idx`(`Do_No`),
    INDEX `DRIVER_CHECKIN_Vehicle_No_idx`(`Vehicle_No`),
    INDEX `DRIVER_CHECKIN_Status_idx`(`Status`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DRIVER_DOCUMENTS` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Driver_Checkin_Id` INTEGER NOT NULL,
    `Doc_Type` VARCHAR(191) NOT NULL,
    `Expiry_Date` DATETIME(3) NULL,
    `Verified` BOOLEAN NOT NULL DEFAULT false,
    `Image_Path` VARCHAR(191) NOT NULL,
    `Verified_By` INTEGER NULL,
    `Created_At` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Updated_At` DATETIME(3) NOT NULL,

    INDEX `DRIVER_DOCUMENTS_Driver_Checkin_Id_idx`(`Driver_Checkin_Id`),
    INDEX `DRIVER_DOCUMENTS_Verified_By_idx`(`Verified_By`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Driver_Temp_Upload` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Session_Id` VARCHAR(191) NOT NULL,
    `Doc_Type` VARCHAR(191) NOT NULL,
    `Image_Path` VARCHAR(191) NOT NULL,
    `Is_Selfie` BOOLEAN NOT NULL DEFAULT false,
    `Created_At` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Driver_Temp_Upload_Session_Id_idx`(`Session_Id`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WEIGHBRIDGE` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `TicketNo` VARCHAR(191) NOT NULL,
    `VehicleNo` VARCHAR(191) NOT NULL,
    `TagNo` VARCHAR(191) NULL,
    `Transporter` VARCHAR(191) NULL,
    `GatePassNo` VARCHAR(191) NOT NULL,
    `Tolerances` DECIMAL(65, 30) NULL,
    `GrossWeight` DECIMAL(65, 30) NULL,
    `GrossDate` DATETIME(3) NULL,
    `GrossTime` VARCHAR(191) NULL,
    `TareWeight` DECIMAL(65, 30) NULL,
    `TareDate` DATETIME(3) NULL,
    `TareTime` VARCHAR(191) NULL,
    `NetWeight` DECIMAL(65, 30) NULL,
    `Duration` INTEGER NULL,
    `Shift` VARCHAR(191) NULL,
    `Created_At` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Updated_At` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WEIGHBRIDGE_TicketNo_key`(`TicketNo`),
    UNIQUE INDEX `WEIGHBRIDGE_GatePassNo_key`(`GatePassNo`),
    INDEX `WEIGHBRIDGE_VehicleNo_idx`(`VehicleNo`),
    INDEX `WEIGHBRIDGE_GatePassNo_idx`(`GatePassNo`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DRIVER_DOCUMENTS` ADD CONSTRAINT `DRIVER_DOCUMENTS_Driver_Checkin_Id_fkey` FOREIGN KEY (`Driver_Checkin_Id`) REFERENCES `DRIVER_CHECKIN`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DRIVER_DOCUMENTS` ADD CONSTRAINT `DRIVER_DOCUMENTS_Verified_By_fkey` FOREIGN KEY (`Verified_By`) REFERENCES `GUARD_MASTER`(`Guard_Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WEIGHBRIDGE` ADD CONSTRAINT `WEIGHBRIDGE_GatePassNo_fkey` FOREIGN KEY (`GatePassNo`) REFERENCES `DRIVER_CHECKIN`(`Zgp`) ON DELETE RESTRICT ON UPDATE CASCADE;
