sap.ui.define(
  [
    "sapui5/com/employeemgmt/controller/BaseController",
    "sap/m/MessageBox",
    "sapui5/com/employeemgmt/controller/UploadSetCtrl",
    "sapui5/com/employeemgmt/controller/WizardCtrl"
  ],
  function (BaseController, MessageBox, UploadSetCtrl, WizardCtrl) {
    "use strict";

    return BaseController.extend("sapui5.com.employeemgmt.controller.CreateEmployee", {

      onInit: function () {
       
        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("CreateEmployeeRoute").attachMatched(this._onRouteMatched, this);

      },

      _onRouteMatched: function () {

        //Create a WizardCtrl object
        this._oWizard = new WizardCtrl(this.getView(), this);
 
        //Initialize fields of wizard
        this._oWizard.initWizard(0);
     
        //Destroy previous items of UploadSet
        this.getView().byId("idUploadSet").destroyItems()

        //Create a UploadSetCtrl object
        this._oUploadSet = new UploadSetCtrl(this.getView(), this)
        
        //Navigate to main page
        this._oWizard._oNavContainer.to(this.byId("wizardContentPageId1"));
        if (this._oWizard._oWizard.getProgressStep() !== this.getView().byId("idWizardStep1")) {
          this._oWizard.discardProgress(this.getView().byId("idWizardStep1"));
        }

      },

      setEmployeeType: function (oEvent) {
         
        //Get the employee type
        let key = oEvent.getParameters().item.getKey();

        //Assign employee type to the wizard and update initial settings
        this._oWizard.initWizard(key);

        //Validate step 1
        this._oWizard.validateStep("idWizardStep1");

      },

      onSaveEmployee: function () {

        //Get data employee
        let data = this.getView().getModel("DataEmployee").oData;

        //Get odata model
        let oEmployeesModel = this.getView().getModel("employeeModels");

        //Establish creation date and formatt values 
        let creationDate = new Date(data.creationDate);
        let sValue = BaseController.prototype.formatUTCDate(creationDate);

        //Assig 
        let oBody = {
          SapId: this.getOwnerComponent().SapId,
          Type: data.type,
          FirstName: data.firstName,
          LastName: data.lastName,
          Dni: data.documentId,
          CreationDate: sValue,
          Comments: data.comment,
          UserToSalary: [{
            Amount: data.salary.toString(),
            Comments: data.comment,
            Waers: data.waers
          }]
        };


        this.getView().setBusy(true);
        
        //Create employee  
        oEmployeesModel.create("/Users", oBody, {
          success: function (data) {
             
            let employeeId = data.UserToSalary.results[0].EmployeeId;
            //Assign EmployeeId to the 'DataEmployee' model 
            this.getView().getModel("DataEmployee").setProperty("/employeeId", employeeId);
        
            //Load files to employeeModels
            this._oUploadSet.uploadFiles();

            //show confirmation message
            this._confirmEmployeeSaved();
            
            this.getView().setBusy(false);

          }.bind(this),
          error: function (error) {
            this.getView().setBusy(false);
            MessageBox.error(oi18n.getText("employeeNotSaved"), {
              title: oi18n.getText("createEmployeeMsgTitle")
            });
          }.bind(this)
        });
      },

      _confirmEmployeeSaved: function () {

        let oi18n = this.getView().getModel("i18n").getResourceBundle();
        this.getView().setBusy(false);
        MessageBox.information(
          oi18n.getText("employeeSaved", [this.getView().getModel("DataEmployee").getProperty("/employeeId")]),
          {
            title: oi18n.getText("createEmployeeMsgTitle"),
            onClose: this._cancelWizard.bind(this)
          }
        );
      },

      onCIFChange: function (oEvent) {
        let fieldInput = this.getView().byId("cifInput");
        let sValue = fieldInput.getValue();
        let sStatus = BaseController.prototype.validateCIF(sValue);
        this.getView().getModel("DataEmployee").setProperty("/documentId", sValue);
        this.getView().getModel("DataEmployeeStates").setProperty("/documentState", sStatus);
        this._validateMandatoryFields("idWizardStep2");
      },

      onDNIChange: function (oEvent) {
        let fieldInput = this.getView().byId("dniInput");
        let sValue = fieldInput.getValue();
        let sStatus = BaseController.prototype.validateDNI(sValue);
        this.getView().getModel("DataEmployee").setProperty("/documentId", sValue);
        this.getView().getModel("DataEmployeeStates").setProperty("/documentState", sStatus);
        this._validateMandatoryFields("idWizardStep2");
      },

      onFirstNameChange: function () {
        let oInput = this.getView().byId("firstNameInput");
        let sValue = oInput.getValue();
        let sStatus = BaseController.prototype.validateInputField(sValue);
        this.getView().getModel("DataEmployeeStates").setProperty("/firstNameState", sStatus);
        this.getView().getModel("DataEmployee").setProperty("/firstName", sValue);
        this._validateMandatoryFields("idWizardStep2");
      },

      onLastNameChange: function () {
        let oInput = this.getView().byId("lastNameInput");
        let sValue = oInput.getValue();
        let sStatus = BaseController.prototype.validateInputField(sValue);
        this.getView().getModel("DataEmployeeStates").setProperty("/lastNameState", sStatus);
        this.getView().getModel("DataEmployee").setProperty("/lastName", sValue);
        this._validateMandatoryFields("idWizardStep2");
      },

      _validateMandatoryFields(sId) {

        const { firstName, lastName, documentId, creationDate } = this.getView().getModel("DataEmployee").oData;
        const { firstNameState, lastNameState, documentState } = this.getView().getModel("DataEmployeeStates").oData;

        const allFieldsFilled = firstName && lastName && documentId && creationDate;
        const allStatusNone = firstNameState === "None" && lastNameState === "None" && documentState === "None";

        if (allFieldsFilled && allStatusNone) {
          this._oWizard.validateStep(sId);
        } else {
          this._oWizard.invalidateStep(sId);
          this._oWizard.discardProgress(this.getView().byId(sId));
        }
      },

      onCreationDateChange: function (oEvent) {
        this._validateMandatoryFields("idWizardStep2");
      },

      onBeforeUploadStarts: function (oEvent) {
        this._oUploadSet.onBeforeUploadStarts(oEvent);
      },

      onAfterItemAdded: function (oEvent) {

        let dataEmployee = this.getView().getModel("DataEmployee");
        let data = dataEmployee.getData();

        let sFileName = oEvent.getParameter("item").getFileName()

        data.files.push({ fileName: sFileName });
 
        dataEmployee.setData(data);
 
        dataEmployee.refresh();

        this._oUploadSet.onAfterItemAdded(oEvent);
      },

      editStep1: function (oEvent) {
        this._oWizard.NavigateToStep(0);
        this._oWizard.discardProgress(this.getView().byId("idWizardStep1"));
      },

      editStep2: function (oEvent) {
        this._oWizard.NavigateToStep(1);
        this._oWizard.discardProgress(this.getView().byId("idWizardStep2"));
      },

      editStep3: function (oEvent) {
        this._oWizard.NavigateToStep(2);
        this._oWizard.discardProgress(this.getView().byId("idWizardStep3"));
      },

      onWizardCompleted: function (oEvent) {
        this._oWizard.wizardCompletedHandler();
      },

      onCancelEmployee: function () {
        this._cancelWizard("YES");
      },

      _cancelWizard: function (sAction) {

        if (sAction === "YES" || sAction === "OK") {

          BaseController.prototype.navToBack();

          jQuery.sap.delayedCall(
            1000,
            this,
            function () {
              this._oWizard.discardProgress(this.getView().byId("idWizardStep1"));
            }.bind(this)
          );

        }

      },

    });

  }
);
