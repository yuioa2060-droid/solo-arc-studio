// Trim the actual path geometry instead of masking its zero-area bounding box.
// Quadratic subdivision keeps a curve intact throughout a progressive reveal.
export function progressivePath(points, progress) {
  const p = Math.max(0, Math.min(1, progress));
  if (!p) return '';
  const [a, b, c] = points;
  const mix = (u, v, q) => u.map((n, i) => n + (v[i] - n) * q);
  if (!c) return `M${a}L${mix(a, b, p)}`;
  const control = mix(a, b, p);
  const end = mix(control, mix(b, c, p), p);
  return `M${a}Q${control} ${end}`;
}
