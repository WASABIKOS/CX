import fs from 'node:fs/promises';

const files = ['work/build_dashboard_clean.mjs', 'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html'];
const from = '<div class="panel-head"><div><h2>Evolución mensual del NPS</h2></div></div><div class="bar-chart" id="npsChart"></div>';
for (const file of files) {
  let s = await fs.readFile(file, 'utf8');
  s = s.replaceAll(from, '<div class="bar-chart" id="npsChart"></div>');
  await fs.writeFile(file, s, 'utf8');
}
console.log('duplicate NPS heading removed');
