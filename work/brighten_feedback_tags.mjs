import fs from 'node:fs/promises';

const files = ['work/build_dashboard_clean.mjs', 'work/add_feedback_tags.mjs'];
for (const file of files) {
  let s = await fs.readFile(file, 'utf8');
  s = s.replaceAll('.feedback-tag{display:inline-flex;align-items:center;max-width:100%;padding:3px 7px;border-radius:999px;font-size:9px;font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}', '.feedback-tag{display:inline-flex;align-items:center;max-width:100%;padding:5px 9px;border-radius:999px;font-size:9px;font-weight:850;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 0 10px rgba(255,255,255,.12)}');
  s = s.replaceAll('.tag-detractor{background:rgba(224,0,50,.18);border:1px solid var(--red);color:#ff6b82}', '.tag-detractor{background:var(--red);border:1px solid #ff4d73;color:#fff;box-shadow:0 0 12px rgba(224,0,50,.55)}');
  s = s.replaceAll('.tag-promotor{background:rgba(141,182,0,.18);border:1px solid var(--green);color:#b9df3d}', '.tag-promotor{background:var(--green);border:1px solid #c8f04b;color:#fff;box-shadow:0 0 12px rgba(141,182,0,.5)}');
  s = s.replaceAll('.tag-neutro{background:rgba(240,168,0,.18);border:1px solid var(--yellow);color:#ffd25a}', '.tag-neutro{background:var(--yellow);border:1px solid #ffd86a;color:#fff;box-shadow:0 0 12px rgba(240,168,0,.5)}');
  s = s.replaceAll('.tag-category{background:rgba(255,255,255,.07);border:1px solid var(--border);color:#ddd7d2}', '.tag-category{background:#fff;border:1px solid #fff;color:#191817;box-shadow:0 0 10px rgba(255,255,255,.2)}');
  await fs.writeFile(file, s, 'utf8');
}
console.log('feedback tags brightened');
