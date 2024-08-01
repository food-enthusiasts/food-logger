ALTER TABLE `recipes` ADD `ingredient-list` text DEFAULT '1/2 tsp salt' NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD `recipe-steps` text DEFAULT 'cook the food' NOT NULL;