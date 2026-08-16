import fs from 'node:fs/promises';

const path = 'work/build_dashboard_clean.mjs';
let s = await fs.readFile(path, 'utf8');
if (!s.includes('.bar.nps-white')) {
  s = s.replace('.bar.green{background:var(--green)}', '.bar.green{background:var(--green)}.bar.nps-white{background:#fff}');
}
s = s.replace("renderBarChart($('npsChart'),months,function(m){return calcNps(trend[m])||0},function(v){return v.toFixed(1)},function(v){return v>=0?'green':'red'});", "renderBarChart($('npsChart'),months,function(m){return calcNps(trend[m])||0},function(v){return v.toFixed(1)},function(){return 'nps-white'});");
await fs.writeFile(path, s, 'utf8');
console.log('NPS bars set to white');
