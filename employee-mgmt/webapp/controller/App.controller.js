sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   *
   */
  function (Controller) {
    "use strict";
    return Controller.extend("sapui5.com.employeemgmt.controller.App", {

      onInit: function () {  

      }, 

      onCreateEmployee: function (oEvent) {
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("CreateEmployeeRoute");
      },       
      
      onLookupEmployee: function (oEvent) {
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("LookupEmployeeRoute");
      },             

    });
  } 
);
