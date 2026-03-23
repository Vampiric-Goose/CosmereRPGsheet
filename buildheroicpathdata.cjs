const fs = require('fs');
const path = require('path');

function buildHeroicData() {
    const heroicData = {};

    const heroicRoot = 'data/heroic';

    for (const pathKey of fs.readdirSync(heroicRoot)) {
        const pathDir = path.join(heroicRoot, pathKey);
        if (!fs.statSync(pathDir).isDirectory()) continue;

        heroicData[pathKey] = {
            specialties: [],
            startingTalent: "",
            startingTalentType: "",
            startingTalentDesc: "",
            talentTrees: {}
        };

        const files = fs.readdirSync(pathDir);

        for (const specFile of files) {
            if (!specFile.endsWith('.json')) continue;

            const specKey = specFile.replace('.json', '').toLowerCase().replace(/\s+/g, '_');
            const metaPath = path.join(pathDir, specFile);
            console.log(`Reading JSON: ${metaPath}`);
            const raw = fs.readFileSync(metaPath, 'utf8');
            console.log(`Raw content length: ${raw.length} bytes`);
            console.log(`First 100 chars: ${raw.substring(0, 100).replace(/\n/g, '\\n')}`);
            const meta = JSON.parse(raw);

            if (specKey === pathKey) {
                heroicData[pathKey].specialties = meta.specialties || [];
                heroicData[pathKey].startingTalent = meta.startingTalent || "";
                heroicData[pathKey].startingTalentType = meta.startingTalentType || "";
                heroicData[pathKey].startingTalentDesc = meta.startingTalentDesc || "";
                continue;
            }

            const tree = [];

            for (const talent of (meta.talents || [])) {
                let desc = '';
                const candidates = [
                    path.join(pathDir, specKey, `${talent.id}.txt`),
                    path.join(pathDir, specKey, `${talent.id}`)
                ];

                for (const candidate of candidates) {
                    if (fs.existsSync(candidate)) {
                        desc = fs.readFileSync(candidate, 'utf8').trim();
                        break;
                    }
                }

                tree.push({
                    id: talent.id,
                    name: talent.name,
                    type: talent.type,
                    prereq: talent.prereq || null,
                    parent: talent.parent || null,
                    desc: desc
                });
            }

            heroicData[pathKey].talentTrees[specKey] = tree;
        }
    }

    const output = `const heroicPathsData = ${JSON.stringify(heroicData, null, 0)};`;
    fs.writeFileSync('heroicPathsData.js', output);
    console.log('✅ Built heroicPathsData.js');
}

buildHeroicData();

// open console and run cd vite-project
// >> node buildheroicpathdata.cjs