import fs from 'node:fs/promises';

const inputPath='work/nps_data.json';
const cachePath='work/ollama_classification_cache.json';
const data=JSON.parse(await fs.readFile(inputPath,'utf8'));
const rows=data.feedback_model.rows;
const categories=[
  'Bajas y cancelaciones','Compra, activación y portabilidad','Cuenta, titularidad y app',
  'Facturación, pagos y crédito','Fallas de internet residencial','Fallas de servicio móvil',
  'Mudanza, instalación y visita','Otros motivos y derivaciones','Planes y cambios de plan',
  'Recargas y paquetes prepago','Roaming internacional','SIM y eSIM','Saldo y consumo',
  'Sin motivo o abandono temprano','TV y control remoto'
];
let cache={}; try{cache=JSON.parse(await fs.readFile(cachePath,'utf8'))}catch{}
const unique=[...new Set(rows.map(x=>x.feedback).filter(Boolean))].filter(x=>!cache[x]).slice(0,120);
const batches=[]; for(let i=0;i<unique.length;i+=10)batches.push(unique.slice(i,i+10));
let done=0;
async function classify(batch){
  const numbered=batch.map((x,i)=>(i+1)+'. '+String(x).replace(/\s+/g,' ').slice(0,420)).join('\n');
  const prompt='Clasifica cada comentario de telecomunicaciones en UNA categoría exacta. Categorías permitidas: '+categories.join(' | ')+'. Devuelve únicamente JSON con la forma {"labels":["categoria",...]}, en el mismo orden y con '+batch.length+' etiquetas. Comentarios:\n'+numbered;
  const res=await fetch('http://127.0.0.1:11434/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'qwen2.5-coder:1.5b',prompt,stream:false,format:{type:'object',properties:{labels:{type:'array',items:{type:'string',enum:categories}}},required:['labels']},options:{temperature:0,num_predict:240}})});
  if(!res.ok)throw new Error('Ollama HTTP '+res.status);
  const body=await res.json(); const parsed=JSON.parse(body.response); if(!Array.isArray(parsed.labels)||parsed.labels.length!==batch.length)throw new Error('Respuesta incompleta '+(parsed.labels?.length||0)+'/'+batch.length);
  batch.forEach((text,i)=>cache[text]=categories.includes(parsed.labels[i])?parsed.labels[i]:'Otros motivos y derivaciones');
  done+=batch.length; if(done%180===0||done===unique.length)console.log('classified',done,'of',unique.length);
}
let cursor=0; async function worker(){while(cursor<batches.length){const ix=cursor++;const batch=batches[ix];for(let attempt=0;attempt<3;attempt++){try{await classify(batch);break}catch(e){if(attempt===2){console.error('batch failed',ix,e.message);batch.forEach(t=>cache[t]='Otros motivos y derivaciones')}}}}}
await Promise.all(Array.from({length:1},worker));
await fs.writeFile(cachePath,JSON.stringify(cache),'utf8');
rows.forEach(x=>{x.category_local=x.category;x.category_ollama=cache[x.feedback]||null});
data.feedback_model.ollama={model:'qwen2.5-coder:1.5b',classified_at:new Date().toISOString(),taxonomy:categories};
await fs.writeFile(inputPath,JSON.stringify(data),'utf8');
console.log('saved',rows.length,'rows');
