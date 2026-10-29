import { useState, useEffect } from 'react';


export const getIpAndLocation = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        return {
            ip: data.ip,
            publicIp: data.ip || 'N/A',
            ipVersion: data.version || 'N/A',
            city: data.city || 'N/A',
            region: data.region || 'N/A',
            country: data.country_name || 'N/A',
            countryCode: data.country_code || 'N/A',
            continent: data.continent_code || 'N/A',
            postal: data.postal || 'N/A',
            latitude: data.latitude || 'N/A',
            longitude: data.longitude || 'N/A',
            timezone: data.timezone || 'N/A',
            currency: data.currency || 'N/A',
            isp: data.org || 'N/A',
            asn: data.asn || 'N/A'
        };
    } catch (error) {
        return {
            ip: 'Unable to fetch',
            publicIp: 'Unable to fetch',
            error: 'Failed to fetch IP information'
        };
    }
};

// ✅ Export other helper functions
export const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown';
};

export const getBrowserVersion = () => {
    const ua = navigator.userAgent;
    const match = ua.match(/(Firefox|Chrome|Safari|Edge|OPR)\/(\d+)/);
    return match ? match[2] : 'Unknown';
};

export const getOperatingSystem = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
};

export const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
};


export default function DeviceDetails() {
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [ipInfo, setIpInfo] = useState({ loading: true });

    useEffect(() => {
        getDeviceDetails();
        fetchIpInfo();
    }, []);

    const getDeviceDetails = () => {
        const info = {
            browser: {
                name: getBrowserName(),
                version: getBrowserVersion(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            },
            device: {
                platform: navigator.platform,
                deviceMemory: navigator.deviceMemory || 'N/A',
                hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
                maxTouchPoints: navigator.maxTouchPoints || 0,
                deviceType: getDeviceType(),
                macAddress: 'Not accessible (browser security restriction)'
            },
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight,
                colorDepth: window.screen.colorDepth,
                pixelRatio: window.devicePixelRatio,
                orientation: window.screen.orientation?.type || 'N/A'
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight
            },
            os: getOperatingSystem(),
            network: {
                connection: navigator.connection?.effectiveType || 'N/A',
                downlink: navigator.connection?.downlink || 'N/A',
                rtt: navigator.connection?.rtt || 'N/A'
            },
            time: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset(),
                currentTime: new Date().toLocaleString()
            },
            battery: 'Checking...'
        };

        setDeviceInfo(info);

        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                setDeviceInfo(prev => ({
                    ...prev,
                    battery: {
                        level: `${(battery.level * 100).toFixed(0)}%`,
                        charging: battery.charging ? 'Yes' : 'No',
                        chargingTime: battery.chargingTime === Infinity ? 'N/A' : `${battery.chargingTime}s`,
                        dischargingTime: battery.dischargingTime === Infinity ? 'N/A' : `${battery.dischargingTime}s`
                    }
                }));
            });
        } else {
            setDeviceInfo(prev => ({ ...prev, battery: 'Not supported' }));
        }
    };

    const fetchIpInfo = async () => {
        const data = await getIpAndLocation();
        setIpInfo({ loading: false, ...data });
    };

    const renderSection = (title, data) => (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h2>
            <div className="space-y-2">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start">
                        <span className="font-medium text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-gray-800 text-right ml-4 break-all max-w-md">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!deviceInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading device information...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Device Details</h1>
                    <p className="text-gray-600">Complete information about your device and browser</p>
                </div>

                {renderSection('Browser Information', deviceInfo.browser)}
                {renderSection('Device Information', deviceInfo.device)}

                <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">IP & Location Information</h2>
                    {ipInfo.loading ? (
                        <div className="text-center text-gray-600 py-4">Loading IP and location...</div>
                    ) : ipInfo.error ? (
                        <div className="text-center text-red-600 py-4">{ipInfo.error}</div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">Public IP:</span>
                                <span className="text-gray-800 text-right ml-4 font-mono">{ipInfo.publicIp}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">IP Version:</span>
                                <span className="text-gray-800 text-right ml-4">{ipInfo.ipVersion}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">City:</span>
                                <span className="text-gray-800 text-right ml-4">{ipInfo.city}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">Region:</span>
                                <span className="text-gray-800 text-right ml-4">{ipInfo.region}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">Country:</span>
                                <span className="text-gray-800 text-right ml-4">{ipInfo.country} ({ipInfo.countryCode})</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">Continent:</span>
                                <span className="text-gray-800 text-right ml-4">{ipInfo.continent}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">Postal Code:</span>
                                <span className="text-gray-800 text-right ml-4">{ipInfo.postal}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">Coordinates:</span>
                                <span className="text-gray-800 text-right ml-4">{ipInfo.latitude}, {ipInfo.longitude}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">ISP:</span>
                                <span className="text-gray-800 text-right ml-4 break-all max-w-md">{ipInfo.isp}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">ASN:</span>
                                <span className="text-gray-800 text-right ml-4">{ipInfo.asn}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-600">Currency:</span>
                                <span className="text-gray-800 text-right ml-4">{ipInfo.currency}</span>
                            </div>
                        </div>
                    )}
                </div>

                {renderSection('Screen Information', deviceInfo.screen)}
                {renderSection('Viewport Information', deviceInfo.viewport)}
                {renderSection('Operating System', { os: deviceInfo.os })}
                {renderSection('Network Information', deviceInfo.network)}
                {renderSection('Time & Location', deviceInfo.time)}
                {renderSection('Battery Information', typeof deviceInfo.battery === 'object' ? deviceInfo.battery : { status: deviceInfo.battery })}

                <button
                    onClick={() => {
                        getDeviceDetails();
                        fetchIpInfo();
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
                >
                    Refresh Device Details
                </button>

                
            </div>
        </div>
    );
}
