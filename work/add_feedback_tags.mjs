import fs from 'node:fs/promises';

const path = 'work/build_dashboard_clean.mjs';
let s = await fs.readFile(path, 'utf8');
const cssNeedle = '.comment-meta{font-size:10px;color:var(--muted);margin-bottom:6px}';
const cssInsert = cssNeedle + '.feedback-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:7px}.feedback-tag{display:inline-flex;align-items:center;max-width:100%;padding:5px 9px;border-radius:999px;font-size:9px;font-weight:850;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 0 10px rgba(255,255,255,.12)}.tag-detractor{background:var(--red);border:1px solid #ff4d73;color:#fff;box-shadow:0 0 12px rgba(224,0,50,.55)}.tag-promotor{background:var(--green);border:1px solid #c8f04b;color:#fff;box-shadow:0 0 12px rgba(141,182,0,.5)}.tag-neutro{background:var(--yellow);border:1px solid #ffd86a;color:#fff;box-shadow:0 0 12px rgba(240,168,0,.5)}.tag-category{background:#fff;border:1px solid #fff;color:#191817;box-shadow:0 0 10px rgba(255,255,255,.2)}';
if (!s.includes('.feedback-tags{')) s = s.replace(cssNeedle, cssInsert);
s = s.replace("'<div class=\"comment-meta\">'+x.klass+' · '+x.category+' · '+monthLabel(x.month)+'</div>'", "'<div class=\"feedback-tags\"><span class=\"feedback-tag '+(x.klass==='Detractor'?'tag-detractor':x.klass==='Promotor'?'tag-promotor':'tag-neutro')+'\">'+x.klass+'</span><span class=\"feedback-tag tag-category\" title=\"'+x.category+'\">'+x.category+'</span></div><div class=\"comment-meta\">'+monthLabel(x.month)+'</div>'");
s = s.replace("'<div class=\"search-result-meta\">'+x.klass+' · '+activeCategory(x)+' · '+monthLabel(x.month)+'</div>'", "'<div class=\"feedback-tags\"><span class=\"feedback-tag '+(x.klass==='Detractor'?'tag-detractor':x.klass==='Promotor'?'tag-promotor':'tag-neutro')+'\">'+x.klass+'</span><span class=\"feedback-tag tag-category\" title=\"'+activeCategory(x)+'\">'+activeCategory(x)+'</span></div><div class=\"search-result-meta\">'+monthLabel(x.month)+'</div>'");
await fs.writeFile(path, s, 'utf8');
console.log('feedback tags added');
