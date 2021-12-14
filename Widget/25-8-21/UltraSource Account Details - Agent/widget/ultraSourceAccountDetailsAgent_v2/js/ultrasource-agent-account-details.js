/**
 * @fileoverview Agent Account Details Widget.
 *
 */
define(
  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  [ 'knockout', 'ccRestClient', 'jquery', 'CCi18n', 'ccConstants', 'notifier', 'pubsub', 'pageLayout/organization', 'viewModels/site-listing', 'spinner', 'agentViewModels/agentConfiguration', 'agentViewModels/account-site-selector', 'viewModels/dynamicPropertyMetaContainer'],

  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function (ko, CCRestClient, $, CCi18n, CCConstants, notifier, PubSub, Organization, siteListingViewModel, spinner, agentConfiguration, accountAndSiteSelector, DynamicPropertyMetaContainer) {

    "use strict";

    return {
      // Widget ID
      WIDGET_ID: "agentAccountDetails",
      
      SELF_REGISTRATION_SOURCE: "selfRegistration",

      isSelfRegistrationEnabled: ko.observable(false),
      delegatedAdminAllowedThroughAgent: ko.observable(false),
      opDynamicProperty: ko.observable(),

      allowedAccountCustomerTypes: ko.observableArray(),
      allowedAccountTypes: ko.observableArray(),
      isPrincipalAccount: ko.observable(false),
      accountParentOrganizationId: ko.observable(),
      showInheritedCheckbox: ko.observable(false),

      isOrgSourceSelfRegistration: ko.observable(false),
      orgRegistrationApproverComments: ko.observable(),
      orgRegistrationRequesterComments: ko.observable(),
      requesterAccountName: ko.observable(),
      registrationRequestOriginSiteInfo: ko.observable(),

      approvalRequired: ko.observable(),
      isWebhookEnabled: ko.observable(),
      approvalErrorMessage: ko.observable(),

      // Spinner resources
      accountDetailsIndicator: '#cc-agent-account-details-container',
      accountDetailsIndicatorOptions: {
        parent: '#cc-agent-account-details-container',
        posTop: '50%',
        posLeft: '50%'
      },

      /**
       * Called when resources have been loaded
       */
      resourcesLoaded: function(widget) {
        widget.componentPlaceholder = widget.translate('noneDefinedText');
        widget.propertyDropdownSelectText = widget.translate('propertySelectText');
      },

      /**
       * Called when widget first loaded
       */
      onLoad: function(widget) {
        //get 'delegatedAdminAllowedThroughAgent' from agent configuration
        widget.agentConfigurationData = agentConfiguration.getConfigurationProperty(CCConstants.AGENT_CONFIGURATIONS);
        widget.delegatedAdminAllowedThroughAgent = widget.agentConfigurationData ? widget.agentConfigurationData.delegatedAdminAllowedThroughAgent : false;

        //To get 'selfRegistrationEnabled' from agent policies
        widget.setRegistrationEnabledFlag();

        widget.initializeLocalVariables();

        widget.accountAndSiteSelector = accountAndSiteSelector;

        widget.enableApprovalProperties = ko.pureComputed(function() {
          widget.updateApprovalInfoPopover();
          var user = widget.user();
          return (user.isDelegatedAdmin() && user.currentOrganizationDetails() && user.currentOrganizationDetails().delegateApprovalManagement() && user.currentOrganizationDetails().numberOfActiveApprovers() > 0 && !widget.isWebhookEnabled() 
            && user.active() && widget.delegatedAdminAllowedThroughAgent);
        }, widget);

        var fractionalDigits = widget.user().priceListGroup.currency.fractionalDigits();
        widget.orderPriceLimit = ko.observable().extend({numeric: fractionalDigits});
        widget.orderPriceLimit.extend({
          pattern: {
            message: CCi18n.t('ns.common:resources.quantityNumericMsg'),
            params: /^-?[0-9]+([.][0-9]+)?$/g,
          },
          maxLength: {
            params: CCConstants.MAX_LENGTH_PURCHASE_LIMIT,
            message: CCi18n.t('ns.common:resources.maxlengthValidationMsg',
            {maxLength: CCConstants.MAX_LENGTH_PURCHASE_LIMIT})
          },
          validation: {
              validator: function (value, newValue) {
                return value >= newValue;
              },
               message: widget.translate('priceInvalidSummaryText')+widget.translate('priceValidation'),
              params: 0
            }
        });

        //If user.currentOrganizationDetails is not empty, then set element variables for the current organization
        if (widget.user().currentOrganizationDetails()){
          widget.setAccountDetails();
        }

        //Otherwise subscribe the event for currentOrganizationDetails change of user viewmodel
        widget.user().currentOrganizationDetails.subscribe(widget.setAccountDetails.bind(widget));
      },

      /**
       * Called each time the page appears
       */
      beforeAppear: function (page) {
        var widget = this;
      },

      /**
       * Sets account static infos, registration request details,
       * approval setting related infos for the selected organization
       * @param {boolean} pValue indicates if the organization value of user view model is updated or not
       */
      setAccountDetails: function () {
        var widget = this;
        var currentOrg = widget.user().currentOrganizationDetails();
        if (currentOrg.parentOrganization && currentOrg.parentOrganization.id()) {
          widget.isPrincipalAccount(false);
          widget.accountParentOrganizationId(currentOrg.parentOrganization.id());
        } else {
          widget.isPrincipalAccount(true);
          widget.accountParentOrganizationId(null);
        }
        widget.showInheritedCheckbox(!widget.isPrincipalAccount() && widget.accountParentOrganizationId());
        widget.isOrgSourceSelfRegistration(widget.SELF_REGISTRATION_SOURCE ===  currentOrg.source());
        if (widget.isOrgSourceSelfRegistration())
          widget.getOrganizationRequestDetails();

        widget.approvalRequired(currentOrg.approvalRequired());
        widget.orderPriceLimit(currentOrg.orderPriceLimit());
        widget.isWebhookEnabled(currentOrg.isApprovalWebhookEnabled());

        //Add dynamic property infos
        widget.setOpDynamicProperty();
        widget.user().currentOrganizationDetails().updateDynamicProperties(widget.opDynamicProperty());
        widget.destroySpinner();
      },

      /**
       * If isRegistrationEnabled is disabled then try to check if there is any account which
       * was initiated by registration request. And if there is any account then show
       * 'Initiated by Registration Request' checkbox in Account Details tab.
       */
      setRegistrationEnabledFlag: function() {
        var widget = this;
        var queryParams = {};
        //we are making an end point call to get the self registration setting flag
        CCRestClient.request(CCConstants.ENDPOINT_SETTINGS_GET_POLICIES, queryParams,
          //success callback
          function(data) {
            var isRegistrationEnabled =  data.selfRegistrationEnabled;
            if (!isRegistrationEnabled) {
              // Call to check if there are any request which has been initiated by self registration
              Organization.prototype.loadOrganizationsWithSelfRegistration(widget.getListOrganizationsSuccess.bind(widget), widget.getListOrganizationsFailure.bind(widget));
            } else{
              widget.isSelfRegistrationEnabled(isRegistrationEnabled);
            }
          },
          //error callback
          function(pError) {
            notifier.sendError(widget.WIDGET_ID, pError.message, true);
          });
      },

      /**
       * Success callback method for loadOrganizationsWithSelfRegistration
       */
      getListOrganizationsSuccess: function(pResponse) {
        var widget= this;
        widget.isSelfRegistrationEnabled(pResponse && pResponse.totalResults >0 ? true : false);
      },

      /**
       * Failure method handler for loadOrganizationsWithSelfRegistration
       */
      getListOrganizationsFailure: function(pError) {
        var widget = this;
        widget.isSelfRegistrationEnabled(false);
        notifier.sendError(widget.WIDGET_ID, pError.message, true);
      },

      /**
       * Click handler for "cancel" button.
       * Reverts the changes in 'account-approval-setting' element
       * @name handleCancelUpdate
       */
      handleCancelUpdate: function() {
        var widget = this;
        widget.createSpinner();
        widget.approvalRequired(widget.user().currentOrganizationDetails().approvalRequired());
        widget.orderPriceLimit(widget.user().currentOrganizationDetails().orderPriceLimit());
        widget.isWebhookEnabled(widget.user().currentOrganizationDetails().isApprovalWebhookEnabled());
        if(widget.user().currentOrganizationDetails().dynamicProperties() && widget.user().currentOrganizationDetails().dynamicProperties().length > 0) {
          var dynamicPropertyArray = widget.user().currentOrganizationDetails().dynamicProperties();
          for (var i = 0; i < dynamicPropertyArray.length; i++) {
            if (dynamicPropertyArray[i].value.isModified()) {
              widget.user().currentOrganizationDetails().dynamicProperties()[i].value(null);
            }
          }
        }
        widget.user().currentOrganizationDetails().updateDynamicProperties(widget.opDynamicProperty());
        widget.user().currentOrganizationDetails().resetDynamicPropertiesValueIsModified();
        widget.destroySpinner();
      },

      /**
       * Click handler for "save" button.
       * Updates the organization data with the 'account-approval-setting' element changes
       */
      updateAccountDetails: function() {
        var widget = this;
        var data = {};
        if(widget.validate()) {
          widget.createSpinner();
          widget.unwrap(data);
          widget.user().currentOrganizationDetails().updateOrganization(data,
                 widget.updateAccountDetailsSuccess.bind(widget),
                 widget.updateAccountDetailsFailure.bind(widget));
        }
      },

      /**
       * Success call back for updateAccountDetails.
       * Updates the approval setting details for organizations in user view model
       * @param {Object} pResponse
       */
      updateAccountDetailsSuccess: function(pResponse) {
        var widget = this;
        notifier.sendSuccess(widget.WIDGET_ID, widget.translate('accountUpdateSuccessMessage'), true);
        widget.user().currentOrganizationDetails().populateOrganizationViewModel(pResponse);
        widget.user().currentOrganizationDetails().resetDynamicPropertiesValueIsModified();
        widget.user().currentOrganizationDetails().updateDynamicProperties(widget.opDynamicProperty());
        widget.destroySpinner();
      },

      /**
       * Error call back for updateAccountDetails.
       * Displays a message with appropriate error.
       */
      updateAccountDetailsFailure: function(pError) {
        var widget = this;
        notifier.sendError(widget.WIDGET_ID, pError.message, true);
        widget.destroySpinner();
      },

      /**
       * @name validate
       * validates all the editable properties
       */
      validate: function() {
        var widget = this;
        if (!widget.orderPriceLimit.isValid()) {
          $("#purchaseOrderLimitField").focus();
          return false;
        } else {
          return widget.user().currentOrganizationDetails().isOrganizationDynamicPropertiesValid()
        }
      },

      /**
       * create a spinner with spinner options
       */
      createSpinner: function() {
        var widget = this;
        spinner.create(widget.accountDetailsIndicatorOptions);
      },

      /**
       * destroy the spinner
       */
      destroySpinner: function() {
        var widget = this;
        spinner.destroyWithoutDelay(widget.accountDetailsIndicator);
      },

      /**
       * @name unwrap
       * Stores the changes in approval setting and dynamic properties in 'data' parameter.
       * Called from the click handler method of 'save' button.
       * @param {Object} data to contain updated approval setting details
       */
      unwrap: function(pData){
        var widget = this;
        var dynamicProperties = widget.user().currentOrganizationDetails().dynamicProperties();
        for (var i = 0; i < dynamicProperties.length; i++) {
          if (dynamicProperties[i].value.isModified && dynamicProperties[i].value.isModified()) {
            pData[dynamicProperties[i].id()] = dynamicProperties[i].value();
          }
        }
        if (widget.user().currentOrganizationDetails().delegateApprovalManagement()) {
          pData[CCConstants.APPROVAL_REQUIRED] = this.approvalRequired();
          pData[CCConstants.ORDER_PRICE_LIMIT] = this.orderPriceLimit();
        }
      },

      /**
       * Set the mode for dynamic property (view/update)
       */
      setOpDynamicProperty: function() {
        var widget = this;
        if (!widget.user().active() || !widget.user().isDelegatedAdmin() || !widget.delegatedAdminAllowedThroughAgent) {
          widget.opDynamicProperty(CCConstants.DYNAMIC_PROPERTY_VIEW_ONLY);
        } else {
          widget.opDynamicProperty(CCConstants.DYNAMIC_PROPERTY_UPDATE_ONLY);
        }
      },

      //Methods for account-general-info
      /**
       * Initializes arrays of allowed customer types and account types.
       */
      initializeLocalVariables: function() {
        var widget = this;
        widget.allowedAccountCustomerTypes([ {
          value : CCConstants.CUSTOMER_TYPES_STANDARD_ID,
          label : widget.translate('standardText')
        }, {
          value : CCConstants.CUSTOMER_TYPES_PREFERRED_ID,
          label : widget.translate('preferredText')
        }, {
          value : CCConstants.CUSTOMER_TYPES_ENTERPRISE_ID,
          label : widget.translate('enterpriseText')
        }, {
          value : CCConstants.CUSTOMER_TYPES_OEM_ID,
          label : widget.translate('oemText')
        }, {
          value : CCConstants.CUSTOMER_TYPES_DISTRIBUTOR_ID,
          label : widget.translate('distributorText')
        }, {
          value : CCConstants.CUSTOMER_TYPES_SUPPLIER_ID,
          label : widget.translate('supplierText')
        } ]);

        widget.allowedAccountTypes([ {
          value : CCConstants.ACCOUNT_TYPES_COMPANY_ID,
          label : widget.translate('companyText')
        }, {
          value : CCConstants.ACCOUNT_TYPES_DIVISION_ID,
          label : widget.translate('divisionText')
        }, {
          value : CCConstants.ACCOUNT_TYPES_DEPARTMENT_ID,
          label : widget.translate('departmentText')
        }, {
          value : CCConstants.ACCOUNT_TYPES_GROUP_ID,
          label : widget.translate('groupText')
        } ]);
      },

      //Methods for registration-request-details
      /**
       * Invokes the method in Organization view model to get the organization Request Id,
       * if the organization is initiated by Registration request.
       * If request Id is present, then get the organization notes for the found organization requst id.
       */
      getOrganizationRequestDetails: function(){
        var widget = this;
        // Get the Organization request Id of the current Organization.
        var successCallback = function(pResponse){
          if (pResponse && pResponse.items && pResponse.items.length){
            var orgRequestId = pResponse.items[0].id;
            // Once an Organization Request is found which was associated with current Organization 
            // then get the organization notes by making a call to get Organization request for the found organization request Id.
            widget.user().currentOrganizationDetails().getRegistrationRequestNotes(orgRequestId,
              widget.getOrganizationRequestDetailsSuccess.bind(widget),
              widget.getOrganizationRequestDetailsFailure.bind(widget));
          }
        };

        var errorCallback = function(pError) {
          notifier.sendError(widget.widget.WIDGET_ID, pError.message, true);
        };

        widget.user().currentOrganizationDetails().getRegistrationRequest(successCallback, errorCallback);
      },

     /**
      * Success call back for get organization request call.
      */
      getOrganizationRequestDetailsSuccess: function(pResponse){
        var widget = this;
        if(pResponse){
          widget.orgRegistrationApproverComments(pResponse[CCConstants.REGISTRATION_REQUEST_APPROVER_COMMENTS]);
          widget.orgRegistrationRequesterComments(pResponse[CCConstants.REGISTRATION_REQUEST_REQUESTER_COMMENTS]);
          widget.requesterAccountName(pResponse[CCConstants.REGISTRATION_REQUEST_REQUESTER_ORG_NAME]);
          var siteId = pResponse[CCConstants.REGISTRATION_REQUEST_ORIGIN_SITE_ID];
          widget.updateRegistrationSiteInfo(siteId);
        }
      },

      /**
       * Failure callback for get organization request call.
       */
      getOrganizationRequestDetailsFailure: function(pError){
        notifier.sendError(widget.WIDGET_ID, pError.message, true);
      },

      /**
       * Updates site name and url of site.
       */
      updateRegistrationSiteInfo: function(pSiteId) {
        var widget = this;
        var sites = siteListingViewModel.activeSites();
        for (var i =0; i < sites.length ; i++) {
          if (sites[i].id === pSiteId){
            var siteName = sites[i].name ? sites[i].name : sites[i].id;
            var siteURL = sites[i].productionURL ? "-"+ sites[i].productionURL : "";
            widget.registrationRequestOriginSiteInfo(siteName + siteURL);
            break;
          }
        }
        if (!widget.registrationRequestOriginSiteInfo()){
          widget.registrationRequestOriginSiteInfo(pSiteId);
        }
      },

      //Methods for account-approval-setting
      /**
       * @name updateApprovalInfoPopover
       * Based on various conditions it updates the message in information pop over(besides 'require approval' checkbox)
       */
      updateApprovalInfoPopover: function(){
        var widget=this;
        widget.approvalErrorMessage(null);
        if(!widget.delegatedAdminAllowedThroughAgent)
          widget.approvalErrorMessage(widget.translate('delegatedAdminAllowedThroughAgentText'));
        else if(!widget.user().active)
          widget.approvalErrorMessage(widget.translate('profileInactiveText'));
        else if(!widget.user().isDelegatedAdmin())
          widget.approvalErrorMessage(widget.translate('notADelegatedAdminText'));
        else if(widget.isWebhookEnabled())
          widget.approvalErrorMessage(widget.translate('approvalWebhookIsEnabled'));
        else if(widget.user().currentOrganizationDetails() && !widget.user().currentOrganizationDetails().delegateApprovalManagement())
          widget.approvalErrorMessage(widget.translate('delegatedAdminDisabledAccountSettingsText'));
        else if(widget.user().currentOrganizationDetails() && widget.user().currentOrganizationDetails().numberOfActiveApprovers() === 0)
          widget.approvalErrorMessage(widget.translate('noApproverForTheOrganizationText'));
      }
    }
  }
);
