import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const files=['index.html','fonts.css','node-symbols.js','assets/fonts/dm-sans-latin.woff2','assets/fonts/space-grotesk-latin.woff2','assets/fonts/dm-sans-OFL.txt','assets/fonts/space-grotesk-OFL.txt','assets/fonts/SOURCES.txt','knowledge-graph.js','story-player.js','mind.css','reader.css','reader-experience.js','research-home.js','research-home.css','universe-field.js','universe.css','observatory.css','home-layout.css','cyber.css','universe.js','catalog.js','security-data.js','defensive-commands.js','community-detections.js','hacktricks-data.js','scenario-data.js','s3-notes.js','data.js','favicon.svg','generated/docs.json','docs/cybersecurity-attack-dataset-review.md'];
for(const file of files){const target=path.join(root,'dist',file);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(root,file),target);}
await writeFile(path.join(root,'dist','.nojekyll'),'');
console.log(`Built ${files.length} static assets in dist/. No server is required by the published site.`);
