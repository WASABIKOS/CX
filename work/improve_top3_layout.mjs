import fs from 'node:fs/promises';

const files = ['work/build_dashboard_clean.mjs', 'work/replace_complaint_chart.mjs'];
const oldChart = '.top3-chart{min-height:300px;display:flex;align-items:flex-start;gap:18px;overflow-x:auto;padding:12px 8px 18px;border-bottom:1px solid var(--border)}';
const newChart = '.top3-chart{min-height:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));align-items:start;gap:22px 18px;overflow:visible;padding:14px 8px 18px;border-bottom:1px solid var(--border)}';
const oldMonth = '.top3-month{flex:0 0 285px}';
const newMonth = '.top3-month{min-width:0;width:100%}';
const oldRow = '.top3-row{display:grid;grid-template-columns:108px 1fr 43px;gap:7px;align-items:center;margin:13px 0}';
const newRow = '.top3-row{display:grid;grid-template-columns:108px minmax(0,1fr) 43px;gap:8px;align-items:center;margin:15px 0}';
for (const file of files) {
  let text = await fs.readFile(file, 'utf8');
  text = text.replaceAll(oldChart, newChart).replaceAll(oldMonth, newMonth).replaceAll(oldRow, newRow);
  await fs.writeFile(file, text, 'utf8');
}
console.log('top 3 responsive layout improved');
