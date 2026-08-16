import fs from 'node:fs';
for (const file of ['work/build_dashboard_clean.mjs','outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html']) {
  let h=fs.readFileSync(file,'utf8');
  if(!h.includes('report-update-card')){
    h=h.replace('.subtitle{color:', '.report-update-card{margin:14px 0 18px;padding:10px 11px;background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--orange);border-radius:9px;color:var(--muted);font-size:10px;line-height:1.35}.report-update-card strong{display:block;margin-top:4px;color:var(--text);font-size:12px}.subtitle{color:');
    h=h.replace('<div class="subtitle">CWP · Experiencia del cliente<br>Lectura ejecutiva y drivers accionables</div>', '<div class="subtitle">CWP · Experiencia del cliente<br>Lectura ejecutiva y drivers accionables</div><div class="report-update-card">Última actualización del reporte<strong>14 Ago 2026 · 10:16</strong></div>');
  }
  fs.writeFileSync(file,h);
}
console.log('report update card added');
