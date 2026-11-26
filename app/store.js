// MeridiaStats store — the year's state, saved preferences and every
// calculation the pages show, so a number is computed once, in one place,
// and every page that shows it agrees.
import {
  AGE_GROUPS,
  EMPLOYMENT_BY_SECTOR,
  INDICATORS,
  LABOUR,
  LATEST_YEAR,
  QUARTERLY_GROWTH,
  REGIONS,
  SECTORS,
  YEARS,
} from "./data.js";

const STORAGE_KEY = "meridiastats-v1";

// ---- state ---------------------------------------------------------------
export const state = load();

function load() {
  const fallback = { year: LATEST_YEAR, regionSort: "population", regionDir: "desc", explorerQuery: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...fallback };
    const saved = JSON.parse(raw);
    const merged = { ...fallback, ...saved };
    if (!YEARS.includes(merged.year)) merged.year = LATEST_YEAR;
    return merged;
  } catch {
    return { ...fallback };
  }
}

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or a full store: the site still works, it just forgets.
  }
}

export function setYear(year) {
  if (YEARS.includes(year)) {
    state.year = year;
    save();
  }
}

// ---- lookups ---------------------------------------------------------------
export function indicator(id) {
  return INDICATORS.find((item) => item.id === id);
}

export function valueAt(id, year) {
  const found = indicator(id);
  return found ? found.values[year] : undefined;
}

export function latest(id) {
  return valueAt(id, LATEST_YEAR);
}

// ---- derived figures (each recomputable from the numbers on screen) -------
export function yearOnYear(id, year) {
  const now = valueAt(id, year);
  const before = valueAt(id, year - 1);
  if (now === undefined || before === undefined || before === 0) return null;
  return ((now - before) / Math.abs(before)) * 100;
}

// Population change in a year, from the components the site publishes.
export function populationChange(year) {
  const natural = valueAt("births", year) - valueAt("deaths", year);
  const migration = valueAt("net_migration", year);
  return { natural, migration, total: natural + migration };
}

// Trade balance: exports minus imports, in $ billion.
export function tradeBalance(year) {
  return valueAt("exports", year) - valueAt("imports", year);
}

// Unemployment rate recomputed from headcounts: unemployed / labour force.
export function unemploymentFromHeadcounts() {
  return (LABOUR.unemployed / LABOUR.labourForce) * 100;
}

// GDP per capita recomputed from GDP and population.
export function gdpPerCapitaFromParts(year) {
  return (valueAt("gdp", year) * 1e9) / (valueAt("population", year) * 1e6);
}

// Sums used to prove the tables add up.
export function regionPopulationTotal() {
  return REGIONS.reduce((sum, region) => sum + region.population, 0);
}

export function regionShareTotal() {
  return REGIONS.reduce((sum, region) => sum + region.share, 0);
}

export function sectorShareTotal() {
  return SECTORS.reduce((sum, sector) => sum + sector.share, 0);
}

export function ageShareTotal() {
  return AGE_GROUPS.reduce((sum, group) => sum + group.share, 0);
}

export function employmentTotal() {
  return EMPLOYMENT_BY_SECTOR.reduce((sum, sector) => sum + sector.people, 0);
}

export function averageQuarterlyGrowth() {
  const values = QUARTERLY_GROWTH.map((quarter) => quarter.value);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// ---- formatting -------------------------------------------------------------
export function fmt(value, format) {
  if (value === undefined || value === null) return "—";
  switch (format) {
    case "millions":
      return `${value.toFixed(2)}m`;
    case "billions":
      return `$${value.toFixed(0)}bn`;
    case "dollars":
      return `$${Math.round(value).toLocaleString("en-US")}`;
    case "percent1":
      return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
    case "rate1":
      // A level, not a change: no leading plus (an unemployment rate is 3.8%, not +3.8%).
      return `${value.toFixed(1)}%`;
    case "years1":
      return `${value.toFixed(1)}`;
    case "integer":
      return Math.round(value).toLocaleString("en-US");
    case "signed":
      return `${value > 0 ? "+" : ""}${Math.round(value).toLocaleString("en-US")}`;
    default:
      return String(value);
  }
}

export function fmtSignedPercent(value) {
  if (value === null || value === undefined) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

// ---- data explorer -----------------------------------------------------------
export function filteredIndicators(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return INDICATORS;
  return INDICATORS.filter(
    (item) =>
      item.name.toLowerCase().includes(needle) ||
      item.unit.toLowerCase().includes(needle) ||
      item.method.toLowerCase().includes(needle),
  );
}

// Regions sorted by the column the visitor picked.
export function sortedRegions() {
  const key = state.regionSort;
  const dir = state.regionDir === "asc" ? 1 : -1;
  return [...REGIONS].sort((a, b) => (a[key] - b[key]) * dir);
}

export function setRegionSort(key) {
  if (state.regionSort === key) {
    state.regionDir = state.regionDir === "asc" ? "desc" : "asc";
  } else {
    state.regionSort = key;
    state.regionDir = "desc";
  }
  save();
}

// CSV of the explorer table the visitor is looking at.
export function explorerCsv(query) {
  const rows = filteredIndicators(query);
  const lines = [["Indicator", "Unit", ...YEARS.map(String)].join(",")];
  for (const row of rows) {
    const cells = [
      `"${row.name}"`,
      `"${row.unit}"`,
      ...YEARS.map((year) => row.values[year]),
    ];
    lines.push(cells.join(","));
  }
  return lines.join("\n");
}
