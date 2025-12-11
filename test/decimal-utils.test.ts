import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js'
import {
  calculateLoanPayment,
  calculateRoi,
  evaluateExpression,
  formatCurrency,
  safeDivide
} from '../src/lib/decimal-utils'

describe('calculateLoanPayment', () => {
  it('computes monthly payment with interest', () => {
    const result = calculateLoanPayment(250000, 4, 30)
    expect(result.monthlyPayment.toNumber()).toBeCloseTo(1193.54, 2)
    expect(result.totalInterest.toNumber()).toBeCloseTo(179674.4, 1)
  })

  it('supports zero interest gracefully', () => {
    const result = calculateLoanPayment(1200, 0, 1)
    expect(result.monthlyPayment.toNumber()).toBeCloseTo(100, 2)
    expect(result.totalInterest.toNumber()).toBe(0)
  })
})

describe('evaluateExpression', () => {
  it('evaluates simple expressions respecting precedence', () => {
    const value = evaluateExpression('2 + 3 * 4')
    expect(value?.toNumber()).toBe(14)
  })

  it('returns null on invalid input', () => {
    expect(evaluateExpression('abc + 1')).toBeNull()
  })
})

describe('safeDivide', () => {
  it('divides numbers safely', () => {
    const result = safeDivide(new Decimal(10), new Decimal(4))
    expect(result?.toNumber()).toBeCloseTo(2.5, 2)
  })

  it('returns null when dividing by zero', () => {
    expect(safeDivide(new Decimal(1), new Decimal(0))).toBeNull()
  })
})

describe('formatCurrency', () => {
  it('formats currency with rounding', () => {
    const formatted = formatCurrency(1234.567)
    expect(formatted).toBe('$1,234.57')
  })
})

describe('calculateRoi', () => {
  it('computes roi and annualized return', () => {
    const { totalReturn, annualized } = calculateRoi(10000, 15000, 3)
    expect(totalReturn.toNumber()).toBeCloseTo(0.5, 2)
    expect(annualized?.toNumber()).toBeCloseTo(0.1447, 3)
  })
})

