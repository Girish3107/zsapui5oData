sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment",
        "sap/ui/model/resource/ResourceModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"

    ],
    function (Controller, JSONModel, Fragment, ResourceModel, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("sap.ui.demo.sapui5odata.controller.View1", {
            onInit() {
                var oModel = this.getView().getModel("product");
                var oJsonModel = new JSONModel();
                this.getView().setModel(oJsonModel, "Product");

                oModel.read("/Products", {
                    success: function (oData, oResponse) {

                        oJsonModel.setData({ "Products": oData.results });
                    },
                    error: function (oError) {

                        console.log("Error handler");
                    }
                });


                this.getView().getModel("i18n").getResourceBundle();


            },


            handleValueHelp: function () {
                var oView = this.getView();

                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.sapui5odata.view.ValueHelp",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    //this._configValueHelpDialog();
                    oValueHelpDialog.open();
                }.bind(this));
            },

            handleSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("ProductName", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([oFilter]);
            },


            handleValueHelpClose: function (oEvent) {

                var oSelectedItem = oEvent.getParameter("selectedItem"),
                    oInput = this.byId("productInput");
                debugger;

                if (!oSelectedItem) {
                    oInput.resetProperty("value");
                    return;
                }

                oInput.setValue(oSelectedItem.getCells()[1].getTitle());

                //new model for selected item
                var oCurrentProduct = oSelectedItem.oBindingContexts.Product.getObject();
                var oModel = new JSONModel(oCurrentProduct);
                //this.getView().byId("idTable").setModel(oModel, "currentProd");
                // this.getView().setModel(oModel, "currentProd");
                // oModel.setData({ "CurrentProducts": oModel.oData });
                this.getView().byId("idTable").setModel(oModel, "currentProd");
                


            }

        });
    }
);
