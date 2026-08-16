import fs from 'node:fs';
for (const file of ['work/build_dashboard_clean.mjs','outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html']) {
  let h=fs.readFileSync(file,'utf8');
  h=h.replace(/trend\[m\]=responses\.filter/g,'trend[m]=RESPONSES.filter');
  fs.writeFileSync(file,h);
}
console.log('chart data reference fixed');
