CREATE TABLE `recipes` (
	`id` integer PRIMARY KEY NOT NULL,
	`recipe_name` text NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
