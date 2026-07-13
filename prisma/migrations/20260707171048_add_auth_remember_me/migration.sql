-- AlterTable
ALTER TABLE `AuthToken` ADD COLUMN `rememberMe` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `deletedAt` DATETIME(3) NULL;
