import fs from 'node:fs/promises';

const builder = 'work/build_dashboard_clean.mjs';
let s = await fs.readFile(builder, 'utf8');
const navOld = "const nav=$('segmentNav'),monthFilter=$('monthFilter'),categoryFilter=$('categoryFilter'),classFilter=$('classFilter'),trendCategoryFilter=$('trendCategoryFilter'),waterfallStart=$('waterfallStart'),waterfallEnd=$('waterfallEnd');";
const navNew = "const nav=$('segmentNav'),monthFilter=$('monthFilter'),classifierFilter=$('classifierFilter'),categoryFilter=$('categoryFilter'),classFilter=$('classFilter'),trendCategoryFilter=$('trendCategoryFilter'),waterfallStart=$('waterfallStart'),waterfallEnd=$('waterfallEnd'),commentSearch=$('commentSearch'),searchCount=$('searchCount'),searchResults=$('searchResults');";
s = s.replace(navOld, navNew);
s = s.replace("[monthFilter,categoryFilter,classFilter,trendCategoryFilter,waterfallStart,waterfallEnd].forEach(function(el){el.addEventListener('change',render)});", "[monthFilter,categoryFilter,classFilter,trendCategoryFilter,waterfallStart,waterfallEnd].forEach(function(el){el.addEventListener('change',render)});commentSearch.addEventListener('input',render);");
const start = s.indexOf('var safeQuery=', s.indexOf('var query=String(commentSearch.value'));
const marked = s.indexOf('var marked=', start);
const end = s.indexOf(';', marked) + 1;
if (start >= 0 && marked > start && end > marked) s = s.slice(0, start) + 'var marked=text;' + s.slice(end);
await fs.writeFile(builder, s, 'utf8');

const toggle = 'work/add_classifier_toggle.mjs';
let t = await fs.readFile(toggle, 'utf8');
const toggleOld = "h=h.replace(\"const nav=$('segmentNav'),monthFilter=$('monthFilter'),categoryFilter=$('categoryFilter'),classFilter=$('classFilter');\",\"const nav=$('segmentNav'),monthFilter=$('monthFilter'),classifierFilter=$('classifierFilter'),categoryFilter=$('categoryFilter'),classFilter=$('classFilter');\");";
const toggleNew = "h=h.replace(\"const nav=$('segmentNav'),monthFilter=$('monthFilter'),classifierFilter=$('classifierFilter'),categoryFilter=$('categoryFilter'),classFilter=$('classFilter'),trendCategoryFilter=$('trendCategoryFilter'),waterfallStart=$('waterfallStart'),waterfallEnd=$('waterfallEnd'),commentSearch=$('commentSearch'),searchCount=$('searchCount'),searchResults=$('searchResults');\",\"const nav=$('segmentNav'),monthFilter=$('monthFilter'),classifierFilter=$('classifierFilter'),categoryFilter=$('categoryFilter'),classFilter=$('classFilter'),trendCategoryFilter=$('trendCategoryFilter'),waterfallStart=$('waterfallStart'),waterfallEnd=$('waterfallEnd'),commentSearch=$('commentSearch'),searchCount=$('searchCount'),searchResults=$('searchResults');\");";
if (!t.includes('commentSearch=$')) t = t.replace(toggleOld, toggleNew);
await fs.writeFile(toggle, t, 'utf8');
console.log('comment search logic fixed');
