import assert from "node:assert/strict"
import { test } from "node:test"
import { oklch, toSrgb255, contrast, inSrgbGamut, fitGamut, format } from "./color.ts"

test("oklch 转换与 WCAG 对比度", () => {
  // 已知颜色：白、黑、#FF0000 ≈ oklch(0.628 0.2577 29.23)、#0000FF ≈ oklch(0.452 0.3132 264.05)
  assert.deepEqual(toSrgb255(oklch(1)), [255, 255, 255])
  assert.deepEqual(toSrgb255(oklch(0)), [0, 0, 0])
  assert.deepEqual(toSrgb255(oklch(0.62796, 0.25768, 29.234)), [255, 0, 0])
  assert.deepEqual(toSrgb255(oklch(0.45201, 0.31321, 264.052)), [0, 0, 255])
  // 对比度：黑白 21:1；#777777 ≈ oklch(0.5693 0 0) 对白 ≈ 4.48
  assert.equal(contrast(oklch(0), oklch(1)).toFixed(1), "21.0")
  assert.equal(contrast(oklch(0.5693), oklch(1)).toFixed(2), "4.48")
  // 色域
  assert.ok(!inSrgbGamut(oklch(0.55, 0.4, 150)))
  assert.ok(inSrgbGamut(fitGamut(oklch(0.55, 0.4, 150))))
  assert.equal(format(oklch(0.5, 0.1, 200, 0.3)), "oklch(0.5 0.1 200 / 30%)")
})
