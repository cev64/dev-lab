/* Odds Toolkit: pure logic. Works as <script src> (window.Odds) and require() in Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Odds = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var isNum = function (x) { return typeof x === 'number' && isFinite(x); };

  /* ---- conversions (decimal odds are the pivot) ---- */

  function americanToDecimal(a) {
    if (!isNum(a) || Math.abs(a) < 100) return null;
    return a > 0 ? 1 + a / 100 : 1 + 100 / -a;
  }

  function decimalToAmerican(d) {
    if (!isNum(d) || d <= 1) return null;
    if (d === 2) return 100;
    return d > 2 ? Math.round((d - 1) * 100) : Math.round(-100 / (d - 1));
  }

  function decimalToImplied(d) {
    return isNum(d) && d > 1 ? 1 / d : null;
  }

  function impliedToDecimal(p) {
    return isNum(p) && p > 0 && p < 1 ? 1 / p : null;
  }

  function fractionalToDecimal(n, d) {
    if (!isNum(n) || !isNum(d) || n <= 0 || d <= 0) return null;
    return 1 + n / d;
  }

  /** Nearest simple fraction [num, den] for decimal odds, or null. */
  function decimalToFractional(dec, maxDen) {
    if (!isNum(dec) || dec <= 1) return null;
    maxDen = maxDen || 100;
    var x = dec - 1, best = null, bestErr = Infinity;
    for (var den = 1; den <= maxDen; den++) {
      var num = Math.round(x * den);
      if (num < 1) continue;
      var err = Math.abs(x - num / den);
      if (err < bestErr - 1e-12) { best = [num, den]; bestErr = err; }
      if (err < 1e-9) break;
    }
    return best;
  }

  function fmtFractional(f) { return f ? f[0] + '/' + f[1] : null; }

  /** Parse text in a given format ('american'|'decimal'|'fractional'|'implied') to decimal odds. */
  function parseToDecimal(text, format) {
    if (text == null) return null;
    var s = String(text).trim().replace(/−/g, '-').replace(/,/g, '');
    if (!s) return null;
    var m;
    switch (format) {
      case 'american':
        if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return null;
        return americanToDecimal(parseFloat(s));
      case 'decimal':
        if (!/^\d+(\.\d+)?$/.test(s)) return null;
        return parseFloat(s) > 1 ? parseFloat(s) : null;
      case 'fractional':
        if (/^(evens?|ev)$/i.test(s)) return 2;
        m = /^(\d+(?:\.\d+)?)\s*[\/-]\s*(\d+(?:\.\d+)?)$/.exec(s);
        return m ? fractionalToDecimal(parseFloat(m[1]), parseFloat(m[2])) : null;
      case 'implied':
        m = /^(\d+(?:\.\d+)?)\s*%?$/.exec(s);
        return m ? impliedToDecimal(parseFloat(m[1]) / 100) : null;
    }
    return null;
  }

  /** Auto-detect format: "5/2" fractional, "+150"/"-110"/"150" american, "2.5"/"2" decimal. Returns decimal odds or null. */
  function parseOdds(text) {
    if (text == null) return null;
    var s = String(text).trim().replace(/\u2212/g, '-');
    if (!s) return null;
    if (/^(evens?|ev)$/i.test(s) || s.indexOf('/') >= 0) return parseToDecimal(s, 'fractional');
    if (/^[+-]/.test(s)) return parseToDecimal(s, 'american');
    if (s.indexOf('.') >= 0) return parseToDecimal(s, 'decimal');
    return Math.abs(parseFloat(s)) >= 100 ? parseToDecimal(s, 'american') : parseToDecimal(s, 'decimal');
  }

  /** All formats from decimal odds. */
  function describe(dec) {
    if (!isNum(dec) || dec <= 1) return null;
    return {
      decimal: dec,
      american: decimalToAmerican(dec),
      fractional: fmtFractional(decimalToFractional(dec)),
      implied: 1 / dec
    };
  }

  function formatAmerican(a) {
    if (a == null) return null;
    return a > 0 ? '+' + a : '−' + Math.abs(a);
  }

  /* ---- vig removal ---- */

  /**
   * decimals: array (>=2) of decimal odds. method: 'proportional' (default) | 'power'.
   * Returns { implied, fair, fairDecimal, fairAmerican, overround, method } or null.
   * overround = sum(implied) - 1.
   */
  function removeVig(decimals, method) {
    if (!Array.isArray(decimals) || decimals.length < 2) return null;
    var implied = decimals.map(decimalToImplied);
    if (implied.some(function (p) { return p === null; })) return null;
    var total = implied.reduce(function (a, b) { return a + b; }, 0);
    var fair;
    method = method || 'proportional';
    if (method === 'power') {
      // find k so that sum(p_i^k) = 1 (k >= 1 when total >= 1)
      var lo = 0.01, hi = 50;
      for (var i = 0; i < 200; i++) {
        var mid = (lo + hi) / 2;
        var s = implied.reduce(function (a, p) { return a + Math.pow(p, mid); }, 0);
        if (s > 1) lo = mid; else hi = mid;
      }
      var k = (lo + hi) / 2;
      fair = implied.map(function (p) { return Math.pow(p, k); });
    } else if (method === 'proportional') {
      fair = implied.map(function (p) { return p / total; });
    } else return null;
    var fairDecimal = fair.map(function (p) { return 1 / p; });
    return {
      method: method,
      implied: implied,
      fair: fair,
      fairDecimal: fairDecimal,
      fairAmerican: fairDecimal.map(decimalToAmerican),
      overround: total - 1,
      hold: 1 - 1 / total
    };
  }

  /* ---- EV, Kelly, edge ---- */

  function validBet(dec, p) { return isNum(dec) && dec > 1 && isNum(p) && p > 0 && p < 1; }

  /** Expected profit of a bet: p * stake * (dec - 1) - (1 - p) * stake. */
  function expectedValue(stake, dec, p) {
    if (!isNum(stake) || stake < 0 || !validBet(dec, p)) return null;
    return p * stake * (dec - 1) - (1 - p) * stake;
  }

  /** Full Kelly fraction of bankroll, clamped to >= 0. */
  function kellyFraction(dec, p, multiplier) {
    if (!validBet(dec, p)) return null;
    var m = multiplier == null ? 1 : multiplier;
    if (!isNum(m) || m < 0) return null;
    var b = dec - 1;
    return Math.max(0, (b * p - (1 - p)) / b) * m;
  }

  function kellyStake(bankroll, dec, p, multiplier) {
    var f = kellyFraction(dec, p, multiplier);
    if (f === null || !isNum(bankroll) || bankroll < 0) return null;
    return bankroll * f;
  }

  /** Edge in probability points: your probability minus the no-vig fair probability. */
  function edgeVsFair(p, fairProb) {
    if (!isNum(p) || p <= 0 || p >= 1 || !isNum(fairProb) || fairProb <= 0 || fairProb >= 1) return null;
    return p - fairProb;
  }

  /** Expected return per 1 staked at this price: p * dec - 1. */
  function roi(dec, p) {
    return validBet(dec, p) ? p * dec - 1 : null;
  }

  return {
    americanToDecimal: americanToDecimal,
    decimalToAmerican: decimalToAmerican,
    decimalToImplied: decimalToImplied,
    impliedToDecimal: impliedToDecimal,
    fractionalToDecimal: fractionalToDecimal,
    decimalToFractional: decimalToFractional,
    fmtFractional: fmtFractional,
    parseToDecimal: parseToDecimal,
    parseOdds: parseOdds,
    describe: describe,
    formatAmerican: formatAmerican,
    removeVig: removeVig,
    expectedValue: expectedValue,
    kellyFraction: kellyFraction,
    kellyStake: kellyStake,
    edgeVsFair: edgeVsFair,
    roi: roi
  };
});
