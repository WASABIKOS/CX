import fs from 'node:fs/promises';

const files = ['work/build_dashboard_clean.mjs', 'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html'];

const sampleArticle = '<article class="panel"><div class="panel-head"><div><h2>Muestras por mes</h2><div class="panel-question">¿Cuántas respuestas tenemos y cómo varían contra el mes anterior?</div></div></div><div class="bar-chart" id="sampleChart"></div></article>';
const npsArticle = '<article class="panel"><div class="panel-head"><div><h2>Evolución mensual del NPS</h2><div class="panel-question">¿La recomendación mejora o empeora?</div><div id="npsVariation" class="trend-summary"></div></div></div><div class="bar-chart" id="npsChart"></div></article>';

const renderFunction = "function renderBarChart(container,months,getValue,formatValue,colorFn,deltaFn,deltaFormatFn,centerZero){container.innerHTML='';if(!months.length){container.innerHTML='<div class=\"empty\">No hay datos para esta selección.</div>';return}var values=months.map(getValue),max=Math.max.apply(null,values.map(function(v){return Math.abs(v||0)}).concat([1]));months.forEach(function(m,i){var v=values[i],item=document.createElement('div');item.className='bar-item';var track=document.createElement('div');track.className='bar-track'+(centerZero?' nps-track':'');if(centerZero){var zero=document.createElement('div');zero.className='nps-zero-line';track.appendChild(zero)}var bar=document.createElement('div');bar.className='bar '+colorFn(v);var height=centerZero?Math.max(Math.abs(v)/200*205,3):Math.max(Math.abs(v)/max*175,3);bar.style.height=height+'px';if(centerZero){bar.style.top=(v>=0?(102.5-height):102.5)+'px';bar.style.bottom='auto'}var value=document.createElement('span');value.className='bar-value';value.style.top=centerZero&&v<0?(height+3)+'px':'-20px';value.textContent=formatValue(v);bar.appendChild(value);track.appendChild(bar);var label=document.createElement('div');label.className='month-label';label.textContent=monthLabel(m);item.appendChild(track);item.appendChild(label);var delta=deltaFn?deltaFn(m,i,months,values):null;if(delta!==null&&delta!==undefined){var deltaLabel=document.createElement('div');deltaLabel.className='bar-delta '+(delta>=0?'up':'down');deltaLabel.textContent='Δ '+deltaFormatFn(delta);item.appendChild(deltaLabel)}container.appendChild(item)})}";

const extraCss = '.chart-stack{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:14px;align-items:stretch}.chart-stack>.panel{min-width:0}.bar-delta{height:16px;font-size:9px;font-weight:850;text-align:center;white-space:nowrap}.bar-delta.up{color:var(--green)}.bar-delta.down{color:var(--red)}.nps-track{display:block!important;position:relative!important;height:205px!important}.nps-zero-line{position:absolute;left:0;right:0;top:50%;height:1px;background:#aaa29c;z-index:0}.nps-track .bar{position:absolute;left:50%;transform:translateX(-50%);z-index:1}.nps-track .bar-value{z-index:2}';

for (const file of files) {
  let h = await fs.readFile(file, 'utf8');
  h = h.replace('.chart-stack{display:grid;grid-template-columns:1fr;gap:14px;margin-bottom:14px}', extraCss);
  if (!h.includes('.nps-track{')) h = h.replace('</style>', extraCss + '</style>');
  const start = h.indexOf('<section class="chart-stack">');
  if (start >= 0) {
    const firstEnd = h.indexOf('</article>', start) + '</article>'.length;
    const sectionEnd = h.indexOf('</section>', firstEnd);
    const section = h.slice(start, sectionEnd + '</section>'.length);
    if (section && (section.match(/<article class="panel">/g)||[]).length < 3) {
      const top3 = h.slice(firstEnd, sectionEnd);
      h = h.slice(0, start) + '<section class="chart-stack">' + sampleArticle + npsArticle + top3 + '</section>' + h.slice(sectionEnd + '</section>'.length);
    }
  }
  const fnStart = h.indexOf('function renderBarChart');
  const fnEnd = h.indexOf('\nvar ', fnStart);
  if (fnStart >= 0 && fnEnd > fnStart) h = h.slice(0, fnStart) + renderFunction + h.slice(fnEnd);
  h = h.replace("function(v){return (v>=0?'+':'')+v.toFixed(1)+' pts'});var npsDelta", "function(v){return (v>=0?'+':'')+v.toFixed(1)+' pts'},true);var npsDelta");
  await fs.writeFile(file, h, 'utf8');
}
console.log('monthly charts separated and NPS baseline fixed');
