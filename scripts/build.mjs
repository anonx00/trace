import {mkdir,copyFile,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const files=['index.html','fonts.css','node-symbols.js','assets/fonts/dm-sans-latin.woff2','assets/fonts/space-grotesk-latin.woff2','assets/fonts/dm-sans-OFL.txt','assets/fonts/space-grotesk-OFL.txt','assets/fonts/SOURCES.txt','knowledge-graph.js','story-player.js','mind.css','reader.css','reader-experience.js','research-home.js','research-home.css','universe-field.js','universe.css','observatory.css','home-layout.css','cyber.css','universe.js','news-intel.js','catalog.js','security-data.js','defensive-commands.js','community-detections.js','hacktricks-data.js','scenario-data.js','s3-notes.js','data.js','favicon.svg','generated/docs.json','generated/news.json','docs/cybersecurity-attack-dataset-review.md'];
files.push('research-index.js','coverage-view.js','research-experience.css','route-utils.js','evidence-data.js','evidence-view.js','workspace.css');
for(const file of files){const target=path.join(root,'dist',file);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(root,file),target);}
await writeFile(path.join(root,'dist','.nojekyll'),'');
// Every module in a release gets the same content-derived suffix. A fresh HTML
// document can never pair a new navigation bar with a cached old router.
const versioned=files.filter(file=>/\.(js|css)$/.test(file));
const contents=await Promise.all(versioned.map(file=>readFile(path.join(root,file),'utf8')));
const release=createHash('sha256').update(contents.join('\n')).digest('hex').slice(0,12);
const manifest=Object.fromEntries(versioned.map(file=>[file,file.replace(/\.(js|css)$/,`.${release}.$1`)]));
function rewrite(text){
  return text.replace(/(['"])(\.\/)?([\w-]+\.(?:js|css))\1/g,(match,quote,prefix,file)=>manifest[file]?`${quote}${prefix||''}${manifest[file]}${quote}`:match);
}
for(let i=0;i<versioned.length;i++)await writeFile(path.join(root,'dist',manifest[versioned[i]]),rewrite(contents[i]));
const html=await readFile(path.join(root,'index.html'),'utf8');
await writeFile(path.join(root,'dist','index.html'),rewrite(html).replace('</head>',`  <meta name="trace-release" content="${release}">\n</head>`));
await writeFile(path.join(root,'dist','release.json'),JSON.stringify({release,assets:manifest},null,2));
console.log(`Built ${files.length} static assets. Release ${release} uses versioned JS and CSS.`);
