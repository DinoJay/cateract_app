cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-screensize/www/screensize.js",
        "id": "cordova-plugin-screensize.screensize",
        "pluginId": "cordova-plugin-screensize",
        "clobbers": [
            "window.plugins.screensize"
        ]
    },
    {
        "file": "plugins/cordova-plugin-screensize/src/browser/ScreenSizeProxy.js",
        "id": "cordova-plugin-screensize.ScreenSizeProxy",
        "pluginId": "cordova-plugin-screensize",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-nativestorage/www/mainHandle.js",
        "id": "cordova-plugin-nativestorage.mainHandle",
        "pluginId": "cordova-plugin-nativestorage",
        "clobbers": [
            "NativeStorage"
        ]
    },
    {
        "file": "plugins/cordova-plugin-nativestorage/www/LocalStorageHandle.js",
        "id": "cordova-plugin-nativestorage.LocalStorageHandle",
        "pluginId": "cordova-plugin-nativestorage"
    },
    {
        "file": "plugins/cordova-plugin-nativestorage/www/NativeStorageError.js",
        "id": "cordova-plugin-nativestorage.NativeStorageError",
        "pluginId": "cordova-plugin-nativestorage"
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-crosswalk-webview": "2.3.0",
    "cordova-plugin-whitelist": "1.3.1",
    "cordova-plugin-screensize": "1.3.1",
    "cordova-plugin-nativestorage": "2.2.2"
}
// BOTTOM OF METADATA
});