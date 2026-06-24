import { describe, it, expect } from "vitest"
import { formatCurrency, formatDate, getMonthName, cn } from "@/lib/utils"

describe("formatCurrency", () => {
  it("formatea COP correctamente", () => {
    const result = formatCurrency(1500000)
    expect(result).toContain("1.500.000")
  })

  it("formatea cero", () => {
    const result = formatCurrency(0)
    expect(result).toContain("0")
  })

  it("formatea millones", () => {
    const result = formatCurrency(5450000)
    expect(result).toContain("5.450.000")
  })
})

describe("formatDate", () => {
  it("retorna string de fecha", () => {
    const result = formatDate("2026-06-01")
    expect(typeof result).toBe("string")
  })

  it("acepta Date object", () => {
    const result = formatDate(new Date("2026-01-15"))
    expect(typeof result).toBe("string")
  })
})

describe("getMonthName", () => {
  it("retorna enero para 1", () => {
    expect(getMonthName(1)).toBe("Enero")
  })

  it("retorna diciembre para 12", () => {
    expect(getMonthName(12)).toBe("Diciembre")
  })

  it("retorna vacío para índice inválido", () => {
    expect(getMonthName(0)).toBe("")
    expect(getMonthName(13)).toBe("")
  })
})

describe("cn", () => {
  it("combina clases", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("filtra falsy", () => {
    expect(cn("a", false, "b", undefined, "c")).toBe("a b c")
  })
})
