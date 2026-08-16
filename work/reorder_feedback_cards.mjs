import fs from 'node:fs/promises';

const path = 'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html';
let h = await fs.readFile(path, 'utf8');

h = h.replace('.comments-layout{display:grid;grid-template-columns:1.45fr .55fr;gap:14px;margin-bottom:14px}', '.comments-layout{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:14px;align-items:stretch}.comments-layout>.panel{height:100%}.comments-layout .comments{grid-template-columns:1fr}');
h = h.replace('@media(max-width:1100px){.comments-layout{grid-template-columns:1fr}}', '@media(max-width:1100px){.comments-layout{grid-template-columns:1fr}}');

const sectionStart = h.indexOf('<section class="comments-layout">');
const sectionEnd = h.indexOf('</section></main>', sectionStart);
if (sectionStart < 0 || sectionEnd < 0) throw new Error('No se encontró la sección de tarjetas de comentarios');
const section = h.slice(sectionStart, sectionEnd + '</section>'.length);
const markers = {
  search: '<article class="panel search-card">',
  comments: '<article class="panel"><div class="panel-head"><div><h2>Comentarios representativos</h2>',
  coverage: '<article class="panel"><div class="panel-head"><div><h2>Cobertura de categorización</h2>',
};
function articleFrom(marker) {
  const start = section.indexOf(marker);
  if (start < 0) throw new Error(`No se encontró ${marker}`);
  const end = section.indexOf('</article>', start) + '</article>'.length;
  return section.slice(start, end);
}
const ordered = '<section class="comments-layout">' + articleFrom(markers.search) + articleFrom(markers.comments) + articleFrom(markers.coverage) + '</section>';
h = h.slice(0, sectionStart) + ordered + h.slice(sectionEnd + '</section>'.length);
await fs.writeFile(path, h, 'utf8');
console.log('feedback cards reordered: search, comments, coverage');
