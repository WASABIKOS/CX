import fs from 'node:fs/promises';

const path = 'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html';
let h = await fs.readFile(path, 'utf8');
const npsClass = "(x.klass==='Detractor'?'tag-detractor':x.klass==='Promotor'?'tag-promotor':'tag-neutro')";
const tags = "'<div class=\"feedback-tags\"><span class=\"feedback-tag '+" + npsClass + "+'\">'+x.klass+'</span><span class=\"feedback-tag tag-category\" title=\"'+activeCategory(x)+'\">'+activeCategory(x)+'</span></div>";
const commentMeta = h.indexOf('comment-meta', h.indexOf('var commentPool='));
const commentStart = h.lastIndexOf("'<div", commentMeta);
const commentEnd = h.indexOf('</div>', commentMeta) + '</div>'.length;
if (commentStart >= 0 && commentEnd > commentMeta) h = h.slice(0, commentStart) + tags + "+'<div class=\"comment-meta\">'+monthLabel(x.month)+'</div>'" + h.slice(commentEnd);
const searchMeta = h.indexOf('search-result-meta', h.indexOf('var query='));
const searchStart = h.lastIndexOf("'<div", searchMeta);
const searchEnd = h.indexOf('</div>', searchMeta) + '</div>'.length;
if (searchStart >= 0 && searchEnd > searchMeta) h = h.slice(0, searchStart) + tags + "+'<div class=\"search-result-meta\">'+monthLabel(x.month)+'</div>'" + h.slice(searchEnd);
await fs.writeFile(path, h, 'utf8');
console.log(JSON.stringify({commentPatched: commentStart >= 0, searchPatched: searchStart >= 0}));
