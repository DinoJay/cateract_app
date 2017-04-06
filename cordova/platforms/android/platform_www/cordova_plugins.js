cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-screensize.screensize",
        "file": "plugins/cordova-plugin-screensize/www/screensize.js",
        "pluginId": "cordova-plugin-screensize",
        "clobbers": [
            "window.plugins.screensize"
        ]
    },
    {
        "id": "cordova-plugin-nativestorage.mainHandle",
        "file": "plugins/cordova-plugin-nativestorage/www/mainHandle.js",
        "pluginId": "cordova-plugin-nativestorage",
        "clobbers": [
            "NativeStorage"
        ]
    },
    {
        "id": "cordova-plugin-nativestorage.LocalStorageHandle",
        "file": "plugins/cordova-plugin-nativestorage/www/LocalStorageHandle.js",
        "pluginId": "cordova-plugin-nativestorage"
    },
    {
        "id": "cordova-plugin-nativestorage.NativeStorageError",
        "file": "plugins/cordova-plugin-nativestorage/www/NativeStorageError.js",
        "pluginId": "cordova-plugin-nativestorage"
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.3.1",
    "cordova-plugin-crosswalk-webview": "2.3.0",
    "cordova-plugin-screensize": "1.3.1",
    "cordova-plugin-nativestorage": "2.2.2",
    "cordova-plugin-console": "1.0.6"
};
// BOTTOM OF METADATA
});