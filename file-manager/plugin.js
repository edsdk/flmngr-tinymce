/*!
 * Add-on for including Flmngr file manager into your TinyMCE
 * Developer: Flmngr
 * Website: https://flmngr.com/
 * License: GPL v3
 */


//
//   HOW TO INSTALL THIS ADD-ON
//
//   1. Copy the plugin as "tinymce/plugins/file-manager/plugin.js"
//   2. Add "file-manager" into "plugins" config option
//   3. Done!
//
//
//   VISUAL CONFIGURATION
//
//   If you want to configure all Flmngr visually,
//   just go into your dashboard at:
//
//       https://flmngr.com/dashboard
//
//   Once configured Flmngr using Dashboard please set your personal API key to use it:
//
//      apiKey: "APIKEY12"
//

(function() {

    var PLUGIN_NAME = "file-manager";
    var DEFAULT_API_KEY = "FLMNFLMN";

    window.n1edPluginVersion=202310004;

    function get(varName, defaultValue) {
        if (window[varName] !== undefined && window[varName] !== "-")
            return window[varName];
        else
            return defaultValue;
    }

    var apiKey;

    if (tinymce.majorVersion == 6) {

        function getTinyMCE6Option(name, type) {
            var options = tinymce.get()[0].options;
            var defaultValue = false;
            if (type === "string")
                defaultValue = "";
            else if (type === "object")
                defaultValue = {};
            options.register(name, {processor: type, default: defaultValue});
            if (options.isSet(name))
                return options.get(name);
            else
                return null;
        }

        apiKey = getTinyMCE6Option("apiKey", "string");
        if (!apiKey) {
            var flmngrOpts = getTinyMCE6Option("Flmngr", "object");
            if (!!flmngrOpts && !!flmngrOpts["apiKey"])
                apiKey = flmngrOpts["apiKey"];
        }

    } else {
        apiKey = tinymce.settings.apiKey;
    }
    window.TINYMCE_OVERRIDE_API_KEY_PARAM = "OVERRIDE_API_KEY";
    apiKey = window.OVERRIDE_API_KEY || apiKey || DEFAULT_API_KEY;

    var version = get("N1ED_VERSION", "latest");
    var n1edPrefix = get("N1ED_PREFIX", null);
    var n1edHttps = get("N1ED_HTTPS", true);

    var protocol = n1edHttps ? "https" : "http";

    var host = (n1edPrefix ? (n1edPrefix + ".") : "") + "cloud.n1ed.com";
    var urlPlugin = protocol + "://" + host + "/a/" + apiKey + "/plugins/N1EDEco/plugin.js";

    // Load Ecosystem plugin manually due to
    // TinyMCE will not accept external_plugins option on the fly
    tinymce.PluginManager.load("N1EDEco",  urlPlugin);

    tinymce.PluginManager.add(
        PLUGIN_NAME,
        function(ed, url) {
            // TinyMCE 6 does not initialize dependency plugins automatically
            if (tinymce.majorVersion == 6)
                tinymce.PluginManager.get("N1EDEco")(ed, url);
        },
        ["N1EDEco"] // We can not move Ecosystem in this file due to we need to dynamically
                    // embed configuration from your Dashboard into it.
                    // So Ecosystem add-on can be loaded only from CDN
    );

})();