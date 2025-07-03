-- CreateTable
CREATE TABLE `Device_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `nis` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NULL,
    `platform` VARCHAR(191) NULL,
    `app_version` VARCHAR(191) NULL,
    `last_active_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Device_tokens_id_key`(`id`),
    INDEX `Device_tokens_nis_idx`(`nis`),
    INDEX `Device_tokens_token_idx`(`token`),
    INDEX `Device_tokens_platform_idx`(`platform`),
    INDEX `Device_tokens_app_version_idx`(`app_version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notifications` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `data_payload` JSON NOT NULL,
    `target_type` VARCHAR(191) NOT NULL,
    `target_value` VARCHAR(191) NOT NULL,
    `nis` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `fmc_message_id` VARCHAR(191) NOT NULL,
    `error_message` VARCHAR(191) NOT NULL,
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Notifications_id_key`(`id`),
    INDEX `Notifications_type_idx`(`type`),
    INDEX `Notifications_title_idx`(`title`),
    INDEX `Notifications_body_idx`(`body`),
    INDEX `Notifications_nis_idx`(`nis`),
    INDEX `Notifications_status_idx`(`status`),
    INDEX `Notifications_error_message_idx`(`error_message`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
