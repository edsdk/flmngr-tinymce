/*!
 * Add-on for including Flmngr into your TinyMCE
 * Developer: Flmngr
 * Website: https://flmngr.com/
 * License: GPL v3
 */

/*
 *   HOW TO INSTALL THIS ADD-ON
 *
 *   1. Copy the plugin into
 *
 *        tinymce/
 *          plugins/
 *            file-manager/
 *              plugin.js
 *              plugin.min.js
 *
 *   2. Add "file-manager" into "plugins" config option
 *   3. Done
 *
 *
 *   VISUAL CONFIGURATION
 *
 *   Configure Flmngr visually using the Dashboard:
 *
 *       https://flmngr.com/dashboard
 *
 *   Get there an API key to link with your installation.
 *   Specify it as a TinyMCE parameter:
 *
 *       apiKey: "..."
 */

(function() {

    var PLUGIN_NAME = "file-manager";
    var DEFAULT_API_KEY = "FLMN24RR1234123412341234";

    window.n1edPluginVersion=202409001;
    window.n1edPluginEditor="tinymce";

    function get(varName, defaultValue) {
        if (window[varName] !== undefined)
            return window[varName];
        else
            return defaultValue;
    }

    var apiKey;

    if (tinymce.majorVersion >= 6) {

        function getTinyMCE6Option(name, type) {
            for (var i=0; i<tinymce.get().length; i++) {
                var options = tinymce.get()[i].options;
                var defaultValue = false;
                if (type === "string")
                    defaultValue = "";
                else if (type === "object")
                    defaultValue = {};
                options.register(name, {processor: type, default: defaultValue});
                if (options.isSet(name))
                    return options.get(name);
            }
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
        if (!apiKey) {
            var flmngrOpts = tinymce.settings.Flmngr;
            if (!!flmngrOpts && !!flmngrOpts["apiKey"])
                apiKey = flmngrOpts["apiKey"];
        }

        if (!apiKey) {
            for (var i = 0; i < tinymce.editors.length && !apiKey; i++) {
                apiKey = tinymce.editors[i].getParam("apiKey");
                if (!apiKey) {
                    var flmngrOpts = tinymce.editors[i].getParam("Flmngr");
                    if (!!flmngrOpts && !!flmngrOpts["apiKey"])
                        apiKey = flmngrOpts["apiKey"];
                }
            }
        }

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
            if (tinymce.majorVersion >= 6)
                tinymce.PluginManager.get("N1EDEco")(ed, url);
        },
        ["N1EDEco"] // We can not move Ecosystem in this file due to we need to dynamically
        // embed configuration from your Dashboard into it.
        // So Ecosystem add-on can be loaded only from CDN
    );

    function applyPatch() {
        window.applyPatch && window.applyPatch(PLUGIN_NAME, window.n1edPluginVersion, apiKey);
    }
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = protocol + "://" + host + "/static/pluginPatch.js";
    document.head.appendChild(script);
    if (script.readyState) {  //IE
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                applyPatch();
            }
        };
    } else {  //Others
        script.onload = function () {
            applyPatch();
        };
    }

})();