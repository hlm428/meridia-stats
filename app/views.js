// MeridiaStats views — one renderer per page. Each page is built from the
// same store, so a figure shown twice is the same figure twice.
import {
  AGE_GROUPS,
  EMPLOYMENT_BY_SECTOR,
  INDICATORS,
  LABOUR,
  LATEST_YEAR,
  QUARTERLY_GROWTH,
  REGIONS,
  RELEASES,
  SECTORS,
  YEARS,
} from "./data.js";
import {
  ageShareTotal,
  averageQuarterlyGrowth,
  employmentTotal,
  explorerCsv,
  filteredIndicators,
  fmt,
  fmtSignedPercent,
  gdpPerCapitaFromParts,
  indicator,
  latest,
  populationChange,
  regionPopulationTotal,
  regionShareTotal,
  sectorShareTotal,
  setRegionSort,
  sortedRegions,
  state,
  tradeBalance,
  unemploymentFromHeadcounts,
  valueAt,
  yearOnYear,
} from "./store.js";
import { donutChart, groupedBars, hbarChart, lineChart, miniBars } from "./charts.js";

function kpi(label, value, sub) {
  return `<div class="kpi"><span class="kpi-label">${label}</span><span class="kpi-value">${value}</span><span class="kpi-sub">${sub}</span></div>`;
}

// Compact second-row indicator: same store figures, smaller card, for the
// Overview first screen (round 2 density iteration).
function miniKpi(label, value, sub) {
  return `<div class="mini-kpi"><span class="mini-kpi-label">${label}</span><span class="mini-kpi-value">${value}</span><span class="mini-kpi-sub">${sub}</span></div>`;
}

function section(title, inner, note) {
  return `<section class="card"><h2>${title}</h2>${inner}${note ? `<p class="note">${note}</p>` : ""}</section>`;
}

function yearOptions() {
  return YEARS.map((y) => `<option value="${y}"${y === state.year ? " selected" : ""}>${y}</option>`).join("");
}

function yearPicker() {
  return `<label class="year-picker">Year in focus <select id="year-select" aria-label="Year in focus">${yearOptions()}</select></label>`;
}

// ---- Overview ---------------------------------------------------------------
export function viewOverview() {
  const y = state.year;
  const change = populationChange(y);
  const gdpLine = lineChart({
    labels: YEARS.map(String),
    values: YEARS.map((year) => valueAt("gdp", year)),
    format: (v) => `$${v}bn`,
  });
  const quarterly = miniBars({ rows: QUARTERLY_GROWTH, height: 110 });
  const regionBars = hbarChart({
    rows: REGIONS.map((r) => ({ label: r.name, value: r.population })),
    format: (v) => `${v.toFixed(2)}m`,
  });
  const ageBars = hbarChart({
    rows: AGE_GROUPS.map((g) => ({ label: g.label, value: g.share })),
    format: (v) => `${v.toFixed(1)}%`,
    barHeight: 20,
    gap: 8,
  });
  const releases = RELEASES.map(
    (r) => `<li><b>${r.title}</b><span>${r.date} — ${r.note}</span></li>`,
  ).join("");
  return `
  <div class="ov">
  <div class="page-head"><div><h1>Meridia in ${y}</h1>
  <p class="lede">${fmt(valueAt("population", y), "millions")} people · ${fmt(valueAt("gdp", y), "billions")} economy · unemployment ${fmt(valueAt("unemployment", y), "rate1")} · CPI +${fmt(valueAt("cpi", y), "rate1")} · ${fmt(valueAt("life_expectancy", y), "years1")} years.</p></div>${yearPicker()}</div>
  <div class="kpi-grid">
    ${kpi("Population", fmt(valueAt("population", y), "millions"), `${fmtSignedPercent(yearOnYear("population", y))} on ${y - 1}`)}
    ${kpi("GDP", fmt(valueAt("gdp", y), "billions"), `Real growth ${fmt(valueAt("real_growth", y), "percent1")}`)}
    ${kpi("GDP per capita", fmt(valueAt("gdp_per_capita", y), "dollars"), `2019: ${fmt(valueAt("gdp_per_capita", 2019), "dollars")}`)}
    ${kpi("Unemployment", fmt(valueAt("unemployment", y), "rate1"), `${fmt(LABOUR.unemployed, "millions")} of ${fmt(LABOUR.labourForce, "millions")} in the labour force`)}
    ${kpi("Consumer prices", fmt(valueAt("cpi", y), "rate1"), "Annual average inflation")}
    ${kpi("Life expectancy", `${fmt(valueAt("life_expectancy", y), "years1")} years`, `Female ${fmt(84.1, "years1")} · Male ${fmt(80.7, "years1")}`)}
  </div>
  <div class="kpi-strip">
    ${miniKpi("Trade balance", fmt(tradeBalance(y), "billions"), `Exports ${fmt(valueAt("exports", y), "billions")} · Imports ${fmt(valueAt("imports", y), "billions")}`)}
    ${miniKpi("Employment", fmt(LABOUR.employed, "millions"), `Participation ${fmt(LABOUR.participation, "rate1")} · ${fmt(LABOUR.unemployed, "millions")} unemployed`)}
    ${miniKpi("Median wage", fmt(valueAt("median_wage", y), "dollars"), `Per month · 2019: ${fmt(valueAt("median_wage", 2019), "dollars")}`)}
    ${miniKpi("Median age", `${fmt(valueAt("median_age", y), "years1")} years`, `65+ share ${AGE_GROUPS[2].share}% · 0–14 share ${AGE_GROUPS[0].share}%`)}
  </div>
  <div class="two-col">
    ${section(`GDP, ${YEARS[0]}–${LATEST_YEAR} ($ billion)`, `${gdpLine}<p class="mini-head">Real growth, quarter on quarter</p>${quarterly}`, `GDP rose from ${fmt(valueAt("gdp", 2019), "billions")} in 2019 to ${fmt(valueAt("gdp", LATEST_YEAR), "billions")} in 2026.`)}
    ${section("Population by region, 2026 (millions)", `${regionBars}<p class="mini-head">Age structure, 2026 (% of population)</p>${ageBars}`, `Five regions add up to ${regionPopulationTotal().toFixed(2)} million — Central alone holds ${REGIONS[0].share}% of the country.`)}
  </div>
  <div class="two-col">
    ${section("Latest releases", `<ul class="releases">${releases}</ul>`, "Every release names its date and its headline finding.")}
    ${section("2026 at a glance", `
      <dl class="facts">
        <div><dt>People</dt><dd>${fmt(valueAt("births", 2026), "integer")} births, ${fmt(valueAt("deaths", 2026), "integer")} deaths — natural increase ${fmt(change.natural, "signed")} people, plus net migration ${fmt(change.migration, "signed")}.</dd></div>
        <div><dt>Trade</dt><dd>Exports ${fmt(valueAt("exports", 2026), "billions")}, imports ${fmt(valueAt("imports", 2026), "billions")} — a surplus of ${fmt(tradeBalance(2026), "billions")}.</dd></div>
        <div><dt>Work</dt><dd>${fmt(LABOUR.employed, "millions")} employed, participation ${fmt(LABOUR.participation, "rate1")}, median wage ${fmt(valueAt("median_wage", 2026), "dollars")} a month.</dd></div>
        <div><dt>Ageing</dt><dd>Median age ${fmt(valueAt("median_age", 2026), "years1")} years; ${AGE_GROUPS[2].share}% of the population is 65 or older.</dd></div>
      </dl>`, "Figures are rounded; components may not sum exactly to a rounded total.")}
  </div>
  </div>`;
}

// ---- Population ---------------------------------------------------------------
export function viewPopulation() {
  const y = state.year;
  const change = populationChange(y);
  const popLine = lineChart({
    labels: YEARS.map(String),
    values: YEARS.map((year) => valueAt("population", year)),
    format: (v) => `${v.toFixed(2)}m`,
  });
  const ageBars = hbarChart({
    rows: AGE_GROUPS.map((g) => ({ label: g.label, value: g.share })),
    format: (v) => `${v.toFixed(1)}%`,
  });
  const vitalBars = groupedBars({
    labels: ["2019", "2022", "2024", "2026"],
    series: [
      { name: "Births", values: [82100, 79300, 78600, 78400] },
      { name: "Deaths", values: [68900, 70100, 70900, 71200] },
    ],
    format: (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)),
  });
  const regionRows = sortedRegions()
    .map(
      (r) =>
        `<tr><td>${r.name}</td><td>${r.population.toFixed(2)}</td><td>${r.share.toFixed(1)}%</td><td>${fmtSignedPercent(r.yoy)}</td></tr>`,
    )
    .join("");
  return `
  <div class="page-head"><div><h1>Population</h1>
  <p class="lede">Meridia's population in ${y} is ${fmt(valueAt("population", y), "millions")} — growing slowly, living longer, and ageing: median age ${fmt(valueAt("median_age", y), "years1")} years.</p></div>${yearPicker()}</div>
  <div class="kpi-grid">
    ${kpi("Population", fmt(valueAt("population", y), "millions"), `${fmtSignedPercent(yearOnYear("population", y))} on ${y - 1}`)}
    ${kpi("Births", fmt(valueAt("births", y), "integer"), `Deaths ${fmt(valueAt("deaths", y), "integer")}`)}
    ${kpi("Natural increase", fmt(change.natural, "signed"), `Net migration ${fmt(change.migration, "signed")}`)}
    ${kpi("Median age", `${fmt(valueAt("median_age", y), "years1")} years`, `Life expectancy ${fmt(valueAt("life_expectancy", y), "years1")} years`)}
  </div>
  <div class="two-col">
    ${section("Population, 2019–2026 (millions)", popLine, "Eight years of steady growth: from 8.11 million in 2019 to 8.42 million in 2026.")}
    ${section("Age structure, 2026 (% of population)", ageBars, `Shares sum to ${ageShareTotal().toFixed(1)}%. Two in three residents are of working age (15–64).`)}
  </div>
  <div class="two-col">
    ${section("Births vs deaths", vitalBars, "Births have fallen every year since 2019 while deaths edge up — natural increase is now just 7,200 a year.")}
    ${section("Life expectancy, 2026", `<dl class="facts"><div><dt>All</dt><dd>${fmt(valueAt("life_expectancy", 2026), "years1")} years at birth.</dd></div><div><dt>Female</dt><dd>84.1 years.</dd></div><div><dt>Male</dt><dd>80.7 years.</dd></div><div><dt>Since 2019</dt><dd>Up 0.8 years, from 81.6 to 82.4.</dd></div></dl>`, "From the national life table; the 2020 dip to 81.4 reflects the pandemic years.")}
  </div>
  ${section("Regions, 2026 — click a column heading to sort", `
    <table class="data-table" id="region-table">
      <thead><tr><th data-sort="name">Region</th><th data-sort="population">Population (m) ↕</th><th data-sort="share">Share ↕</th><th data-sort="yoy">Change on 2025 ↕</th></tr></thead>
      <tbody>${regionRows}</tbody>
      <tfoot><tr><td>Total</td><td>${regionPopulationTotal().toFixed(2)}</td><td>${regionShareTotal().toFixed(1)}%</td><td>${fmtSignedPercent(yearOnYear("population", 2026))}</td></tr></tfoot>
    </table>`, "Populations sum to 8.42 million and shares to 100.0%. Regional change is rounded to one decimal.")}
  <p class="note">Population change in 2026: natural increase +7,200 and net migration +12,600, a combined +19,800 before rounding; the published total rose by 30,000 because the 2025 and 2026 totals are rounded to the nearest 10,000. See Sources &amp; methods on the Data page.</p>`;
}

// ---- Economy ---------------------------------------------------------------
export function viewEconomy() {
  const y = state.year;
  const donut = donutChart({
    rows: SECTORS,
    centerLabel: "GDP 2026",
    centerValue: fmt(valueAt("gdp", 2026), "billions"),
  });
  const growthLine = lineChart({
    labels: YEARS.map(String),
    values: YEARS.map((year) => valueAt("real_growth", year)),
    format: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`,
    color: "#2e7d6b",
  });
  const tradeBars = groupedBars({
    labels: ["2023", "2024", "2025", "2026"],
    series: [
      { name: "Exports", values: [284, 289, 293, 298] },
      { name: "Imports", values: [266, 269, 272, 276] },
    ],
    format: (v) => `$${v}bn`,
  });
  const quarterly = miniBars({ rows: QUARTERLY_GROWTH });
  return `
  <div class="page-head"><div><h1>Economy</h1>
  <p class="lede">Meridia's economy in ${y}: GDP ${fmt(valueAt("gdp", y), "billions")}, real growth ${fmt(valueAt("real_growth", y), "percent1")}, and ${fmt(valueAt("gdp_per_capita", y), "dollars")} of output per person.</p></div>${yearPicker()}</div>
  <div class="kpi-grid">
    ${kpi("GDP", fmt(valueAt("gdp", y), "billions"), `Real growth ${fmt(valueAt("real_growth", y), "percent1")}`)}
    ${kpi("GDP per capita", fmt(valueAt("gdp_per_capita", y), "dollars"), `Recomputed from GDP ÷ population: $${Math.round(gdpPerCapitaFromParts(y)).toLocaleString("en-US")}`)}
    ${kpi("Exports", fmt(valueAt("exports", y), "billions"), `Imports ${fmt(valueAt("imports", y), "billions")}`)}
    ${kpi("Trade balance", fmt(tradeBalance(y), "billions"), tradeBalance(y) >= 0 ? "Surplus" : "Deficit")}
  </div>
  <div class="two-col">
    ${section("Real GDP growth, 2019–2026 (% on previous year)", growthLine, "The 2020 contraction (−2.7%) and the 2021 rebound (+6.6%) dominate the decade; growth since 2023 has settled between 1.5% and 2.8%.")}
    ${section("What the economy makes, 2026 (share of GDP)", donut, `Services ${SECTORS[0].share}%, industry ${SECTORS[1].share}%, agriculture ${SECTORS[2].share}% — shares sum to ${sectorShareTotal().toFixed(1)}%.`)}
  </div>
  <div class="two-col">
    ${section("Trade, 2023–2026 ($ billion)", tradeBars, `The surplus widened to ${fmt(tradeBalance(2026), "billions")} in 2026: exports ${fmt(valueAt("exports", 2026), "billions")} against imports ${fmt(valueAt("imports", 2026), "billions")}.`)}
    ${section("Quarterly real growth, quarter on quarter", quarterly, `Eight straight quarters of growth, averaging ${fmtSignedPercent(averageQuarterlyGrowth())} a quarter — no quarter below +0.3%.`)}
  </div>`;
}

// ---- People ---------------------------------------------------------------
export function viewPeople() {
  const y = state.year;
  const unempLine = lineChart({
    labels: YEARS.map(String),
    values: YEARS.map((year) => valueAt("unemployment", year)),
    format: (v) => `${v.toFixed(1)}%`,
    color: "#b4552d",
  });
  const cpiLine = lineChart({
    labels: YEARS.map(String),
    values: YEARS.map((year) => valueAt("cpi", year)),
    format: (v) => `${v.toFixed(1)}%`,
    color: "#d98e2b",
  });
  const wageLine = lineChart({
    labels: YEARS.map(String),
    values: YEARS.map((year) => valueAt("median_wage", year)),
    format: (v) => `$${Math.round(v).toLocaleString("en-US")}`,
    color: "#2e7d6b",
  });
  const regionUnemp = hbarChart({
    rows: REGIONS.map((r) => ({ label: r.name, value: r.unemployment })),
    format: (v) => `${v.toFixed(1)}%`,
    color: "#b4552d",
  });
  const empBars = hbarChart({
    rows: EMPLOYMENT_BY_SECTOR.map((s) => ({ label: s.name, value: s.people })),
    format: (v) => `${v.toFixed(2)}m`,
  });
  return `
  <div class="page-head"><div><h1>People &amp; work</h1>
  <p class="lede">Work and pay in Meridia in ${y}: unemployment ${fmt(valueAt("unemployment", y), "rate1")}, median wage ${fmt(valueAt("median_wage", y), "dollars")} a month, prices up ${fmt(valueAt("cpi", y), "rate1")}.</p></div>${yearPicker()}</div>
  <div class="kpi-grid">
    ${kpi("Unemployment", fmt(valueAt("unemployment", y), "rate1"), `${fmt(LABOUR.unemployed, "millions")} unemployed of ${fmt(LABOUR.labourForce, "millions")} in the labour force`)}
    ${kpi("Participation rate", fmt(LABOUR.participation, "rate1"), "Share of ages 15–74 in work or looking")}
    ${kpi("Median monthly wage", fmt(valueAt("median_wage", y), "dollars"), `2019: ${fmt(valueAt("median_wage", 2019), "dollars")} — up 17.7% in seven years`)}
    ${kpi("Median household income", fmt(LABOUR.medianHouseholdIncome, "dollars"), "Per year, 2026")}
  </div>
  <div class="two-col">
    ${section("Unemployment, 2019–2026 (% of labour force)", unempLine, `Peaked at 6.8% in 2020 and has fallen every year since, to 3.8% in 2026 — the lowest in the series. Recomputed from headcounts: ${fmt(unemploymentFromHeadcounts(), "rate1")}.`)}
    ${section("Consumer price inflation, 2019–2026 (% a year)", cpiLine, "Inflation peaked at 5.1% in 2022 and has eased every year since, to 2.1% in 2026.")}
  </div>
  <div class="two-col">
    ${section("Median monthly wage, 2019–2026 ($, gross)", wageLine, `From ${fmt(valueAt("median_wage", 2019), "dollars")} in 2019 to ${fmt(valueAt("median_wage", 2026), "dollars")} in 2026 — wages rose faster than prices over the period.`)}
    ${section("Unemployment by region, 2026 (%)", regionUnemp, "Eastvale has the highest rate at 4.2%; Central the lowest at 3.5%. The national rate is 3.8%.")}
  </div>
  ${section("Employment by sector, 2026 (millions)", empBars, `Sectors add up to ${employmentTotal().toFixed(2)} million employed: services ${EMPLOYMENT_BY_SECTOR[0].share}%, industry ${EMPLOYMENT_BY_SECTOR[1].share}%, agriculture ${EMPLOYMENT_BY_SECTOR[2].share}%.`)}`;
}

// ---- Data explorer ---------------------------------------------------------------
export function viewData(query) {
  const rows = filteredIndicators(query);
  const body = rows
    .map((row) => {
      const cells = YEARS.map(
        (year) => `<td class="${year === state.year ? "hl" : ""}">${fmt(row.values[year], row.format)}</td>`,
      ).join("");
      return `<tr><td><b>${row.name}</b><span class="unit">${row.unit}</span></td>${cells}</tr>`;
    })
    .join("");
  const methods = INDICATORS.map(
    (row) => `<li><b>${row.name}.</b> ${row.method}</li>`,
  ).join("");
  return `
  <div class="page-head"><div><h1>Data explorer</h1>
  <p class="lede">All 14 headline indicators, 2019–2026, in one table. Search to filter, pick a year to highlight its column, and download the table as CSV.</p></div>${yearPicker()}</div>
  <section class="card">
    <div class="explorer-tools">
      <label>Search indicators <input type="search" id="explorer-search" placeholder="Try “wage”, “price” or “migration”" value="${query.replace(/"/g, "&quot;")}" aria-label="Search indicators"></label>
      <button id="csv-download" type="button">Download CSV (${rows.length} indicators)</button>
    </div>
    <div class="table-scroll">
    <table class="data-table explorer">
      <thead><tr><th>Indicator</th>${YEARS.map((year) => `<th class="${year === state.year ? "hl" : ""}">${year}</th>`).join("")}</tr></thead>
      <tbody>${body || `<tr><td colspan="9">No indicator matches “${query}”. Try another word.</td></tr>`}</tbody>
    </table>
    </div>
    <p class="note">Showing ${rows.length} of ${INDICATORS.length} indicators. The highlighted column is ${state.year}. CSV downloads exactly the rows shown.</p>
  </section>
  <section class="card">
    <h2>Sources &amp; methods</h2>
    <p>MeridiaStats publishes the definition and scope of every indicator it shows, so any figure can be checked against its source. Figures are rounded for display; a rounded total may differ from the sum of rounded parts by up to the last digit shown.</p>
    <ul class="methods">${methods}</ul>
    <p class="note">Population change: the 2026 components (natural increase +7,200; net migration +12,600) sum to +19,800 before rounding, while the published totals (8.39m in 2025, 8.42m in 2026) are rounded to the nearest 10,000. Regional figures come from the same mid-year estimates; sector shares from the national accounts; labour figures from the labour force survey. This is a fictional country's statistics site: the figures are invented, but they are internally consistent, as a real statistics office's would be.</p>
  </section>`;
}

export const VIEWS = {
  "/": viewOverview,
  "/population": viewPopulation,
  "/economy": viewEconomy,
  "/people": viewPeople,
  "/data": viewData,
};
