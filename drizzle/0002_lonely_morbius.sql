ALTER TABLE `expenses` MODIFY COLUMN `amount` decimal(10,4) NOT NULL;--> statement-breakpoint
ALTER TABLE `summaries` MODIFY COLUMN `totalSpent` decimal(10,4) NOT NULL;