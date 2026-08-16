import fs from 'node:fs/promises';

const files = [
  'work/build_dashboard_clean.mjs',
  'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html',
];
const replacements = [
  ['--orange:#e85d00', '--orange:#ff6b00'],
  ['--green:#689100', '--green:#8db600'],
  ['--yellow:#db8f00', '--yellow:#f0a800'],
  ['--red:#d51b3f', '--red:#e00032'],
];
for (const file of files) {
  let text = await fs.readFile(file, 'utf8');
  for (const [from, to] of replacements) text = text.replaceAll(from, to);
  await fs.writeFile(file, text, 'utf8');
}
console.log('brand palette applied');
