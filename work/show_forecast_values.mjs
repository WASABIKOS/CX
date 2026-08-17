import fs from 'node:fs';

for (const file of ['work/build_dashboard_clean.mjs','outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html']) {
  let h=fs.readFileSync(file,'utf8');
  if(!h.includes('var actualLabels=forecastMonths')){
    const marker=";$('forecastChart').innerHTML=";
    const labels=";var actualLabels=forecastMonths.map(function(m,i){var v=actualSeries[i];return v===null?'':'<text x=\"'+scaleX(i)+'\" y=\"'+(scaleY(v)-9)+'\" text-anchor=\"middle\" fill=\"#fff\" font-size=\"9\" font-weight=\"700\">'+v.toFixed(1)+'</text>'}).join('');var requiredLabels=forecastMonths.map(function(m,i){var v=requiredSeries[i];return v===null?'':'<text x=\"'+scaleX(i)+'\" y=\"'+(scaleY(v)+15)+'\" text-anchor=\"middle\" fill=\"#8db600\" font-size=\"8\" font-weight=\"700\">'+v.toFixed(1)+'</text>'}).join('')";
    h=h.replace(marker,labels+marker);
    h=h.replace("+actualPoints+requiredPoints+'</svg>'","+actualPoints+requiredPoints+actualLabels+requiredLabels+'</svg>'");
  }
  fs.writeFileSync(file,h);
}
console.log('forecast values made visible');
