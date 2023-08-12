sap.ui.define([
    "sap/ui/base/ManagedObject"
],
    /**
     * 
     * @param {typeof sap.ui.base.ManagedObject} ManagedObject  
     */
    function (ManagedObject) {
        "use strict";

        return ManagedObject.extend("sapui5.com.employeemgmt.controller.WizardCtrl", {

            constructor: function (oView, oController) { 
                
                this._oView = oView;
                this._oController = oController;
                this._oNavContainer = this._oView.byId("idNavContainer");
                this._oWizardContentPage = this._oView.byId("wizardContentPageId1");
                this._oWizard = this._oView.byId("createEmployeeWizard");
 
            },

            initWizard: function (key) {

                this._oView.byId("idWizardStep1").setValidated(false)
                
                // Get employee types model by set default type
                let employeeType = this._oView.getModel("EmployeeTypes").oData;
                let selectedType = employeeType[key];
                
                // Get data employee model for clean default values   
                let dataEmployee = this._oView.getModel("DataEmployee");
                
                // Get the data from the model
                let data = dataEmployee.getData();
            
                // Update the properties with new values
                data.firstName = "";
                data.lastName = "";
                data.documentId = "";  
                data.creationDate = "";
                data.comment = "";
                data.files = [];
            
                data.type = key;
                data.descriptionType = selectedType.type;
                data.minSalary = selectedType.minSalary;
                data.maxSalary = selectedType.maxSalary;
                data.salary = selectedType.defaultSalary;
                data.waers = selectedType.waers;
            
                // Set the updated data back to the model
                dataEmployee.setData(data);
            
                // Refresh the model bindings to reflect the changes
                dataEmployee.refresh();
       
                let dataEmployeeStates = this._oView.getModel("DataEmployeeStates");
                let dataStates = dataEmployeeStates.getData();

                dataStates.firstNameState = "None";
                dataStates.lastNameState = "None";
                dataStates.documentState = "None"; 
                dataStates.creationDateState = "None";

                dataEmployeeStates.setData(dataStates);
                dataEmployeeStates.refresh();

            },
             
            NavigateToStep: function (iStepNumber) {
                let fnAfterNavigate = function () {
                    if (iStepNumber >= 0 && iStepNumber < this._oWizard.getSteps().length) {
                        this._oWizard.goToStep(this._oWizard.getSteps()[iStepNumber]);
                    }
                    this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
                }.bind(this);
                this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
                this.backToWizardContent();
            },

            discardProgress: function (oId) {
                this._oWizard.discardProgress(oId);
            },

            wizardCompletedHandler: function () {
                this._oNavContainer.to(this._oView.byId("wizardContentPageId2"));
            },

            backToWizardContent: function () {
                this._oNavContainer.backToPage(this._oWizardContentPage.getId());
            },

            validateStep: function (IdName) {
                let step = this._oView.byId(IdName);
                this._oWizard.validateStep(step);
            },

            invalidateStep: function (IdName) {
                let step = this._oView.byId(IdName);
                this._oWizard.invalidateStep(step);
            }

        });
    }
);
