const PALETTE = [
  { bg: '#ECE5FB', fg: '#5A3E9D' },
  { bg: '#FDF2F8', fg: '#9D174D' },
  { bg: '#ECFDF5', fg: '#065F46' },
  { bg: '#FFFBEB', fg: '#92400E' },
  { bg: '#EFF6FF', fg: '#1D4ED8' },
  { bg: '#FEF2F2', fg: '#991B1B' },
]

export function avatarColorFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}
