/**
 * Created by srekonda on 10/24/2016.
 */
/**
 * @fileoverview Account Addresses Widget
 */
define(
  ['ccConstants', 'knockout', 'navigation', 'notifier', 'spinner', 'ccRestClient', 'ccStoreConfiguration', 'CCi18n',
   'jquery', 'viewModels/dynamicPropertyMetaContainer', 'pubsub','agentViewModels/account-site-selector'],
   
  function(CCConstants, ko, navigation, notifier, spinner, CCRestClient, CCStoreConfiguration, CCi18n,
   $, DynamicPropertyMetaContainer, pubsub, AccountAndSiteSelector) {
  'use strict';

  return {
    /** Widget root element id */
    WIDGET_ID: 'accountAddresses',
    addresses: ko.observableArray([]),
    allAddresses: ko.observableArray([]),
    inheritedAddresses: ko.observableArray([]),
    secondaryAddresses: ko.observableArray([]),
    profileAddresses: ko.observableArray([]),
    showInherited: ko.observable(false),
    showProfileAddress: ko.observable(false),
    hasSecondaryAddresses: ko.observable(false),
    isEditMode: ko.observable(false),
    totalInheritedAddresses: ko.observable(0),
    totalProfileAddresses: ko.observable(0),
    totalAccountAddresses: ko.observable(0),
    showLoadMore: ko.observable(false),
    showLoadMorePAddress: ko.observable(false),
    showLoadMoreAccountAddress: ko.observable(false),
    companyName: ko.observable(),
    addressType: ko.observable(),
    firstName: ko.observable(),
    lastName: ko.observable(),
    address1: ko.observable(),
    address2: ko.observable(),    
    address3: ko.observable(),
    county: ko.observable(),
    city: ko.observable(),
    country: ko.observable(),
    state: ko.observable(),
    postalCode: ko.observable(),
/*    phoneNumber: ko.observable("9999999999"),*/
    isDefaultShippingAddress: ko.observable(false),
    isDefaultBillingAddress: ko.observable(false),
    defaultShippingAddress: ko.observableArray(),
    defaultBillingAddress: ko.observableArray(),
    countriesList: ko.observableArray(),
    stateList: ko.observableArray([]),
    subscriptionArray: [],
    isDirty: ko.observable(false),
    isCreateNewAddress: ko.observable(false),
    isProfileAddress: ko.observable(false),
    editingAddressId: ko.observable(),
    duplicateEditingAddressId: ko.observable(),
    offset: ko.observable(0),
    profileOffset: ko.observable(0),
    accountOffset: ko.observable(0),
    limit: ko.observable(40),
    defaultBillingAddressType: ko.observable(),
    defaultShippingAddressType: ko.observable(),
    isGettingSavedToProfile: ko.observable(false),
    isGettingSavedToAccount: ko.observable(false),
    deleteButtonId: null,
    addressToBeDeleted: null,
    /*rahul 01/09*/
    dyProp_SpecialdeliveryIn: ko.observable(),
    dyProp_Insidepickupdlr: ko.observable(),
    dyProp_LiftGate: ko.observable(),
    dyProp_ResidentialPickup: ko.observable(),
    dyProp_LimitedAcc: ko.observable(),
    dyProp_Maincontact: ko.observable(),
    dyProp_billingContact: ko.observable(),
    dyProp_ShippingContact: ko.observable(),
    dyProp_AddressStatus: ko.observable(),
    // Postal Code Patterns
    postalCodePattern: ko.observable(''),
    US_POSTAL_CODE_PATTERN: "^[0-9]{5}([ -][0-9]{4})?$",
    CANADA_POSTAL_CODE_PATTERN: "^[abceghjklmnprstvxyABCEGHJKLMNPRSTVXY]{1}[0-9]{1}[a-zA-Z]{1} *[0-9]{1}[a-zA-Z]{1}[0-9]{1}$",
    DEFAULT_POSTAL_CODE_PATTERN: "^[0-9a-zA-Z]{1,}([ -][0-9a-zA-Z]{1,})?$",
    addressObject: ko.validatedObservable(),
    dynamicPropertyMetaInfo: DynamicPropertyMetaContainer.getInstance(),
    dynamicProperties: ko.observableArray([]),
    opDynamicProperty: ko.observable(),
    subscriptions: [],
    operationPerformedOnAddresses: ko.observable(),
    contextManager: null,
    siteFilter: ko.observable(null),
    organizationFilter: ko.observable(null),
    homeRoute: "",
   
     dynaynamiccontact: function(data)
     {
        for(var j=0; j<data.dynamicProperties().length; j++)
         {
            // console.log("===",data.dynamicProperties()[j].id())
     if(data.dynamicProperties()[j].id() == "special_delivery_instructions"){
    data.dyProp_SpecialdeliveryIn(data.dynamicProperties()[j].value());
    }else if(data.dynamicProperties()[j].id() == "INDE_INPU"){
        console.log("INDU")
    data. dyProp_Insidepickupdlr(data.dynamicProperties()[j].value());
    }else if(data.dynamicProperties()[j].id() == "LIFT_GATE"){
        console.log("LIFT_GATE")
    data.dyProp_LiftGate(data.dynamicProperties()[j].value());
    }else if(data.dynamicProperties()[j].id() == "RESI_PU_DEL"){
    data.dyProp_ResidentialPickup(data.dynamicProperties()[j].value());
    }else if(data.dynamicProperties()[j].id() == "LAPU_LADL"){
        console.log("LAPU_LADL")
    data.dyProp_LimitedAcc(data.dynamicProperties()[j].value());
    }else if(data.dynamicProperties()[j].id() == "x_main_contact"){
    data.dyProp_Maincontact(data.dynamicProperties()[j].value());
    }else if(data.dynamicProperties()[j].id() == "x_billing_contact"){
    data.dyProp_billingContact(data.dynamicProperties()[j].value());
    }else if(data.dynamicProperties()[j].id() == "x_shipping_contact"){
    data.dyProp_ShippingContact(data.dynamicProperties()[j].value());
    }else if(data.dynamicProperties()[j].id() == "Address_Status"){
    data.dyProp_AddressStatus(data.dynamicProperties()[j].value());    }
         }    
         
     },
     
    onLoad: function(widget) {
     if(widget.user().currentOrganization()!==null){
          console.log("IF")
          widget.companyName(widget.user().currentOrganization().name)
      }
      
    //   for(var j=0; j<widget.dynamicProperties().length; j++)
    //      {
    //          console.log("===",widget.dynamicProperties()[j].id())
    //  if(widget.dynamicProperties()[j].id() == "special_delivery_instructions"){
    // widget.dyProp_SpecialdeliveryIn(widget.dynamicProperties()[j].value());
    // }else if(widget.dynamicProperties()[j].id() == "INDE_INPU"){
    // widget.dyProp_Insidepickupdlr(widget.dynamicProperties()[j].value());
    // }else if(widget.dynamicProperties()[j].id() == "LIFT_GATE"){
    // widget.dyProp_LiftGate(widget.dynamicProperties()[j].value());
    // }else if(widget.dynamicProperties()[j].id() == "RESI_PU_DEL"){
    // widget.dyProp_ResidentialPickup(widget.dynamicProperties()[j].value());
    // }else if(widget.dynamicProperties()[j].id() == "LAPU_LADL"){
    // widget.dyProp_LimitedAcc(widget.dynamicProperties()[j].value());
    // }else if(widget.dynamicProperties()[j].id() == "x_main_contact"){
    // widget.dyProp_Maincontact(widget.dynamicProperties()[j].value());
    // }else if(widget.dynamicProperties()[j].id() == "x_billing_contact"){
    // widget.dyProp_billingContact(widget.dynamicProperties()[j].value());
    // }else if(widget.dynamicProperties()[j].id() == "x_shipping_contact"){
    // widget.dyProp_ShippingContact(widget.dynamicProperties()[j].value());
    // }else if(widget.dynamicProperties()[j].id() == "Address_Status"){
    // widget.dyProp_AddressStatus(widget.dynamicProperties()[j].value());    }
    //      }  
     widget.accountAndSiteSelector = AccountAndSiteSelector;
      if (!(CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT)) {
        widget.spinnerOptions = {
             parent: '#CC-scheduledOrder-scheduleForm',
             posTop: '0',
             posLeft: '50%'
        }
      }
      // Define property validation for Country
      widget.country.extend({
        required: {
          params: true,
          message: widget.translate('countryRequiredText')
        }
      });
      //Define property validation for address type
      widget.addressType.extend({
        required: {
          params: true,
          onlyIf: function(){
            if((CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT)) {
              return (widget.user().isProfileAddressManager() || widget.user().isAccountAddressManager()|| widget.user().isDelegatedAdmin() 
              || widget.isGettingSavedToProfile() || !widget.user().isB2BUser());
            } else {
              return ((!widget.user().isProfileAddressManager() && (widget.user().isAccountAddressManager() || widget.user().isDelegatedAdmin())) 
              || widget.isGettingSavedToAccount());
            }
          },
          message: widget.translate('nickNameRequiredText')
        },
        maxLength: { params:  CCConstants.ACCOUNT_NICKNAME_MAXIMUM_LENGTH, message: widget.translate('maxlengthValidationMsg',{maxLength: CCConstants.ACCOUNT_NICKNAME_MAXIMUM_LENGTH}) }
      });
      
      //Define property validation for first name and last name      
      widget.firstName.extend({
        required: {
          params: true,
          onlyIf: function(){return ((widget.user().isProfileAddressManager() && !(widget.user().isAccountAddressManager()|| widget.user().isDelegatedAdmin())) || widget.isGettingSavedToProfile() || !widget.user().isB2BUser());},
          message: widget.translate('firstNameRequired')
        },
        maxLength: {params: CCStoreConfiguration.ADDRESS_FIRSTNAME_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_FIRSTNAME_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_FIRSTNAME_MAXIMUM_LENGTH,
                    message: widget.translate('maxlengthValidationMsg',{maxLength:CCStoreConfiguration.ADDRESS_FIRSTNAME_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_FIRSTNAME_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_FIRSTNAME_MAXIMUM_LENGTH}) }
      });
      
      widget.lastName.extend({
        required: {
          params: true,
          onlyIf: function(){return ((widget.user().isProfileAddressManager() && !(widget.user().isAccountAddressManager() || widget.user().isDelegatedAdmin())) || widget.isGettingSavedToProfile() || !widget.user().isB2BUser());},
          message: widget.translate('lastNameRequired')
        },
        maxLength: {params: CCStoreConfiguration.ADDRESS_LASTNAME_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_LASTNAME_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_LASTNAME_MAXIMUM_LENGTH,
                    message: widget.translate('maxlengthValidationMsg',{maxLength:CCStoreConfiguration.ADDRESS_LASTNAME_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_LASTNAME_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_LASTNAME_MAXIMUM_LENGTH}) }
      });
      
      
      //Define property validation for company name
      widget.companyName.extend({
        required: {
          params: true,
          onlyIf: function(){return ((!widget.user().isProfileAddressManager() && (widget.user().isAccountAddressManager()|| widget.user().isDelegatedAdmin())) || widget.isGettingSavedToAccount());},
          message: widget.translate('companyNameRequiredText')
        }
      });
      
      // Define property validation for State
      widget.state.extend({
        required: {
          params: true,
          onlyIf: function () { return widget.stateList().length > 0; },
          message: widget.translate('stateRequiredText')
        }
      });
      // Define property validation for Address1
      widget.address1.extend({
        required: {
          params: true,
          message: widget.translate('addressRequiredText')
        },
        maxLength: {params: CCStoreConfiguration.ADDRESS_ADDRESS1_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_ADDRESS1_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_ADDRESS_MAXIMUM_LENGTH,
                    message: widget.translate('maxlengthValidationMsg',{maxLength:CCStoreConfiguration.ADDRESS_ADDRESS1_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_ADDRESS1_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_ADDRESS_MAXIMUM_LENGTH}) }
      });
      //Define property validation for Address2
      widget.address2.extend({ required: false,
        maxLength: {params: CCStoreConfiguration.ADDRESS_ADDRESS2_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_ADDRESS2_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_ADDRESS_MAXIMUM_LENGTH,
                    message: widget.translate('maxlengthValidationMsg',{maxLength:CCStoreConfiguration.ADDRESS_ADDRESS2_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_ADDRESS2_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_ADDRESS_MAXIMUM_LENGTH}) } });

      //Show address3 and county properties for agent application.
      //Define property validation for Address3
      widget.address3.extend({ required: false,
        maxLength: {params: CCStoreConfiguration.ADDRESS_ADDRESS3_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_ADDRESS3_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_ADDRESS_MAXIMUM_LENGTH,
                    message: widget.translate('maxlengthValidationMsg',{maxLength:CCStoreConfiguration.ADDRESS_ADDRESS3_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_ADDRESS3_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_ADDRESS_MAXIMUM_LENGTH}) } });

      //Define property validation for County
      widget.county.extend({ required: false,
        maxLength: {params: CCStoreConfiguration.ADDRESS_COUNTY_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_COUNTY_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_COUNTY_MAXIMUM_LENGTH,
                    message: widget.translate('maxlengthValidationMsg',{maxLength:CCStoreConfiguration.ADDRESS_COUNTY_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_COUNTY_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_COUNTY_MAXIMUM_LENGTH}) } });

      // Define property validation for City
      widget.city.extend({
        required: {
          params: true,
          message: widget.translate('cityRequiredText')
        },
        maxLength: {params: CCStoreConfiguration.ADDRESS_CITY_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_CITY_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_CITY_MAXIMUM_LENGTH,
                    message: widget.translate('maxlengthValidationMsg',{maxLength:CCStoreConfiguration.ADDRESS_CITY_MAXIMUM_LENGTH ? CCStoreConfiguration.ADDRESS_CITY_MAXIMUM_LENGTH : CCConstants.CYBERSOURCE_CITY_MAXIMUM_LENGTH}) }
      });
      // Define property validation for Postal Code
      widget.postalCode.extend({
    	  required: { params: true, message: widget.translate('postalCodeRequiredText') },
          maxLength: {params: CCConstants.CYBERSOURCE_POSTAL_CODE_MAXIMUM_LENGTH,
                               message: widget.translate('maxlengthValidationMsg',{fieldName: widget.translate('postalCodeNameText'),maxLength:CCConstants.CYBERSOURCE_POSTAL_CODE_MAXIMUM_LENGTH}) },
          observablePattern: { params: widget.postalCodePattern, onlyIf: function () { return (widget.postalCodePattern() != ''); }, message: widget.translate('postalCodeInvalid')}
      });
      
     widget.validationModel = ko.validatedObservable({
        country: widget.country(),
        state: widget.state(),
        address1: widget.address1(),
        address2: widget.address2(),
        address3: widget.address3(),
        county: widget.county(),
        city: widget.city(),
        postalCode: widget.postalCode(),
       /* phoneNumber: widget.phoneNumber,*/
        addressType: widget.addressType(),
        companyName: widget.companyName(),
        lastName: widget.lastName(),
        firstName: widget.firstName()
        
      });
      widget.countriesList(widget.shippingCountries());
      
      widget.homeRoute = widget.links().home.route;
      if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
        widget.homeRoute = widget.links().agentHome.route;
        widget.contextManager = require("agentViewModels/agent-context-manager").getInstance();
        $.Topic(pubsub.topicNames.PAGE_CHANGED).subscribe(widget.triggerPageChangeEvent.bind(widget));
      }
      /* widget.marketingMailsTextForSite = ko.pureComputed(function(){
      return CCi18n.t("ns.agentcustomerprofiledetails:resources.marketingMailsText" , {siteName : widget.accountAndSiteSelector.selectedSiteInfo().name});
      }, widget);*/
    },
    /*rahul added redirection part on 28/09*/
    redirectToStoreadd : function(){
    var widget = this;
    // Success Function
    var successFunction = function(pData) {
      var token = pData.access_token;
      var siteProductionUrl = widget.getSelectedSiteProductionUrl();
      if(!widget.isValidURL(siteProductionUrl)) {
        notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.productionURLMissingMessage'));
      } else {
        $("#shopperRedirectForm").attr('action', siteProductionUrl);
        $("#cc-shopper-behalf-token").val(token);
        var url = window.location.href;
        $("#cc-shopper-agent-redirect-url").val(url);
        $("#cc-shopper-organizationId-value").val(widget.contextManager.currentOrganizationId());
        $("#cc-shopper-priceListGroupId-value").val(widget.contextManager.getPriceListGroup());
        var form = $("#shopperRedirectForm")[0];
        form.submit();
      }
    };

    var failureFunction = function(pResult) {
      notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.customerTokenRetrievalErrorText'));
    };

    widget.user().getOnBehlafOfToken(successFunction, failureFunction);
  },

    getSelectedSiteProductionUrl : function () {
        //determine the production url for the selected site
        var widget = this;
        console.log(this.accountAndSiteSelector);
            var selectedSiteSiteInfo = this.accountAndSiteSelector.selectedSiteInfo();
            var redirectURL=selectedSiteSiteInfo.productionURL ? ("//"+selectedSiteSiteInfo.productionURL):
          selectedSiteSiteInfo.productionURL;
        return redirectURL +"/addressBook"
        
      },

    isValidURL: function(str) {
        if(str === null || str === "undefined" || str === "") {
          return null;
        }
        return str;
      },
   
    /*end*/
    
    /**
     * Initializes the dynamic properties
     */
    
    initializeDynamicProperties: function(pDynamicPropertyMetaCache, pData, isNewAddress) {
      var widget = this;
      widget.dynamicProperties.removeAll();
      var dynamicProperties = widget.dynamicPropertyMetaInfo.createDynamicProperties(pDynamicPropertyMetaCache, CCConstants.ADDRESS_TEXT);

      if(!isNewAddress){
        // We filter the dynamic properties only in case of editing an address to make sure
        //only readable fields (as per GDPR settings) are shown.
        var filteredDynamicProperties = [];
        for (var i = 0,k=0; i < dynamicProperties.length; i++) {
          if (pData.address && pData.address.hasOwnProperty(pDynamicPropertyMetaCache[i].id())) {
            filteredDynamicProperties[k] = dynamicProperties[i];
            k++;
          }
        }
        widget.dynamicProperties(filteredDynamicProperties);
      }
      else{
        widget.dynamicProperties(dynamicProperties);
      }
    },
    
    /**
     * Assign Value to dynamic Properties
     */
    assignValueToDynamicProperties: function(pProperty, pValue, isEnum) {
      var widget = this;
      for(var k = 0; k <  widget.dynamicProperties().length; k++) {
        if (widget.dynamicProperties()[k].id() === pProperty) {
          if(isEnum) {
            widget.dynamicProperties()[k].values.push(pValue);
          } else {
            widget.dynamicProperties()[k].value(pValue);
          }
        }
      }
    },
    
    /**
     * Clear Value For Dynamic Properties
     */
    clearDynamicProperties: function() {
      var widget = this;
      for (var i = 0; i < widget.dynamicProperties.length; i++) {
        widget.dynamicProperties[i].value(null);
        widget.dynamicProperties[i].values.removeAll();
      }
    },
    
    /**
     * This method populates address dynamic property meta data into
     * dynamic property meta container view model.
     *
     * @function
     * @name Address#populateDynamicPropertyMetaData
     */
    populateDynamicPropertiesMetaData: function() {
      var self = this;
      var params = {};
      params[CCConstants.PARENT] = CCConstants.ENDPOINT_CONTACT_INFO_TYPE;
      if (self.dynamicPropertyMetaInfo && self.dynamicPropertyMetaInfo.dynamicPropertyMetaCache &&
        !self.dynamicPropertyMetaInfo.dynamicPropertyMetaCache.hasOwnProperty(CCConstants.ENDPOINT_CONTACT_INFO_TYPE)) {

        CCRestClient.request(CCConstants.ENDPOINT_GET_ITEM_TYPE, params,
          //success callback
          function(dynamicPropData){
            self.dynamicPropertyMetaInfo.intializeDynamicProperties(dynamicPropData.specifications, CCConstants.ENDPOINT_CONTACT_INFO_TYPE);
          },
          //error callback
          function(dynamicPropData) {
          },
          CCConstants.ENDPOINT_CONTACT_INFO_TYPE);
      }
    },

    
    loadProfileAddresses: function(){
      //load profile addresses
      var widget = this;
      var url = CCConstants.END_POINT_LIST_PROFILE_ADDRESSES;
      var input = {};
      input[CCConstants.OFFSET] = widget.profileOffset();
      input[CCConstants.LIMIT] = widget.limit();
      // AgentApplication - If we are in agent application the user id is required for getting the list of profile address
      if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
        CCRestClient.request(url,input, widget.loadProfileAddressSuccess.bind(widget),widget.fetchAddressesFailure.bind(widget),widget.user().id());
      } else {
        CCRestClient.request(url,input, widget.loadProfileAddressSuccess.bind(widget),widget.fetchAddressesFailure.bind(widget));
      }
    },
    
    /**
     * AgentApplication
     * Success call back for displaying default address of B2C customers
     * @param pData Contains the details of the default addresses 
     */
    loadDefaultAddressesSuccess: function(pData) {
        var widget = this;
        if(pData.address){
          widget.addresses.removeAll();
          var fullDisplayNameOfcountryAndState = widget.fetchCountryandStateName(pData.address.country, pData.address.state);
          pData.address.displayCountryName = fullDisplayNameOfcountryAndState.country;
          pData.address.displayStateName = fullDisplayNameOfcountryAndState.state? fullDisplayNameOfcountryAndState.state : " ";
          pData.address.addressType = pData.addressType;
          widget.defaultShippingAddress(pData.address);
          widget.user().contactShippingAddress = pData.address;
          widget.defaultShippingAddressType(pData.addressType);
          widget.setDefaultAdresses();
          pData.address.isDefaultShippingAddress = true;
          widget.addresses().push(pData);
          widget.addresses.valueHasMutated();
        }
    },

    loadProfileAddressSuccess: function(data){
       var widget = this;
       if(data.items.length>0){
        data.items = data.items.sort(function(left, right) {
          if (left.address.lastName && right.address.lastName && (left.address.lastName.toLowerCase() == right.address.lastName.toLowerCase())) {
            return left.address.address1.toLowerCase() == right.address.address1.toLowerCase() ? 0
                  : (left.address.address1.toLowerCase() < right.address.address1.toLowerCase() ? -1 : 1);
          } else if (left.address.lastName && right.address.lastName && (left.address.lastName.toLowerCase() < right.address.lastName.toLowerCase())) {
            return -1;
          } else {
            return 1;
          }
        });
        widget.showProfileAddress(true);
        for(var iter = 0;iter <data.items.length; iter++){
          data.items[iter].isProfile = true;
          //AgentApplication - Added to display the complete state and country name instead of abbreviations
          var fullDisplayNameOfcountryAndState = widget.fetchCountryandStateName(data.items[iter].address.country, data.items[iter].address.state);
          data.items[iter].address.displayCountryName = fullDisplayNameOfcountryAndState.country;
          data.items[iter].address.displayStateName = fullDisplayNameOfcountryAndState.state? fullDisplayNameOfcountryAndState.state : " ";
          widget.profileAddresses().push(data.items[iter]);
        }
        widget.profileOffset(data.offset + data.items.length);
        widget.allAddresses.push(data.items);
        widget.profileAddresses.valueHasMutated();
        widget.totalProfileAddresses(data.total);
        if (widget.totalProfileAddresses() > widget.profileOffset()){
          widget.showLoadMorePAddress(true);            
        }else{
          widget.showLoadMorePAddress(false);
          widget.profileOffset(0);
        }
      }
       //AgentApplication - Added to display default shipping address for B2C customers
       if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT && !widget.user().isB2BUser()) {
         var addressRepositoryId = null;
         if (widget.user().contactShippingAddress) {
           addressRepositoryId = widget.user().contactShippingAddress.repositoryId;
         } else if(widget.user().contactBillingAddress) {
           addressRepositoryId = widget.user().contactBillingAddress.repositoryId;
         } else if(data.items.length > 0 && !addressRepositoryId) {
           widget.setDefaultShippingAddress(data.items[0]);
           widget.loadDefaultAddressesSuccess(data.items[0]);
         }
         if (addressRepositoryId) {
           var data = {};
           var url2 = CCConstants.END_POINT_GET_PROFILE_ADDRESS;
           CCRestClient.request(url2, data, widget.loadDefaultAddressesSuccess.bind(widget), widget.fetchAddressesFailure.bind(widget), widget.user().id(), addressRepositoryId);
         }
       }
    },
    
    loadInheritedAddresses: function () {
        var widget=this;
        widget.showInherited(false);
        var url= CCConstants.END_POINT_LIST_ADDRESSES;
        var input = {};
        input["orgId"]=(CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT)? widget.organizationFilter() : widget.user().currentOrganization().repositoryId;
        input["include"]=CCConstants.END_POINT_INHERITED_ADDRESSES;
        input["offset"] = widget.offset();
        input["limit"] = widget.limit();
        CCRestClient.request(url, input, widget.loadInheritedAddressSuccess.bind(widget), widget.fetchAddressesFailure.bind(widget));
      },
      
      loadInheritedAddressSuccess: function(data){
        var widget = this;
        if(data.derivedShippingAddressType){
          widget.defaultShippingAddressType(data.derivedShippingAddressType);
        }
        if(data.derivedBillingAddressType){
          widget.defaultBillingAddressType(data.derivedBillingAddressType);
        }
        if(data.items.length>0){
          widget.showInherited(true);
          for(var iter = 0;iter <data.items.length; iter++){
            data.items[iter].isInherited = true;
            var fullDisplayNameOfcountryAndState = widget.fetchCountryandStateName(data.items[iter].address.country, data.items[iter].address.state);
            data.items[iter].address.displayCountryName = fullDisplayNameOfcountryAndState.country;
            data.items[iter].address.displayStateName = fullDisplayNameOfcountryAndState.state? fullDisplayNameOfcountryAndState.state : " ";
            widget.inheritedAddresses().push(data.items[iter]);
          }
          widget.offset(data.offset + data.items.length);
          widget.allAddresses.push(data.items);
         // widget.setDefaultAdresses();
          widget.inheritedAddresses.valueHasMutated();
          widget.totalInheritedAddresses(data.total);
          if (widget.totalInheritedAddresses() > widget.offset()){
            widget.showLoadMore(true);
            
          }
          else{
            widget.showLoadMore(false);
            widget.offset(0);
          }
        }
      },
   
   loadAddresses: function(){
     var widget = this;
     widget.opDynamicProperty("view");
     widget.allAddresses.removeAll();
     widget.inheritedAddresses.removeAll();
     widget.profileAddresses.removeAll();
     widget.addresses.removeAll();
     widget.offset(0);
     widget.secondaryAddresses.removeAll();     
     widget.profileOffset(0);
     widget.accountOffset(0);
     if ((CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT)) {
      if (!widget.user().isB2BUser() || widget.organizationFilter() !== null) {
        widget.loadProfileAddresses();
	    //AgentApplication - Load organization dependent addresses for B2B customer
	    if (widget.user().isB2BUser()) {
	      widget.loadInheritedAddresses();
	      widget.loadOrganizationAddresses();
        } 
      }
     } else {
       widget.loadProfileAddresses();
       widget.loadInheritedAddresses();
       widget.loadOrganizationAddresses();
     }
     
   },
   
    
    /**
     * Called:
     * 1] when the widget is loaded
     * 2] Any address related to the organization is updated or created and the user moves back to the address listing page
     */
    loadOrganizationAddresses: function() {
      var widget = this;
      var data,input = {};       
      var url = CCConstants.END_POINT_GET_ADDRESSES;
      var url2= CCConstants.END_POINT_LIST_ADDRESSES;
      var orgId =(CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT)? widget.organizationFilter() : widget.user().currentOrganization().repositoryId;
      
      input["orgId"]=orgId;
      input[CCConstants.OFFSET] = widget.accountOffset();
      input[CCConstants.LIMIT] = widget.limit();
      var index=0;
      CCRestClient.request(url, input, widget.fetchAddressesSuccess.bind(widget), widget.fetchAddressesFailure.bind(widget));
      CCRestClient.request(url2, input, widget.loadOrganizationAddressesSuccess.bind(widget),widget.fetchAddressesFailure.bind(widget));
    },
    
    loadOrganizationAddressesSuccess: function(data){
      var widget = this;
      if(data.derivedShippingAddressType){
        widget.defaultShippingAddressType(data.derivedShippingAddressType);
      }
      if(data.derivedBillingAddressType){
        widget.defaultBillingAddressType(data.derivedBillingAddressType);
      }
        //widget.secondaryAddresses.push(data.items);
        if (!(CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT))  {
          for (var iter = 0;iter <data.items.length; iter++){
            data.items[iter].isInherited = false;
          }
          widget.allAddresses.push(data.items);
           widget.secondaryAddresses(widget.secondaryAddresses().concat(data.items));
        } else {
          if (widget.secondaryAddresses().length === 0) {
            if(data.items.length>0){
              for(var iter = 0;iter <data.items.length; iter++){
                data.items[iter].isInherited = false;
                var fullDisplayNameOfcountryAndState = widget.fetchCountryandStateName(data.items[iter].address.country, data.items[iter].address.state);
                data.items[iter].address.displayCountryName = fullDisplayNameOfcountryAndState.country;
                data.items[iter].address.displayStateName = fullDisplayNameOfcountryAndState.state? fullDisplayNameOfcountryAndState.state : " ";
            }
            widget.allAddresses.push(data.items);
            widget.secondaryAddresses(widget.secondaryAddresses().concat(data.items));
          }
        }
      }
        //widget.setDefaultAdresses();  
        widget.accountOffset(data.offset + data.items.length);
        widget.totalAccountAddresses(data.total);
        if (widget.totalAccountAddresses() > widget.accountOffset()){
          widget.showLoadMoreAccountAddress(true);              
      } else {
          widget.showLoadMoreAccountAddress(false);
          widget.accountOffset(0);
      }
    },
    /**
     * Success Call back function for a fetching organization addresses:
     * @pResponse {Response from the server}
     * @type {function}
     */
     fetchAddressesSuccess: function(pResponse) {
       var widget = this;
       var fullDisplayNameOfcountryAndState = null;
       if (widget.user().isB2BUser() && pResponse.billingAddress){
         fullDisplayNameOfcountryAndState = widget.fetchCountryandStateName(pResponse.billingAddress.country, pResponse.billingAddress.state);
         pResponse.billingAddress.displayCountryName = fullDisplayNameOfcountryAndState.country;
         pResponse.billingAddress.displayStateName = fullDisplayNameOfcountryAndState.state? fullDisplayNameOfcountryAndState.state : " ";
         widget.defaultBillingAddress(pResponse.billingAddress);
       } else {
         widget.defaultBillingAddress(null);
       }
       // AgentApplication - adding dynamic properties to secondary addresses
       if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT && pResponse.secondaryAddresses.length > 0) {
         for(var iter = 0;iter <pResponse.secondaryAddresses.length; iter++){
          pResponse.secondaryAddresses[iter].isInherited = false;
          var fullDisplayNameOfcountryAndState = widget.fetchCountryandStateName(pResponse.secondaryAddresses[iter].address.country, pResponse.secondaryAddresses[iter].address.state);
          pResponse.secondaryAddresses[iter].address.displayCountryName = fullDisplayNameOfcountryAndState.country;
          pResponse.secondaryAddresses[iter].address.displayStateName = fullDisplayNameOfcountryAndState.state? fullDisplayNameOfcountryAndState.state : " ";
        }
        //For adding dynamic properties to address object
        widget.secondaryAddresses([]);
        widget.secondaryAddresses(widget.secondaryAddresses().concat(pResponse.secondaryAddresses));
       } 
       if(widget.defaultBillingAddress() && widget.defaultBillingAddress().repositoryId){
         CCRestClient.request(CCConstants.END_POINT_GET_ADDRESS,null,
           function(data){
             var fullDisplayNameOfcountryAndState = widget.fetchCountryandStateName(data.address.country, data.address.state);
             data.address.displayCountryName = fullDisplayNameOfcountryAndState.country;
             data.address.displayStateName = fullDisplayNameOfcountryAndState.state? fullDisplayNameOfcountryAndState.state : " ";
             if(data.address.isInherited){
               data["isInherited"]=true;
             }else{
               data["isInherited"]=false; 
             } 
             if(widget.addresses().length<2)
             {
               data.address.isDefaultBillingAddress = true;
               widget.addresses.push(data);  
               widget.addresses.valueHasMutated();
               widget.checkSameDefaultAddress();
             }             
           }, function(){}, 
           widget.defaultBillingAddress().repositoryId);      
       }
       if(widget.user().isB2BUser() && pResponse.shippingAddress) {
         var fullDisplayNameOfcountryAndState = widget.fetchCountryandStateName(pResponse.shippingAddress.country, pResponse.shippingAddress.state);
         pResponse.shippingAddress.displayCountryName = fullDisplayNameOfcountryAndState.country;
         pResponse.shippingAddress.displayStateName = fullDisplayNameOfcountryAndState.state? fullDisplayNameOfcountryAndState.state : " ";
         widget.defaultShippingAddress(pResponse.shippingAddress);
       } else {
         widget.defaultShippingAddress(null);
       }
       if(widget.defaultShippingAddress() && widget.defaultShippingAddress().repositoryId)
       {
         CCRestClient.request(CCConstants.END_POINT_GET_ADDRESS,null,  
           function(data){
             var fullDisplayNameOfcountryAndState = widget.fetchCountryandStateName(data.address.country, data.address.state);
             data.address.displayCountryName = fullDisplayNameOfcountryAndState.country;
             data.address.displayStateName = fullDisplayNameOfcountryAndState.state ? fullDisplayNameOfcountryAndState.state : " ";
             if(data.address.isInherited){
               data["isInherited"]=true;
             }else{
               data["isInherited"]=false; 
             }
             if(widget.addresses().length<2)
             {
               data.address.isDefaultShippingAddress = true;
               widget.user().primaryShippingAddress(data.address);
               widget.addresses.push(data);
               widget.addresses.valueHasMutated();
               widget.checkSameDefaultAddress();
             }
           }, 
           function(){}, 
           widget.defaultShippingAddress().repositoryId); 
       }
       widget.replaceAllAddress2NullStringWithNull(pResponse.secondaryAddresses);
       widget.setDefaultAdresses();
     },
     
     checkSameDefaultAddress: function(){
       var widget = this;
       if(widget.addresses().length===2){
         if(widget.addresses()[0].address.repositoryId === widget.addresses()[1].address.repositoryId){
           widget.addresses.pop();
         }
       }
     },
    
    /**
     * @pError {Response from the server}
     * @type {function}
     */
    fetchAddressesFailure: function(pError) {
      var widget = this;
      notifier.clearError(widget.WIDGET_ID);
      notifier.clearSuccess(widget.WIDGET_ID);
      if (pError.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
          widget.user().handleSessionExpired();
          if (navigation.isPathEqualTo(widget.links().profile.route) || navigation.isPathEqualTo(widget.links().accountAddresses.route)) {
              navigation.doLogin(navigation.getPath(), widget.homeRoute);
          }
      }
      else {
        notifier.sendError(widget.WIDGET_ID, pError.message, true);
      }
    },
    
     /**
     * Set default addresses after fetching all organization addresses:
     * @type {function}
     */
    setDefaultAdresses: function() {
      var widget = this;
      var shippingAddress = {};
      var billingAddress ={};
      var shippingData=false;
      var billingData=false;
      widget.addresses.removeAll();
      if(!(widget.defaultShippingAddress() instanceof Array) && widget.defaultShippingAddressType() && widget.defaultShippingAddress()){
        shippingAddress["address"]=widget.defaultShippingAddress();
        shippingAddress["addressType"]=widget.defaultShippingAddressType();
        if(widget.secondaryAddresses().length >0){
           for(var i = 0; i < widget.secondaryAddresses().length; i++) {
              if(widget.defaultShippingAddress() && widget.defaultShippingAddress().repositoryId === widget.secondaryAddresses()[i].address.repositoryId ){
                 shippingData=true;
              }
           }
        }
      }
      if(!(widget.defaultBillingAddress() instanceof Array) && widget.defaultBillingAddressType() && widget.defaultBillingAddress()){
        billingAddress["address"]=widget.defaultBillingAddress();
        billingAddress["addressType"]=widget.defaultBillingAddressType();
        if(widget.secondaryAddresses().length >0){
          for (var i = 0; i < widget.secondaryAddresses().length; i++) {
             if(widget.defaultBillingAddress() && widget.defaultBillingAddress().repositoryId === widget.secondaryAddresses()[i].address.repositoryId ){
               billingData=true;
             }
          }  
        }
      }        
     },
    
    /**
     * Invoked when user clicks on the edit or new button:
     * @isNewAddress Boolean to specify whether the mode is create/edit
     * @data Address reference in case of edit mode
     */
    handleCreateOrEditOrganizationAddress: function(isNewAddress, data) {
      var widget = this;
      //console.log(widget.dynamicPropertyMetaInfo.dynamicPropertyMetaCache.contactInfo);
      widget.resetAddressData();
      if (widget.user().active()) {
        widget.opDynamicProperty("update");
      } else {
        widget.opDynamicProperty("view");
      }
      widget.subscribeForChanges();
      
      if(!isNewAddress) {
        widget.isProfileAddress(data.isProfile);
        widget.addressType(data.addressType);
        widget.address1(data.address.address1);
        widget.address2(data.address.address2);
        widget.address3(data.address.address3);
        widget.county(data.address.county);
        widget.city(data.address.city);
        widget.country(data.address.country);
        // AgentApplication - For B2C user company name is not required
        if (widget.user().isB2BUser()) {
          widget.companyName(data.address.companyName);
        }
        widget.state(data.address.state);
        widget.postalCode(data.address.postalCode);
        /*widget.phoneNumber(data.address.phoneNumber);*/
        widget.firstName(data.address.firstName);
        widget.lastName(data.address.lastName);
        widget.isDefaultShippingAddress(data.address.isDefaultShippingAddress);
        if (widget.defaultBillingAddress() !== null && data.address.repositoryId === widget.defaultBillingAddress().repositoryId) {
          widget.isDefaultBillingAddress(true);
        }
        if (widget.defaultShippingAddress() !== null && data.address.repositoryId === widget.defaultShippingAddress().repositoryId) {
          widget.isDefaultShippingAddress(true);
        }
        widget.editingAddressId(data.address.repositoryId);
        widget.isCreateNewAddress(false);
        //AgentApplication
        if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
          var dynamicPropertyMetaCache = widget.dynamicPropertyMetaInfo.dynamicPropertyMetaCache[CCConstants.ENDPOINT_CONTACT_INFO_TYPE];
          if (dynamicPropertyMetaCache && dynamicPropertyMetaCache.length > 0){
            widget.initializeDynamicProperties(dynamicPropertyMetaCache, data, isNewAddress);
            var value = null;
            for (var i = 0; i < dynamicPropertyMetaCache.length; i++) {
               if (data.address[dynamicPropertyMetaCache[i].id()] && data.address[dynamicPropertyMetaCache[i].id()] !== undefined) {
                 if (dynamicPropertyMetaCache[i].type() === "enum") {
                   for (var j = 0; j < data.address[dynamicPropertyMetaCache[i].id()].length; j++) {
                      value = data.address[dynamicPropertyMetaCache[i].id()][j]
                      widget.dynamicPropertyMetaInfo.dynamicPropertyMetaCache[CCConstants.ENDPOINT_CONTACT_INFO_TYPE][i].values.push(value);
                      widget.assignValueToDynamicProperties(dynamicPropertyMetaCache[i].id(), value, true);
                   }
                 } else {
                   value  = data.address[dynamicPropertyMetaCache[i].id()];
                   widget.assignValueToDynamicProperties(dynamicPropertyMetaCache[i].id(), value, false);
                   widget.dynamicPropertyMetaInfo.dynamicPropertyMetaCache[CCConstants.ENDPOINT_CONTACT_INFO_TYPE][i].value(value);
                 }
               }
            }
          }
        } 
      } else {
        if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
          var dynamicPropertyMetaCache = widget.dynamicPropertyMetaInfo.dynamicPropertyMetaCache[CCConstants.ENDPOINT_CONTACT_INFO_TYPE];
          if (dynamicPropertyMetaCache && dynamicPropertyMetaCache.length > 0){
            widget.initializeDynamicProperties(dynamicPropertyMetaCache, data, isNewAddress);
            
          }
        }
        if(widget.user().isProfileAddressManager() && !(widget.user().isAccountAddressManager() || widget.user().isDelegatedAdmin())){
          widget.isProfileAddress(true);
           
        }
         /*if (widget.user().isB2BUser()) {
          widget.companyName(widget.companyName);
        }*/
        
        widget.isCreateNewAddress(true);
      }
      widget.isEditMode(true);
      widget.isDirty(false);
    },
    
    /**
     * Invoked when user clicks on  button to save the changes to the server:
     */
    handleUpdateOrganizationAddress: function(elementId) {
      var widget = this;
      /*rahul*/
     console.log(widget.dynamicProperties());
//     var updateDDetails =widget.dynamicProperties();
//     for(var i = 0; i<updateDDetails.length;i++){
//         if(updateDDetails[i].id()=="special_delivery_instructions"){
//         updateDDetails[i].value(widget.dyProp_SpecialdeliveryIn());
//     }else if(updateDDetails[i].id()=="INDE_INPU"){
//         updateDDetails[i].value(widget.dyProp_Insidepickupdlr());
//     }else if(updateDDetails[i].id()=="LIFT_GATE"){
//         updateDDetails[i].value(widget.dyProp_LiftGate());
//     }else if(updateDDetails[i].id()=="RESI_PU_DEL"){
//         updateDDetails[i].value(widget.dyProp_ResidentialPickup()); 
//     }else if(updateDDetails[i].id()=="LAPU_LADL"){

//         updateDDetails[i].value(widget.dyProp_LimitedAcc());   

//     }else if(updateDDetails[i].id()=="x_main_contact"){

//         updateDDetails[i].value(widget.dyProp_Maincontact());  
//     }
//     else if(updateDDetails[i].id()=="x_billing_contact"){
//         updateDDetails[i].value(widget.dyProp_billingContact()); 
//     }
//     else if(updateDDetails[i].id()=="x_shipping_contact"){
//         updateDDetails[i].value(widget.dyProp_ShippingContact()); 
//     }
//     else if(updateDDetails[i].id()=="Address_Status"){
//         updateDDetails[i].value(widget.dyProp_AddressStatus());
//     }
//  }
      if(((widget.isCreateNewAddress() && elementId==="organization-address-save-create-new") || 
          (elementId==="organization-address-update" && (widget.isProfileAddress() || !(widget.user().isAccountAddressManager() || widget.user().isDelegatedAdmin()))) || 
          elementId==="organization-address-save-copy" || elementId==="profile-address-create") && 
          widget.user().isProfileAddressManager()|| (elementId==="organization-address-save-create-new" && widget.isProfileAddress() && widget.user().isProfileAddressManager()&& !(widget.user().isAccountAddressManager() || widget.user().isDelegatedAdmin()) )){
         console.log("create New address")
        widget.isGettingSavedToProfile(true);
        widget.isGettingSavedToAccount(false);
      }else{
       //AgentApplication - For B2C customers not required
       console.log("create else address")
        if (widget.user().isB2BUser()) {
          widget.isGettingSavedToAccount(true);
          widget.isGettingSavedToProfile(false);
          
        }
      }      
      console.log("widget.validationModel.isValid()",widget.validationModel.isValid())
      if (widget.validationModel.isValid()) {
          console.log("validationModel")
        //var isCurrentAddressDuplicate = widget.isDuplicateNickname();
        if(((widget.isCreateNewAddress() && elementId==="organization-address-save-create-new") || elementId==="organization-address-save-copy" || elementId==="account-address-create") && (widget.user().isAccountAddressManager() || widget.user().isDelegatedAdmin())) {
          widget.createNewOrganizationAddress(widget.convertToData());
        }else if(((widget.isCreateNewAddress() && elementId==="organization-address-save-create-new") || elementId==="organization-address-save-copy" || elementId==="profile-address-create") && widget.user().isProfileAddressManager()) {          
          widget.createNewProfileAddress(widget.convertToData());
        }else if ( widget.isCreateNewAddress() && !widget.user().isB2BUser()) {
          widget.createNewProfileAddress(widget.convertToData());
        }else if((elementId==="organization-address-update" || elementId==="organization-address-save-create-new") && widget.isProfileAddress()) {
          widget.updateProfileAddress(widget.convertToData(), widget.editingAddressId());
        }else {
            if((elementId==="organization-address-update" || elementId==="organization-address-save-create-new") && !widget.isProfileAddress()) {
             // AgentApplication - For B2C user update the profile address
              if (!widget.user().isB2BUser()) {
                  //nickName is not mand
                widget.updateProfileAddress(widget.convertToData(), widget.editingAddressId());
              } else {
                  //nickName is mand
                 widget.updateOrganizationAddress(widget.convertToData(), widget.editingAddressId());
              }
            } 
        }
      } else {
        widget.validationModel.errors.showAllMessages();
      }
    },
    
    /**
     * Method which handles the object to be constructed and passed to the server:
     * @pData Address reference
     * @pEditingAddressId Id of address to be updated
     */
    updateOrganizationAddress: function(pData, pEditingAddressId) {
      var widget = this;
      /* var svd =  widget.dynamicProperties();
      console.log(svd);
      for(var i = 0; i<svd.length;i++){
              if(svd[i].id() == "x_main_contact"){
              svd[i].value(dyProp_Maincontact());
        }
             }*/
      widget.updateAddress(pData, pEditingAddressId);
    },
    
    /**
     * Method to POST the organization address data to the server:
     * @pData Address reference
     */
    createNewOrganizationAddress: function(pData) {
      var widget = this;
      widget.operationPerformedOnAddresses("created");
      CCRestClient.request(CCConstants.END_POINT_ADD_ADDRESSES, pData, widget.createOrUpdateSuccess.bind(widget), widget.saveFailure.bind(widget));
    },
    
    createNewProfileAddress: function(pData) {
      var widget = this;
      widget.operationPerformedOnAddresses("created");
      //AgentApplication - User id required in agent application
      if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
        CCRestClient.request(CCConstants.END_POINT_ADD_PROFILE_ADDRESS, pData, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget), widget.user().id());
      } else {
        CCRestClient.request(CCConstants.END_POINT_ADD_PROFILE_ADDRESS, pData, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget));
      }
    },
    
    /**
     * Method to update the organization address data in the server:
     * @pData Address reference
     * @pEditingAddressId Id of address to be updated
     */
     
    updateAddress: function(pData, pEditingAddressId) {
      var widget = this;
      widget.operationPerformedOnAddresses("updated");
        /* */
      CCRestClient.request(CCConstants.END_POINT_UPDATE_ADDRESSES, pData, widget.createOrUpdateSuccess.bind(widget), widget.saveFailure.bind(widget), pEditingAddressId);
       
    },
    
    updateProfileAddress: function(pData, pEditingAddressId) {
      var widget = this;
     
      widget.operationPerformedOnAddresses("updated");
      //AgentApplication - User id required in agent application
      if ((CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT)) {
        CCRestClient.request(CCConstants.END_POINT_UPDATE_PROFILE_ADDRESS, pData, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget), widget.user().id(),pEditingAddressId);
      } else {
        CCRestClient.request(CCConstants.END_POINT_UPDATE_PROFILE_ADDRESS, pData, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget), pEditingAddressId);
      }
    },
    
    /**
     * Success Call back function for creating or updating profile addresses:
     * @pResponse {Response from the server}
     * @type {function}
     */
    profileCreateOrUpdateSuccess: function(pResponse) {
      var widget = this;
      if (widget.isDefaultShippingAddress()) {
        widget.user().contactShippingAddress = pResponse.address;
        widget.user().primaryShippingAddress(pResponse.address);
      }
      widget.isEditMode(false);
      widget.isGettingSavedToProfile(false);
      widget.isGettingSavedToAccount(false);
      widget.isProfileAddress(false);
      notifier.clearError(widget.WIDGET_ID);
      notifier.clearSuccess(widget.WIDGET_ID);
      if ((CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT)) {
        if(widget.operationPerformedOnAddresses() === "created") {
          notifier.sendSuccess(widget.WIDGET_ID, this.translate("agentProfileAddressCreateOperation"), true);
        } else if(widget.operationPerformedOnAddresses() === "updated") {
          notifier.sendSuccess(widget.WIDGET_ID, this.translate("agentProfileAddressUpdateOperation"), true);
        } else {
          notifier.sendSuccess(widget.WIDGET_ID, this.translate("agentProfileAddressDeleteOperation"), true);
        } 
      } else {
        notifier.sendSuccess(widget.WIDGET_ID, this.translate("profileAddressUpdateSuccessText"), true);
      }
      widget.operationPerformedOnAddresses(null);
      widget.resetAddressData();
      widget.loadAddresses();
      //widget.setDefaultAdresses();
    },
        
    /**
     * Success Call back function for creating or updating organization addresses:
     * @pResponse {Response from the server}
     * @type {function}
     */
    createOrUpdateSuccess: function(pResponse) {
      var widget = this;
      widget.isEditMode(false);
      widget.isGettingSavedToProfile(false);
      widget.isGettingSavedToAccount(false);
      widget.isProfileAddress(false);
      notifier.clearError(widget.WIDGET_ID);
      notifier.clearSuccess(widget.WIDGET_ID);
      if ((CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT)) {
        if(widget.operationPerformedOnAddresses() === "created") {
         notifier.sendSuccess(widget.WIDGET_ID, this.translate("agentOrganizationAddressCreateOperation"), true);
       } else if(widget.operationPerformedOnAddresses() === "updated") {
         notifier.sendSuccess(widget.WIDGET_ID, this.translate("agentOrganizationAddressUpdateOperation"), true);
       } else {
         notifier.sendSuccess(widget.WIDGET_ID, this.translate("agentOrganizationAddressDeleteOperation"), true);
       } 
      } else {
        notifier.sendSuccess(widget.WIDGET_ID, this.translate("organizationAddressUpdateSuccessText"), true);
      }
      widget.operationPerformedOnAddresses(null);
      widget.resetAddressData();
      widget.loadAddresses();
      //widget.setDefaultAdresses();
    },
    
    /**
     * Failure Call back function for creating or updating profile addresses:
     * @pResponse {Response from the server}
     * @type {function}
     */
    profileAddressSaveFailure: function(pError) {
      var widget = this;
      notifier.clearError(widget.WIDGET_ID);
      notifier.clearSuccess(widget.WIDGET_ID);
      if (pError.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
          widget.user().handleSessionExpired();
          if (navigation.isPathEqualTo(widget.links().profile.route) || navigation.isPathEqualTo(widget.links().accountAddresses.route)) {
            navigation.doLogin(navigation.getPath(), widget.homeRoute);
          }
      }
      else {
        notifier.sendError(widget.WIDGET_ID, pError.message ? pError.message : this.translate("organizationAddressUpdateFailureText"), true);
      }
    },
    
    /**
     * Failure Call back function for creating or updating organization addresses:
     * @pResponse {Response from the server}
     * @type {function}
     */
    saveFailure: function(pError) {
      var widget = this;
      notifier.clearError(widget.WIDGET_ID);
      notifier.clearSuccess(widget.WIDGET_ID);
      if (pError.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
          widget.user().handleSessionExpired();
          if (navigation.isPathEqualTo(widget.links().profile.route) || navigation.isPathEqualTo(widget.links().accountAddresses.route)) {
            navigation.doLogin(navigation.getPath(), widget.homeRoute);
          }
      }
      else {
        notifier.sendError(widget.WIDGET_ID, pError.message ? pError.message : this.translate("organizationAddressUpdateFailureText"), true);
      }
    },
    
    /**
     * Invoked when the user clicks on the credit card icon in the address listing page for a particular address:
     * @pData {Address reference}
     * @type {function}
     */
    setDefaultBillingAddress: function(pData) {
      var widget = this;
      var updateData = {};
      if(widget.defaultBillingAddress() && widget.defaultBillingAddress().repositoryId === pData.address.repositoryId){
          updateData[CCConstants.ORG_IS_DEFAULT_BILLING_ADDRESS] = false;
          widget.defaultBillingAddress(null);
      }
      else{
       updateData[CCConstants.ORG_IS_DEFAULT_BILLING_ADDRESS] = true;
      }
      var address = {};
      address[CCConstants.ORG_ADDRESS] = updateData;
      address[CCConstants.ORG_ADDRESS_TYPE] = pData.addressType;
      widget.user().contactBillingAddress = pData.address;
      widget.updateAddress(address, pData.address.repositoryId);
    },

    /**
     * Invoked when the user clicks on the shipping icon in the address listing page for a particular address:
     * @pData {Address reference}
     * @type {function}
     */
    setDefaultShippingAddress: function(pData) {
      var widget = this;
      var updateData = {};
      if(widget.defaultShippingAddress() && widget.defaultShippingAddress().repositoryId===pData.address.repositoryId){
    	  updateData[CCConstants.ORG_IS_DEFAULT_SHIPPING_ADDRESS] = false;
    	  widget.defaultShippingAddress(null);
      }
      else{
    	updateData[CCConstants.ORG_IS_DEFAULT_SHIPPING_ADDRESS] = true;
      }
      var address = {};
      address[CCConstants.ORG_ADDRESS] = updateData;
      address[CCConstants.ORG_ADDRESS_TYPE] = pData.addressType;
      widget.user().contactShippingAddress = pData.address;
      if (widget.user().isB2BUser()) {
        widget.updateAddress(address, pData.address.repositoryId);
      } else {
        //For B2C User update the flag and create the address object
        widget.isDefaultShippingAddress(true);
        widget.loadWidgetValues(pData);
        widget.updateProfileAddress(widget.convertToData(), pData.address.repositoryId);
      }
    },
    /**
     * Method to load widget address value when
     * setting an address as default shipping address for B2C user
     */
    loadWidgetValues: function(pData) {
      var widget = this;
      widget.addressType(pData.addressType);
      widget.address1(pData.address.address1);
      widget.address2(pData.address.address2);
      widget.address3(pData.address.address3);
      widget.county(pData.address.county);
      widget.country(pData.address.country);
      for (var i = 0; i < widget.countriesList().length; i++) {
        if (widget.countriesList()[i].countryCode === widget.country()) {
          widget.stateList(widget.countriesList()[i].regions);
          break;
        }
      }
      widget.state(pData.address.state);
      widget.firstName(pData.address.firstName);
      widget.lastName(pData.address.lastName);
      widget.companyName(pData.address.companyName);
      widget.city(pData.address.city);
      widget.postalCode(pData.address.postalCode);
     /* widget.phoneNumber(pData.address.phoneNumber);*/
    },

    /**
     * Invoked when the user clicks on the delete icon in the address listing page for a particular address:
     * @pData {Address reference}
     * @type {function}
     */
    removeOrganizationAddress: function(pData, elementId, pParent) {
      var widget = this; 
      widget.deleteButtonId = elementId;
      widget.addressToBeDeleted = pData;
      widget.editingAddressId(pData.repositoryId);
      if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
        $("#CC-accountAddress-delete-modal-1").modal('show');
        $('body').addClass('modal-open');
      } else {
        var data = {};
        if(elementId.indexOf("CC-customerProfile-remove-addr-btn-")===0){
          CCRestClient.request(CCConstants.END_POINT_DELETE_PROFILE_ADDRESS, data, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget), widget.editingAddressId());
        }else if (elementId.indexOf("CC-account-remove-addr-btn")===0){
          CCRestClient.request(CCConstants.END_POINT_DELETE_ADDRESSES, data, widget.createOrUpdateSuccess.bind(widget), widget.saveFailure.bind(widget), widget.editingAddressId());
        }
      }
      
    },
    
    /**
     * Method that is invoked on clicking the yes button in delete confirmation dialog
     * @param pData
     * @param elementId
     * @param pParent
     */
    continueDeleteOperation: function(pData, elementId, pParent) {
     $("#CC-accountAddress-delete-modal-1").modal('hide');
     setTimeout(function() {
       $('body').removeClass('modal-open');
       $('.modal-backdrop').remove();
     },300);
     if (elementId) {
       var widget = this;
       if (widget.user().contactShippingAddress && widget.user().contactShippingAddress.repositoryId === pData.repositoryId) {
          widget.user().contactShippingAddress = null;
       }
       if (widget.user().isB2BUser() && widget.user().contactBillingAddress && 
         widget.user().contactBillingAddress.repositoryId === pData.repositoryId) {
         widget.user().contactBillingAddress = null;
       }
       widget.editingAddressId(pData.repositoryId);
       widget.operationPerformedOnAddresses("deleted");
       var data = {};
       if (elementId.indexOf("CC-customerProfile-remove-addr-btn-") === 0 || elementId.indexOf("CC-B2CcustomerProfile-remove-addr-btn-") === 0){
         // AgentApplication - User id required in agent application
         if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
           CCRestClient.request(CCConstants.END_POINT_DELETE_PROFILE_ADDRESS, data, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget), widget.user().id(), widget.editingAddressId());
         } else {
           CCRestClient.request(CCConstants.END_POINT_DELETE_PROFILE_ADDRESS, data, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget), widget.editingAddressId()); 
         }
       } else if (elementId.indexOf("CC-account-remove-addr-btn") === 0){
         CCRestClient.request(CCConstants.END_POINT_DELETE_ADDRESSES, data, widget.createOrUpdateSuccess.bind(widget), widget.saveFailure.bind(widget), widget.editingAddressId());
       }
     }
    },
    
    /**
     * Invoked when the user clicks on the cancel button while either viewing the address or editing the address:
     * @pData {Address reference}
     * @type {function}
     */
    handleCancelUpdateOrganizationAddress: function() {
      var widget = this;
      widget.isProfileAddress(false); 
      widget.isGettingSavedToProfile(false);
      widget.isGettingSavedToAccount(false);
      widget.redirectToAccountAddressesListingPage(true);
    },

    /**
     * Helper function when the user clicks on "No" button on the cancel modal:
     */
    redirectToAccountAddressesListingPage: function(isServiceCallNeeded) {
      var widget = this;
      widget.user().isSearchInitiatedWithUnsavedChanges(false);
      if(widget.interceptedLink != null && widget.interceptedLink != undefined && widget.interceptedLink != "" && !navigation.isPathEqualTo(widget.interceptedLink)) {
        navigation.goTo(widget.interceptedLink);
      }
      else {
        widget.isEditMode(false);
      }
      widget.isDirty(false);
      $("#cc-cancel-account-addresses-ModalContainer").modal('hide');
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
      notifier.clearError(widget.WIDGET_ID);
      widget.resetAddressData();
    },
    
    /**
     * Subscription function called for performing validations when any value in the subscription list is changed by the user:
     * @type {function}
     */
    subscribeForChanges: function() {
      var widget = this;
      widget.subscriptionArray.push(widget.addressType.subscribe(function(newValue) {
        widget.isDirty(true);
      }));
      widget.subscriptionArray.push(widget.address1.subscribe(function(newValue) {
          widget.isDirty(true);
      }));
      widget.subscriptionArray.push(widget.address2.subscribe(function(newValue) {
        widget.isDirty(true);
      }));
      widget.subscriptionArray.push(widget.address3.subscribe(function(newValue) {
        widget.isDirty(true);
      }));
      widget.subscriptionArray.push(widget.county.subscribe(function(newValue) {
        widget.isDirty(true);
      }));
      widget.subscriptionArray.push(widget.country.subscribe(function(newValue) {
          if (!widget.country()) {
              widget.state(null);
            widget.postalCodePattern('');
          } else {
            for (var i=0; i<widget.countriesList().length; i++) {
              if (widget.countriesList()[i].countryCode == widget.country()) {
                widget.country(widget.countriesList()[i].countryCode);
              }
            }
          }
          // reset state if one has been selected
          if ((widget.state() !== undefined) && 
             (widget.state() !== '')) {
            // needs to be null rather than empty string
            // or knockout resets to dropdown value
            widget.state(null);
          }
          
          // Update State List
          widget.stateList([]);
          for (var i=0; i<widget.countriesList().length; i++) {
            if (widget.countriesList()[i].countryCode === widget.country()) {
              widget.stateList(widget.countriesList()[i].regions);
              if (widget.stateList() && widget.stateList().length > 0 && widget.stateList()[0] && widget.stateList()[0]['abbreviation']) {
                widget.state(widget.stateList()[0]['abbreviation']);
              }
              // Postal code pattern match. Currently hardcoded
              // into the JS file. Maybe the pattern can be sent
              // from the repository.
              if (widget.country() === CCConstants.UNITED_STATES) {
                widget.postalCodePattern(widget.US_POSTAL_CODE_PATTERN);
              }
              
              else if (widget.country() === CCConstants.CANADA) {
                widget.postalCodePattern(widget.CANADA_POSTAL_CODE_PATTERN);
              }
              else {
                widget.postalCodePattern(widget.DEFAULT_POSTAL_CODE_PATTERN);
              }
            }
          }
          widget.isDirty(true);
        }));
      
      widget.subscriptionArray.push(widget.state.subscribe(function(newValue) {
        widget.isDirty(true);
      }));
      widget.subscriptionArray.push(widget.city.subscribe(function(newValue) {
        widget.isDirty(true);
      }));
      widget.subscriptionArray.push(widget.companyName.subscribe(function(newValue) {
          widget.isDirty(true);
      }));
      widget.subscriptionArray.push(widget.postalCode.subscribe(function(newValue) {
        widget.isDirty(true);
      }));
      /*widget.subscriptionArray.push(widget.phoneNumber.subscribe(function(newValue) {
        widget.isDirty(true);
      }));*/
      widget.subscriptionArray.push(widget.isDefaultShippingAddress.subscribe(function(newValue) {
        widget.isDirty(true);
      }));
      widget.subscriptionArray.push(widget.isDefaultBillingAddress.subscribe(function(newValue) {
        widget.isDirty(true);
      }));
    },
    
    /**
     * Invoked when a address is selected from the address listing page to view the details:
     */
    resetAddressData: function() {
      var widget = this;
      var length = widget.subscriptionArray.length;
      for(var i=0; i < length; i++) {
        widget.subscriptionArray[i].dispose();
      }
      widget.subscriptionArray = [];
      
      widget.addressType(null);
      widget.address1(null);
      widget.address2(null);
      widget.address3(null);
      widget.county(null);
      widget.city(null);
      widget.firstName(null);
      widget.lastName(null);
        //default value
      widget.country(undefined);
      widget.state(undefined);
      widget.postalCode(null);
     /* widget.phoneNumber(null);*/
      widget.isDefaultBillingAddress(false);
      widget.isDefaultShippingAddress(false);
      widget.validationModel.errors.showAllMessages(false);
      widget.isCreateNewAddress(false);
      widget.editingAddressId(null);
      if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
        var dynamicPropertyMetaCache = widget.dynamicPropertyMetaInfo.dynamicPropertyMetaCache[CCConstants.ENDPOINT_CONTACT_INFO_TYPE];
        if (dynamicPropertyMetaCache && dynamicPropertyMetaCache.length > 0){
          for (var i = 0; i < dynamicPropertyMetaCache.length; i++) {
             if (dynamicPropertyMetaCache[i].type() === "enum") {
               dynamicPropertyMetaCache[i].values.removeAll();
             } else {
               dynamicPropertyMetaCache[i].value(null);
             }
          }
        }
        widget.clearDynamicProperties();
      }
    },
    
    /**
     * Called each time the widget is rendered:
     *    Ensure the user is authenticated, prompt to login if not.
     */
    beforeAppear: function(page) {
      var widget = this;
        //console.log(widget.dynamicProperties);
        console.log(widget)
       /* widget.subscriptions.push(widget.accountAndSiteSelector.activeSites.subscribe(function(){
      var activeSites = widget.accountAndSiteSelector.activeSites();
       }));*/
      //console.log( widget.accountAndSiteSelector.selectedSiteInfo());
      // The user MUST be logged in to view this widget.
      if (!this.user().loggedIn() || this.user().isUserSessionExpired()) {
        navigation.doLogin(navigation.getPath(), widget.homeRoute);
        return;
      } else {
        if (widget.dynamicPropertyMetaInfo) {
         widget.populateDynamicPropertiesMetaData();
         widget.opDynamicProperty("view");
        }
        if(widget.user().roles().length == 0 && widget.user().id() == "") {
          widget.user().isDelegatedAdmin(true);
          return;
        } else {
          widget.isEditMode(false);
          widget.populateSiteAndOrganization();
          widget.loadAddresses();
        }
      }
      if ((CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT)) {
        widget.subscriptions.push(widget.contextManager.selectedSite.subscribe(function(pValue){
           widget.siteFilter(pValue);
        }));
        widget.subscriptions.push(widget.contextManager.currentOrganizationId.subscribe(function(pValue){
           widget.organizationFilter(pValue);
           widget.loadAddresses();
           widget.isEditMode(false);
        }));
      }
      widget.isGettingSavedToProfile(false);
      widget.isGettingSavedToAccount(false);
    },
    populateSiteAndOrganization : function () {
        var widget = this;
        if(widget.contextManager) {
          widget.siteFilter(widget.contextManager.getSelectedSite());
          widget.organizationFilter(widget.contextManager.getCurrentOrganizationId()); 	
        }    	  
    },
    /**
     * Replaces "null" in address2 and address3 of all addresses in array with null
     */
    replaceAllAddress2NullStringWithNull: function(pAddresses) {
      var addressesLength = pAddresses.length;
      for(var i = 0; i < addressesLength; i++) {
        var currentAddress = pAddresses[i];
        if(currentAddress.address.address2 === "null") {
          currentAddress.address.address2 = null;
        }
        if(currentAddress.address.address3 === "null") {
          currentAddress.address.address3 = null;
        }
      }
    },
    
    /**
     * address to data object
     */
    convertToData: function(pData) {
	  var widget = this;
		  var data = {};
// 		  if([null,undefined,""].indexOf(widget.currentAddress().addressType) == -1){
// 			data[CCConstants.ORG_ADDRESS_TYPE] = widget.currentAddress().addressType;              
// 		  }else{
			  
		  //data[CCConstants.ORG_ADDRESS_TYPE] = "Address"+(widget.secondaryAddresses().length+1);
		   data[CCConstants.ORG_ADDRESS_TYPE] = "Address"+(Math.random().toString(32).slice(11));
		  
		  //}
		  var address = {};
		  address[CCConstants.ORG_ADDRESS_1] = widget.address1();
		  console.log(CCConstants)
		  //alias
		  //address[CCConstants.ORG_NICK_NAME] = "Address"+(widget.secondaryAddresses().length+1);
		  // address[CCConstants.ORG_ADDRESS_TYPE] = "Address"+(widget.secondaryAddresses().length+1);
		  console.log("Widget==",widget)
		  if((widget.address2() === null || widget.address2() === undefined || widget.address2() === "")) {
			address[CCConstants.ORG_ADDRESS_2] ="";
		  }else{
			address[CCConstants.ORG_ADDRESS_2] =widget.address2();
		  }
		  if((widget.address3() === null || widget.address3() === undefined || widget.address3() === "")) {
			address[CCConstants.ORG_ADDRESS_3] ="";
		  }else{
			address[CCConstants.ORG_ADDRESS_3] =widget.address3();
		  }
		  if((widget.county() === null || widget.county() === undefined || widget.county() === "")) {
			address[CCConstants.ORG_COUNTY] ="";
		  }else{
			address[CCConstants.ORG_COUNTY] =widget.county();
		  }
		  address[CCConstants.ORG_COUNTRY] = widget.country();
		  if(widget.stateList().length <= 0) {
			address[CCConstants.ORG_STATE] = "";
		  } else {
			address[CCConstants.ORG_STATE] = widget.state();
		  }
		  if((widget.firstName() === null || widget.firstName() === undefined || widget.firstName() === "")) {
			address[CCConstants.PROFILE_FIRST_NAME]="Test"
		  }else{
			address[CCConstants.PROFILE_FIRST_NAME] = widget.firstName();
		  }
		  if((widget.lastName() === null || widget.lastName() === undefined || widget.lastName() === "")) {
			address[CCConstants.PROFILE_LAST_NAME]="Test";
		  }else{
			address[CCConstants.PROFILE_LAST_NAME] = widget.lastName();
		  } 
		  if((widget.companyName() === null || widget.companyName() === undefined || widget.companyName() === "")){
			address[CCConstants.ORG_COMPANY_NAME] = "";
		  }else{
			address[CCConstants.ORG_COMPANY_NAME] =  widget.companyName();
		  }  
		  
      
      console.log("INDE_INPU",widget.dyProp_Insidepickupdlr())
       console.log("LIFT_GATE",widget.dyProp_LiftGate())
        console.log("LAPU_LADL",widget.dyProp_LimitedAcc())
		  address[CCConstants.ORG_CITY] = widget.city();
		  address[CCConstants.ORG_POSTAL_CODE] = widget.postalCode();
		  /*if((widget.phoneNumber() === null || widget.phoneNumber() === undefined || widget.phoneNumber() === "")) {
			address[CCConstants.ORG_PHONE_NUMBER] = "";
		  }else{
			address[CCConstants.ORG_PHONE_NUMBER] =widget.phoneNumber();        
		  }*/  
		  address[CCConstants.ORG_IS_DEFAULT_BILLING_ADDRESS] = widget.isDefaultBillingAddress();
		  address[CCConstants.ORG_IS_DEFAULT_SHIPPING_ADDRESS] = widget.isDefaultShippingAddress();
		  //For B2C user, make the first address as default shipping address
		  if (!widget.user().isB2BUser() && widget.profileAddresses().length === 0) {
			address[CCConstants.ORG_IS_DEFAULT_SHIPPING_ADDRESS] = true;
		  }
		  for(var i = 0; i< widget.dynamicProperties().length; i++) {
			if (widget.dynamicProperties()[i].type() === "enum") {
			    console.log("Values",widget.dynamicProperties()[i].values)
			  address[widget.dynamicProperties()[i].id()] = widget.dynamicProperties()[i].values;
			} else {
			    console.log("Value",widget.dynamicProperties()[i].value())
			  address[widget.dynamicProperties()[i].id()] = widget.dynamicProperties()[i].value();
			}
		  }
		   address["INDE_INPU"]=widget.dyProp_Insidepickupdlr();
          address["LIFT_GATE"]=widget.dyProp_LiftGate();
          address["RESI_PU_DEL"]=widget.dyProp_ResidentialPickup();
     
          address["LAPU_LADL"]=widget.dyProp_LimitedAcc();
		  data[CCConstants.ORG_ADDRESS] = address;
		  return data;
    },
    
    
    /**
     * Method to get full display name of states and countries
     * @param countryCode
     * @param stateCode
     */
    fetchCountryandStateName: function(countryCode, stateCode) {
     var widget = this;
     var country = null;
     var countryAndStateName = {};
      for (var i = 0; i < widget.countriesList().length;i++) {
        if (countryCode === widget.countriesList()[i].countryCode) {
          country = widget.countriesList()[i];
          countryAndStateName.country = widget.countriesList()[i].displayName;
          break;
        }
      }
      if (country.regions && country.regions.length > 0) {
        for (var j = 0; j < country.regions.length; j++) {
           if (stateCode === country.regions[j].abbreviation) {
             countryAndStateName.state = country.regions[j].displayName;
             break;
           }
        }
      }
      return countryAndStateName;
    },
    
    triggerPageChangeEvent: function () {
        var widget = this;
        var length = widget.subscriptions.length;
        for (var i =0; i<length; i++){
           widget.subscriptions[i].dispose();
        }
        widget.subscriptions = [];
    },
    
    returnUniqueValueForId: function() {
      var widget = this;
      return (Math.floor((Math.random() * 100) + 1)+"_"+Math.floor((Math.random() * 100) + 1)+"_"+Math.floor((Math.random() * 100) + 1));
    }
  };
});