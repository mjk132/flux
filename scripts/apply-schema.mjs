// Applies the current Prisma schema (as SQL) to a Turso/libsql database.
// Needed because `prisma db push` only understands file: URLs.
//
// Usage:
//   1. Generate the schema SQL:
//        npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > schema.sql
//   2. Apply it (and run verification):
//        $env:TURSO_URL="libsql://flux-store-xxx.turso.io?authToken=YOUR_TOKEN"
//        node scripts/apply-schema.mjs schema.sql
//      (the script also works on an already-created DB; it reapplies and reports)
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
if (!url) {
  console.error("TURSO_URL not set");
  process.exit(1);
}
const client = createClient({ url });

try {
  const ping = await client.execute("SELECT 1 AS ok");
  console.log("CONNECTED, SELECT 1 ->", JSON.stringify(ping.rows));

  let sql = readFileSync(process.argv[2], "utf8").replace(/^\uFEFF/, "");
  const statements = sql
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Running ${statements.length} statements one-by-one...`);
  let done = 0;
  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      done++;
    } catch (e) {
      console.error(`STATEMENT ${done + 1} FAILED:`);
      console.error(stmt.slice(0, 400));
      console.error("ERROR:", e?.message || e);
      process.exit(1);
    }
  }

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log(
    `APPLIED OK — ${done}/${statements.length} ok, ${tables.rows.length} tables: ${tables.rows.map((r) => r.name).join(", ")}`
  );
} catch (e) {
  console.error("FATAL:", e?.message || e);
  process.exit(1);
} finally {
  client.close();
}