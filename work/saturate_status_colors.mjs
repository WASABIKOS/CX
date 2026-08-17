import fs from 'node:fs/promises';
const files=[
  'outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html',
  'work/build_dashboard_clean.mjs'
];
for(const file of files){
  let text=await fs.readFile(file,'utf8');
  text=text.replaceAll('#52b66a','#32c86a')
           .replaceAll('#e5b94f','#f3c83f')
           .replaceAll('#e75547','#f04f45');
  await fs.writeFile(file,text,'utf8');
  console.log('updated',file);
}
