import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveClaimAssets } from "./claimAssets.ts";

test("uses the vault's locked AZTEC amount, not 50,000 indexed shares", () => {
  assert.equal(resolveClaimAssets({ activeAssets: 53_781n * 10n ** 18n }), 53_781n * 10n ** 18n);
});

test("uses the actual payout for a claimed request", () => {
  assert.equal(
    resolveClaimAssets({ assetsClaimed: "53781000000000000000000" }),
    53_781n * 10n ** 18n
  );
});

test("vault state takes precedence, including a zero payout after slashing", () => {
  assert.equal(resolveClaimAssets({ activeAssets: 0n, assetsClaimed: "50000" }), 0n);
});

test("missing authoritative data is unknown, not shares or zero", () => {
  assert.equal(resolveClaimAssets({}), undefined);
});
