-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SleepLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bedTime" DATETIME NOT NULL,
    "wakeTime" DATETIME NOT NULL,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SleepLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SleepLog" ("id", "userId", "bedTime", "wakeTime", "loggedAt")
SELECT "id", "userId", datetime("loggedAt", '-' || "hours" || ' hours'), "loggedAt", "loggedAt" FROM "SleepLog";
DROP TABLE "SleepLog";
ALTER TABLE "new_SleepLog" RENAME TO "SleepLog";
CREATE INDEX "SleepLog_userId_loggedAt_idx" ON "SleepLog"("userId", "loggedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
