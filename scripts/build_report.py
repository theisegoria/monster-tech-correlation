#!/usr/bin/env python3
"""Build the vector PDF companion to the Monster × Tech interactive report."""

from __future__ import annotations

import math
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "lib" / "analysis-data.ts"
DEFAULT_OUTPUT = ROOT / "public" / "monster-energy-tech-correlation.pdf"

W, H = A4
M = 44
INK = colors.HexColor("#28251F")
MUTED = colors.HexColor("#6B685F")
GREEN = colors.HexColor("#5F9E2F")
GREEN_DARK = colors.HexColor("#34721F")
GREEN_LIGHT = colors.HexColor("#DDEBCE")
BLUE = colors.HexColor("#3D6F99")
ORANGE = colors.HexColor("#C96F43")
PURPLE = colors.HexColor("#8A67A5")
TAN = colors.HexColor("#EDE6D8")
PAPER = colors.HexColor("#FBF8F0")
GRID = colors.HexColor("#D8D1C4")
WHITE = colors.white


def load_data() -> dict[str, list[dict[str, float | int | str]]]:
    text = DATA_FILE.read_text(encoding="utf-8")

    stock_rows = []
    stock_pattern = re.compile(
        r"\{ year: (\d+), monster: ([\d.]+), apple: ([\d.]+), nvidia: ([\d.]+), "
        r"microsoft: ([\d.]+), qqq: ([\d.]+), spy: ([\d.]+) \}"
    )
    for match in stock_pattern.finditer(text):
        year, *values = match.groups()
        stock_rows.append(
            dict(zip(
                ["year", "monster", "apple", "nvidia", "microsoft", "qqq", "spy"],
                [int(year), *map(float, values)],
            ))
        )

    region_rows = [
        {"region": region, "sales": float(sales), "share": float(share)}
        for region, sales, share in re.findall(
            r"\{ region: '([^']+)', sales: ([\d.]+), share: ([\d.]+) \}", text
        )
    ]

    country_rows = [
        {
            "country": country,
            "code": code,
            "monsterShare": float(monster),
            "ictEmployment": float(ict),
            "ictExports": float(exports),
            "exportYear": int(year),
        }
        for country, code, monster, ict, exports, year in re.findall(
            r"\{ country: '([^']+)', code: '([^']+)', monsterShare: ([\d.]+), "
            r"ictEmployment: ([\d.]+),(?: ictEmploymentYear: \d+,)? ictExports: ([\d.]+), exportYear: (\d+) \}",
            text,
        )
    ]

    state_rows = [
        {"state": state, "interest": int(interest), "tech": float(tech)}
        for state, interest, tech in re.findall(
            r"\{ state: '([^']+)', interest: (\d+), tech: ([\d.]+) \}", text
        )
    ]

    if not (len(stock_rows) == 26 and len(region_rows) == 4 and len(country_rows) == 14 and len(state_rows) == 51):
        raise RuntimeError(
            f"Unexpected parsed row counts: stocks={len(stock_rows)}, regions={len(region_rows)}, "
            f"countries={len(country_rows)}, states={len(state_rows)}"
        )
    return {"stocks": stock_rows, "regions": region_rows, "countries": country_rows, "states": state_rows}


def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if pdfmetrics.stringWidth(trial, font, size) <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(c: canvas.Canvas, text: str, x: float, y: float, width: float, *,
                 font: str = "Helvetica", size: float = 10.5, leading: float = 15,
                 color: colors.Color = MUTED) -> float:
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap(text, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def page_base(c: canvas.Canvas, number: int, kicker: str) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setStrokeColor(GRID)
    c.setLineWidth(0.5)
    c.line(M, H - 39, W - M, H - 39)
    c.setFillColor(GREEN_DARK)
    c.setFont("Helvetica-Bold", 7.8)
    c.drawString(M, H - 29, "MONSTER × TECH")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(W - M, H - 29, kicker.upper())
    c.drawString(M, 24, "Evidence brief · 31 August 2026")
    c.drawRightString(W - M, 24, f"{number} / 6")


def title(c: canvas.Canvas, number: str, heading: str, subheading: str, y: float = H - 80) -> float:
    c.setFillColor(GREEN_DARK)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M, y, number)
    y -= 29
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(M, y, heading)
    y -= 22
    return draw_wrapped(c, subheading, M, y, W - 2 * M, size=9.5, leading=13.5)


def metric(c: canvas.Canvas, x: float, y: float, w: float, label: str, value: str, note: str) -> None:
    c.setFillColor(WHITE)
    c.roundRect(x, y, w, 88, 5, stroke=0, fill=1)
    c.setStrokeColor(GRID)
    c.roundRect(x, y, w, 88, 5, stroke=1, fill=0)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(x + 12, y + 68, label.upper())
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(x + 12, y + 40, value)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.3)
    c.drawString(x + 12, y + 18, note)


def draw_log_stock_chart(c: canvas.Canvas, rows: list[dict], x: float, y: float, w: float, h: float) -> None:
    keys = ["monster", "apple", "nvidia", "microsoft", "qqq", "spy"]
    labels = ["MNST", "AAPL", "NVDA", "MSFT", "QQQ", "SPY"]
    palette = [GREEN_DARK, ORANGE, PURPLE, BLUE, colors.HexColor("#97784D"), MUTED]
    y_min, y_max = math.log10(200), math.log10(3_000_000)
    x0, y0 = x + 50, y + 34
    pw, ph = w - 60, h - 54

    c.setStrokeColor(GRID)
    c.setLineWidth(0.5)
    for tick in [250, 1_000, 10_000, 100_000, 1_000_000, 3_000_000]:
        yy = y0 + (math.log10(tick) - y_min) / (y_max - y_min) * ph
        c.line(x0, yy, x0 + pw, yy)
        label = f"${tick // 1_000_000}m" if tick >= 1_000_000 else (f"${tick // 1_000}k" if tick >= 1_000 else f"${tick}")
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 6.5)
        c.drawRightString(x0 - 7, yy - 2, label)
    for year in [2001, 2006, 2011, 2016, 2021, 2026]:
        xx = x0 + (year - 2001) / 25 * pw
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 6.5)
        c.drawCentredString(xx, y0 - 14, str(year))

    for key, color in zip(keys, palette):
        c.setStrokeColor(color)
        c.setLineWidth(2.2 if key == "monster" else 1.25)
        path = c.beginPath()
        for i, row in enumerate(rows):
            xx = x0 + (int(row["year"]) - 2001) / 25 * pw
            yy = y0 + (math.log10(float(row[key])) - y_min) / (y_max - y_min) * ph
            path.moveTo(xx, yy) if i == 0 else path.lineTo(xx, yy)
        c.drawPath(path, stroke=1, fill=0)

    legend_y = y + h - 8
    cursor = x0
    for label, color in zip(labels, palette):
        c.setStrokeColor(color)
        c.setLineWidth(2)
        c.line(cursor, legend_y, cursor + 12, legend_y)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 6.8)
        c.drawString(cursor + 16, legend_y - 2, label)
        cursor += 54


def draw_horizontal_bars(c: canvas.Canvas, rows: list[dict], x: float, y: float, w: float, h: float) -> None:
    max_value = max(float(row["sales"]) for row in rows)
    bar_h = 32
    gap = 18
    for index, row in enumerate(rows):
        yy = y + h - (index + 1) * (bar_h + gap)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 8.2)
        c.drawString(x, yy + bar_h + 4, str(row["region"]))
        c.setFillColor(TAN)
        c.roundRect(x, yy, w, bar_h, 3, stroke=0, fill=1)
        width = w * float(row["sales"]) / max_value
        c.setFillColor(GREEN_DARK if index == 0 else GREEN)
        c.roundRect(x, yy, width, bar_h, 3, stroke=0, fill=1)
        c.setFillColor(WHITE if width > 95 else INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x + 8, yy + 11, f"${float(row['sales']):.2f}bn")
        c.setFillColor(INK)
        c.drawRightString(x + w, yy + 11, f"{float(row['share']):.1f}%")


def draw_scatter(c: canvas.Canvas, rows: list[dict], x_key: str, y_key: str,
                 x_domain: tuple[float, float], y_domain: tuple[float, float],
                 slope: float, intercept: float, x: float, y: float, w: float, h: float,
                 label_key: str, x_label: str, y_label: str, label_codes: bool = False) -> None:
    x0, y0 = x + 48, y + 38
    pw, ph = w - 62, h - 58
    xmin, xmax = x_domain
    ymin, ymax = y_domain

    c.setStrokeColor(GRID)
    c.setLineWidth(0.5)
    for fraction in [0, .25, .5, .75, 1]:
        xx = x0 + fraction * pw
        yy = y0 + fraction * ph
        c.line(xx, y0, xx, y0 + ph)
        c.line(x0, yy, x0 + pw, yy)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 6.5)
        c.drawCentredString(xx, y0 - 12, f"{xmin + fraction * (xmax - xmin):.1f}")
        c.drawRightString(x0 - 7, yy - 2, f"{ymin + fraction * (ymax - ymin):.0f}")

    def sx(value: float) -> float:
        return x0 + (value - xmin) / (xmax - xmin) * pw

    def sy(value: float) -> float:
        return y0 + (value - ymin) / (ymax - ymin) * ph

    c.setStrokeColor(MUTED)
    c.setDash(5, 4)
    c.setLineWidth(1.1)
    c.line(sx(xmin), sy(intercept + slope * xmin), sx(xmax), sy(intercept + slope * xmax))
    c.setDash()

    c.setFillColor(GREEN_DARK)
    for row in rows:
        xx, yy = sx(float(row[x_key])), sy(float(row[y_key]))
        c.circle(xx, yy, 3.4, stroke=0, fill=1)
        if label_codes:
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 5.6)
            c.drawString(xx + 4, yy + 2, str(row[label_key]))
            c.setFillColor(GREEN_DARK)

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawCentredString(x0 + pw / 2, y + 5, x_label)
    c.saveState()
    c.translate(x + 8, y0 + ph / 2)
    c.rotate(90)
    c.drawCentredString(0, 0, y_label)
    c.restoreState()


def source_line(c: canvas.Canvas, label: str, url: str, y: float) -> float:
    c.setFont("Helvetica-Bold", 8.2)
    c.setFillColor(INK)
    c.drawString(M + 8, y, label)
    c.setFont("Helvetica", 6.8)
    c.setFillColor(BLUE)
    short = url if len(url) < 91 else url[:88] + "…"
    c.drawString(M + 8, y - 11, short)
    c.linkURL(url, (M + 8, y - 14, W - M - 8, y + 8), relative=0)
    return y - 31


def build(output: Path) -> None:
    data = load_data()
    output.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output), pagesize=A4, pageCompression=1)
    c.setTitle("Monster Beverage, Tech Stocks & the Geography of Demand")
    c.setAuthor("OpenAI Codex for Benjamin Haire")
    c.setSubject("25-year return comparison and geographic sales-correlation analysis")

    # Page 1 — answer first
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(GREEN_DARK)
    c.rect(0, H - 18, W, 18, stroke=0, fill=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(GREEN_DARK)
    c.drawString(M, H - 58, "MONSTER × TECH · EVIDENCE BRIEF")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 35)
    c.drawString(M, H - 119, "Monster drank the")
    c.drawString(M, H - 158, "tech sector’s lunch.")
    draw_wrapped(
        c,
        "A $1,000 Monster Beverage investment grew to about $2.32 million over the 25 years to 28 August 2026. But country sales and U.S. demand geography do not support a tech-hub consumption story.",
        M,
        H - 195,
        W - 2 * M,
        size=12,
        leading=18,
        color=MUTED,
    )
    card_w = (W - 2 * M - 20) / 3
    metric(c, M, H - 370, card_w, "MNST ending value", "$2.32m", "$1,000 invested")
    metric(c, M + card_w + 10, H - 370, card_w, "MNST annualised", "36.3%", "25-year CAGR")
    metric(c, M + 2 * (card_w + 10), H - 370, card_w, "Europe sales test", "r = −0.51", "vs ICT employment")
    c.setFillColor(GREEN_LIGHT)
    c.roundRect(M, H - 535, W - 2 * M, 115, 6, stroke=0, fill=1)
    c.setFillColor(GREEN_DARK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(M + 18, H - 450, "Bottom line")
    draw_wrapped(
        c,
        "Monster’s exceptional equity return behaves like a technology winner; its retail geography does not. Across 14 European markets, value share declines as ICT-workforce concentration rises. Across U.S. states, relative search interest also declines as tech employment rises. These are correlations, not individual-level drinking data.",
        M + 18,
        H - 474,
        W - 2 * M - 36,
        size=10.2,
        leading=15,
        color=INK,
    )
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(M, 54, "Prepared 31 August 2026 · Adjusted returns; public company filings; OECD, World Bank, Google Trends, CompTIA")
    c.showPage()

    # Page 2 — returns
    page_base(c, 2, "Long-run performance")
    title(c, "01", "Growth of a hypothetical $1,000", "Adjusted month-end closes, 31 August 2001 to 28 August 2026. Logarithmic vertical scale; fees, taxes, and inflation excluded.")
    draw_log_stock_chart(c, data["stocks"], M, 285, W - 2 * M, 390)
    table = [
        ("Monster Beverage", "MNST", "$2,318,884", "2,318.88×", "36.34%"),
        ("Apple", "AAPL", "$1,152,438", "1,152.44×", "32.58%"),
        ("Nvidia", "NVDA", "$673,092", "673.09×", "29.75%"),
        ("Microsoft", "MSFT", "$29,658", "29.66×", "14.52%"),
        ("Nasdaq-100 ETF", "QQQ", "$23,211", "23.21×", "13.40%"),
        ("S&P 500 ETF", "SPY", "$10,585", "10.59×", "9.90%"),
    ]
    yy = 255
    headers = [(M, "INVESTMENT"), (338, "ENDING VALUE"), (432, "MULTIPLE"), (W - M, "CAGR")]
    c.setFont("Helvetica-Bold", 6.8)
    c.setFillColor(MUTED)
    for xx, label in headers:
        (c.drawRightString if xx > 300 else c.drawString)(xx, yy, label)
    yy -= 18
    for name, ticker, ending, multiple, cagr in table:
        c.setStrokeColor(GRID)
        c.line(M, yy - 5, W - M, yy - 5)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 8.2)
        c.drawString(M, yy, name)
        c.setFont("Helvetica", 7)
        c.setFillColor(MUTED)
        c.drawString(M + 112, yy, ticker)
        c.setFillColor(INK)
        c.setFont("Helvetica", 8)
        c.drawRightString(338, yy, ending)
        c.drawRightString(432, yy, multiple)
        c.drawRightString(W - M, yy, cagr)
        yy -= 23
    c.showPage()

    # Page 3 — regions
    page_base(c, 3, "Where demand is largest")
    title(c, "02", "North America dominates audited sales", "Monster does not publish litres or cans by geography. The closest globally comparable public measure is FY2025 net sales for the broader Monster Energy Drinks segment.")
    draw_horizontal_bars(c, data["regions"], M, 360, W - 2 * M, 260)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(M, 330, "What the regional table can—and cannot—say")
    c.setFillColor(TAN)
    c.roundRect(M, 174, W - 2 * M, 132, 5, stroke=0, fill=1)
    draw_wrapped(
        c,
        "The U.S. and Canada generated $4.70bn, or 61.4%, of FY2025 Monster Energy Drinks segment net sales. EMEA contributed 22.2%; Latin America and the Caribbean 8.8%; Asia-Pacific and Oceania 7.6%.",
        M + 16,
        280,
        W - 2 * M - 32,
        size=10.2,
        leading=15,
        color=INK,
    )
    draw_wrapped(
        c,
        "Sales dollars are not litres: prices, product mix, exchange rates, channel coverage, and distributor timing differ. The evidence supports a largest-sales-market conclusion, not a per-capita consumption ranking.",
        M + 16,
        225,
        W - 2 * M - 32,
        size=9.2,
        leading=14,
        color=MUTED,
    )
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.4)
    c.drawString(M, 147, "Source: Monster Beverage 2025 Form 10-K. Segment includes Monster, Reign, Bang, and related energy brands.")
    c.showPage()

    # Page 4 — direct sales test
    page_base(c, 4, "Country sales-share test")
    title(c, "03", "Actual retail sales do not cluster in tech economies", "Latest 13-week NielsenIQ scanner periods ending March 2026. Consistent Monster Energy Company retail value share across 14 European markets, compared with OECD ICT-specialist employment.")
    draw_scatter(
        c, data["countries"], "ictEmployment", "monsterShare", (2, 8.2), (10, 45),
        -3.2113, 44.6746, M, 282, W - 2 * M, 360, "code",
        "ICT specialists as share of employment (%)", "MEC retail value share (%)", True,
    )
    metric(c, M, 160, 150, "Pearson", "r = −0.51", "linear association")
    metric(c, M + 160, 160, 150, "Rank correlation", "ρ = −0.44", "Spearman")
    metric(c, M + 320, 160, W - M - (M + 320), "Sample", "n = 14", "European markets")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(M, 132, "Independent export-based check")
    draw_wrapped(
        c,
        "Using World Bank ICT-service exports as a second tech-intensity measure gives r = −0.06—essentially no linear relationship. Ireland is an extreme export outlier; excluding it changes r to −0.58, still not positive.",
        M,
        114,
        W - 2 * M,
        size=8.7,
        leading=12.5,
        color=MUTED,
    )
    c.showPage()

    # Page 5 — U.S. proxy
    page_base(c, 5, "U.S. demand proxy")
    title(c, "04", "Monster interest rises away from tech-heavy states", "Google Trends relative interest for “Monster Energy,” 31 August 2025 to 30 August 2026, compared with CompTIA’s technology-employment share. Search interest is not sales or consumption.")
    draw_scatter(
        c, data["states"], "tech", "interest", (2, 10), (10, 105),
        -2.3126, 42.4459, M, 282, W - 2 * M, 360, "state",
        "Technology employment share (%)", "Google Trends index", False,
    )
    metric(c, M, 160, 150, "Pearson", "r = −0.37", "all 50 states + D.C.")
    metric(c, M + 160, 160, 150, "Spearman", "ρ = −0.44", "rank association")
    metric(c, M + 320, 160, W - M - (M + 320), "Without Wyoming", "r = −0.39", "outlier check")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(M, 128, "Highest relative search interest")
    top = sorted(data["states"], key=lambda row: int(row["interest"]), reverse=True)[:5]
    c.setFont("Helvetica", 8.4)
    c.setFillColor(MUTED)
    c.drawString(M, 108, "   ·   ".join(f"{row['state']} {row['interest']}" for row in top))
    c.showPage()

    # Page 6 — method and sources
    page_base(c, 6, "Method, limitations & sources")
    title(c, "05", "What the evidence supports", "The boundaries below are part of the result: company sales, retail scanner share, online search interest, and individual consumption are related concepts, but they are not interchangeable.")
    boxes = [
        ("Returns", "Yahoo Finance adjusted closes at the August 2001 and August 2026 endpoints, with annual August observations for the chart. Split and dividend adjustments are included; taxes, fees, and inflation are not."),
        ("Direct sales test", "NielsenIQ country tables report value share in measured retail channels. They do not identify purchasers or litres. Great Britain’s OECD ICT-workforce observation is 2019; the other employment figures are 2023."),
        ("U.S. proxy test", "Google Trends normalises interest within each region; 100 is the strongest relative interest, not an absolute search count. Age, income, rurality, retail mix, gaming culture, and sampling may confound the relationship."),
    ]
    yy = 640
    for heading, body in boxes:
        c.setFillColor(TAN)
        c.roundRect(M, yy - 72, W - 2 * M, 79, 5, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(M + 13, yy - 16, heading)
        draw_wrapped(c, body, M + 13, yy - 34, W - 2 * M - 26, size=8.1, leading=11.5, color=MUTED)
        yy -= 91

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(M, 364, "Primary sources")
    yy = 342
    source_urls = [
        ("Monster Beverage 2025 Form 10-K", "https://www.sec.gov/Archives/edgar/data/865752/000110465926020831/mnst-20251231x10k.htm"),
        ("Monster Q1 2026 country scanner presentation", "https://www.sec.gov/Archives/edgar/data/865752/000110465926057188/tm2613885d1_ex99-2.htm"),
        ("OECD Digital Economy Outlook 2024, Figure 2.S.1 data", "https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/11/oecd-digital-economy-outlook-2024-volume-2_9b2801fc/3adf705b-en.pdf"),
        ("World Bank ICT service exports indicator", "https://data.worldbank.org/indicator/BX.GSR.CCIS.ZS?name_desc=true"),
        ("Google Trends query and regional-interest methodology", "https://trends.google.com/trends/explore?date=today%2012-m&geo=US&q=Monster%20Energy&hl=en"),
        ("CompTIA State of the Tech Workforce 2025", "https://lecbyo.files.cmp.optimizely.com/download/808ea63053b111f08b6ca695fc160b1a"),
        ("Yahoo Finance historical adjusted prices", "https://finance.yahoo.com/quote/MNST/history/"),
    ]
    for label, url in source_urls:
        yy = source_line(c, label, url, yy)
    c.save()


if __name__ == "__main__":
    destination = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_OUTPUT
    build(destination)
    print(destination)
