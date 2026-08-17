import fs from 'node:fs/promises';

const files = ['work/build_dashboard_clean.mjs', 'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html'];
const css = `.filter select{appearance:none;-webkit-appearance:none;background-color:#1b171c!important;border:1px solid rgba(255,107,0,.78)!important;border-radius:12px!important;color:#f8f5f2!important;padding:0 40px 0 14px!important;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ff6b00' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")!important;background-repeat:no-repeat!important;background-position:right 14px center!important;background-size:16px!important;box-shadow:0 0 0 1px rgba(255,107,0,.18),0 0 14px rgba(255,107,0,.12);transition:border-color .2s,box-shadow .2s,background-color .2s}.filter select:hover{border-color:#ff6b00!important;box-shadow:0 0 0 1px rgba(255,107,0,.4),0 0 18px rgba(255,107,0,.2)}.filter select:focus{outline:none;border-color:#ff8a33!important;box-shadow:0 0 0 2px rgba(255,107,0,.25),0 0 22px rgba(255,107,0,.3)}.filter select option{background:#151217;color:#f8f5f2}.filter select option:checked{background:#2b1a16;color:#ff9b5b}`;
for (const file of files) {
  let text = await fs.readFile(file, 'utf8');
  if (!text.includes('.filter select{appearance:none')) text = text.replace('</style>', css + '</style>');
  await fs.writeFile(file, text, 'utf8');
}
console.log('dropdown visual style applied');
