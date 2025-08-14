/*
  Warnings:

  - Added the required column `image` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Market" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "ci2savedkg" REAL NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL
);
INSERT INTO "new_Market" ("ci2savedkg", "createdAt", "id", "name", "price") SELECT "ci2savedkg", "createdAt", "id", "name", "price" FROM "Market";
DROP TABLE "Market";
ALTER TABLE "new_Market" RENAME TO "Market";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
