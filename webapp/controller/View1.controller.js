sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("ui5multicomboboxdisable.controller.View1", {
        onInit: function () {
            this.getOwnerComponent().getModel().setProperty("/maxSelected", 2);
        },
    });
});
