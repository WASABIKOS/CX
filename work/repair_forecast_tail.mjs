import fs from 'node:fs';
const final='outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html';
let h=fs.readFileSync(final,'utf8');
const endToken="</article>';>";
if(h.endsWith(endToken)) h=h.slice(0,-endToken.length)+"</article>';\n}\nrender();\n</script></body></html>";
fs.writeFileSync(final,h);

const builder='work/build_dashboard_clean.mjs';
let b=fs.readFileSync(builder,'utf8');
const bToken="</article>';\n";
if(b.endsWith(bToken)) b=b.slice(0,-bToken.length)+"</article>';\n}\nrender();\n</script></body></html>`;\n\nawait fs.writeFile(output, html, 'utf8');\nconsole.log(output, html.length);\n";
fs.writeFileSync(builder,b);
console.log('forecast tails repaired');
