/**
 * @fileoverview Customer Profile Widget.
 * 
 */
define(
  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['knockout', 'notifier','pubsub', 'spinner', 'xDomainProxy','jquery',
   'ccConstants', 'CCi18n', 'ccRestClient', 'agentViewModels/agentUtils/agent-utils',
   'agentViewModels/order-search', 'agentViewModels/account-site-selector', 'agentViewModels/agent-context-manager', 'viewModels/paymentsViewModel',
   'viewModels/storeCreditContainer', 'viewModels/loyalty', 'agentViewModels/agentConfiguration'],

   //-------------------------------------------------------------------
   // MODULE DEFINITION
   //-------------------------------------------------------------------
   function (ko, notifier, pubsub, spinner, XDomainProxy,$,
     CCConstants, CCi18n, CCRestClient, AgentUtils,
     OrderSearch, AccountAndSiteSelector, agentContextManager, paymentsViewModel, storeCreditContainer, Loyalty, agentConfiguration) {

    "use strict";
    return {

    // Constants
    // Widget ID
    WIDGET_ID:    "customerProfile",

    // Customer B2B Account Types 
    ALL_ACCOUNTS: "AllAccounts",
    ONLY_ACTIVE_ACCOUNTS: "ActiveAccounts",
    ONLY_DELEGATED_ADMIN_ACCOUNTS: "DelegatedAdminAccounts",
    ONLY_APPROVER_ACCOUNTS: "ApproverAccounts",
    loaded : ko.observable(false),
    notesType : "customer",
    subscriptions: [],
    contextManager: agentContextManager.getInstance(),
    opDynamicProperty: ko.observable(),
    spinnerOptions : {
      parent : '#cc-customerDisplay',
      posTop : '50%',
      posLeft : '50%'
    },

    beforeAppear: function (page) {
      var widget = this;
      widget.loaded(true);

      // On load of active sites in site selector, load user specific properties
      widget.subscriptions.push(widget.accountAndSiteSelector.activeSites.subscribe(function(){
      var activeSites = widget.accountAndSiteSelector.activeSites();
      if(activeSites && activeSites.length > 0){
        widget.isAccountWithNoContracts(false);
      }else {
        widget.isAccountWithNoContracts(true);
      }
      widget.updateSiteGlobalProperties(false); //reset global email pref update
      // get site specific properties (email preferences)
      widget.getSiteSpecificProperties();
      }));

      widget.opDynamicProperty("update");

      widget.displayCustomer();
    },

    onLoad: function(widget) {
      var user = widget.user();

      /**
       * Flag to indicate whether global email preferences are changed from initial load
       * If yes, update site global properties for customer (email preferences)
       */
      widget.updateSiteGlobalProperties = ko.observable(false);

      widget.marketingMailsTextForSite = ko.pureComputed(function(){
      return CCi18n.t("ns.agentcustomerprofiledetails:resources.marketingMailsText" , {siteName : widget.accountAndSiteSelector.selectedSiteInfo().name});
      }, widget);

      /**
       * Text to say to create to new order or complete existing
       */
      widget.newOrIncompleteOrderLinkText = ko.observable();

      /**
       * Boolean indicates whether user has incomplete order
       */
      widget.hasIncompleteOrder = ko.observable();

      /**
       * Incomplete order object
       */
      widget.incompleteOrder = ko.observable();

      /**
       * loyaltyFlag is used to check
       * inquire balance call is going to external
       * system or not
       */
      widget.loyaltyFlag = ko.observable(false);

      /**
       * Total loyalty programs enrolled by user
       */
      widget.totalLoyaltyPrograms = ko.observable();

      /**
       * isEnrollProperty is flag to check dynamic property
       * with id enrollForLoyalty exist or not.
       */
      widget.isEnrollProperty = ko.observable(null);

      /**
       * reference to payment view model
       */
      widget.paymentsContainer = paymentsViewModel.getInstance();

      /**
       * reference to store credit container view model
       */
      widget.storeCreditContainer = storeCreditContainer.getInstance();

      widget.accountAndSiteSelector = AccountAndSiteSelector;

      /**
       * This flag is to indicate if any account is there with active sites to it
       */
      widget.isAccountWithNoContracts = ko.observable(false);

      widget.currencyObject = ko.observable(user.selectedPriceListGroup().currency);

      widget.accountAndSiteSelector.selectedSite.subscribe(widget.handleSiteSelection.bind(widget));
      widget.accountAndSiteSelector.currentOrganizationId.subscribe(widget.handleOrganizationSelection.bind(widget));

      $.Topic(pubsub.topicNames.USER_RESET_PASSWORD_SUCCESS).subscribe(widget.generatePasswordSuccess.bind(widget));
      $.Topic(pubsub.topicNames.USER_RESET_PASSWORD_FAILURE).subscribe(widget.generatePasswordFailure.bind(widget));

      $.Topic(pubsub.topicNames.USER_PROFILE_UPDATE_SUCCESSFUL).subscribe(widget.updateCustomerSuccess.bind(widget));
      $.Topic(pubsub.topicNames.USER_PROFILE_UPDATE_FAILURE).subscribe(widget.updateCustomerFailure.bind(widget));

      $.Topic(pubsub.topicNames.USER_PROFILE_UPDATE_NOCHANGE).subscribe(widget.closeSpinner.bind(widget));
      $.Topic(pubsub.topicNames.USER_PROFILE_UPDATE_INVALID).subscribe(widget.closeSpinner.bind(widget));

      // Handles if data is invalid.
      $.Topic(pubsub.topicNames.USER_PROFILE_UPDATE_INVALID).subscribe(function() {
       notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.updateErrorMsg'), true);
      });
      $.Topic(pubsub.topicNames.PAGE_CHANGED).subscribe(widget.triggerPageChangeEvent.bind(widget));
    },

    /**
     * On account selection change, refresh the roles and incomplete order for that organization
     * @function
     */
    handleOrganizationSelection : function(){
      var widget = this;
      widget.showIncompleteOrders();
    },

    /**
     * On site selection change, get incomplete orders again
     */
    handleSiteSelection : function(){
      var widget = this;
      widget.showIncompleteOrders();

      var activeSites = widget.accountAndSiteSelector.activeSites();
      widget.user().getSiteSpecificProperties(activeSites);
    },

    /**
     * display the customer details by given profile
     *
     * @name displayCustomer
     * @param {String}
     *      pCustomerId Customer profile id
     */
    displayCustomer : function () {
      var widget = this;
      // Check loyalty programs and display
      widget.checkForLoyalty();

      // Get store credit balance
      widget.getStoreCreditBalance();

      widget.getSiteSpecificProperties();

     // check for incomplete orders otherwise show link to create new order
     if(widget.contextManager.currentOrganizationId() ||
      widget.contextManager.selectedSite()) {
      widget.showIncompleteOrders();
     }
    },

    /**
     * Check if loyalty is enabled for this user, then load the programs
     * @param widget
     */
    checkForLoyalty : function(){
      var widget = this;
      if(widget.isEnrollForLoyalty()){
      widget.loyaltyFlag(true);
      widget.loadLoyaltyPrograms();
      }else {
      widget.totalLoyaltyPrograms(0);
      }
    },

    /**
     * To check id of any custom property is enrollForLoyalty or not.
     * enrollForLoyalty is used for enroll or unenroll the loyalty program.
     * It is hard coded and this id will never change.
     */
    isEnrollForLoyalty : function() {
      var widget = this;
      var user = widget.user();
      var dynamicProperties = user.dynamicProperties();
      if(dynamicProperties && dynamicProperties.length > 0) {
      for(var i in dynamicProperties){
        if(dynamicProperties[i].id() == CCConstants.ENROLLED_FOR_LOYALTY) {
        if(dynamicProperties[i].value() == true){
          widget.isEnrollProperty(true);
          return widget.isProfileEnrolledForLoyalty();
        } else {
          widget.isEnrollProperty(false);
          return false;
        }
        }
      }
      }
      return widget.isProfileEnrolledForLoyalty();
    },

    /**
     * Check for status of any loyalty program
     * if it is enrolled or not
     */
    isProfileEnrolledForLoyalty : function() {
      var widget = this;
      var user = widget.user();
      var loyaltyPrograms = user.loyaltyPrograms();
      if(loyaltyPrograms){
      for(var i = 0; i<loyaltyPrograms.length;i++){
        if(loyaltyPrograms[i].status && loyaltyPrograms[i].status === CCConstants.ENROLLED){
        return true;
        }
      }
       }
      return false;
    },

    /**
     * Retrieve loyalty programs for shopper
     * @function
     * @param pSuccessCallback
     * @param pFailureCallback
     */
    loadLoyaltyPrograms : function() {
      var widget = this;
      var user = widget.user();
      var payments = [];
      var payment = {};
      payment.paymentMethodType = CCConstants.LOYALTY_POINTS_PAYMENT_TYPE;
      payments.push(payment);

      widget.paymentsContainer.inquireBalance(widget.loadLoyaltyProgramsSuccess.bind(widget), widget.loadLoyaltyProgramsFailure.bind(widget), payments, user.id());
    },

    /**
     * Success call back of loadLoyaltyPrograms.
     * @param pData Success response
     */
    loadLoyaltyProgramsSuccess : function(pData) {
      var widget = this;
      var user = widget.user();
      var loyaltyViewModel = new Loyalty();
      widget.paymentsContainer.populateViewModelWithServerData(loyaltyViewModel, pData);
      user.loyaltyViewModel(loyaltyViewModel);
      if(loyaltyViewModel.loyaltyPrograms.length > 0){
      widget.totalLoyaltyPrograms(loyaltyViewModel.loyaltyPrograms.length);
      }
      widget.loyaltyFlag(false);
    },

    /**
     * Failure call back of loadLoyaltyPrograms.
     */
    loadLoyaltyProgramsFailure : function(pResult) {
      var widget = this;
      widget.loyaltyFlag(false);
      widget.totalLoyaltyPrograms(0);
      notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.loyaltyProgramRetrievalErrorText'));
    },

    /**
     * Handler function for generate password update.
     *
     * @name sendResetPasswordLink
     */
    sendResetPasswordLink : function () {
      var widget = this;
      var user = widget.user();
      var emailAddress = user.emailAddress();
      user.resetForgotPassword(emailAddress);
    },

    /**
     * Success callback after reset password is completed
     * @param pData
     */
    generatePasswordSuccess : function (pData) {
      var widget = this;
      notifier.sendSuccess(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.customerGenerateResetPasswordLinkSuccessMsg'));
    },

    /**
     * Failure callback for reset password
     * @param pResult
     */
    generatePasswordFailure : function (pResult) {
      var widget = this;
      notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.customerGenerateResetPasswordLinkErrorMsg'));
    },

    /**
     * Get store credit balance
     * @function
     */
    getStoreCreditBalance : function(){
      var widget = this;
      var user = widget.user();
      var successCallback = function(pData){
        user.storeCreditContainer().populateViewModelWithServerData(pData);
      };
      var errorCallback = function(pData){
        notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.storeCreditRetrievalErrorText'));
      };
      widget.paymentsContainer.retrieveStoreCreditBalance(successCallback, errorCallback, user.id());
    },

    /**
     * Function to Redirect the Agent to Storefront on behalf of a shopper
     * @name redirectToStore
     *
     */
    redirectToStore : function(){
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

   /**
	  * Utility method to obtain the site based URL
	  */
    getSelectedSiteProductionUrl : function () {
      //determine the production url for the selected site
      var selectedSiteSiteInfo = this.accountAndSiteSelector.selectedSiteInfo();
      return selectedSiteSiteInfo.productionURL ? ("//"+selectedSiteSiteInfo.productionURL):
        selectedSiteSiteInfo.productionURL;
    },

    /**
     * Utility method to validate the siteBased URL in case of OBO flow.
     * If the URL is invalid the Agent will not be redirected to the SF page
     */
    isValidURL: function(str) {
      if(str === null || str === "undefined" || str === "") {
        return null;
      }
      return str;
    },

    /**
     * On change of global email preference, update email preference for site too
     */
    switchGlobalEmailPrefOptionChange : function(event) {
      var widget = this;
      var user = widget.user();
      user.emailMarketingMails(user.receiveEmailGlobally());
      var optionValue = event.target.checked;
      if(user.originalReceiveEmailGlobally != optionValue){
      widget.updateSiteGlobalProperties(true);
      } else {
      widget.updateSiteGlobalProperties(false);
      }
      return true;
    },

    /**
     * On click of save button, publish event in user view model to save
     */
    updateCustomer : function(){
      var widget = this;
      var user = widget.user();
      spinner.create(widget.spinnerOptions);

      user.handleUpdateProfile();

      var successCallback = function(){
      widget.getSiteSpecificProperties();
        notifier.sendSuccess(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.customerUpdateSiteSpecifcPropertySuccessMsg'));
        spinner.destroy();
      };
      var errorCallback = function(){
        notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.customerUpdateSiteSpecifcPropertyFailureMsg'));
        spinner.destroy();
      }
      // Update site specific properties for customer
      if(widget.updateSiteGlobalProperties()){
        user.updateSiteSpecificProperites(widget.accountAndSiteSelector.activeSites(), successCallback, errorCallback);
      }
    },

    /**
     * Success handler for updateCustomer.
     * Update site specific details for customer
     * @name updateCustomerSuccess
     * @param pData
     *      {Object} the response information received after successfully
     *      updating customer information
     */
    updateCustomerSuccess : function (pData) {
      var widget=this;
      var user = widget.user();
      // Dynamic properties update can be restricted if GDPR is enabled. So resetting the
      // dynamic properties value using the pData obtained from endpoint.
      var priceListGroups = agentConfiguration.getPriceListGroups();
      pData.priceListGroup = priceListGroups[pData.priceListGroup.repositoryId];
      user.populateUserViewModel(pData);
      notifier.sendSuccess(widget.WIDGET_ID, CCi18n.t('ns.agentcustomerprofiledetails:resources.customerProfileUpdateSuccessMsg'));
      if(!widget.updateSiteGlobalProperties()){
      widget.getSiteSpecificProperties();
      widget.closeSpinner();
      }
    },

    /**
     * close spinner
     */
    closeSpinner : function(){
      spinner.destroy();
    },

    /**
     * Refresh the site specific properties
     */
    getSiteSpecificProperties : function(){
      var widget = this;
      // refresh the global site specific props
      var activeSites = widget.accountAndSiteSelector.activeSites();
      widget.user().getSiteSpecificProperties(activeSites);
      widget.updateSiteGlobalProperties(false); //reset global email pref update
    },

    /**
     * Failure handler for updateCustomer.
     *
     * @name updateCustomerFailure
     * @param pResult
     *      {Object} the response error information.
     */
    updateCustomerFailure : function (pResult) {
      var widget=this;
      notifier.sendError(widget.WIDGET_ID, widget.translate('errorHeader', {result: pResult}), true);
      spinner.destroy();
    },

    /**
     * On click of cancel button, reload the current user profile
     */
    cancelUpdates : function(){
      var widget = this;
      var user = widget.user();
      spinner.create(widget.spinnerOptions);
      user.getCurrentUser(null, null, widget.cancelUpdatesSuccessCallback.bind(widget), widget.cancelUpdatesFailCallback.bind(widget));
    },

    /**
     * cancel updates success callback
     */
    cancelUpdatesSuccessCallback : function(){
      spinner.destroy();
    },

    /**
     * Cancel updates fail callback
     */
    cancelUpdatesFailCallback : function(){
      spinner.destroy();
    },

    /**
     * @name Function to enable or disable edit save button
     */
    enableSaveButton : function () {
      var widget = this;
      var user = widget.user();
      return (user.firstName.isModified() ||
        user.lastName.isModified());
    },

    /**
     * Function to invoke incomplete orders
     * @name showIncompleteOrders
     * @param -{boolean}
     *   phasIncompleteOrder - Indicates whether there is an incomplete order
     */
    showIncompleteOrders : function () {
      var widget = this;

      var selectedSite = widget.contextManager.selectedSite();
      var currentOrganizationId = widget.contextManager.currentOrganizationId();
      
      var ordersSearch = new OrderSearch();
      // prepare query for order search
      var data = {};
      var query = "state eq \"INCOMPLETE\" and profileId eq \"" + widget.contextManager.getShopperProfileId() +"\"";
      if(selectedSite) {
        query = query + " and siteId eq \"" + selectedSite + "\"";
      }    

      if(currentOrganizationId) {
        query  = query + " and organizationId eq \"" + currentOrganizationId + "\"";
      }
      // May be we can get this 'query' value from widget. So user can write his own query.
      data[CCConstants.Q] = query;  
      data[CCConstants.FIELDS_QUERY_PARAM] = "items.organization,items.commerceItems,items.priceGroupId,items.payTaxInSecondaryCurrency,items.secondaryCurrency,items.payShippingInSecondaryCurrency,items.secondaryCurrencyCode,items.priceInfo,items.siteId,items.id";
      data[CCConstants.PARAM_QUERY_FORMAT] = CCConstants.PARAM_QUERY_FORMAT_SCIM;
      data[CCConstants.OFFSET] = 0;
      data[CCConstants.LIMIT] = 1;
      data["sort"]="lastModifiedDate:desc";
      ordersSearch.getIncompleteOrdersForUser(data, widget.getIncompleteOrderDetailsSuccess.bind(widget),
                      widget.getIncompleOrderDetailsFailure.bind(widget));
    },
    

  /***
   * Function to load the order page
   * @name changeHashToDisplayOrder
   * @param - boolean 
   *    hasIncompleteOrder 
   */
  showOrdersPage : function() {
    var widget = this;
    var hasIncompleteOrder = widget.hasIncompleteOrder();
    var user = widget.user();
    if(!hasIncompleteOrder){
        widget.contextManager.setPriceListGroup(user.priceListGroup.id());
      }else{
        widget.contextManager.setCurrentOrganizationId(widget.incompleteOrder().organization ? widget.incompleteOrder().organization.repositoryId : null);
        widget.contextManager.setSelectedSite(widget.incompleteOrder().siteId);
        widget.contextManager.setPriceListGroup(widget.incompleteOrder().priceGroupId);
      }
    var context = widget.contextManager.export();
    user.validateAndRedirectPage(widget.links().agentCheckout.route +'?context='+ encodeURIComponent(context));
  },
  
    /**
     * Success function call on loading incomplete order details
     * @name  loadIncompleteOrderDetailsSuccess
     * @param  {object }
     *    pData - incomplete order details 
     */
    getIncompleteOrderDetailsSuccess : function(pData) {
      var widget = this;
      widget.updateCartText(pData);
    },

    /**
     * Failure function for loading incomplete order
     *  details call.
     *  
     * @name loadIncompleOrderDetailsFailure
     * @param {Object}
     *      pResult The error response data 
     */
    getIncompleOrderDetailsFailure : function (pResult) {
      var widget = this;
      notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.ultrasourceCustomerProfileDetailsAgent:resources.profileLoadOrderError'));
    },
    
    /**
     * Function to update cart text
     * @name updateCartText
     * @param - {object }
     *   pData - cart items data 
     */
    updateCartText : function(pData) {
      var widget = this;
      if(pData && pData.items && pData.items.length > 0) {
        // if there are incomplete orders for a particular Organization.
        var incompleteOrderText = widget.getIncompleteOrderText(pData);
        widget.newOrIncompleteOrderLinkText(incompleteOrderText);
        widget.hasIncompleteOrder(true);
        widget.incompleteOrder(pData.items[0]);
      } else{
        var createNewOrderText =  CCi18n.t('ns.ultrasourceCustomerProfileDetailsAgent:resources.createOrderLink');
        widget.newOrIncompleteOrderLinkText(createNewOrderText);
        widget.hasIncompleteOrder(false);
      }
    },
    
    /**
   * Function to get incomplete order text
   * @name getIncompleteOrderText
   * @param  - {Object}
   *    pData incomplete order details 
   */  
  getIncompleteOrderText : function(pData) {
    var widget = this;
    var linkText = "";
    // fetch the only item
    var incompleteOrderItem = pData.items[0];
    var commerceItems = incompleteOrderItem.commerceItems;
    var itemsInCart = 0;
    commerceItems.forEach(function(commerceItem) {
    itemsInCart += commerceItem.quantity;
    });
    var priceListGroups = agentConfiguration.getPriceListGroups();
    var priceListGroup = AgentUtils.getPriceListGroupInfo(priceListGroups, incompleteOrderItem.priceGroupId);
    var priceTotal = incompleteOrderItem.priceInfo.total;
    var currency;
    if (priceListGroup != null) {
    currency = priceListGroup.currency;
    }
    if(!currency){
      currency = widget.currencyObject();
    }
    var currencySymbol = currency.symbol;
    var cartSubTotal = AgentUtils.formatPrice(priceTotal,
      currency.fractionalDigits);
    if (currencySymbol.match(/^[0-9a-zA-Z]+$/)) {
    currencySymbol = currencySymbol + ' ';
    }
    var numItems = AgentUtils.formatNumber(itemsInCart);
    //If shipping and tax are to be paid in secondary currency the order total should be in mixed currency format
    if (incompleteOrderItem.payShippingInSecondaryCurrency || incompleteOrderItem.payTaxInSecondaryCurrency) {
    var secondaryCurrency = AgentUtils.getSecondaryCurrency(incompleteOrderItem.secondaryCurrencyCode);
    var primaryCurrencyTotal = incompleteOrderItem.priceInfo.primaryCurrencyTotal;
    var secondaryCurrencyTotal = incompleteOrderItem.priceInfo.secondaryCurrencyTotal;
    var resourceKey = numItems > 1 ? "completeOrderDetailTextInMixCurrency_plural" : "completeOrderDetailTextInMixCurrency";
    linkText = CCi18n.t("ns.ultrasourceCustomerProfileDetailsAgent:resources." + resourceKey, {
      count : numItems,
      primaryCurrencySymbol : currencySymbol,
      totalPrimaryPrice : AgentUtils.formatPrice(primaryCurrencyTotal,currency.fractionalDigits),
      secondaryCurrencySymbol : secondaryCurrency.symbol,
      totalSecondaryPrice : AgentUtils.formatPrice(secondaryCurrencyTotal,secondaryCurrency.fractionalDigits)
    });
    }
    else{
    resourceKey = numItems > 1 ? "completeOrderDetailText_plural" : "completeOrderDetailText";
    linkText = CCi18n.t("ns.ultrasourceCustomerProfileDetailsAgent:resources." + resourceKey, {
      count : numItems,
      currency : currencySymbol,
      totalPrice : cartSubTotal
    });
    }
    return linkText;
  },
  
  /**
   * Loyalty points details
   */
  getPointTypeText : function (pLoyaltyPointDetails) {
    var balances = "";
    if(pLoyaltyPointDetails) {
    for(var i = 0; i < pLoyaltyPointDetails.length; i++) {
      if(i==0){
      balances = pLoyaltyPointDetails[i].pointsBalance + " " + pLoyaltyPointDetails[i].membershipType + " " +pLoyaltyPointDetails[i].pointsType;
      } else {
      balances = balances + ", " + pLoyaltyPointDetails[i].pointsBalance + " " + pLoyaltyPointDetails[i].membershipType + " " + pLoyaltyPointDetails[i].pointsType;
      }
    }
    }
    return balances;
  },
  
  /**
   * If roles are changed then set the dirty flag in user
   */
  rolesHaveChanged : function() {
    var widget = this;
    widget.user().isUserDataModified(true);
  },
  
  /**
   * On page change, remove all subscriptions in widget
   */
    triggerPageChangeEvent: function () {
      var widget = this;
      var length = widget.subscriptions.length;
      for (var i =0; i<length; i++){
        widget.subscriptions[i].dispose();
      }
    }

    };
  }
);
