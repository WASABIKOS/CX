import fs from 'node:fs/promises';
const p='outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html'; let h=await fs.readFile(p,'utf8');
h=h.replace('</style>','.grid{display:grid!important;grid-template-columns:1fr 1fr!important;align-items:start}.chart,.uxchart{display:flex!important;flex-direction:row!important;align-items:flex-end!important;gap:6px}.barwrap{flex:1!important;width:auto!important}.uxpanel{width:auto!important;display:block!important}@media(max-width:950px){.grid{grid-template-columns:1fr!important}} </style>');
await fs.writeFile(p,h,'utf8'); console.log('charts aligned side by side');
