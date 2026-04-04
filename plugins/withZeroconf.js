const { withInfoPlist, withAndroidManifest } = require('@expo/config-plugins');

const withZeroconf = (config) => {
    // 1. iOS Configuration
    config = withInfoPlist(config, (config) => {
        if (!config.modResults.NSLocalNetworkUsageDescription) {
            config.modResults.NSLocalNetworkUsageDescription =
                "Allow Connect Camp to find nearby students on your Wi-Fi.";
        }
        if (!config.modResults.NSBonjourServices) {
            config.modResults.NSBonjourServices = ["_connectcamp._tcp."];
        } else {
            if (!config.modResults.NSBonjourServices.includes("_connectcamp._tcp.")) {
                config.modResults.NSBonjourServices.push("_connectcamp._tcp.");
            }
        }
        return config;
    });

    // 2. Android Configuration
    config = withAndroidManifest(config, (config) => {
        const mainApplication = config.modResults.manifest.application[0];

        // Ensure permissions are present
        const permissions = config.modResults.manifest['uses-permission'] || [];
        const requiredPermissions = [
            'android.permission.ACCESS_WIFI_STATE',
            'android.permission.CHANGE_WIFI_MULTICAST_STATE',
            'android.permission.INTERNET'
        ];

        requiredPermissions.forEach(permission => {
            if (!permissions.some(p => p['$']['android:name'] === permission)) {
                permissions.push({ '$': { 'android:name': permission } });
            }
        });
        config.modResults.manifest['uses-permission'] = permissions;

        return config;
    });

    return config;
};

module.exports = withZeroconf;
