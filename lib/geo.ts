export interface GeoData {
    city: string;
    region: string;
    lat: number;
    lon: number;
}

export async function getGeoByIp(ip: string): Promise<GeoData | null> {
    // Ignore local or reserved IPs
    if (!ip || ip === "::1" || ip === "127.0.0.1") return null;

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,lat,lon`);
        const data = await response.json();

        if (data.status === 'success') {
            return {
                city: data.city,
                region: data.regionName,
                lat: data.lat,
                lon: data.lon
            };
        }
    } catch (error) {
        console.error('[Geo] Error fetching geo data:', error);
    }
    return null;
}
