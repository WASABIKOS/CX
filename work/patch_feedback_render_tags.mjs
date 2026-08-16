import fs from 'node:fs/promises';

const path = 'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html';
let h = await fs.readFile(path, 'utf8');
const commentNew = "'<div class=\"feedback-tags\"><span class=\"feedback-tag '+(x.klass==='Detractor'?'tag-detractor':x.klass==='Promotor'?'tag-promotor':'tag-neutro')+'\">'+x.klass+'</span><span class=\"feedback-tag tag-category\" title=\"'+activeCategory(x)+'\">'+activeCategory(x)+'</span></div><div class=\"comment-meta\">'+monthLabel(x.month)+'</div>'";
for (const categoryExpr of ['x.category', 'activeCategory(x)']) {
  h = h.replace("'<div class=\"comment-meta\">'+x.klass+' · '+categoryExpr+' · '+monthLabel(x.month)+'</div>'", commentNew);
}
const searchNew = "'<div class=\"feedback-tags\"><span class=\"feedback-tag '+(x.klass==='Detractor'?'tag-detractor':x.klass==='Promotor'?'tag-promotor':'tag-neutro')+'\">'+x.klass+'</span><span class=\"feedback-tag tag-category\" title=\"'+activeCategory(x)+'\">'+activeCategory(x)+'</span></div><div class=\"search-result-meta\">'+monthLabel(x.month)+'</div>'";
h = h.replace("'<div class=\"search-result-meta\">'+x.klass+' · '+activeCategory(x)+' · '+monthLabel(x.month)+'</div>'", searchNew);
await fs.writeFile(path, h, 'utf8');
console.log('feedback render tags patched');
