// MeridiaStats charts — hand-rolled SVG, no libraries. Each builder takes
// plain numbers and returns an SVG string the page drops into place.
const NAVY = "#16324f";
const OCHRE = "#d98e2b";
const SLATE = "#5b6b7a";
const GRID = "#d8d2c6";
const TEAL = "#2e7d6b";
const RUST = "#b4552d";

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function niceTicks(min, max, count = 4) {
  const span = max - min || 1;
  const step = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(step));
  const norm = step / magnitude;
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  const size = nice * magnitude;
  const start = Math.floor(min / size) * size;
  const ticks = [];
  for (let value = start; value <= max + size * 0.5; value += size) ticks.push(value);
  return ticks;
}

// Line chart with dots, value labels and a year axis.
export function lineChart({ labels, values, format, width = 560, height = 220, color = NAVY, area = true }) {
  const padL = 52;
  const padR = 14;
  const padT = 18;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min > 0) min = Math.max(0, min - (max - min) * 0.15);
  min = Math.floor(min);
  max = Math.ceil(max + (max - min) * 0.08);
  const x = (i) => padL + (i / (values.length - 1)) * innerW;
  const y = (v) => padT + innerH - ((v - min) / (max - min)) * innerH;
  const ticks = niceTicks(min, max);
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const grid = ticks
    .map(
      (t) =>
        `<line x1="${padL}" y1="${y(t)}" x2="${width - padR}" y2="${y(t)}" stroke="${GRID}" stroke-width="1"/>` +
        `<text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="${SLATE}">${esc(format(t))}</text>`,
    )
    .join("");
  const dots = values
    .map(
      (v, i) =>
        `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#f7f5f0" stroke="${color}" stroke-width="2"/>` +
        `<text x="${x(i)}" y="${y(v) - 9}" text-anchor="middle" font-size="11" font-weight="600" fill="${NAVY}">${esc(format(v))}</text>`,
    )
    .join("");
  const axis = labels
    .map((label, i) => `<text x="${x(i)}" y="${height - 8}" text-anchor="middle" font-size="11" fill="${SLATE}">${esc(label)}</text>`)
    .join("");
  const fill = area
    ? `<polygon points="${padL},${y(min)} ${points} ${x(values.length - 1)},${y(min)}" fill="${color}" opacity="0.08"/>`
    : "";
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Line chart">${grid}${fill}<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}${axis}</svg>`;
}

// Horizontal bars: a label, a bar scaled to the largest value, and the value.
export function hbarChart({ rows, format, width = 560, barHeight = 26, gap = 12, color = NAVY }) {
  const labelW = 96;
  const valueW = 64;
  const height = rows.length * (barHeight + gap) + 8;
  const max = Math.max(...rows.map((row) => row.value));
  const barW = width - labelW - valueW;
  const bars = rows
    .map((row, i) => {
      const y = 8 + i * (barHeight + gap);
      const w = Math.max(2, (row.value / max) * barW);
      return (
        `<text x="0" y="${y + barHeight / 2 + 4}" font-size="13" fill="${NAVY}">${esc(row.label)}</text>` +
        `<rect x="${labelW}" y="${y}" width="${w}" height="${barHeight}" rx="3" fill="${row.color || color}"/>` +
        `<text x="${labelW + w + 8}" y="${y + barHeight / 2 + 4}" font-size="13" font-weight="600" fill="${NAVY}">${esc(format(row.value))}</text>`
      );
    })
    .join("");
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Bar chart">${bars}</svg>`;
}

// Grouped bars: two series side by side per category.
export function groupedBars({ labels, series, format, width = 560, height = 230 }) {
  const padL = 52;
  const padR = 10;
  const padT = 22;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all) * 1.12;
  const groupW = innerW / labels.length;
  const barW = Math.min(34, (groupW - 24) / series.length);
  const y = (v) => padT + innerH - (v / max) * innerH;
  const colors = [NAVY, OCHRE];
  const ticks = niceTicks(0, max, 3);
  const grid = ticks
    .map(
      (t) =>
        `<line x1="${padL}" y1="${y(t)}" x2="${width - padR}" y2="${y(t)}" stroke="${GRID}" stroke-width="1"/>` +
        `<text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="${SLATE}">${esc(format(t))}</text>`,
    )
    .join("");
  let bars = "";
  labels.forEach((label, i) => {
    const cx = padL + groupW * i + groupW / 2;
    series.forEach((s, j) => {
      const v = s.values[i];
      const bx = cx - (series.length * barW) / 2 + j * barW;
      bars +=
        `<rect x="${bx}" y="${y(v)}" width="${barW - 3}" height="${padT + innerH - y(v)}" rx="2" fill="${colors[j]}"/>` +
        `<text x="${bx + (barW - 3) / 2}" y="${y(v) - 5}" text-anchor="middle" font-size="11" font-weight="600" fill="${NAVY}">${esc(format(v))}</text>`;
    });
    bars += `<text x="${cx}" y="${height - 8}" text-anchor="middle" font-size="11" fill="${SLATE}">${esc(label)}</text>`;
  });
  const legend = series
    .map(
      (s, j) =>
        `<rect x="${padL + j * 130}" y="2" width="10" height="10" rx="2" fill="${colors[j]}"/><text x="${padL + j * 130 + 15}" y="11" font-size="12" fill="${NAVY}">${esc(s.name)}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Grouped bar chart">${legend}${grid}${bars}</svg>`;
}

// Donut: shares that sum to 100%, with a centre total and a legend.
export function donutChart({ rows, width = 300, height = 300, centerLabel, centerValue }) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 14;
  const inner = radius * 0.62;
  const colors = [NAVY, OCHRE, TEAL, RUST, SLATE];
  let angle = -Math.PI / 2;
  let slices = "";
  rows.forEach((row, i) => {
    const sweep = (row.share / 100) * Math.PI * 2;
    const large = sweep > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(angle);
    const y1 = cy + radius * Math.sin(angle);
    const x2 = cx + radius * Math.cos(angle + sweep);
    const y2 = cy + radius * Math.sin(angle + sweep);
    const ix1 = cx + inner * Math.cos(angle + sweep);
    const iy1 = cy + inner * Math.sin(angle + sweep);
    const ix2 = cx + inner * Math.cos(angle);
    const iy2 = cy + inner * Math.sin(angle);
    slices += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${ix1.toFixed(1)} ${iy1.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${ix2.toFixed(1)} ${iy2.toFixed(1)} Z" fill="${colors[i % colors.length]}"/>`;
    angle += sweep;
  });
  const legend = rows
    .map(
      (row, i) =>
        `<div class="legend-row"><span class="swatch" style="background:${colors[i % colors.length]}"></span>${esc(row.name)}<b>${row.share.toFixed(1)}%</b></div>`,
    )
    .join("");
  return (
    `<div class="donut-wrap"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Donut chart">${slices}` +
    `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="13" fill="${SLATE}">${esc(centerLabel)}</text>` +
    `<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="20" font-weight="700" fill="${NAVY}">${esc(centerValue)}</text></svg>` +
    `<div class="donut-legend">${legend}</div></div>`
  );
}

// Small vertical bars for the quarterly growth strip.
export function miniBars({ rows, width = 560, height = 150 }) {
  const padB = 24;
  const padT = 20;
  const innerH = height - padT - padB;
  const max = Math.max(...rows.map((r) => r.value)) * 1.25;
  const slot = width / rows.length;
  const barW = Math.min(36, slot * 0.55);
  const bars = rows
    .map((row, i) => {
      const h = (row.value / max) * innerH;
      const x = slot * i + (slot - barW) / 2;
      const y = padT + innerH - h;
      return (
        `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="2" fill="${row.value >= 0.6 ? TEAL : NAVY}"/>` +
        `<text x="${x + barW / 2}" y="${y - 5}" text-anchor="middle" font-size="11" font-weight="600" fill="${NAVY}">+${row.value.toFixed(1)}%</text>` +
        `<text x="${x + barW / 2}" y="${height - 8}" text-anchor="middle" font-size="10.5" fill="${SLATE}">${esc(row.label)}</text>`
      );
    })
    .join("");
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Quarterly growth bars">${bars}</svg>`;
}

export const CHART_COLORS = { navy: NAVY, ochre: OCHRE, slate: SLATE, teal: TEAL, rust: RUST };
