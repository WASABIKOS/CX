import fs from 'node:fs/promises';

const path = 'work/build_dashboard_clean.mjs';
let s = await fs.readFile(path, 'utf8');

const cssNeedle = '.comments{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}';
const cssInsert = cssNeedle + '.comments-layout{display:grid;grid-template-columns:1.45fr .55fr;gap:14px;margin-bottom:14px}.search-card{min-width:0}.search-input{width:100%;height:40px;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:0 12px;margin:8px 0 12px}.search-input:focus{outline:2px solid var(--orange);outline-offset:1px}.search-count{color:var(--muted);font-size:11px;margin-bottom:10px}.search-results{max-height:540px;overflow:auto;display:grid;gap:9px}.search-result{background:var(--surface2);border:1px solid #38332f;border-radius:9px;padding:11px;line-height:1.45}.search-result-meta{font-size:10px;color:var(--muted);margin-bottom:5px}.search-result-text{font-size:12px}.search-highlight{background:var(--yellow);color:#191817;border-radius:2px;padding:0 2px}@media(max-width:1100px){.comments-layout{grid-template-columns:1fr}}';
if (!s.includes('.comments-layout{')) s = s.replace(cssNeedle, cssInsert);

const endNeedle = '<article class="panel"><div class="panel-head"><div><h2>Comentarios representativos</h2><div class="panel-question">Muestra diversa de la selección actual</div></div></div><div class="comments" id="comments"></div></article></main>';
const endInsert = '<section class="comments-layout"><article class="panel"><div class="panel-head"><div><h2>Comentarios representativos</h2><div class="panel-question">Muestra diversa de la selección actual</div></div></div><div class="comments" id="comments"></div></article><article class="panel search-card"><div class="panel-head"><div><h2>Buscar comentarios</h2><div class="panel-question">Filtra por palabra o frase dentro de la selección actual</div></div></div><input id="commentSearch" class="search-input" type="search" placeholder="Ejemplo: precio" autocomplete="off"><div id="searchCount" class="search-count">Escribe una palabra para comenzar.</div><div id="searchResults" class="search-results"><div class="empty">Sin búsqueda activa.</div></div></article></section></main>';
if (!s.includes('id="commentSearch"')) s = s.replace(endNeedle, endInsert);

s = s.replace("const nav=$('segmentNav'),monthFilter=$('monthFilter'),categoryFilter=$('categoryFilter'),classFilter=$('classFilter');", "const nav=$('segmentNav'),monthFilter=$('monthFilter'),categoryFilter=$('categoryFilter'),classFilter=$('classFilter'),commentSearch=$('commentSearch'),searchCount=$('searchCount'),searchResults=$('searchResults');");
s = s.replace("[monthFilter,categoryFilter,classFilter].forEach(function(el){el.addEventListener('change',render)});", "[monthFilter,categoryFilter,classFilter].forEach(function(el){el.addEventListener('change',render)});commentSearch.addEventListener('input',render);");
s = s.replace("monthFilter.value='all';categoryFilter.value='all';classFilter.value='all';", "monthFilter.value='all';categoryFilter.value='all';classFilter.value='all';commentSearch.value='';");

const renderNeedle = "var topDriver=top.length?top[0][0]:'sin categoría dominante';";
const searchCode = "var query=String(commentSearch.value||'').trim().toLowerCase();var matches=query?feedback.filter(function(x){return String(x.feedback||'').toLowerCase().includes(query)}):[];if(!query){searchCount.textContent='Escribe una palabra para comenzar.';searchResults.innerHTML='<div class=\"empty\">Sin búsqueda activa.</div>'}else{searchCount.textContent=fmt(matches.length)+' comentario'+(matches.length===1?'':'s')+' encontrado'+(matches.length===1?'':'s');searchResults.innerHTML=matches.length?matches.map(function(x){var text=String(x.feedback||'').replace(/</g,'&lt;');var safeQuery=query.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&');var marked=text.replace(new RegExp('('+safeQuery+')','ig'),'<mark class=\"search-highlight\">$1</mark>');return '<div class=\"search-result\"><div class=\"search-result-meta\">'+x.klass+' · '+activeCategory(x)+' · '+monthLabel(x.month)+'</div><div class=\"search-result-text\">'+marked+'</div></div>'}).join(''):'<div class=\"empty\">No hay comentarios que coincidan con “'+String(commentSearch.value).replace(/</g,'&lt;')+'”.</div>'}"
s = s.replace(renderNeedle, searchCode + renderNeedle);

await fs.writeFile(path, s, 'utf8');
console.log('comment search added');
