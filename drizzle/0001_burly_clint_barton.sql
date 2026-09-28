CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`category` enum('Food','Transport','Entertainment','Utilities','Health','Other') NOT NULL,
	`date` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`period` enum('weekly','monthly','quarterly') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`content` text NOT NULL,
	`totalSpent` decimal(10,2) NOT NULL,
	`topCategory` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `summaries_id` PRIMARY KEY(`id`)
);
