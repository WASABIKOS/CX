import fs from 'node:fs/promises';

const files = ['work/build_dashboard_clean.mjs', 'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html'];
const commentBlock = String.raw`var commentPool=feedback.slice().sort(function(a,b){return a.klass.localeCompare(b.klass)}).slice(0,6);$('comments').innerHTML=commentPool.length?commentPool.map(function(x){var tagClass=x.klass==='Detractor'?'tag-detractor':x.klass==='Promotor'?'tag-promotor':'tag-neutro';return '<div class="comment"><div class="feedback-tags"><span class="feedback-tag '+tagClass+'">'+x.klass+'</span><span class="feedback-tag tag-category" title="'+activeCategory(x)+'">'+activeCategory(x)+'</span></div><div class="comment-meta">'+monthLabel(x.month)+'</div><div class="comment-text">'+String(x.feedback).replace(/</g,'&lt;')+'</div></div>'}).join(''):'<div class="empty">No hay comentarios para esta selección.</div>'`;
const searchBlock = String.raw`var query=String(commentSearch.value||'').trim().toLowerCase();var matches=query?feedback.filter(function(x){return String(x.feedback||'').toLowerCase().includes(query)}):[];if(!query){searchCount.textContent='Escribe una palabra para comenzar.';searchResults.innerHTML='<div class="empty">Sin búsqueda activa.</div>'}else{searchCount.textContent=fmt(matches.length)+' comentario'+(matches.length===1?'':'s')+' encontrado'+(matches.length===1?'':'s');searchResults.innerHTML=matches.length?matches.map(function(x){var text=String(x.feedback||'').replace(/</g,'&lt;');var tagClass=x.klass==='Detractor'?'tag-detractor':x.klass==='Promotor'?'tag-promotor':'tag-neutro';return '<div class="search-result"><div class="feedback-tags"><span class="feedback-tag '+tagClass+'">'+x.klass+'</span><span class="feedback-tag tag-category" title="'+activeCategory(x)+'">'+activeCategory(x)+'</span></div><div class="search-result-meta">'+monthLabel(x.month)+'</div><div class="search-result-text">'+text+'</div></div>'}).join(''):'<div class="empty">No hay comentarios que coincidan con “'+String(commentSearch.value).replace(/</g,'&lt;')+'”.</div>'}`;
for (const file of files) {
  let h = await fs.readFile(file, 'utf8');
  const a = h.indexOf('var commentPool=');
  const b = h.indexOf('\nvar query=', a);
  const c = h.indexOf('var topDriver=', b);
  if (a >= 0 && b >= 0 && c >= 0) h = h.slice(0, a) + commentBlock + '\n' + searchBlock + h.slice(c);
  await fs.writeFile(file, h, 'utf8');
}
console.log('feedback render syntax fixed');
