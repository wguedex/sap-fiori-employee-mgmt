sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device", 
    "sapui5/com/employeemgmt/config/config"
],
function (UIComponent, Device, config) {
    "use strict";

    return UIComponent.extend("sapui5.com.employeemgmt.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
        }, 

        SapId : config.SapId
    });
}
);
