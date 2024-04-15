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


                sap.ushell.Container.getRenderer("fiori2").addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", {
                    id: "supportBtn",
                    icon: "sap-icon://sys-help", 
                    text:"Support",
                    tooltip : this.getModel("i18n").getResourceBundle().getText("tooltip"),
                    press:this.onOpenSupport.bind(this)
                }, true, false, [sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState.Home, sap.ushell.renderers.fiori2.RendererExtensions
					.LaunchpadState.App
				]);
                
               /* sap.ushell.Container.getRenderer("fiori2").addFloatingActionButton("sap.ushell.ui.shell.ShellFloatingAction", {
                    id: "floatingSupportBtn",
                    icon: "sap-icon://headset",
                    tooltip : this.getModel("i18n").getResourceBundle().getText("tooltip"),
                    press:this.onOpenSupport.bind(this)}, true, true);

                    sap.ui.getCore().byId("floatingSupportBtn").addStyleClass("zsupport-floating-support");
                    */
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
                        this.getModel("errorModel")
                    }.bind(this));
                } else {
                    this._supportDialog.setModel(this.getModel("i18n"),"i18n");
                    this._supportDialog.setModel(this.getModel("errorModel"),"errorModel");
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

                var oModel = this.getModel(),
                    odata = this.getModel("errorModel").getData();

                oModel.create("/ticketSet",odata,{
                    success : function(odata){
                        if(this._supportDialog){
                            this._supportDialog.close();
                        }
                        sap.m.MessageToast.show(this.getModel("i18n").getResourceBundle().getText("success"));
                    }.bind(this),
                    error : function(oError){
                        debugger;
                    }
                });
            },
            onCancel : function(oEvent){
                oEvent.getSource().getParent().close();
            }
        });
    }
);