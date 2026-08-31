# Monster Beverage, tech stocks, and the geography of demand

An evidence-backed interactive report comparing Monster Beverage's adjusted 25-year investment performance with Apple, Nvidia, Microsoft, the Nasdaq-100 ETF, and the S&P 500 ETF. It also tests whether Monster retail share or U.S. search interest is higher in areas with more technology employment.

## Main finding

Monster was the strongest investment in the selected August 2001–August 2026 window, but the geographic evidence does not support a tech-hub consumption story. Monster Energy Company retail value share across 14 European markets is negatively associated with ICT-specialist employment, and the separate U.S. state search-interest test is negative as well.

## Build

```sh
npm install
npm run dev
npm run build:pages
```

The PDF is generated from the same local data module:

```sh
python3 scripts/build_report.py
```

The published static site is built into `dist/client`. Sources and methodological caveats are included in both the site and PDF.
