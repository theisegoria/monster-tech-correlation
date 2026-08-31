'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { ArrowDownToLine, ExternalLink, FlaskConical, MapPin, TrendingUp } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import {
  countryCorrelation,
  countrySalesData,
  correlation,
  regionalSales,
  sources,
  stateData,
  stockSeries,
  stockSummary,
} from '@/lib/analysis-data';

type StockKey = (typeof stockSummary)[number]['key'];
type StatePoint = (typeof stateData)[number];
type CountryPoint = (typeof countrySalesData)[number];

const stockConfig = {
  monster: { label: 'Monster Beverage', color: 'var(--chart-1)' },
  apple: { label: 'Apple', color: 'var(--chart-2)' },
  nvidia: { label: 'Nvidia', color: 'var(--chart-4)' },
  microsoft: { label: 'Microsoft', color: 'var(--chart-3)' },
  qqq: { label: 'Nasdaq-100 ETF', color: 'var(--chart-5)' },
  spy: { label: 'S&P 500 ETF', color: 'var(--muted-foreground)' },
} satisfies ChartConfig;

const regionConfig = {
  sales: { label: 'Net sales', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const stateConfig = {
  interest: { label: 'Google search interest', color: 'var(--chart-1)' },
  tech: { label: 'Tech employment share', color: 'var(--chart-3)' },
} satisfies ChartConfig;

const countryConfig = {
  monsterShare: { label: 'MEC retail value share', color: 'var(--chart-1)' },
  ictEmployment: { label: 'ICT specialists in employment', color: 'var(--chart-3)' },
} satisfies ChartConfig;

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function compactMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 2_000_000 ? 1 : 2)}m`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${Math.round(value)}`;
}

export default function Home() {
  const [visibleStocks, setVisibleStocks] = useState<StockKey[]>([
    'monster',
    'apple',
    'nvidia',
    'microsoft',
    'qqq',
  ]);
  const [selectedState, setSelectedState] = useState<StatePoint>(stateData[0]);
  const [selectedCountry, setSelectedCountry] = useState<CountryPoint>(countrySalesData[0]);

  const topStates = useMemo(() => stateData.slice(0, 10), []);

  function toggleStock(key: StockKey) {
    setVisibleStocks((current) =>
      current.includes(key)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="#top" className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Monster × Tech
          </a>
          <nav aria-label="Report sections" className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a className="transition-colors hover:text-foreground" href="#returns">Returns</a>
            <a className="transition-colors hover:text-foreground" href="#regions">Regions</a>
            <a className="transition-colors hover:text-foreground" href="#sales-test">Sales test</a>
            <a className="transition-colors hover:text-foreground" href="#correlation">Correlation</a>
          </nav>
          <a href="./monster-energy-tech-correlation.pdf" download className={buttonVariants({ size: 'sm', variant: 'outline' })}>
            <ArrowDownToLine data-icon="inline-start" /> PDF
          </a>
        </div>
      </header>

      <section id="top" className="relative mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-20">
        <div aria-hidden="true" className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)] lg:items-end">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-primary">Evidence brief · 31 August 2026</p>
            <h1 className="max-w-5xl text-4xl font-medium tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Monster drank the tech sector’s lunch.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              A split- and dividend-adjusted $1,000 investment in Monster Beverage at the August 2001 close grew to about $2.32 million by 28 August 2026—more than Apple or Nvidia over the same 25-year window.
            </p>
          </div>
          <Card className="bg-primary text-primary-foreground ring-0">
            <CardHeader>
              <CardDescription className="text-primary-foreground/70">The geographic result</CardDescription>
              <CardTitle className="text-3xl tracking-[-0.03em]">Not a tech-hub story</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-primary-foreground/85">
              The direct test also points the other way: across 14 European markets, Monster-company retail value share is lower where ICT employment is more concentrated (r = −0.51). The separate U.S. search-interest test is negative too (r = −0.37).
            </CardContent>
          </Card>
        </div>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Monster ending value</CardDescription>
              <CardTitle className="text-3xl tabular-nums">$2.32m</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">$1,000 invested at the August 2001 close</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Annualised return</CardDescription>
              <CardTitle className="text-3xl tabular-nums">36.3%</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">25-year compound annual growth rate</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Largest audited market</CardDescription>
              <CardTitle className="text-3xl tabular-nums">61.4%</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">U.S. & Canada share of 2025 segment net sales</CardContent>
          </Card>
        </div>
      </section>

      <section id="returns" className="border-y border-border/70 bg-card/45">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">01 · Long-run performance</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Growth of a hypothetical $1,000</h2>
              <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
                Adjusted closes at each August month-end; the logarithmic axis makes both the early and late compounding visible. Values exclude fees, taxes, and inflation.
              </p>
            </div>
            <p className="font-mono text-xs text-muted-foreground">31 Aug 2001 → 28 Aug 2026</p>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2" aria-label="Toggle stock series">
            {stockSummary.map((stock) => {
              const active = visibleStocks.includes(stock.key);
              return (
                <button
                  type="button"
                  key={stock.key}
                  aria-pressed={active}
                  onClick={() => toggleStock(stock.key)}
                  className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-muted aria-pressed:bg-muted"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--color-${stock.key}, var(--chart-1))`, opacity: active ? 1 : 0.28 }} />
                  <span className={active ? 'text-foreground' : 'text-muted-foreground'}>{stock.ticker}</span>
                </button>
              );
            })}
          </div>

          <ChartContainer config={stockConfig} className="mt-3 h-[430px] w-full aspect-auto" aria-label="Adjusted growth of one thousand dollars across six stocks and ETFs from 2001 to 2026">
            <ComposedChart data={stockSeries} margin={{ top: 18, right: 18, left: 18, bottom: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 5" />
              <XAxis dataKey="year" tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis
                scale="log"
                domain={[200, 3_000_000]}
                ticks={[250, 1_000, 10_000, 100_000, 1_000_000, 3_000_000]}
                tickLine={false}
                axisLine={false}
                width={76}
                tickFormatter={compactMoney}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `August ${label}`}
                    formatter={(value, name) => (
                      <div className="flex min-w-52 items-center justify-between gap-5">
                        <span className="text-muted-foreground">{stockConfig[name as StockKey]?.label}</span>
                        <span className="font-mono tabular-nums">{money.format(Number(value))}</span>
                      </div>
                    )}
                  />
                }
              />
              {visibleStocks.includes('monster') && <Area type="monotone" dataKey="monster" stroke="var(--color-monster)" fill="var(--color-monster)" fillOpacity={0.14} strokeWidth={2.7} dot={false} />}
              {(['apple', 'nvidia', 'microsoft', 'qqq', 'spy'] as StockKey[]).map((key) =>
                visibleStocks.includes(key) ? <Line key={key} type="monotone" dataKey={key} stroke={`var(--color-${key})`} strokeWidth={key === 'apple' || key === 'nvidia' ? 2.1 : 1.6} dot={false} /> : null,
              )}
            </ComposedChart>
          </ChartContainer>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="py-3 pr-5 font-normal">Investment</th>
                  <th className="py-3 pr-5 text-right font-normal">Ending value</th>
                  <th className="py-3 pr-5 text-right font-normal">Multiple</th>
                  <th className="py-3 text-right font-normal">Annualised</th>
                </tr>
              </thead>
              <tbody>
                {stockSummary.map((stock) => (
                  <tr key={stock.key} className="border-b border-border/70 last:border-0">
                    <td className="py-3.5 pr-5"><span className="font-medium">{stock.name}</span> <span className="font-mono text-xs text-muted-foreground">{stock.ticker}</span></td>
                    <td className="py-3.5 pr-5 text-right font-mono tabular-nums">{money.format(stock.ending)}</td>
                    <td className="py-3.5 pr-5 text-right font-mono tabular-nums">{stock.multiple.toLocaleString(undefined, { maximumFractionDigits: 2 })}×</td>
                    <td className="py-3.5 text-right font-mono tabular-nums">{stock.cagr.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="regions" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">02 · Where demand is largest</p>
            <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">North America dominates audited sales</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Monster does not publish a global regional table of cans consumed. Its strongest comparable public measure is 2025 net sales for the broader Monster Energy Drinks segment, which includes Monster, Reign, and Bang.
            </p>
            <Card className="mt-7 bg-secondary/55">
              <CardHeader>
                <CardDescription>Evidence boundary</CardDescription>
                <CardTitle>Sales dollars are not litres</CardTitle>
              </CardHeader>
              <CardContent className="leading-6 text-muted-foreground">
                Regional prices, product mix, exchange rates, and distributor timing differ. The chart supports “largest sales market,” not a literal per-capita consumption ranking.
              </CardContent>
            </Card>
          </div>

          <div>
            <p className="mb-3 text-sm text-muted-foreground">Monster Energy Drinks segment net sales · US$ billions · FY2025</p>
            <ChartContainer config={regionConfig} className="h-[330px] w-full aspect-auto" aria-label="Monster Energy Drinks segment net sales by broad global region in 2025">
              <BarChart data={regionalSales} layout="vertical" margin={{ top: 4, right: 58, left: 16, bottom: 4 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 5" />
                <XAxis type="number" domain={[0, 5]} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}b`} />
                <YAxis type="category" dataKey="region" width={168} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value, name, item) => <div className="flex min-w-48 items-center justify-between gap-5"><span className="text-muted-foreground">{item.payload.region}</span><span className="font-mono tabular-nums">${Number(value).toFixed(2)}b</span></div>} />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="share" position="right" formatter={(value) => `${Number(value).toFixed(1)}%`} className="fill-foreground text-xs" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-border pt-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <MapPin className="text-primary" aria-hidden="true" />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">U.S. demand proxy</p>
                <h3 className="text-2xl font-medium">Highest relative search interest</h3>
              </div>
            </div>
            <p className="mt-4 leading-7 text-muted-foreground">
              Google Trends normalises each state against all searches there; 100 means the strongest relative interest, not the largest number of searches or cans sold. Small states can be noisier.
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {topStates.map((item, index) => (
              <li key={item.state} className="border-b border-border/70 py-3">
                <button type="button" onClick={() => setSelectedState(item)} className="flex w-full items-center justify-between gap-4 text-left">
                  <span><span className="mr-3 font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>{item.state}</span>
                  <span className="font-mono tabular-nums text-primary">{item.interest}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="sales-test" className="border-y border-border/70 bg-card/45">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">03 · Direct sales-share test</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Actual retail sales do not cluster in tech economies</h2>
              <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
                Monster’s latest NielsenIQ scanner tables make a cleaner comparison possible. Across 14 consistently scoped European markets, Monster Energy Company’s share of retail energy-drink value is lower—not higher—where ICT specialists make up more of the workforce.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="border-l border-border pl-4"><p className="font-mono text-2xl tabular-nums">−0.51</p><p className="mt-1 text-xs text-muted-foreground">Pearson r</p></div>
              <div className="border-l border-border pl-4"><p className="font-mono text-2xl tabular-nums">−0.44</p><p className="mt-1 text-xs text-muted-foreground">Spearman ρ</p></div>
              <div className="border-l border-border pl-4"><p className="font-mono text-2xl tabular-nums">14</p><p className="mt-1 text-xs text-muted-foreground">Markets</p></div>
            </div>
          </div>

          <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <ChartContainer config={countryConfig} className="h-[455px] w-full aspect-auto" aria-label="Scatter plot of Monster Energy Company retail value share against ICT specialists as a share of national employment">
              <ScatterChart margin={{ top: 22, right: 22, left: 12, bottom: 22 }}>
                <CartesianGrid strokeDasharray="3 5" />
                <XAxis type="number" dataKey="ictEmployment" name="ICT employment" unit="%" domain={[2, 8.2]} tickLine={false} axisLine={false} label={{ value: 'ICT specialists as share of employment (%)', position: 'insideBottom', offset: -14 }} />
                <YAxis type="number" dataKey="monsterShare" name="MEC retail share" unit="%" domain={[10, 45]} tickLine={false} axisLine={false} width={52} label={{ value: 'MEC retail value share (%)', angle: -90, position: 'insideLeft' }} />
                <ZAxis range={[110, 110]} />
                <ReferenceLine segment={[{ x: 2.23, y: countryCorrelation.employmentIntercept + countryCorrelation.employmentSlope * 2.23 }, { x: 7.83, y: countryCorrelation.employmentIntercept + countryCorrelation.employmentSlope * 7.83 }]} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                <ChartTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.country ?? ''}
                      formatter={(value, name) => (
                        <div className="flex min-w-56 items-center justify-between gap-5">
                          <span className="text-muted-foreground">{countryConfig[name as keyof typeof countryConfig]?.label}</span>
                          <span className="font-mono tabular-nums">{Number(value).toFixed(name === 'ictEmployment' ? 2 : 1)}%</span>
                        </div>
                      )}
                    />
                  }
                />
                <Scatter
                  data={countrySalesData}
                  fill="var(--color-monsterShare)"
                  fillOpacity={0.82}
                  onClick={(point) => {
                    const payload = (point as { payload?: CountryPoint }).payload;
                    if (payload) setSelectedCountry(payload);
                  }}
                />
              </ScatterChart>
            </ChartContainer>

            <Card className="self-start">
              <CardHeader>
                <CardDescription>Selected market</CardDescription>
                <CardTitle className="text-2xl">{selectedCountry.country}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex items-end justify-between gap-4 border-b border-border pb-3"><dt className="text-muted-foreground">MEC value share</dt><dd className="font-mono text-2xl tabular-nums">{selectedCountry.monsterShare.toFixed(1)}%</dd></div>
                  <div className="flex items-end justify-between gap-4 border-b border-border pb-3"><dt className="text-muted-foreground">ICT employment</dt><dd className="font-mono text-2xl tabular-nums">{selectedCountry.ictEmployment.toFixed(2)}%</dd></div>
                  <div className="flex items-end justify-between gap-4"><dt className="text-muted-foreground">ICT service exports</dt><dd className="font-mono text-lg tabular-nums">{selectedCountry.ictExports.toFixed(1)}%</dd></div>
                </dl>
                <p className="mt-5 text-sm leading-6 text-muted-foreground">Choose a dot to inspect the market. Great Britain’s OECD workforce observation is from 2019; the rest are 2023.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardDescription>Second technology measure</CardDescription>
                <CardTitle>ICT-service exports: r = −0.06</CardTitle>
              </CardHeader>
              <CardContent className="leading-6 text-muted-foreground">
                The same retail shares are essentially unrelated to ICT services as a share of service exports. Ireland is an extreme export outlier; excluding it changes Pearson r to −0.58, still not a positive link.
              </CardContent>
            </Card>
            <Card className="bg-secondary/55">
              <CardHeader>
                <CardDescription>Evidence boundary</CardDescription>
                <CardTitle>Scanner share is close to sales, not consumption</CardTitle>
              </CardHeader>
              <CardContent className="leading-6 text-muted-foreground">
                NielsenIQ value share captures measured retail channels and prices. It does not count litres, identify buyers, or prove causation; Monster states that its proprietary scanner figures are not independently verified.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="correlation" className="border-y border-border/70 bg-card/45">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">04 · U.S. proxy test</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Monster interest rises away from tech-heavy states</h2>
              <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
                Across 50 states and D.C., the correlation between relative “Monster Energy” search interest and tech workers as a share of employment is moderately negative, not positive.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="border-l border-border pl-4"><p className="font-mono text-2xl tabular-nums">−0.37</p><p className="mt-1 text-xs text-muted-foreground">Pearson r</p></div>
              <div className="border-l border-border pl-4"><p className="font-mono text-2xl tabular-nums">−0.44</p><p className="mt-1 text-xs text-muted-foreground">Spearman ρ</p></div>
              <div className="border-l border-border pl-4"><p className="font-mono text-2xl tabular-nums">0.13</p><p className="mt-1 text-xs text-muted-foreground">R²</p></div>
            </div>
          </div>

          <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <ChartContainer config={stateConfig} className="h-[470px] w-full aspect-auto" aria-label="Scatter plot of Monster Energy Google search interest against state tech employment share">
              <ScatterChart margin={{ top: 22, right: 22, left: 12, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 5" />
                <XAxis type="number" dataKey="tech" name="Tech employment share" unit="%" domain={[2, 10]} tickLine={false} axisLine={false} label={{ value: 'Tech employment share (%)', position: 'insideBottom', offset: -12 }} />
                <YAxis type="number" dataKey="interest" name="Search interest" domain={[10, 105]} tickLine={false} axisLine={false} width={46} label={{ value: 'Google Trends index', angle: -90, position: 'insideLeft' }} />
                <ZAxis range={[90, 90]} />
                <ReferenceLine segment={[{ x: 2.5, y: correlation.intercept + correlation.slope * 2.5 }, { x: 9.3, y: correlation.intercept + correlation.slope * 9.3 }]} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                <ChartTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.state ?? ''}
                      formatter={(value, name) => (
                        <div className="flex min-w-52 items-center justify-between gap-5">
                          <span className="text-muted-foreground">{stateConfig[name as keyof typeof stateConfig]?.label}</span>
                          <span className="font-mono tabular-nums">{Number(value).toFixed(name === 'tech' ? 1 : 0)}{name === 'tech' ? '%' : ''}</span>
                        </div>
                      )}
                    />
                  }
                />
                <Scatter
                  data={stateData}
                  fill="var(--color-interest)"
                  fillOpacity={0.78}
                  onClick={(point) => {
                    const payload = (point as { payload?: StatePoint }).payload;
                    if (payload) setSelectedState(payload);
                  }}
                />
              </ScatterChart>
            </ChartContainer>

            <Card className="self-start">
              <CardHeader>
                <CardDescription>Selected area</CardDescription>
                <CardTitle className="text-2xl">{selectedState.state}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex items-end justify-between gap-4 border-b border-border pb-3"><dt className="text-muted-foreground">Search interest</dt><dd className="font-mono text-2xl tabular-nums">{selectedState.interest}</dd></div>
                  <div className="flex items-end justify-between gap-4 border-b border-border pb-3"><dt className="text-muted-foreground">Tech employment</dt><dd className="font-mono text-2xl tabular-nums">{selectedState.tech.toFixed(1)}%</dd></div>
                </dl>
                <p className="mt-5 text-sm leading-6 text-muted-foreground">Choose a dot or a state in the ranking above to inspect it.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-start gap-3">
                <TrendingUp className="mt-0.5 text-primary" aria-hidden="true" />
                <div><CardTitle>The result survives Wyoming</CardTitle><CardDescription className="mt-1">Pearson r becomes −0.39 when the 100-index outlier is removed.</CardDescription></div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex-row items-start gap-3">
                <FlaskConical className="mt-0.5 text-primary" aria-hidden="true" />
                <div><CardTitle>But it is not causal</CardTitle><CardDescription className="mt-1">Search interest is not consumption; state age, rurality, income, retail mix, and sampling can confound the association.</CardDescription></div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">05 · Bottom line</p>
            <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em]">The stock story is real. The tech-consumption story is not.</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-muted-foreground">
            <p><strong className="font-medium text-foreground">Investment performance:</strong> Monster was an extraordinary long-run compounder and beat the selected tech comparators in this particular 25-year window.</p>
            <p><strong className="font-medium text-foreground">Geography:</strong> The audited sales centre is U.S. and Canada. Relative online interest is strongest in Wyoming, Utah, Idaho, West Virginia, and Kansas—not the canonical coastal tech hubs.</p>
            <p><strong className="font-medium text-foreground">Direct sales test:</strong> Retail value share across 14 European markets is negatively associated with ICT-workforce concentration (r = −0.51) and essentially unrelated to ICT-service exports (r = −0.06).</p>
            <p><strong className="font-medium text-foreground">U.S. proxy:</strong> State search interest also points to a modest negative association with tech concentration. Neither test tells us what individual tech workers drink, and no public brand-level consumption-by-state dataset was found.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Sources & method</p>
              <p className="mt-3 max-w-md text-sm leading-6 text-background/65">Returns use adjusted closes. Regional sales are FY2025. Country shares use 13-week NielsenIQ scanner periods ending March 2026. OECD ICT employment is 2023 except Great Britain (2019). Trends covers the 12 months through 30 August 2026. U.S. tech concentration is CompTIA’s 2024 estimate.</p>
            </div>
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {sources.map((source) => (
                <li key={source.href}>
                  <a href={source.href} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-sm text-background/75 transition-colors hover:text-background">
                    <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    <span>{source.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
