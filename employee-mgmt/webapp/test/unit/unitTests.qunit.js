/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sapui5com/employee-mgmt/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
