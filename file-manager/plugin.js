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
 *   2. Add "file-manager" to the "plugins" config option
 *   3. Done
 *
 *
 *   VISUAL CONFIGURATION
 *
 *   Configure Flmngr visually using the Dashboard:
 *
 *       https://flmngr.com/dashboard
 *
 *   Get an API key there and link it to your installation.
 *   Specify it as a TinyMCE parameter:
 *
 *       apiKey: "..."
 */

(function() {

    var PLUGIN_NAME = "file-manager";
    var DEFAULT_API_KEY = "FLMN24RR1234123412341234";

    window.n1edPluginVersion=202609001;
    window.n1edPluginEditor="tinymce";

    function get(varName, defaultValue) {
        if (window[varName] !== undefined)
            return window[varName];
        else
            return defaultValue;
    }

    var apiKey;

    var editor = null;
    var majorVersion = null;
    if (!!window.editor42) {
        editor = window.editor42;
        majorVersion = editor.majorVersion;
    } else if (!!window.hugerte || !!window.hugeRTE) {
        editor = window.hugerte || window.hugeRTE;
        majorVersion = editor.majorVersion + 5;
    } else {
        editor = window.tinymce || window.tinyMCE;
        majorVersion = editor.majorVersion;
    }

    function getTinyMCE6Option(name, type) {
        for (var i=0; i<editor.get().length; i++) {
            var options = editor.get()[i].options;
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

    function resolveApiKey() {
        try {

            if (window.OVERRIDE_API_KEY)
                return window.OVERRIDE_API_KEY;

            var key = null;
            var flmngrOpts;
            var settings = editor.settings || {};
            var editors = editor.editors || [];

            if (majorVersion >= 6) {

                key = getTinyMCE6Option("apiKey", "string");
                if (!key) {
                    flmngrOpts = getTinyMCE6Option("Flmngr", "object");
                    if (!!flmngrOpts && !!flmngrOpts["apiKey"])
                        key = flmngrOpts["apiKey"];
                }

            } else {

                key = settings.apiKey;
                if (!key) {
                    flmngrOpts = settings.Flmngr;
                    if (!!flmngrOpts && !!flmngrOpts["apiKey"])
                        key = flmngrOpts["apiKey"];
                }

                if (!key) {
                    for (var i = 0; i < editors.length && !key; i++) {
                        key = editors[i].getParam("apiKey");
                        if (!key) {
                            flmngrOpts = editors[i].getParam("Flmngr");
                            if (!!flmngrOpts && !!flmngrOpts["apiKey"])
                                key = flmngrOpts["apiKey"];
                        }
                    }
                }

            }

            return key || null;

        } catch (e) {
            console.warn("Could not read the API key from the editor options: " + e);
            return null;
        }
    }

    function countEditors() {
        try {
            return majorVersion >= 6 ? editor.get().length : (editor.editors || []).length;
        } catch (e) {
            return 0;
        }
    }

    window.TINYMCE_OVERRIDE_API_KEY_PARAM = "OVERRIDE_API_KEY";
    apiKey = resolveApiKey();

    var version = get("N1ED_VERSION", "latest");
    var n1edPrefix = get("N1ED_PREFIX", null);
    if (n1edPrefix !== null && n1edPrefix !== "local")
        n1edPrefix = null;
    var n1edHttps = get("N1ED_HTTPS", true);

    var protocol = n1edHttps ? "https" : "http";

    var host = (n1edPrefix ? (n1edPrefix + ".") : "") + "cloud.n1ed.com";

    var timeoutMs = typeof window.N1ED_FAILSAFE_TIMEOUT === "number" ? window.N1ED_FAILSAFE_TIMEOUT : 7000;

    function loadEco(key) {

        editor.PluginManager.load("N1EDEco", protocol + "://" + host + "/a/" + key + "/plugins/N1EDEco/plugin.js");

        if (timeoutMs > 0) {
            setTimeout(function() {
                if (editor.PluginManager.get("N1EDEco"))
                    return;
                window.n1edEcoUnavailable = new Date().getTime();
                console.warn("Could not reach our server in " + timeoutMs + " ms (network issue?), starting the editor without cloud plugins");
                var scripts = document.getElementsByTagName("script");
                for (var i = 0; i < scripts.length; i++) {
                    var src = scripts[i].getAttribute("src");
                    if (src && src.indexOf("/plugins/N1EDEco/plugin.js") !== -1) {
                        var ev;
                        try { ev = new Event("error"); } catch (e) { ev = document.createEvent("Event"); ev.initEvent("error", false, false); }
                        scripts[i].dispatchEvent(ev);
                    }
                }
            }, timeoutMs);
        }
    }

    if (apiKey || countEditors() > 0) {

        if (!apiKey)
            apiKey = DEFAULT_API_KEY;
        loadEco(apiKey);

    } else {

        var loaded = false;
        var loadOnce = function(key) {
            if (loaded)
                return;
            loaded = true;
            apiKey = key;
            loadEco(apiKey);
        };

        var onAddEditor = function() {
            if (editor.off)
                editor.off("AddEditor", onAddEditor);
            var key = resolveApiKey();
            if (!key) {
                key = DEFAULT_API_KEY;
                console.warn("No API key found in the editor config, using our demo key - set apiKey to use your own");
            }
            loadOnce(key);
        };
        editor.on("AddEditor", onAddEditor);

        if (timeoutMs > 0)
            setTimeout(function() {
                if (loaded)
                    return;
                console.warn("No editor was created in " + timeoutMs + " ms, preloading with our demo key - set apiKey to use your own");
                loadOnce(DEFAULT_API_KEY);
                editor.ScriptLoader && editor.ScriptLoader.loadQueue && editor.ScriptLoader.loadQueue();
            }, timeoutMs);

    }

    editor.PluginManager.add(
        PLUGIN_NAME,
        function(ed, url) {
            if (majorVersion >= 6 && editor.PluginManager.get("N1EDEco"))
                editor.PluginManager.get("N1EDEco")(ed, url);
        },
        ["N1EDEco"]
    );

    function applyPatch() {
        window.applyPatch && window.applyPatch(PLUGIN_NAME, window.n1edPluginVersion, apiKey || DEFAULT_API_KEY);
    }
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = protocol + "://" + host + "/static/pluginPatch.js";
    document.head.appendChild(script);
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                applyPatch();
            }
        };
    } else {
        script.onload = function () {
            applyPatch();
        };
    }

})();