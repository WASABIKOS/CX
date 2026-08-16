import fs from 'node:fs';
for (const file of ['work/build_dashboard_clean.mjs','outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html']) {
  let h=fs.readFileSync(file,'utf8');
  if(!h.includes('.forecast-panel{display:none!important}')){
    h=h.replace('</style>','.forecast-panel{display:none!important}</style>');
  }
  fs.writeFileSync(file,h);
}
console.log('forecast hidden temporarily');
