import fs from 'node:fs/promises';

const files = ['work/build_dashboard_clean.mjs', 'work/replace_complaint_chart.mjs'];
const from = 'var rows=feedback.filter(function(x){return x.month===m}),total=rows.length||1,counts={};';
const to = "var rows=feedback.filter(function(x){return x.month===m&&x.category!=='Otros / no especificado'}),total=rows.length||1,counts={};";
for (const file of files) {
  let text = await fs.readFile(file, 'utf8');
  text = text.replaceAll(from, to);
  await fs.writeFile(file, text, 'utf8');
}
console.log('Otros excluded from monthly top 3');
