/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel"
    ],
    function (UIComponent, Device, Fragment,JSONModel) {
        "use strict";

        return UIComponent.extend("plg.hcm.zbcplgsupport.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                UIComponent.prototype.init.apply(this, arguments);

                this._supportDialog = undefined;
                
                var btpUser = "";
                try {
                //    btpUser = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                } catch (error) {
                    
                }

                var oErrorModel = new JSONModel({
                    title : "",
                    description : "",
                    href : location.href,
                    btpUser:btpUser,
                    osName:sap.ui.Device.os.name,
                    osVersion:sap.ui.Device.os.version.toString(),
                    browserName : sap.ui.Device.browser.name,
                    browserVersion:sap.ui.Device.browser.version.toString(),
                    orientation : (sap.ui.Device.orientation.landscape) ? 'landscape' : 'portrait',
                    tablet:sap.ui.Device.system.tablet,
                    phone:sap.ui.Device.system.phone,
                    desktop:sap.ui.Device.system.desktop,
                    combi:sap.ui.Device.system.combi
                });

                this.setModel(oErrorModel,"errorModel");
                
                this.setModel(new JSONModel({busy : false}),"runtime");

                this.addFloatingButton();

                sap.ui.require(["sap/ushell/Container"], async function (Container) {
                    const URLParsing = await Container.getServiceAsync("URLParsing");
                    
                    try {
                        if(URLParsing.parseShellHash(window.location.hash).params && URLParsing.parseShellHash(window.location.hash).params.hasOwnProperty("support") && URLParsing.parseShellHash(window.location.hash).params.support[0] === "true"){
                            this.onOpenSupport();
                            // Remove Start Support Parameter from URL
                            window.location.href = window.location.href.replace("?support=true","");
                        }
                    } catch (error) {
                        // do nothing
                    }
                  }.bind(this));
            },

            addFloatingButton : function(oEvent){
                var oRenderer = sap.ushell.Container.getRenderer("fiori2");
                var b = new sap.m.Button({
                    /*icon: "sap-icon://sys-help",*/
                    text:"Support",
                    press: function () {
                        this.onOpenSupport()
                    }.bind(this)
                });
     
                b.addStyleClass("supportBtn");
     
                oRenderer.getRootControl().addContent(b);
            },
                        
            onOpenSupport : function(oEvent){
                var oView = this;

                this.setModelData();

                // create dialog lazily
                if (!this._supportDialog) {
                    // load asynchronous XML fragment
                    Fragment.load({
                        id: oView.getId(),
                        name: "plg.hcm.zbcplgsupport.fragments.Dialog",
                        controller : this
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                       // oView.addDependent(oDialog);
                        oDialog.open();
                        this._supportDialog = oDialog;
                        this._supportDialog.setModel(this.getModel("i18n"),"i18n");
                        this._supportDialog.setModel(this.getModel("errorModel"),"errorModel");
                        this._supportDialog.setModel(this.getModel("runtime"),"runtime");
                        this.getModel("errorModel")
                    }.bind(this));
                } else {
                    this._supportDialog.setModel(this.getModel("i18n"),"i18n");
                    this._supportDialog.setModel(this.getModel("errorModel"),"errorModel");
                    this._supportDialog.setModel(this.getModel("runtime"),"runtime");
                    this._supportDialog.open();
                }
            },
            setModelData : function(){

                var btpUser = "";
                try {
                 //   btpUser = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                } catch (error) {
                    
                }

                var oData = {
                    title : "",
                    description : "",
                    href : location.href,
                    btpUser : btpUser,
                    osName:sap.ui.Device.os.name,
                    osVersion:sap.ui.Device.os.version.toString(),
                    browserName : sap.ui.Device.browser.name,
                    browserVersion:sap.ui.Device.browser.version.toString(),
                    orientation : (sap.ui.Device.orientation.landscape) ? 'landscape' : 'portrait',
                    tablet:sap.ui.Device.system.tablet,
                    phone:sap.ui.Device.system.phone,
                    desktop:sap.ui.Device.system.desktop,
                    combi:sap.ui.Device.system.combi
                };

                this.getModel("errorModel").setData(oData);
            },
            checkData : function(){
                
                var bCheck = true;

                return bCheck;
            },
            onSend : function(oEvent){

                if(!this.checkData()){
                    return;
                }

                this.getModel("runtime").setProperty("/busy", true);

                var oModel = this.getModel(),
                    odata = this.getModel("errorModel").getData();

                oModel.create("/ticketSet",odata,{
                    success : function(odata){
                        this.getModel("runtime").setProperty("/busy", false);
                        if(this._supportDialog){
                            this._supportDialog.close();
                        }
                        sap.m.MessageToast.show(this.getModel("i18n").getResourceBundle().getText("success"));
                    }.bind(this),
                    error : function(oError){
                        this.getModel("runtime").setProperty("/busy", false);
                    }
                });
            },
            onCancel : function(oEvent){
                oEvent.getSource().getParent().close();
            }
        });
    }
);