ALTER TABLE `recipes` DROP FOREIGN KEY `recipes_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `recipes` DROP COLUMN `user_id`;