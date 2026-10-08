# Odds Toolkit

A single-page betting-math helper in the Fluid Glass style. No dependencies, no backend, state lives in memory only.

- **Convert**: type odds in any one format (American, decimal, fractional, implied %) and see the others live, plus profit and stake-to-win on $100.
- **No-vig**: 2 to 4 outcomes with names and odds. Shows implied and fair probability, fair odds, overround and hold. Proportional method, or power method.
- **EV & Kelly**: odds, your win probability, bankroll and stake. Gives EV, edge vs price, edge vs no-vig fair (optional other-side odds) and a recommended stake at full, 1/2 or 1/4 Kelly. Kelly is never negative.

Odds fields accept `-110`, `+150`, `1.91`, `5/2` or `evens`.

## Run

Open `index.html` directly, or from the repo root:

```
python3 -m http.server 8000
# then visit http://localhost:8000/tools/odds-toolkit/
```

## Tests

Node 18+, built-in test runner only:

```
node --test tools/odds-toolkit/odds.test.js
```

## Files

- `index.html`: UI (uses `../../shared/glass.css`)
- `odds.js`: pure logic, works as `window.Odds` in the browser and `require()` in Node

## Notes

- Overround is total implied probability minus 1 (-110/-110 gives 4.76%). Hold is the bookmaker's share of the total (4.55%).
- Probabilities are your own estimates; the tool does not source lines or models.
