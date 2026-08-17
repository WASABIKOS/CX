import fs from 'node:fs/promises';
const p='outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html'; let h=await fs.readFile(p,'utf8');
h=h.replace('id="chart"<div','id="chart"><div');
h=h.replace('id="uxtrend" class="uxchart<div','id="uxtrend" class="uxchart"><div');
await fs.writeFile(p,h,'utf8');
console.log({chart:h.includes('id="chart"><div'),trend:h.includes('id="uxtrend" class="uxchart"><div')});
