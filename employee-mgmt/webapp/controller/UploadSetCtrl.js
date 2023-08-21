sap.ui.define(
  ["sap/ui/base/ManagedObject", "sap/ui/core/Item"],
  /**
   *
   * @param {typeof sap.ui.base.ManagedObject} ManagedObject
   */
  function (ManagedObject, Item) {
    "use strict";

    return ManagedObject.extend(
      "sapui5.com.employeemgmt.controller.UploadSetCtrl",
      {
        constructor: function (oView, oController) {
          this._oView = oView;
          this._oController = oController;
          this._oUpload = this._oView.byId("idUploadSet");
        },

        onFileDelete: function (oEvent) {
          //Borrar archivo del backend
          var oi18n = this._oView.getModel("i18n").getResourceBundle();

          var oUplCollection = oEvent.getSource();
          var sPath = oEvent
            .getParameter("item")
            .getBindingContext("employeeModels")
            .getPath();
          var oModel = this._oView.getModel("employeeModels");

          //Bloquear vistas para evitar que el usuario ejecute accioenes
          // this._setBusyForFiles(true);

          oModel.remove(sPath, {
            success: function () {
              //Se añade delay para que no se vea brusco el apagado del busy indicator
              //cuando el proceso de borrado es muy rápido
              oUplCollection.getBinding("items").refresh();
              jQuery.sap.delayedCall(
                1500,
                this,
                function () {
                  //Desbloquear vistas
                  // this._setBusyForFiles(false);
                  MessageToast.show(oi18n.getText("fileDeleted"));
                }.bind(this)
              );
            }.bind(this),
            error: function () {
              //Se añade delay para que no se vea brusco el apagado del busy indicator
              //cuando el proceso de borrado es muy rápido
              jQuery.sap.delayedCall(
                500,
                this,
                function () {
                  //Desbloquear vistas
                  this._setBusyForFiles(false);
                  MessageBox.error(oi18n.getText("fileNotDeleted"), {
                    title: oi18n.getText("deleteFileTitle"),
                  });
                }.bind(this)
              );
            }.bind(this),
          });
        },

        onBeforeUploadStarts: function (oEvent) {
          let sFilename = oEvent.getParameter("item").getFileName();
          let sEmployeeId = this._oView
            .getModel("DataEmployee")
            .getProperty("/employeeId");

          oEvent.getParameter("item").addHeaderField(
            new Item({
              key: "slug",
              text: "jhon.wick@gmail.com" + ";" + sEmployeeId + ";" + sFilename,
            })
          );
        },

        onAfterItemAdded: function (oEvent) {
          const csrfToken = this._oView
            .getModel("employeeModels")
            .getSecurityToken();

          oEvent.getParameter("item").addHeaderField(
            new Item({
              key: "x-csrf-token",
              text: csrfToken,
            })
          );
        },

        uploadFiles: function () {
          this._oUpload.upload();
        },
      }
    );
  }
);
