CREATE TABLE `recipes` (
	`id` int NOT NULL,
	`recipe_name` varchar(256) NOT NULL,
	`user_id` int NOT NULL,
	`ingredient_list` text NOT NULL,
	`recipe_steps` text NOT NULL,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `recipes` ADD CONSTRAINT `recipes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;