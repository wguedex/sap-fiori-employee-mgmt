sap.ui.define(
  [
    "sapui5/com/employeemgmt/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sapui5/com/employeemgmt/controller/UploadSetCtrl",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    UploadSetCtrl,
    MessageToast,
    MessageBox
  ) {
    "use strict";

    return BaseController.extend(
      "sapui5.com.employeemgmt.controller.LookupEmployee",
      {
        onInit: function () {
          let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter
            .getRoute("LookupEmployeeRoute")
            .attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
          this._splitApp = this.byId("idSplitApp");

          this._oUploadSet = new UploadSetCtrl(this.getView(), this);

          if (this._splitApp.getCurrentDetailPage() !== this.getView().byId("idLandingPage")) {
            this._splitApp.backToTopDetail();
        }

        },

        onNavBack: function (oEvent) {
          BaseController.prototype.navToBack();
        },

        onSearch: function (oEvent) {
          let aFilters = [];
          let sQuery = oEvent.getSource().getValue();
          if (sQuery && sQuery.length > 0) {
            aFilters.push(
              new Filter({
                filters: [
                  new Filter("FirstName", FilterOperator.Contains, sQuery),
                  new Filter("LastName", FilterOperator.Contains, sQuery),
                  new Filter("Dni", FilterOperator.Contains, sQuery),
                ],
                and: false,
              })
            );
          }

          // update list binding
          let oList = this.byId("idUserList");
          let oBinding = oList.getBinding("items");
          oBinding.filter(aFilters, "Application");
        },

        onNavToDetail: function (oEvent) {
          let oContext = oEvent.getSource().getBindingContext("employeeModels");
          let oObject = oContext.getObject();

          let sEmployeeId = oObject.EmployeeId;
         
          this.getView()
            .getModel("DataEmployee")
            .setProperty("/employeeId", sEmployeeId);

          this.getView().byId("idDetailPage").bindElement({
            path: oContext.getPath(),
            model: "employeeModels",
          });

          this._splitApp.toDetail(this.createId("idDetailPage"));
        },

        onAfterItemRemoved: function(oEvent) {
          this._oUploadSet.onFileDelete(oEvent);
        }, 

        onBeforeUploadStarts: function (oEvent) {
          this._oUploadSet.onBeforeUploadStarts(oEvent);
        },

        onAfterItemAdded: function (oEvent) {
          this._oUploadSet.onAfterItemAdded(oEvent);
        },

        onDeleteEmployee: function (oEvent) {
          //Dar de baja al empleado
          var oi18n = this.getView().getModel("i18n").getResourceBundle();
          MessageBox.confirm(oi18n.getText("confirmDeleteEmployee"), {
            title: oi18n.getText("deleteEmployeeTitle"),
            onClose: this._deleteEmployee.bind(this),
          });
        },

        _deleteEmployee: function (sAction) {
          //Validar si el usuario confirmó dar de baja al empleado
          if (sAction !== "OK") {
            return;
          }

          var oi18n = this.getView().getModel("i18n").getResourceBundle();
          var oEmployeesModel = this.getView().getModel("employeeModels");

          //Obtener el path del empleado que se va a borrar (entidad Users)
          var sPath = this.byId("idDetailPage")
            .getBindingContext("employeeModels")
            .getPath();

          // this._setBusyForFiles(true);
          oEmployeesModel.remove(sPath, {
            success: function () {
              let oTimeline = this.byId("idTimeline");
              let oTimeLineItems = oTimeline.getAggregation("content");
              let oUplCollection = this.byId("idUploadSet");
              let oUplItems = oUplCollection.getAggregation("items");

              for (let item in oTimeLineItems) {
                let sPath = oTimeLineItems[item]
                  .getBindingContext("employeeModels")
                  .getPath();
                if (sPath.includes("Salaries")) {
                  this._deleteEmployeeDependencies(sPath);
                }
              }

              for (let item in oUplItems) {
                let sPath = oUplItems[item]
                  .getBindingContext("employeeModels")
                  .getPath();
                if (sPath.includes("Attachments")) {
                  this._deleteEmployeeDependencies(sPath);
                }
              }

              jQuery.sap.delayedCall(
                1000,
                this,
                function () {
                  //Desbloquear vistas - con delay para una mejor experiencia de usuario
                  // this._setBusyForFiles(false);
                  this._splitApp.backToTopDetail();
                  MessageToast.show(oi18n.getText("employeeDeleted"));
                }.bind(this)
              );
            }.bind(this),

            error: function () {
              this.getView().setBusy(false);
              jQuery.sap.delayedCall(
                1500,
                this,
                function () {
                  //Desbloquear vistas - con delay para una mejor experiencia de usuario
                  // this._setBusyForFiles(false);
                  MessageBox.error(oi18n.getText("employeeNotDeleted"), {
                    title: oi18n.getText("deleteEmployeeTitle"),
                  });
                }.bind(this)
              );
            }.bind(this),
          });
        },

        _deleteEmployeeDependencies: function (sPath) {
          let oEmployeesModel = this.getView().getModel("employeeModels");

          oEmployeesModel.remove(sPath, {
            success: function () {
              console.log("Dependency deleted");
            }.bind(this),
            error: function () {
              console.log("Error deleting dependency");
            }.bind(this),
          });
        },

        onAscend: function (oEvent) {

          //Cargar diálogo para ascender empleado
 
          if (!this._oDialogAscend) {
            this._oDialogAscend = sap.ui.xmlfragment(
              "sapui5.com.employeemgmt.fragment.DialogAscend",
              this
            );
            this.getView().addDependent(this._oDialogAscend);
          }

          //Se asigna un número para eliminar posibles errores por entradas incorrectas
          //que no hayan sido asignadas al modelo
          sap.ui.getCore().byId("idSalary").setValue("1");

          var oConfigModel = this.getView().getModel("DataEmployee");
          var oConfigData = oConfigModel.getData();
 
          this._oDialogAscend.open();
        },

        onSaveAscend: function (oEvent) {
 
          //Generar ascenso
          var oi18n = this.getView().getModel("i18n").getResourceBundle();
          var oConfigData = this.getView()
            .getModel("DataEmployee")
            .getData();
 
          MessageBox.confirm(oi18n.getText("confirmNewAscend"), {
            title: oi18n.getText("newAscend"),
            onClose: this._saveAscend.bind(this),
          });
        },

        _saveAscend: function (sAction) {
 
          //Validar si el usuario confirmó guardar el ascenso
          if (sAction === "OK") {
            if (this._oDialogAscend) {
              this._oDialogAscend.close();
            }
          } else {
            return;
          }

          var oi18n = this.getView().getModel("i18n").getResourceBundle();
          var oEmployeesModel = this.getView().getModel("employeeModels");

          var oBody = {
            SapId: this.getOwnerComponent().SapId,
            EmployeeId: this.getView().getModel("DataEmployee").getData()
            .employeeId,
            CreationDate: this.getView().getModel("DataEmployee").getData()
              .creationDate,
            Amount: this.getView()
              .getModel("DataEmployee")
              .getData()
              .salary.toString(),
            Waers: this.getView().getModel("DataEmployee").getData()
              .waers,
            Comments: this.getView().getModel("DataEmployee").getData()
              .comment,
          };

          let creationDate = new Date(oBody.CreationDate);
          let sValue = BaseController.prototype.formatUTCDate(creationDate);
          oBody.CreationDate = sValue;
 
          oEmployeesModel.create("/Salaries", oBody, {
            success: function () {
              this.getView().setBusy(false);
              MessageToast.show(oi18n.getText("newAscendSaved"));
            }.bind(this),
            error: function () {
              this.getView().setBusy(false);
              MessageBox.error(oi18n.getText("newAscendNotSaved"), {
                title: oi18n.getText("newAscend"),
              });
            }.bind(this),
          });
        },

        onCancelAscend: function(oEvent){
            if (this._oDialogAscend) {
              this._oDialogAscend.close();
            }
        }

      }
    );
  }
);
