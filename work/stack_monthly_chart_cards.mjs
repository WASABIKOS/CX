import fs from 'node:fs';
for (const file of ['work/build_dashboard_clean.mjs','outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html']) {
  let h=fs.readFileSync(file,'utf8');
  h=h.replaceAll('.chart-stack{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));','.chart-stack{display:grid;grid-template-columns:1fr;');
  fs.writeFileSync(file,h);
}
console.log('monthly chart cards stacked');
