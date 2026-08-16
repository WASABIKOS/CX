import fs from 'node:fs';
for (const file of ['work/build_dashboard_clean.mjs','outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html']) {
  let h=fs.readFileSync(file,'utf8');
  const pos=h.indexOf('\nrender();');
  if(pos<0) throw new Error('render marker missing');
  if(h[pos-1]!=='}') h=h.slice(0,pos)+'}'+h.slice(pos);
  fs.writeFileSync(file,h);
}
console.log('forecast render closed');
