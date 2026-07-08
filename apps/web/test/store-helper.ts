import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "balaur-memory";

/** Fresh throwaway Store with the app's consent surface registered
 * (mirror of the bootstrap script's proposed-born types). */
export function testStore(): Store {
  const dir = mkdtempSync(join(tmpdir(), "balaur-web-test-"));
  const store = Store.open({ dir });
  for (const name of ["task", "memory", "preference"] as const) {
    store.registerType({ name, bornStatus: "proposed" });
  }
  return store;
}
