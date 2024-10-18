/*
  Warnings:

  - Added the required column `counterparty` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `counterparty` VARCHAR(191) NOT NULL,
    ADD COLUMN `notes` STRING(191) NULL,
    ADD COLUMN `tag` VARCHAR(191) NULL,
    ADD COLUMN `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
