'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const O = require('./odds.js');

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test('american <-> decimal', () => {
  close(O.americanToDecimal(150), 2.5);
  close(O.americanToDecimal(-110), 1 + 100 / 110);
  close(O.americanToDecimal(100), 2);
  close(O.americanToDecimal(-100), 2);
  assert.equal(O.decimalToAmerican(2.5), 150);
  assert.equal(O.decimalToAmerican(2), 100);
  assert.equal(O.decimalToAmerican(1 + 100 / 110), -110);
  assert.equal(O.decimalToAmerican(1.5), -200);
});

test('implied probability', () => {
  close(O.decimalToImplied(O.americanToDecimal(150)), 0.4);
  close(O.decimalToImplied(O.americanToDecimal(-110)), 0.523809, 1e-5);
  close(O.impliedToDecimal(0.25), 4);
});

test('fractional', () => {
  assert.equal(O.fractionalToDecimal(5, 2), 3.5);
  assert.deepEqual(O.decimalToFractional(3.5), [5, 2]);
  assert.deepEqual(O.decimalToFractional(2), [1, 1]);
  assert.equal(O.fmtFractional(O.decimalToFractional(1.5)), '1/2');
});

test('parseToDecimal', () => {
  close(O.parseToDecimal('+150', 'american'), 2.5);
  close(O.parseToDecimal('−110', 'american'), 1.909090909);
  close(O.parseToDecimal('2.5', 'decimal'), 2.5);
  assert.equal(O.parseToDecimal('5/2', 'fractional'), 3.5);
  assert.equal(O.parseToDecimal('evens', 'fractional'), 2);
  close(O.parseToDecimal('40%', 'implied'), 2.5);
  close(O.parseToDecimal('40', 'implied'), 2.5);
});

test('invalid input returns null', () => {
  for (const [t, f] of [['', 'american'], ['abc', 'american'], ['50', 'american'], ['0', 'american'],
    ['1', 'decimal'], ['0.5', 'decimal'], ['-2', 'decimal'], ['1/0', 'fractional'], ['0/5', 'fractional'],
    ['x', 'fractional'], ['0', 'implied'], ['100', 'implied'], ['120%', 'implied'], [null, 'american']]) {
    assert.equal(O.parseToDecimal(t, f), null, `${t} ${f}`);
  }
  assert.equal(O.americanToDecimal(NaN), null);
  assert.equal(O.americanToDecimal(Infinity), null);
  assert.equal(O.americanToDecimal(99), null);
  assert.equal(O.decimalToAmerican(1), null);
  assert.equal(O.decimalToImplied(0.9), null);
  assert.equal(O.impliedToDecimal(1), null);
  assert.equal(O.fractionalToDecimal(-1, 2), null);
  assert.equal(O.decimalToFractional(1), null);
  assert.equal(O.describe(null), null);
});

test('removeVig 2-way -110/-110', () => {
  const r = O.removeVig([O.americanToDecimal(-110), O.americanToDecimal(-110)]);
  close(r.implied[0], 0.5238095, 1e-6);
  close(r.overround, 0.0476190, 1e-6);
  close(r.fair[0], 0.5);
  close(r.fair[1], 0.5);
  assert.equal(r.fairAmerican[0], 100);
});

test('removeVig 3-way soccer +120/+230/+240', () => {
  const r = O.removeVig([2.2, 3.3, 3.4]);
  const total = 1 / 2.2 + 1 / 3.3 + 1 / 3.4;
  close(r.overround, total - 1);
  close(r.fair.reduce((a, b) => a + b, 0), 1);
  close(r.fair[0], 1 / 2.2 / total);
  assert.equal(r.fair.length, 3);
});

test('removeVig 4-way and power method', () => {
  const r = O.removeVig([3.8, 3.8, 3.8, 3.8]);
  r.fair.forEach(p => close(p, 0.25));
  const pw = O.removeVig([1.5, 2.8, 8], 'power');
  close(pw.fair.reduce((a, b) => a + b, 0), 1, 1e-9);
  // power method shades the favourite less than proportional
  const pr = O.removeVig([1.5, 2.8, 8]);
  assert.ok(pw.fair[0] > pr.fair[0] - 0.02);
  assert.ok(pw.fair[2] < pr.fair[2]);
});

test('removeVig invalid', () => {
  assert.equal(O.removeVig([2]), null);
  assert.equal(O.removeVig([2, 1]), null);
  assert.equal(O.removeVig([2, null]), null);
  assert.equal(O.removeVig('x'), null);
  assert.equal(O.removeVig([2, 2], 'bogus'), null);
});

test('expected value', () => {
  // 100 at +150 with 45%: 0.45*150 - 0.55*100 = 12.5
  close(O.expectedValue(100, 2.5, 0.45), 12.5);
  // -110 at 50%: -4.545
  close(O.expectedValue(100, O.americanToDecimal(-110), 0.5), -4.5454545, 1e-5);
  assert.equal(O.expectedValue(-5, 2, 0.5), null);
  assert.equal(O.expectedValue(100, 2, 1.2), null);
  assert.equal(O.expectedValue(100, 1, 0.5), null);
});

test('kelly', () => {
  const d = O.americanToDecimal(-110);
  close(O.kellyFraction(d, 0.55), 0.055, 1e-9);
  close(O.kellyFraction(d, 0.55, 0.25), 0.01375, 1e-9);
  close(O.kellyFraction(d, 0.55, 0.5), 0.0275, 1e-9);
  assert.equal(O.kellyFraction(d, 0.5), 0); // negative edge never negative
  assert.equal(O.kellyFraction(d, 0.2), 0);
  assert.equal(O.kellyFraction(d, 0.55, -1), null);
  close(O.kellyStake(1000, d, 0.55, 0.25), 13.75, 1e-9);
  assert.equal(O.kellyStake(1000, d, 0.4), 0);
  assert.equal(O.kellyStake(-1, d, 0.55), null);
  assert.equal(O.kellyFraction(d, 0), null);
  // +150 at 45%: (1.5*.45-.55)/1.5 = 0.08333
  close(O.kellyFraction(2.5, 0.45), 0.083333, 1e-5);
});

test('edge and roi', () => {
  close(O.edgeVsFair(0.55, 0.5), 0.05);
  close(O.edgeVsFair(0.45, 0.5), -0.05);
  assert.equal(O.edgeVsFair(0, 0.5), null);
  close(O.roi(2.5, 0.45), 0.125);
});

test('formatAmerican uses true minus', () => {
  assert.equal(O.formatAmerican(-110), '−110');
  assert.equal(O.formatAmerican(150), '+150');
  assert.equal(O.formatAmerican(null), null);
});

test('parseOdds auto-detects format', () => {
  close(O.parseOdds('-110'), 1.909090909);
  close(O.parseOdds('\u2212110'), 1.909090909);
  close(O.parseOdds('+150'), 2.5);
  close(O.parseOdds('150'), 2.5);
  close(O.parseOdds('1.91'), 1.91);
  close(O.parseOdds('2'), 2);
  close(O.parseOdds('5/2'), 3.5);
  assert.equal(O.parseOdds('evens'), 2);
  assert.equal(O.parseOdds('+50'), null);
  assert.equal(O.parseOdds('1'), null);
  assert.equal(O.parseOdds(''), null);
  assert.equal(O.parseOdds('abc'), null);
});

test('hold (margin as share of total)', () => {
  const r = O.removeVig([O.americanToDecimal(-110), O.americanToDecimal(-110)]);
  close(r.hold, 0.0454545, 1e-6);
});
