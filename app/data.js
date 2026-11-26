// MeridiaStats seed data — the Republic of Meridia's published figures.
// Every number here is invented for this fictional country, and every total
// equals the sum of its parts. Years run 2019-2026; 2026 is the latest year.

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

// 14 headline indicators, one value per year. Units live in each record so
// every table and chart can label itself honestly.
export const INDICATORS = [
  {
    id: "population",
    name: "Population",
    unit: "million people",
    format: "millions",
    values: { 2019: 8.11, 2020: 8.16, 2021: 8.21, 2022: 8.26, 2023: 8.31, 2024: 8.36, 2025: 8.39, 2026: 8.42 },
    method: "Mid-year resident population estimate, all persons usually resident in Meridia on 30 June.",
  },
  {
    id: "gdp",
    name: "Gross domestic product",
    unit: "$ billion, current prices",
    format: "billions",
    values: { 2019: 512, 2020: 498, 2021: 531, 2022: 562, 2023: 578, 2024: 592, 2025: 601, 2026: 612 },
    method: "Value added by all resident producers, current prices, in US dollars.",
  },
  {
    id: "gdp_per_capita",
    name: "GDP per capita",
    unit: "$, current prices",
    format: "dollars",
    values: { 2019: 63100, 2020: 61000, 2021: 64700, 2022: 68000, 2023: 69600, 2024: 70800, 2025: 71600, 2026: 72700 },
    method: "GDP at current prices divided by the mid-year population, rounded to the nearest $100.",
  },
  {
    id: "real_growth",
    name: "Real GDP growth",
    unit: "% change on previous year",
    format: "percent1",
    values: { 2019: 2.1, 2020: -2.7, 2021: 6.6, 2022: 5.8, 2023: 2.8, 2024: 2.4, 2025: 1.5, 2026: 1.8 },
    method: "Change in the volume of GDP on the previous year, chain-linked to 2019 prices.",
  },
  {
    id: "unemployment",
    name: "Unemployment rate",
    unit: "% of the labour force",
    format: "rate1",
    values: { 2019: 4.6, 2020: 6.8, 2021: 5.9, 2022: 4.9, 2023: 4.2, 2024: 4.0, 2025: 3.9, 2026: 3.8 },
    method: "Unemployed persons as a share of the labour force, annual average, ages 15-74.",
  },
  {
    id: "cpi",
    name: "Consumer price inflation",
    unit: "% change on previous year",
    format: "rate1",
    values: { 2019: 1.8, 2020: 0.9, 2021: 2.4, 2022: 5.1, 2023: 3.6, 2024: 2.7, 2025: 2.3, 2026: 2.1 },
    method: "Annual average change in the consumer price index, all items, 2019 = 100.",
  },
  {
    id: "life_expectancy",
    name: "Life expectancy at birth",
    unit: "years",
    format: "years1",
    values: { 2019: 81.6, 2020: 81.4, 2021: 81.8, 2022: 82.0, 2023: 82.1, 2024: 82.2, 2025: 82.3, 2026: 82.4 },
    method: "Period life expectancy at birth from the national life table; 2026: female 84.1, male 80.7.",
  },
  {
    id: "births",
    name: "Live births",
    unit: "births in the year",
    format: "integer",
    values: { 2019: 82100, 2020: 79800, 2021: 78900, 2022: 79300, 2023: 78900, 2024: 78600, 2025: 78500, 2026: 78400 },
    method: "Live births registered in the calendar year, by mother's place of residence.",
  },
  {
    id: "deaths",
    name: "Deaths",
    unit: "deaths in the year",
    format: "integer",
    values: { 2019: 68900, 2020: 70400, 2021: 69800, 2022: 70100, 2023: 70600, 2024: 70900, 2025: 71000, 2026: 71200 },
    method: "Deaths registered in the calendar year, by place of residence.",
  },
  {
    id: "net_migration",
    name: "Net migration",
    unit: "people in the year",
    format: "signed",
    values: { 2019: 14200, 2020: 9800, 2021: 11300, 2022: 12100, 2023: 12400, 2024: 12500, 2025: 12600, 2026: 12600 },
    method: "Long-term arrivals minus long-term departures, 12 months or more, border statistics.",
  },
  {
    id: "median_wage",
    name: "Median monthly wage",
    unit: "$, gross",
    format: "dollars",
    values: { 2019: 3720, 2020: 3780, 2021: 3910, 2022: 4050, 2023: 4180, 2024: 4260, 2025: 4320, 2026: 4380 },
    method: "Median gross monthly earnings of full-time employees, from the earnings survey.",
  },
  {
    id: "exports",
    name: "Exports of goods and services",
    unit: "$ billion",
    format: "billions",
    values: { 2019: 251, 2020: 238, 2021: 262, 2022: 279, 2023: 284, 2024: 289, 2025: 293, 2026: 298 },
    method: "Exports of goods and services, balance of payments basis, current prices.",
  },
  {
    id: "imports",
    name: "Imports of goods and services",
    unit: "$ billion",
    format: "billions",
    values: { 2019: 236, 2020: 224, 2021: 247, 2022: 261, 2023: 266, 2024: 269, 2025: 272, 2026: 276 },
    method: "Imports of goods and services, balance of payments basis, current prices.",
  },
  {
    id: "median_age",
    name: "Median age",
    unit: "years",
    format: "years1",
    values: { 2019: 39.8, 2020: 40.1, 2021: 40.3, 2022: 40.5, 2023: 40.7, 2024: 40.9, 2025: 41.0, 2026: 41.2 },
    method: "Age that divides the mid-year population in two equal halves.",
  },
];

// Regions, 2026. Populations sum to 8.42 million; shares sum to 100.0%.
export const REGIONS = [
  { name: "Central", population: 2.41, share: 28.6, yoy: 0.5, unemployment: 3.5 },
  { name: "Northgate", population: 1.86, share: 22.1, yoy: 0.3, unemployment: 3.9 },
  { name: "Eastvale", population: 1.52, share: 18.1, yoy: 0.4, unemployment: 4.2 },
  { name: "Southport", population: 1.44, share: 17.1, yoy: 0.2, unemployment: 4.0 },
  { name: "Westfield", population: 1.19, share: 14.1, yoy: 0.3, unemployment: 3.7 },
];

// Age structure, 2026. Shares sum to 100.0%.
export const AGE_GROUPS = [
  { label: "0–14", share: 15.8 },
  { label: "15–64", share: 66.4 },
  { label: "65+", share: 17.8 },
];

// Sector shares of GDP, 2026. Shares sum to 100.0%.
export const SECTORS = [
  { name: "Services", share: 68.2 },
  { name: "Industry", share: 23.9 },
  { name: "Agriculture", share: 7.9 },
];

// Employment by sector, 2026 (millions). Sums to 4.31 million employed.
export const EMPLOYMENT_BY_SECTOR = [
  { name: "Services", people: 3.02, share: 70.1 },
  { name: "Industry", people: 1.03, share: 23.9 },
  { name: "Agriculture", people: 0.26, share: 6.0 },
];

// Quarterly real GDP growth, quarter on quarter, 2025 Q1 to 2026 Q4.
export const QUARTERLY_GROWTH = [
  { label: "2025 Q1", value: 0.4 },
  { label: "2025 Q2", value: 0.6 },
  { label: "2025 Q3", value: 0.3 },
  { label: "2025 Q4", value: 0.5 },
  { label: "2026 Q1", value: 0.7 },
  { label: "2026 Q2", value: 0.5 },
  { label: "2026 Q3", value: 0.6 },
  { label: "2026 Q4", value: 0.4 },
];

// Labour market, 2026: 4.31m employed + 0.17m unemployed = 4.48m labour force.
export const LABOUR = {
  employed: 4.31,
  unemployed: 0.17,
  labourForce: 4.48,
  participation: 68.9,
  medianHouseholdIncome: 86400,
};

// Latest releases, newest first.
export const RELEASES = [
  { title: "Consumer prices, Oct 2026", date: "2026-11-20", note: "CPI up 2.1% on a year earlier" },
  { title: "Labour force survey, Oct 2026", date: "2026-11-18", note: "Unemployment 3.8%, participation 68.9%" },
  { title: "Population estimate 2026", date: "2026-11-12", note: "Population 8.42 million, up 0.4% on 2025" },
  { title: "GDP, Q3 2026", date: "2026-11-06", note: "Real GDP up 1.8% on a year earlier" },
];

export const LATEST_YEAR = 2026;
export const COUNTRY = "Republic of Meridia";
export const CAPITAL = "Meridia City";
