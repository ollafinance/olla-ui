interface ClaimAssetSources {
  activeAssets?: bigint;
  assetsClaimed?: string | null;
}

// RedeemRequest's indexed assets_expected may contain shares in older indexers.
// Never use it as AZTEC, or revalue a locked withdrawal at today's exchange rate.
export function resolveClaimAssets({ activeAssets, assetsClaimed }: ClaimAssetSources) {
  return activeAssets ?? (assetsClaimed != null ? BigInt(assetsClaimed) : undefined);
}
