import fs from 'node:fs/promises';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const data = JSON.parse(await fs.readFile('work/nps_data.json','utf8'));
const outDir = 'outputs/medallia_cx_nps_2026-08-14';
await fs.mkdir(outDir,{recursive:true});
const wb = Workbook.create();
const dash = wb.worksheets.add('Dashboard');
const mapping = wb.worksheets.add('Column Mapping');
const sample = wb.worksheets.add('Sample 10');
const detail = wb.worksheets.add('Normalized Data');
const navy='#12355B', blue='#2F75B5', light='#EAF2F8', teal='#0F766E', red='#C0392B', gold='#F4B183', gray='#6B7280';
for (const s of [dash,mapping,sample,detail]) s.showGridLines=false;

dash.getRange('A1:H1').merge(); dash.getRange('A1').values=[['Medallia CX NPS — CWP | Reporte normalizado']];
dash.getRange('A2:H2').merge(); dash.getRange('A2').values=[[`Fuente: ${data.source_file} | Filas fuente: ${data.raw_rows} | Respuestas con score válido: ${data.summary[0].n}`]];
dash.getRange('A1:H1').format={fill:navy,font:{bold:true,color:'#FFFFFF',size:16},horizontalAlignment:'center'};
dash.getRange('A2:H2').format={fill:light,font:{italic:true,color:gray},horizontalAlignment:'center'};
dash.getRange('A4:G4').values=[['Segmento de producto / encuesta','Respuestas','NPS','Promotores','Neutros','Detractores','Score promedio']];
dash.getRange(`A5:G${4+data.summary.length}`).values=data.summary.map(x=>[x.Segment,x.n,x.NPS,x.Promoters,x.Neutrals,x.Detractors,x['Avg Score']]);
dash.getRange('A4:G4').format={fill:blue,font:{bold:true,color:'#FFFFFF'},wrapText:true};
dash.getRange(`A5:G${4+data.summary.length}`).format={borders:{preset:'inside',style:'thin',color:'#D9E2F3'}};
dash.getRange(`C5:C${4+data.summary.length}`).format.numberFormat='0.0'; dash.getRange(`G5:G${4+data.summary.length}`).format.numberFormat='0.00';
dash.getRange(`C5:C${4+data.summary.length}`).conditionalFormats.add('colorScale',{colors:['#F4CCCC','#FFF2CC','#D9EAD3']});

const start=12; dash.getRange(`A${start}:C${start}`).values=[['Mes de respuesta','Respuestas','NPS']];
dash.getRange(`A${start+1}:C${start+data.monthly.length}`).values=data.monthly.map(x=>[x.Month,x.n,x.NPS]);
dash.getRange(`A${start}:C${start}`).format={fill:teal,font:{bold:true,color:'#FFFFFF'}}; dash.getRange(`C${start+1}:C${start+data.monthly.length}`).format.numberFormat='0.0';
const chart=dash.charts.add('line',dash.getRange(`A${start}:C${start+data.monthly.length}`)); chart.title='Evolución mensual NPS'; chart.hasLegend=true; chart.setPosition('E5','L22'); chart.yAxis={min:-100,max:100,numberFormatCode:'0'};
dash.getRange('A34:H34').merge(); dash.getRange('A34').values=[['Reglas aplicadas']]; dash.getRange('A34:H34').format={fill:navy,font:{bold:true,color:'#FFFFFF'}};
dash.getRange('A35:H38').values=[['rNPS','Probabilidad de Recomendar','Score 0–10','','pNPS Internet','Internet - Likelihood to Recommend','Plan Type = Servicio residencial + Broadband RGU > 0',''],['pNPS Mobile contrato','Mobile - Likelihood to Recommend','Plan Type contiene Contrato','','pNPS Mobile prepago','Mobile - Likelihood to Recommend','Plan Type contiene Prepago',''],['Clasificación NPS','9–10 Promotor | 7–8 Neutro | 0–6 Detractor','','','','','',''],['NPS','(% Promotores - % Detractores) × 100','','','','','','']];
dash.getRange('A35:H38').format={fill:'#F8FAFC',wrapText:true,borders:{preset:'all',style:'thin',color:'#D9E2F3'}};

mapping.getRange('A1:C1').values=[['MAPEO DE COLUMNAS Y REGLAS','', '']]; mapping.getRange('A1:C1').merge(); mapping.getRange('A1:C1').format={fill:navy,font:{bold:true,color:'#FFFFFF',size:14}};
mapping.getRange(`A3:C${2+data.mapping.length}`).values=data.mapping; mapping.getRange('A3:C3').format={fill:blue,font:{bold:true,color:'#FFFFFF'},wrapText:true}; mapping.getRange(`A4:C${2+data.mapping.length}`).format={wrapText:true,borders:{preset:'inside',style:'thin',color:'#D9E2F3'}};
mapping.getRange('A13:C13').merge(); mapping.getRange('A13').values=[['Columnas fuente detectadas (primeras 376 columnas del export)']]; mapping.getRange('A13:C13').format={fill:teal,font:{bold:true,color:'#FFFFFF'}};
mapping.getRange('A14:A389').values=data.headers.map(h=>[h||'']); mapping.getRange('A14:A389').format={wrapText:false};

const sampleHeaders=['CW - Unique ID','Unit','Survey Type','Plan Type','Broadband RGU','Response Date','Score Basis','Score','Product Segment','NPS Class','rNPS - Overall Satisfaction comment','Internet Additional Comments','Phone Mobile Catchall Comment'];
sample.getRange('A1:M1').merge(); sample.getRange('A1').values=[['Muestra de 10 filas — respuestas normalizadas']]; sample.getRange('A1:M1').format={fill:navy,font:{bold:true,color:'#FFFFFF',size:14}};
sample.getRange('A3:M3').values=[sampleHeaders]; sample.getRange('A3:M3').format={fill:blue,font:{bold:true,color:'#FFFFFF'},wrapText:true};
sample.getRange('A4:M13').values=data.sample.map(r=>sampleHeaders.map(h=>r[h]??'')); sample.getRange('A4:M13').format={wrapText:true,borders:{preset:'inside',style:'thin',color:'#D9E2F3'}};
sample.getRange('H4:H13').format.numberFormat='0';

const detHeaders=['CW - Unique ID','Unit','Survey Type','Plan Type','Broadband RGU','Response Date','Score Basis','Score','Product Segment','NPS Class','rNPS - Overall Satisfaction comment','Internet Additional Comments','Phone Mobile Catchall Comment'];
detail.getRange('A1:M1').merge(); detail.getRange('A1').values=[['BASE NORMALIZADA — fuente para auditoría y segmentación']]; detail.getRange('A1:M1').format={fill:navy,font:{bold:true,color:'#FFFFFF',size:14}};
detail.getRange('A3:M3').values=[detHeaders]; detail.getRange('A3:M3').format={fill:blue,font:{bold:true,color:'#FFFFFF'},wrapText:true};
detail.getRange('A4:M13').values=data.sample.map(r=>detHeaders.map(h=>r[h]??'')); detail.getRange('A4:M13').format={wrapText:true}; detail.getRange('H4:H13').format.numberFormat='0'; detail.getRange('A3:M13').format.borders={preset:'inside',style:'thin',color:'#E5E7EB'};
detail.getRange('A15:M15').merge(); detail.getRange('A15').values=[[`Nota: esta pestaña muestra 10 filas normalizadas. Los totales del Dashboard se calcularon sobre las ${data.summary[0].n.toLocaleString('en-US')} respuestas con score válido del archivo fuente.`]]; detail.getRange('A15:M15').format={fill:light,font:{italic:true,color:gray},wrapText:true};

for (const [s,widths] of [[dash,[30,14,12,14,12,14,14]],[mapping,[28,72,64]],[sample,[32,18,18,22,14,15,35,10,24,14,42,42,42]],[detail,[32,18,18,22,14,15,35,10,24,14,42,42,42]]]) { widths.forEach((w,i)=>s.getRangeByIndexes(0,i,1,1).format.columnWidth=w); }
dash.freezePanes.freezeRows(4); mapping.freezePanes.freezeRows(3); sample.freezePanes.freezeRows(3); detail.freezePanes.freezeRows(3);
const png=await wb.render({sheetName:'Dashboard',autoCrop:'all',scale:1,format:'png'}); await fs.writeFile(`${outDir}/dashboard.png`,new Uint8Array(await png.arrayBuffer()));
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',options:{useRegex:true,maxResults:50},summary:'formula errors'}); console.log(errors.ndjson);
const xlsx=await SpreadsheetFile.exportXlsx(wb); await xlsx.save(`${outDir}/medallia_cx_nps_report.xlsx`); console.log('saved',`${outDir}/medallia_cx_nps_report.xlsx`);
