import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const sql = readFileSync(
  "prisma/migrations/20260622063328_init/migration.sql",
  "utf-8"
);

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const client = createClient({ url });
  await client.executeMultiple(sql);
  console.log("Migration applied.");
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
