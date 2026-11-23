// Money is stored in pesewas (GH₵ 1.00 = 100 pesewas).
// These helpers convert between the two.

// 135000 → "GH₵ 1,350.00"
export function formatCedis(pesewas: number) {
  const cedis = pesewas / 100;
  return `GH₵ ${cedis.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// 1350 → 135000   (used when an admin types a price in cedis)
export function cedisToPesewas(cedis: number) {
  return Math.round(cedis * 100);
}
