// 4x5 colour matrices (the format SVG feColorMatrix uses), stored as flat
// 20-number arrays, row by row: R', G', B', A' = row · [R, G, B, A, 1].

// Luminance weights (Rec. 709)
const LR = 0.2126
const LG = 0.7152
const LB = 0.0722

export const IDENTITY = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]

// 0 = greyscale, 1 = unchanged, >1 = more saturated
export function saturation(s) {
  const r = LR * (1 - s)
  const g = LG * (1 - s)
  const b = LB * (1 - s)
  return [r + s, g, b, 0, 0, r, g + s, b, 0, 0, r, g, b + s, 0, 0, 0, 0, 0, 1, 0]
}

// Stretches tones around mid-grey: <1 flatter, >1 punchier
export function contrast(c) {
  const o = 0.5 * (1 - c)
  return [c, 0, 0, 0, o, 0, c, 0, 0, o, 0, 0, c, 0, o, 0, 0, 0, 1, 0]
}

// Per-channel multiply, then add (tints, lifted blacks)
export function channels([rm, gm, bm], [ro, go, bo] = [0, 0, 0]) {
  return [rm, 0, 0, 0, ro, 0, gm, 0, 0, go, 0, 0, bm, 0, bo, 0, 0, 0, 1, 0]
}

export const SEPIA = [
  0.393, 0.769, 0.189, 0, 0,
  0.349, 0.686, 0.168, 0, 0,
  0.272, 0.534, 0.131, 0, 0,
  0, 0, 0, 1, 0,
]

// Blend between the identity (t = 0) and a matrix (t = 1)
export function mix(matrix, t) {
  return matrix.map((value, i) => IDENTITY[i] + (value - IDENTITY[i]) * t)
}

// apply(a, b): the matrix for "a, then b"
function apply(a, b) {
  const out = []
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      let sum = col === 4 ? b[row * 5 + 4] : 0
      for (let k = 0; k < 4; k++) sum += b[row * 5 + k] * a[k * 5 + col]
      out.push(sum)
    }
  }
  return out
}

// Combine several matrices, applied left to right
export function pipeline(...matrices) {
  return matrices.reduce(apply, IDENTITY)
}

export function toSvgValues(matrix) {
  return matrix.map((value) => Number(value.toFixed(4))).join(' ')
}
