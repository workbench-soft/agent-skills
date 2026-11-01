// node --test tests/
import assert from "node:assert/strict";
import { test } from "node:test";
import { riskOf } from "../skills/legal-check/scripts/licenses.ts";

test("an OR takes the easiest branch", () => {
  assert.equal(riskOf("GPL-3.0 OR MIT"), undefined);
  assert.equal(riskOf("MIT/Apache-2.0"), undefined);
  assert.equal(riskOf("GPL-2.0 AND MIT"), "copyleft");
  assert.equal(riskOf("LGPL-2.1"), "weak copyleft");
});

test("a license kept at a URL stays flagged", () => {
  assert.equal(riskOf("SEE LICENSE IN LICENSE.md"), "no clear license");
  assert.equal(riskOf("SEE LICENSE IN https://example.com/eula"), "no clear license");
});
