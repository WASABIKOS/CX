import fs from 'node:fs';
for (const file of ['work/build_dashboard_clean.mjs','outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html']) {
  let h=fs.readFileSync(file,'utf8');
  const marker="\nrender();";
  const pos=h.indexOf(marker);
  if(pos>0 && h[pos-1]==='}') h=h.slice(0,pos-1)+h.slice(pos);
  fs.writeFileSync(file,h);
}
console.log('render closure fixed');
