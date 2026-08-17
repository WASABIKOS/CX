import fs from 'node:fs';

const start = `function render(){var responses=selectedResponses(),feedback=selectedFeedback(),months=[...new Set(responses.map(function(x){return x.month}))].sort(),nps=calcNps(responses),pro=responses.filter(function(x){return x.klass==='Promotor'}).length,neu=responses.filter(function(x){return x.klass==='Neutro'}).length,det=responses.filter(function(x){return x.klass==='Detractor'}).length,pct=function(v){return responses.length?v/responses.length*100:0},base2026=responses.filter(function(x){return x.month.indexOf('2026-')===0}),latestMonth=(months.filter(function(x){return x.indexOf('2026-')===0}).slice(-1)[0]||months.slice(-1)[0]||'');`;

for (const file of ['work/build_dashboard_clean.mjs','outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html']) {
  let h=fs.readFileSync(file,'utf8');
  if (!h.includes('function render(){var responses=selectedResponses()')) {
    const pos=h.indexOf('var cards=');
    h=h.slice(0,pos)+start+h.slice(pos);
  }
  const marker='\nrender();';
  const pos=h.indexOf(marker);
  if(pos>=0 && h[pos-1]!=='}') h=h.slice(0,pos)+'}'+h.slice(pos);
  fs.writeFileSync(file,h);
}
console.log('render function restored');
