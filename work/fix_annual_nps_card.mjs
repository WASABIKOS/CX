import fs from 'node:fs';
for (const file of ['work/build_dashboard_clean.mjs','outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html']) {
  let h=fs.readFileSync(file,'utf8');
  h=h.replace("var observed=actualSeries.filter(function(v){return v!==null});var lastObserved=observed.length?observed[observed.length-1]:0;", "var observed=actualSeries.filter(function(v){return v!==null});var lastObserved=observed.length?observed[observed.length-1]:0;var annualRows=RESPONSES.filter(function(x){return x.month.indexOf('2026-')===0&&(activeSegment==='Total'||x.segment===activeSegment)});var annualNps=annualRows.length?calcNps(annualRows):0;");
  h=h.replace("(observed.length?lastObserved.toFixed(1):'—')+'</div><div class=\"ksub\">'+(latestMonth?monthLabel(latestMonth):'Sin datos')", "(annualRows.length?annualNps.toFixed(1):'—')+'</div><div class=\"ksub\">Acumulado 2026 · '+(latestMonth?monthLabel(latestMonth):'Sin datos')");
  h=h.replace("(target-lastObserved>=0?'positive':'negative')+'\">'+(target-lastObserved>=0?'+':'')+(target-lastObserved).toFixed(1)", "(target-annualNps>=0?'positive':'negative')+'\">'+(target-annualNps>=0?'+':'')+(target-annualNps).toFixed(1)");
  fs.writeFileSync(file,h);
}
console.log('annual NPS card fixed');
