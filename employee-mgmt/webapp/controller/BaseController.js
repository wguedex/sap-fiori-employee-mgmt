sap.ui.define([
  "sap/ui/core/mvc/Controller", 
  "sap/ui/core/routing/History"    
], function (Controller, History) {
  "use strict";

  return Controller.extend("sapui5.com.employeemgmt.controller.BaseController", {

    formatUTCDate: function (date) {

      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      const currentMinutes = currentDate.getMinutes();
      const currentSeconds = currentDate.getSeconds();


      const pad = (num) => num.toString().padStart(2, '0');
      return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(currentHour)}:${pad(currentMinutes)}:${pad(currentSeconds)}`;
    },

    validateComments: function (oEvent) {

      var sComments = oEvent.getParameter("newValue");
      var sExpReg = /^([a-zA-Z0-9ÑñÁáÉéÍíÓóÚúÜü.,\s]{0,200})$/;
      var sExpRegCRLF = /[\n\r]/;

      if (sExpReg.test(sComments) && !sExpRegCRLF.test(sComments)) {
        return "None";
      } else {
        return "Error";
      }
    },

    validateInputField: function (value) {
      // Define regular expression for name/lastname validation
      let sExpReg = /^[a-zA-ZÑñÁáÉéÍíÓóÚúÜü\s]+$/;

      // Define letter count limits
      const minLetters = 2;
      const maxLetters = 20;

      // Remove spaces and count letters
      let noSpaceValue = value.replace(/\s+/g, '');
      let letterCount = noSpaceValue.length;

      // Check against letter count limits and pattern
      if (value === "" || !sExpReg.test(value) || letterCount < minLetters || letterCount > maxLetters) {
        return "Error";
      } else {
        return "None";
      }
    },

    validateDNI: function (dni) {
      const regularExp = /^\d{8}[a-zA-Z]$/;

      if (!regularExp.test(dni)) return "Error";

      const number = dni.substr(0, 8) % 23;
      const expectedLetter = "TRWAGMYFPDXBNJZSQVHLCKET"[number];
      const providedLetter = dni[8].toUpperCase();

      return expectedLetter === providedLetter ? "None" : "Error";
    },

    validateCIF: function (cif) {
      cif = cif.toUpperCase();

      if (cif.length !== 9) {
        return "Error";
      }

      const letterList = "ABCDEFGHJNPQRSUVW";
      const checkDigit = cif[8];
      const initialLetter = cif[0];
      const digits = cif.slice(1, -1);
      let sum = 0;

      if (!letterList.includes(initialLetter)) {
        return "Error";
      }

      for (let i = 0; i < 7; i++) {
        let digit = parseInt(digits[i], 10);
        if (i % 2 === 0) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        sum += digit;
      }

      sum = 10 - (sum % 10);
      if (sum === 10) {
        sum = 0;
      }

      if (sum === parseInt(checkDigit, 10) || (letterList.indexOf(initialLetter) < 8 && checkDigit === "JZ".charAt(sum))) {
        return "None";
      }

      return "Error";
    },

    navToBack: function () {
      let oHistory = History.getInstance();
      let sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);  // Go back to the previous history entry
      } else {
        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("appRoute", true);  // Navigate to the specified route
      }
    },

  })

});