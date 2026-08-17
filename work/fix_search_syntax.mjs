import fs from 'node:fs';

const files = [
  'work/build_dashboard_clean.mjs',
  'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html'
];

const replacement = `var query=String(commentSearch.value||'').trim().toLowerCase();var matches=query?feedback.filter(function(x){return String(x.feedback||'').toLowerCase().includes(query)}):[];searchCount.textContent=query?(fmt(matches.length)+' comentario'+(matches.length===1?'':'s')+' encontrado'+(matches.length===1?'':'s')):'Escribe una palabra para comenzar.';searchResults.innerHTML=matches.length?matches.map(function(x){var text=String(x.feedback||'').replace(/</g,'&lt;');var tagClass=x.klass==='Detractor'?'tag-detractor':x.klass==='Promotor'?'tag-promotor':'tag-neutro';return '<div class="search-result"><div class="feedback-tags"><span class="feedback-tag '+tagClass+'">'+x.klass+'</span><span class="feedback-tag tag-category" title="'+activeCategory(x)+'">'+activeCategory(x)+'</span></div><div class="search-result-meta">'+monthLabel(x.month)+'</div><div class="search-result-text">'+text+'</div></div>'}).join(''):(query?'<div class="empty">No hay comentarios que coincidan con la búsqueda.</div>':'<div class="empty">Sin búsqueda activa.</div>');var topDriver=`;

for (const file of files) {
  let h = fs.readFileSync(file, 'utf8');
  const start = h.indexOf("var query=String(commentSearch.value||'').trim().toLowerCase();");
  const end = h.indexOf("var topDriver=", start);
  if (start >= 0 && end > start) {
    h = h.slice(0, start) + replacement + h.slice(end + "var topDriver=".length);
    fs.writeFileSync(file, h);
  }
}
console.log('search syntax fixed');
