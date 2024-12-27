CREATE TABLE `dishes` (
	`meal_id` int NOT NULL,
	`recipe_id` int NOT NULL,
	`dish_notes` text DEFAULT (''),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dishes_meal_id_recipe_id_pk` PRIMARY KEY(`meal_id`,`recipe_id`)
);
--> statement-breakpoint
CREATE TABLE `meals` (
	`meal_id` int AUTO_INCREMENT NOT NULL,
	`status` enum('initial','todo','cooked','overdue','skipped') NOT NULL,
	`user_id` int NOT NULL,
	`planned_date` date,
	`cooked_date` date,
	`meal_notes` text DEFAULT (''),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meals_meal_id` PRIMARY KEY(`meal_id`)
);
--> statement-breakpoint
ALTER TABLE `dishes` ADD CONSTRAINT `dishes_meal_id_meals_meal_id_fk` FOREIGN KEY (`meal_id`) REFERENCES `meals`(`meal_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dishes` ADD CONSTRAINT `dishes_recipe_id_recipes_id_fk` FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meals` ADD CONSTRAINT `meals_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;