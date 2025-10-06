/**
 * Cloudflare Workers script for QingTing FM radio data caching
 * Uses KV storage with timestamp-based keys for automatic data refresh
 */

const CACHE_DURATION = 3600; // 1 hour in seconds
const KV_KEY_PREFIX = 'qtfm_data_';

export default {
    async fetch(request, env, ctx) {
        try {
            // Get current timestamp
            const now = Math.floor(Date.now() / 1000);

            // Try to get cached data
            const cachedData = await getCachedData(env.QTFM_KV, now);

            if (cachedData) {
                // If cache is fresh, return it
                if (cachedData.isFresh) {
                    return new Response(cachedData.data, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'public, max-age=60',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }

                // Cache is stale, trigger async refresh and return stale data
                ctx.waitUntil(refreshData(env.QTFM_KV, now));

                return new Response(cachedData.data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'public, max-age=60',
                        'Access-Control-Allow-Origin': '*',
                        'X-Cache-Status': 'stale'
                    }
                });
            }

            // No cache exists, fetch and return new data
            const newData = await fetchRadioData();
            await saveToKV(env.QTFM_KV, now, newData);
            ctx.waitUntil(cleanupOldKeys(env.QTFM_KV, now));

            return new Response(newData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=60',
                    'Access-Control-Allow-Origin': '*',
                    'X-Cache-Status': 'miss'
                }
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }
};

/**
 * Get cached data from KV with freshness check
 */
async function getCachedData(kv, currentTimestamp) {
    // List all keys with our prefix
    const list = await kv.list({ prefix: KV_KEY_PREFIX });

    if (list.keys.length === 0) {
        return null;
    }

    // Sort keys by timestamp (descending)
    const sortedKeys = list.keys
        .map(k => ({
            key: k.name,
            timestamp: parseInt(k.name.replace(KV_KEY_PREFIX, ''))
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

    const latestKey = sortedKeys[0];
    const age = currentTimestamp - latestKey.timestamp;
    const isFresh = age < CACHE_DURATION;

    const data = await kv.get(latestKey.key);

    return data ? {
        data,
        isFresh,
        age,
        timestamp: latestKey.timestamp
    } : null;
}

/**
 * Fetch radio data from QingTing FM API
 */
async function fetchRadioData() {
    const regions = await getRegions();
    const data = {};

    for (const region of regions) {
        const radios = await getRadios(region.id);
        data[region.id] = {
            title: region.title,
            radios: radios
        };
    }

    return JSON.stringify(data);
}

/**
 * Fetch list of regions
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
 * Fetch radios for a specific region
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
 * Save data to KV with timestamp key
 */
async function saveToKV(kv, timestamp, data) {
    const key = `${KV_KEY_PREFIX}${timestamp}`;
    await kv.put(key, data);
}

/**
 * Refresh data asynchronously
 */
async function refreshData(kv, currentTimestamp) {
    try {
        const newData = await fetchRadioData();
        await saveToKV(kv, currentTimestamp, newData);
        await cleanupOldKeys(kv, currentTimestamp);
    } catch (error) {
        console.error('Failed to refresh data:', error);
    }
}

/**
 * Clean up old KV keys, keeping only the latest one
 */
async function cleanupOldKeys(kv, currentTimestamp) {
    const list = await kv.list({ prefix: KV_KEY_PREFIX });

    if (list.keys.length <= 1) {
        return;
    }

    // Sort keys by timestamp
    const sortedKeys = list.keys
        .map(k => ({
            key: k.name,
            timestamp: parseInt(k.name.replace(KV_KEY_PREFIX, ''))
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

    // Delete all except the latest
    const keysToDelete = sortedKeys.slice(1);

    for (const item of keysToDelete) {
        await kv.delete(item.key);
    }
}
