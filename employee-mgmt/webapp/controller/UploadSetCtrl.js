sap.ui.define([
    "sap/ui/base/ManagedObject", 
    "sap/ui/core/Item"
],
    /**
     * 
     * @param {typeof sap.ui.base.ManagedObject} ManagedObject  
     */
    function (ManagedObject, Item) {
        "use strict";

        return ManagedObject.extend("sapui5.com.employeemgmt.controller.UploadSetCtrl", {

            constructor: function (oView, oController) {

                this._oView = oView;
                this._oController = oController;
                this._oUpload = this._oView.byId("idUploadSet");
                

            },

            /*onUploadStarted: function (oEvent) {
                debugger;
            },

            onUploadProgressed: function (oEvent) {
            },

            onUploadCompleted: function (oEvent) {
            },

            onUploadAborted: function (oEvent) {
            },

            onFileRenamed: function (oEvent) {
            },

            onFileChange: function (oEvent) {
                debugger;
            },*/

            onBeforeUploadStarts: function (oEvent) { 
                let sFilename = oEvent.getParameter("item").getFileName();
                let sEmployeeId = this._oView.getModel("DataEmployee").getProperty("/employeeId");
                oEvent.getParameter("item").addHeaderField(new Item(
                    {
                        key: 'slug', 
                        text: this._oController.getOwnerComponent().SapId + ";" + sEmployeeId + ";" + sFilename
                    })); 
            },

            onAfterItemAdded: function (oEvent) { 
       
                const csrfToken = this._oView.getModel("employeeModels").getSecurityToken();
                oEvent.getParameter("item").addHeaderField(new Item(
                    {
                        key: 'x-csrf-token',
                        text: csrfToken
                    })); 
  
            },

            uploadFiles: function () { 
                this._oUpload.upload();   
            }

        });
    }
);