const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate signed MP3 streaming URL for a radio station
 * @param {number} id - Radio station ID
 * @returns {string} Signed streaming URL
 */
function getMp3Url(id) {
    const streamPath = `/live/${id}/64k.mp3`;
    const ts = (Math.floor(Date.now() / 1000) + 3600).toString(16);
    const params = `app_id=web&path=${encodeURIComponent(streamPath)}&ts=${encodeURIComponent(ts)}`;

    const sign = crypto
        .createHmac('md5', 'Lwrpu$K5oP')
        .update(params)
        .digest('hex');

    return `https://lhttp.qingting.fm/live/${id}/64k.mp3?app_id=web&ts=${ts}&sign=${sign}`;
}

/**
 * Fetch list of geographic regions from QingTing FM API
 * @returns {Promise<Array>} Array of region objects
 */
async function getRegions() {
    const response = await fetch('https://webbff.qtfm.cn/www', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: '{radioPage(cid:432, page:1){bannerData,regions,radioPlaying,replayRadio,classes,}}'
        })
    });

    const data = await response.json();
    return data.data.radioPage.regions;
}

/**
 * Fetch radio stations for a specific region
 * @param {number} cid - Region ID
 * @returns {Promise<Array>} Array of radio station objects
 */
async function getRadios(cid) {
    const response = await fetch('https://webbff.qtfm.cn/www', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `{radioPage(cid:${cid}, page:1){contents}}`
        })
    });

    const data = await response.json();
    return data.data.radioPage.contents.items;
}

/**
 * Main function to fetch all data and save to data.json
 */
async function main() {
    try {
        console.log('Fetching regions...');
        const regions = await getRegions();
        const data = {};

        for (const region of regions) {
            console.log(`Fetching radios for ${region.title}...`);
            const radios = await getRadios(region.id);
            data[region.id] = {
                title: region.title,
                radios: radios
            };
        }

        const outputPath = path.join(__dirname, 'data.json');
        fs.writeFileSync(
            outputPath,
            JSON.stringify(data, null, 4),
            'utf-8'
        );

        console.log('Data successfully saved to data.json');
    } catch (error) {
        console.error('Error fetching data:', error);
        process.exit(1);
    }
}

// Run main function if executed directly
if (require.main === module) {
    main();
}

module.exports = {
    getMp3Url,
    getRegions,
    getRadios
};
