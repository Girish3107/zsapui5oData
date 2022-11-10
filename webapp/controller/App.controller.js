sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/resource/ResourceModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
       

    ],
    function (Controller, JSONModel, MessageToast, Fragment, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("sap.ui.demo.sapui5odata.controller.App", {
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


                this.mode = undefined;
                // create a new model for property binding .for visible property
                   var newModel1 = new JSONModel({
                    visibleHeader: true,
                    "editable": false,
                    "display": true,
                    "valueState": "None",
                    "add": true,
                    "edit": true,
                    "delete": true,
                    "status":"completed",
                    "status1":"Edited"
    
                });
    
                this.getView().setModel(newModel1, "newModel");
   
                var statusModel1 = new JSONModel({
                    "reference": [{
                        "CustomerReference": "A"
                    }, {
                        "CustomerReference": "B"
    
                    }, {
                        "CustomerReference": "C"
    
                    }]
                });
                this.getView().setModel(statusModel1, "statusModel");



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

           
            },
            onDelete: function(oEvent) {
                debugger;
                this.mode = "delete";
                var that = this;
                var sData = oEvent.getSource().getModel("Product").getData();
                var oTable = this.byId("idTable");
                var oThisObj = oTable.getModel("currentProd").getData();
                var index = $.map(sData.Products, function(obj, index) {
                    if (obj === oThisObj) {
                        return index;
                    }
                });
                
                sData.Products.splice(index, 1);//delete  record by using Splice
                that.getView().getModel("Product").setData(sData);//after deleting set the data
                oTable.removeSelections(true);
                oTable.getModel("currentProd").refresh(true);
               
                
            },


            onEdit: function(oEvent) {
                debugger;
                // this.mode is a global varible 
                this.mode = "Edit";
                var that = this;
                // declare a arry for holding old records.
                this.oldDataArry = [];
                // var sData = oEvent.getSource().getModel("sOrder1").getData();
                var oTable = this.byId("idTable");
                // selected row data contains selected records to edit
                //var selectedRowData = oTable.getSelectedContexts();
               
                oEvent.getSource().getParent().getParent().getParent().setShowFooter(true);//one of the way to show the footer 
                that.getView().getModel("newModel").setProperty("/add", false);//we set property add to false so that it disappear when click on edit button
                that.getView().getModel("newModel").setProperty("/delete", false);//we set property delete to false so that it disappear when click on edit button
                that.getView().getModel("newModel").setProperty("/editable", true);//we set property editable to false so that first property is non-editable
                that.getView().getModel("newModel").setProperty("/display", false);
                that.getView().getModel("newModel").refresh();
                 
            },  

            onAdd: function(oEvent){
                debugger;
                this.mode = "Add";
                var that = this;
                oEvent.getSource().getParent().getParent().getParent().setShowFooter(true);
                that.getView().getModel("newModel").setProperty("/edit", false);
                that.getView().getModel("newModel").setProperty("/add", true);
                that.getView().getModel("newModel").setProperty("/delete", false);
                that.getView().getModel("newModel").setProperty("/editable", true);
               
                var newRecord = {//create a dummy record to push when user click on Add
                    "ProductID": "",
                    "ProductName": "",
                    "SupplierID": "",
                    "CategoryID": "",
                    "QuantityPerUnit": "",
                    "UnitPrice": "",
                    "UnitsInStock": "",
                    "UnitsOnOrder": "",
                    "ReorderLevel": "",
                    "Discontinued": "",
                    "editable": true,
                    "neweditable": true
                };
                var oTableData = oEvent.getSource().getModel("Product").getData();//get table data
                oTableData.Products.push(newRecord);//push this new record in model
                that.getView().getModel("Product").setData(oTableData);//set data to the view
            },


            onLiveChange: function(oEvent) {
                this.enteredValue = oEvent.getParameter("value");
    
            },

            onChange: function(oEvent) {
                var that = this;
                var enteredText = oEvent.getParameters("value").value;
                this.recordexists = undefined;
                // var index=undefined;
                var sData = this.getView().getModel("Product").getData().Products;//get the moedl data
                var spath = parseInt(oEvent.getSource().getBindingContext("Product").getPath().split("/")[2]);//get the index of enter data row
    
                var index = sData.findIndex(function(item, sindex) {//findIndex is a method used to validate if same value found it returns index position othervise it returns -1
                    return item.ProductName === enteredText && sindex !== spath;
                });
                if (index > -1) {
                    this.recordexists = index;
                    that.getView().getModel("newModel").setProperty("/valueState", "Error");//set value state to error
                    MessageToast.show("entered Product Name is alreay exists");
    
                    return;
                }
                that.getView().getModel("newModel").setProperty("/valueState", "None");
    
            },

            onSave: function(oEvent) {
                var that = this;
                if (this.mode === "Edit") {//if user click on save in edit functionality
                    var oTable = this.byId("idTable");
                    // var selectedRowData = oTable.getSelectedContexts();
                    // selectedRowData.forEach(function(item) {
                    //     var sContext = item;
                    //     var sPath = sContext.getPath();
                    //     var sObj = sContext.getObject();
                    //     sObj.editable = false;//we set editable false 
                    //     that.getView().getModel("currentProd").setProperty(sPath, sObj, sContext, true);
    
                    // });
                    oEvent.getSource().getParent().getParent().setShowFooter(false);//we set property add to false so that footer disappear when click on save button
                    that.getView().getModel("newModel").setProperty("/edit", true);//we set property add to true so that it appers when click on save button
                    that.getView().getModel("newModel").setProperty("/add", true);//we set property add to true so that it appers when click on save button
                    that.getView().getModel("newModel").setProperty("/delete", true);//we set property delete to true so that it appers when click on save button
                    that.getView().getModel("newModel").setProperty("/editable", false);
                    that.getView().getModel("newModel").setProperty("/display", true);
                    MessageToast.show("Record updated Successfully");//throws a message
                    return;
    
                } else if (this.mode === "Add") {
                    var sData = oEvent.getSource().getModel("currentProd").getData().Products;//get the table data
                    var sIndex = sData.length - 1;//get the length of the sdata
                    if (this.recordexists !== undefined) {
                        MessageToast.show("Product Name already exists");
    
                        return;
    
                    } else {
                        for (var i = 0; i <= sIndex; i++) {
    
                            if (sData[i].editable === true) {//check feilds which are Appended by click on Add
                                if (sData[i].SalesOrder === "") {//check if the entered data is blank then it throws a error message
                                    MessageToast.show("SalesOrder Number is cannot be empty");
                                    return;
                                } else {
                                    sData[i].editable = false;//if record is not blank set editable to false
                                    sData[i].neweditable = false;//this is for first property
                                    that.getView().getModel("sOrder1").setProperty("/Sales/" + i, sData[i]);//set property binding for that records
                                    that.getView().getModel("newModel").setProperty("/edit", true);//edit button visible
                                    that.getView().getModel("newModel").setProperty("/add", true);//add button visible
                                    that.getView().getModel("newModel").setProperty("/delete", true);//delete button visible
                                    that.getView().getModel("newModel").setProperty("/editable", false);//we set property editable to false so that first property is non-editable
                                    oEvent.getSource().getParent().getParent().setShowFooter(false);//footer false
                                    MessageToast.show("Record saved Successfully");
                                }
                            }
                        }
                    }
                }
    
            },

            onCancel: function(oEvent) {
                if (this.mode === "Edit") {
    
                    var that = this;
                    var oTable = this.byId("idTable");
                    // var selectedRowData = oTable.getSelectedContexts();
    
                    // this.oldDataArry.forEach(function(item) {
                    //     // var sContext = item;
                    //     var sPath = item.sPath;
                    //     var sObj = JSON.parse(item.sObj);
                    //     sObj.editable = false;
                    //     that.getView().getModel("sOrder1").setProperty(sPath, sObj, true);
                    // });
                    oEvent.getSource().getParent().getParent().setShowFooter(false);
                    that.getView().getModel("newModel").setProperty("/edit", true);
                    that.getView().getModel("newModel").setProperty("/add", true);
                    that.getView().getModel("newModel").setProperty("/delete", true);
                    that.getView().getModel("newModel").setProperty("/editable", false);
                    that.getView().getModel("newModel").setProperty("/display", true);
                    // oTable.removeSelections(true);
    
                } else if (this.mode === "Add") {
                    //  var oTable = this.byId("idTable");
                    // var sData = oEvent.getSource().getModel("currentProd").getData().Products;
                    // var sIndex = sData.length - 1;
                    // for (var i = sIndex; i >= 0; i--) {
                    //     var cellsInEdit = sData[i].editable;
                    //     if (cellsInEdit === true) {
                    //         sData.splice(i, 1);//delete a record by slice method
    
                    //     }
                    //      oTable.removeSelections(true);
                    // }
                    // this.getView().getModel("currentProd").setProperty("/Products/", sData);
                    // oEvent.getSource().getParent().getParent().setShowFooter(false);
                    // this.getView().getModel("newModel").setProperty("/edit", true);
                    // this.getView().getModel("newModel").setProperty("/add", true);
                    // this.getView().getModel("newModel").setProperty("/delete", true);
                    // that.getView().getModel("newModel").setProperty("/editable", false);
                    // that.getView().getModel("newModel").setProperty("/display", true);
                    // MessageToast.show("Record saved Successfully");

                    var that = this;
                    var oTable = this.byId("idTable");
                    oEvent.getSource().getParent().getParent().setShowFooter(false);
                    that.getView().getModel("newModel").setProperty("/edit", true);
                    that.getView().getModel("newModel").setProperty("/add", true);
                    that.getView().getModel("newModel").setProperty("/delete", true);
                    that.getView().getModel("newModel").setProperty("/editable", false);
                    that.getView().getModel("newModel").setProperty("/display", true);
                }
    
            },

            onDelete1: function(oEvent) {
                debugger;
                this.mode = "delete";
                var that = this;
                var sData = oEvent.getSource().getModel("Product").getData();
                var oTable = this.byId("prodList");
                var selectedRowData = oTable.getSelectedContexts();//get the selected contexts 
                if (selectedRowData.length === 0) {
                    MessageToast.show("please select atleast one row");
                    return;
                } else {
    
                    for (var i = selectedRowData.length - 1; i >= 0; i--) {
                        var oThisObj = selectedRowData[i].getObject();
                        var index = $.map(sData.Products, function(obj, index) {
                            if (obj === oThisObj) {
                                return index;
                            }
                        });
                        sData.Products.splice(index, 1);//delete  record by using Splice
                    }
                    that.getView().getModel("Product").setData(sData);//after deleting set the data
                    // this._oTable.getModel().setData(sData);
                    oTable.removeSelections(true);
                }
            },

            onAdd1: function(oEvent) {
                debugger;
                this.mode = "Add";
                var that = this;
                oEvent.getSource().getParent().getParent().getParent().setShowFooter(true);
                that.getView().getModel("newModel").setProperty("/edit", false);
                that.getView().getModel("newModel").setProperty("/add", true);
                that.getView().getModel("newModel").setProperty("/delete", false);
                that.getView().getModel("newModel").setProperty("/editable", true);
               
                var newRecord = {//create a dummy record to push when user click on Add
                    "ProductID": "",
                    "ProductName": "",
                    "SupplierID": "",
                    "CategoryID": "",
                    "QuantityPerUnit": "",
                    "UnitPrice": "",
                    "UnitsInStock": "",
                    "UnitsOnOrder": "",
                    "ReorderLevel": "",
                    "Discontinued": "",
                    "editable": true,
                    "neweditable": true
                };
                var oTableData = oEvent.getSource().getModel("Product").getData();//get table data
                oTableData.Products.push(newRecord);//push this new record in model
                that.getView().getModel("Product").setData(oTableData);//set data to the view
            },


            onEdit1: function(oEvent) {
                debugger;
                this.mode = "Edit";
                var that = this;
               
                this.oldDataArry = [];
                
                var oTable = this.byId("prodList");
                // selected row data contains selected records to edit
                //var selectedRowData = oTable.getSelectedContexts();
                var selectedRowData = oTable.getSelectedContexts();

                if (selectedRowData.length === 0) {//this condiction check wheather the records got selected or not
                    MessageToast.show("please select atleast one row");
    
                    return;
                }else{
                    oEvent.getSource().getParent().getParent().getParent().setShowFooter(true);//one of the way to show the footer 
                    that.getView().getModel("newModel").setProperty("/add", false);//we set property add to false so that it disappear when click on edit button
                    that.getView().getModel("newModel").setProperty("/delete", false);//we set property delete to false so that it disappear when click on edit button
                    that.getView().getModel("newModel").setProperty("/editable", false);//we set property editable to false so that first property is non-editable
                    that.getView().getModel("newModel").setProperty("/display", false);
                    that.getView().getModel("newModel").refresh();
                    
                    selectedRowData.forEach(function(item) {
                        var sContext = item;
                        var sPath = sContext.getPath();
                        var sObj = sContext.getObject();
                        var oldObj = {//here old Obj collects selected data 
                            sPath: sPath,
                            sObj: JSON.stringify(sObj)//Json.Stringfy method used to convert in String format
                        };
                        that.oldDataArry.push(oldObj);//append the record to arry which we declare before
                        sObj.editable = true;//by using this property we enable inputfeilds visible
    
                        that.getView().getModel("Product").setProperty(sPath, sObj, sContext, true);//finally we set record in model in that path
    
                    });
                    
                }
                
                
               
                   
    
            },  

            onSave1: function(oEvent) {
                var that = this;
                if (this.mode === "Edit") {//if user click on save in edit functionality
                    var oTable = this.byId("prodList");
                    var selectedRowData = oTable.getSelectedContexts();
                    selectedRowData.forEach(function(item) {
                        var sContext = item;
                        var sPath = sContext.getPath();
                        var sObj = sContext.getObject();
                        sObj.editable = false;//we set editable false 
                        that.getView().getModel("Product").setProperty(sPath, sObj, sContext, true);
    
                    });
                    oEvent.getSource().getParent().getParent().setShowFooter(false);//we set property add to false so that footer disappear when click on save button
                    that.getView().getModel("newModel").setProperty("/edit", true);//we set property add to true so that it appers when click on save button
                    that.getView().getModel("newModel").setProperty("/add", true);//we set property add to true so that it appers when click on save button
                    that.getView().getModel("newModel").setProperty("/delete", true);//we set property delete to true so that it appers when click on save button
                    that.getView().getModel("newModel").setProperty("/editable", false);
                    that.getView().getModel("newModel").setProperty("/display", true);
                    MessageToast.show("Record updated Successfully");//throws a message
                    return;
    
                } else if (this.mode === "Add") {
                    var sData = oEvent.getSource().getModel("Product").getData().Products;//get the table data
                    var sIndex = sData.length - 1;//get the length of the sdata
                    if (this.recordexists !== undefined) {
                        MessageToast.show("Product Name already exists");
    
                        return;
    
                    } else {
                        for (var i = 0; i <= sIndex; i++) {
    
                            if (sData[i].editable === true) {//check feilds which are Appended by click on Add
                                if (sData[i].ProductID === "") {//check if the entered data is blank then it throws a error message
                                    MessageToast.show("ProductID Number is cannot be empty");
                                    return;
                                } else {
                                    sData[i].editable = false;//if record is not blank set editable to false
                                    sData[i].neweditable = false;//this is for first property
                                    that.getView().getModel("Product").setProperty("/Products/" + i, sData[i]);//set property binding for that records
                                    that.getView().getModel("newModel").setProperty("/edit", true);//edit button visible
                                    that.getView().getModel("newModel").setProperty("/add", true);//add button visible
                                    that.getView().getModel("newModel").setProperty("/delete", true);//delete button visible
                                    that.getView().getModel("newModel").setProperty("/editable", false);//we set property editable to false so that first property is non-editable
                                    oEvent.getSource().getParent().getParent().setShowFooter(false);//footer false
                                    MessageToast.show("Record saved Successfully");
                                }
                            }
                        }
                    }
                }
    
            },

            onCancel1: function(oEvent) {
                if (this.mode === "Edit") {
    
                    var that = this;
                    var oTable = this.byId("prodList");
                    // var selectedRowData = oTable.getSelectedContexts();
    
                    this.oldDataArry.forEach(function(item) {
                        // var sContext = item;
                        var sPath = item.sPath;
                        var sObj = JSON.parse(item.sObj);
                        sObj.editable = false;
                        that.getView().getModel("Product").setProperty(sPath, sObj, true);
                    });
                    oEvent.getSource().getParent().getParent().setShowFooter(false);
                    that.getView().getModel("newModel").setProperty("/edit", true);
                    that.getView().getModel("newModel").setProperty("/add", true);
                    that.getView().getModel("newModel").setProperty("/delete", true);
                    oTable.removeSelections(true);
    
                } else if (this.mode === "Add") {
                    var oTable = this.byId("prodList");
                    var sData = oEvent.getSource().getModel("Product").getData().Products;
                    var sIndex = sData.length - 1;
                    for (var i = sIndex; i >= 0; i--) {
                        var cellsInEdit = sData[i].editable;
                        if (cellsInEdit === true) {
                            sData.splice(i, 1);//delete a record by slice method
    
                        }
                         oTable.removeSelections(true);
                    }
                    this.getView().getModel("Product").setProperty("/Products/", sData);
				    oEvent.getSource().getParent().getParent().setShowFooter(false);
				    this.getView().getModel("newModel").setProperty("/edit", true);
				    this.getView().getModel("newModel").setProperty("/add", true);
				    this.getView().getModel("newModel").setProperty("/delete", true);
				    MessageToast.show("Record saved Successfully");
                }
    
            },
    
          


        });
    }
);
