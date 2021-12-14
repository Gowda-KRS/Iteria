/**
 * 
 * @fileoverview Widget to get customer order history.
 */
define(

    //-------------------------------------------------------------------
    // DEPENDENCIES
    //-------------------------------------------------------------------
    [ 'knockout', 'spinner', 'CCi18n', 'agentViewModels/customer-search', 'jquery', 'ccConstants', 'ccRestClient',
        'pubsub', 'agentViewModels/agentUtils/agent-utils', 'agentViewModels/agent-context-manager', 
        'viewModels/site-listing', 'agentViewModels/agentConfiguration','agentViewModels/account-site-selector','notifier', 'viewModels/shopperContext'],

    // MODULE DEFINITION
    //-------------------------------------------------------------------
    function(ko, spinner, CCi18n, AgentCustomerSearchViewModel, $, CCConstants, CCRestClient, pubsub, AgentUtils, 
             AgentContextManager, SiteListingViewModel, AgentConfiguration, AccountAndSiteSelector, notifier, ShopperContextViewModel) {

      'use strict';
      /**
       * Widget to get customer order history
       */
      return {
        sites: ko.observableArray([]),
        customerSearchViewModel: new AgentCustomerSearchViewModel(),
        isCreateOrderEnabled: ko.observable(true),
        customerCartsViewModel: ko.observable(),
        contextManager: AgentContextManager,
        isCustomerCartsModalOpened: ko.observable(false),
        spinnerOptions: {
          parent : '#page',
          posTop : '50%',
          posLeft : '50%'
        },
        onLoad : function(widget) {
        // spinner options
          widget.customerSearchViewModel.itemsPerPage = parseInt(widget.itemsPerPage());
          widget.initCustomerSearchCriteria();
          AgentContextManager.getInstance().clearAgentContextHeader();
          // Clear the header details set if any in agent context header
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_ORGANIZATION_ID);
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_AGENT_CONTEXT);
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_SITE_ID);
        },

        beforeAppear : function(page) {
          AgentContextManager.getInstance().clearAgentContextHeader();
          // Clear the header details set if any in agent context header
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_ORGANIZATION_ID);
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_AGENT_CONTEXT);
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_SITE_ID);
          this.clearShopperContext(this.customerSearch.bind(this));
        },

        /**
         * clears the shopperContext
         * @param pCallback - callback function
         */
        clearShopperContext: function(pCallback){
          var shopperContext =  ShopperContextViewModel.getInstance();
          if(shopperContext.isExternalContext()){
            spinner.create(this.spinnerOptions);
            var populatePLGandCatalogData = shopperContext.populatePLGandCatalogData.bind(shopperContext, pCallback)
            shopperContext.getOrderDynamicPropertiesWithDefaultValues(populatePLGandCatalogData);
          }else{
            if(pCallback){
              pCallback();
            }
          }
        },

        /**
         * Function to call perform search method of customerSearchViewModel.
         */
        customerSearch: function(page) {
            
          var self = this;
          if(!self.isSearchEnabled()){
            spinner.destroy();
            return;
          }
          spinner.create(this.spinnerOptions);
          var data = {};
          if(AgentConfiguration.isTextSearchEnabled()) {
              //Text Search Query
              data = self.getSearchCriteria();
            }
            else {
              // SCIM search Query.
              data.q = self.getSearchQuery();
              data.queryFormat = CCConstants.PARAM_QUERY_FORMAT_SCIM;
              data.limit = 20;
              data.sort = "id" + ':' + "desc";
              data.includeOrderDetails = true;
            }
          
          this.customerSearchViewModel.performSearch(0, data, this.createSpinnerCallBack.bind(this),this.destroySpinnersCallBack.bind(this), this.onSearchFailure.bind(this));
        },

        /**
         * Search failure callback.
         */
        onSearchFailure: function (pResult) {
          var returnCodeLabel = CCi18n.t('ns.common:resources.returnCodeLabel');
          var errorMessage = pResult.message + returnCodeLabel + ':' + pResult.errorCode;
          notifier.sendError(pResult.code, errorMessage, true);
        },

        /**
         * To destroy spinners.
         */
        destroySpinnersCallBack: function() {
          spinner.destroy();
        },
        
        createSpinnerCallBack: function() {
          spinner.create(this.spinnerOptions);
        },
        
        /**
         * Function to reset customer search fields.
         */
        reset: function () {
          var self = this;
          self.firstName('');
          self.lastName('');
          self.email('');
          self.postalCode('');
          self.phoneNumber('');
          self.account('');
          self.officeNumber('');
          self.accountNumber('');
          /*rahul 13/09*/
          
          // ComboBox accepts only array to set as a value of selected account.
          self.accountNameSelected([]);
          self.isEditPhone = ko.observable(false);
          /*rahul 13/09*/
          self.isEditoffice = ko.observable(false);
          
          // To reset the account-search element dropdown.
          $.Topic(pubsub.topicNames.SEARCH_RESET).publishWith(self, []);
        },
        
        /**
         * Function to create search criteria.
         * 
         * @property {<string>} id.
         * @property {<string>} firstName.
         * @property {<string>} lastName.
         * @property {<string>} email.
         * @property {<string>} postalCode.
         * @property {<string>} phoneNumber.
         * @property {<string>} account.
         * @property {<string>} officeNumber.
         * @property {<string>} accountNumber.
         */
        initCustomerSearchCriteria: function (pId, pFirstName, pLastName, pEmail,
            pPostalCode, pPhoneNumber, pAccount, pOfficeNumber,pAccountNumber) {
          var self = this;
          self.firstName = ko.observable(pFirstName || '');
          self.lastName = ko.observable(pLastName || '');
          self.email = ko.observable(pEmail || '');
          self.postalCode = ko.observable(pPostalCode || '');
          self.phoneNumber = ko.observable(pPhoneNumber || '');
          self.account = ko.observable(pAccount || '');
          self.officeNumber = ko.observable(pOfficeNumber || '');
          self.accountNumber = ko.observable(pAccountNumber || '');
          self.accountNameSelected = ko.observableArray([]);
          
          
          self.isEditPhone = ko.observable(false);
          self.isEditPhone.subscribe(function(newValue) {
          if(!newValue) {
              self.phoneNumber(self.phoneNumber().replace(/[^0-9]+/g, ''));
            }
          });
          /*rahul 13/09*/
          self.isEditOffice = ko.observable(false);
          self.isEditOffice.subscribe(function(newValue) {
          if(!newValue) {
              self.officeNumber(self.officeNumber().replace(/[^0-9]+/g, ''));
            }
          });

          // Clear the header details set if any in agent context header
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_ORGANIZATION_ID);
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_AGENT_CONTEXT);
        },

        /**
         * Function to update selected account name of 'account-search' element dropdown.
         * For initial load of element, update the selected account name with the search criteria value.
         */
        handleAccountSearchValueUpdate: function (data, pInitialLoad) {
          var self = this;
          if (pInitialLoad && self.customerSearchViewModel.searchCriteria.account) {
            self.elements["account-search"].accountSearchValue(self.customerSearchViewModel.searchCriteria.account);
          } else {
            data = data ? self.accountNameSelected([data]) : self.accountNameSelected([]);
          }
        },

        /**
         * Function to return search criteria JSON object for TextSearch
         */
        getSearchCriteria : function () {
          var self = this;
          var searchFields = {};
          var searchFieldNames = [CCConstants.PROFILE_FIRST_NAME,
                 CCConstants.PROFILE_LAST_NAME,
                 CCConstants.PROFILE_EMAIL,
                 CCConstants.PROFILE_POSTAL_CODE,
                 CCConstants.PROFILE_PHONE_NUMBER,
                 CCConstants.PROFILE_OFFICE_NUMBER];
          var searchFieldValues = [self.firstName(),
                 self.lastName(),
                 self.email(),
                 self.postalCode(),
                 self.phoneNumber(),
                 self.officeNumber(),
                 self.accountNumber()];

          var noOfFields = searchFieldNames.length;
          for (var fieldIndex = 0; fieldIndex < noOfFields; fieldIndex++) {
            if(searchFieldValues[fieldIndex]) {
              searchFields[searchFieldNames[fieldIndex]] = searchFieldValues[fieldIndex];
            }
          }

          if(self.accountNameSelected() && self.accountNameSelected().length) {
            searchFields[CCConstants.PROFILE_ACCOUNT]=self.accountNameSelected()[0];
          }

          return searchFields;
        },

        /**
         * returns the site name and site production url based 
         * on the site selection 
         * @name formatSiteText
         * @param - {object} 
         * 		pSite - Site object
         */
        formatSiteText : function(pSite) {
          var self = this;
          return AgentUtils.formatSiteText(pSite);
        },

        /** 
         * @funtion
         * @name #isSiteExists
         * returns if the site exists for the given order
         * on the site selection 
         * @name isSiteExists
         * @param - {object} 
         * 		pData - Order object
         */
        isSiteExists : function(pData) {
          return AgentUtils.doesSiteExist(pData.siteId);
        },

        /**
         * Function to enable or disable search button.
         */
        isSearchEnabled : function() {
          if (this.firstName() || this.lastName() || this.email() || this.postalCode() || this.phoneNumber()  || this.accountNameSelected()[0] || this.officeNumber() || this.accountNumber()) {
            return true;
          }
          return false;
        },
        

        /**
         * Function to get SCIM search query.
         * This function constructs SCIM search query.
         * Example: if firstName = "kim" and phoneNumber = "7125" in search criteria
         *          Query should be: [firstName sw "kim" and allSecondaryAddresses.phoneNumber sw "7125"]
         *           Query should be: [firstName sw "kim" and allSecondaryAddresses.officeNumber sw "7125"]
         */

        getSearchQuery: function () {
          var self = this;
          var subQuery = "";
          var finalQuery = "";
          var queryList = [];
          var searchFieldNames = [CCConstants.PROFILE_FIRST_NAME,
                                  CCConstants.PROFILE_LAST_NAME,
                                  CCConstants.PROFILE_EMAIL,
                                  CCConstants.SCIM_POSTAL_CODE,
                                  CCConstants.SCIM_PHONE_NUMBER,
                                  CCConstants.SCIM_OFFICE_NUMBER];
          var searchFieldValues = [self.firstName(),
                                  self.lastName(),
                                  self.email(),
                                  self.postalCode(),
                                  self.phoneNumber(),
                                  self.officeNumber(),
                                  self.accountNumber()];
          var noOfFields = searchFieldNames.length;
          for (var fieldIndex = 0; fieldIndex < noOfFields; fieldIndex++) {
            if(searchFieldValues[fieldIndex]) {
              subQuery = searchFieldNames[fieldIndex] + CCConstants.BLANK_SPACE + "sw \"" + searchFieldValues[fieldIndex] + "\"";
              queryList.push(subQuery);
            }
          }
          if(self.accountNameSelected() && self.accountNameSelected().length) {
            subQuery = CCConstants.LEFT_PARENTHISIS + CCConstants.SCIM_PARENT_ORGANIZATION_NAME + CCConstants.BLANK_SPACE + "sw \"" +  
                                                         self.accountNameSelected()[0] + "\"" + CCConstants.OR_TEXT + 
                                                         CCConstants.BLANK_SPACE + CCConstants.SCIM_SECONDARY_ORGANIZATION_NAME + CCConstants.BLANK_SPACE + "sw \""  + 
                                                         self.accountNameSelected()[0] + "\""+ CCConstants.RIGHT_PARENTHISIS;
            queryList.push(subQuery);
          }
          finalQuery = self.andBuilder(queryList);
          return finalQuery;
        },

        /**
         * Builder function which appends 'and' for each query in the list and returns a final query.
         * Example : queryList = [test1, test2];
         * output : "test1 and test2";
         */
        andBuilder: function(pQueryList) {
          var self = this;
          var finalQuery = '';
          pQueryList.forEach(function(query, index) {
            if(index) {
              finalQuery = finalQuery + CCConstants.BLANK_SPACE + CCConstants.AND_TEXT + CCConstants.BLANK_SPACE + query;
            } else {
              finalQuery = query;
            }
          });
          return finalQuery;
        },


        /**
         * Function to display the hypher link text based on the incomplete order
         * and sites.
         *
         * @name generateOrderText
         * @param widget widget view of the present 
         */
        generateOrderText: function (widget, pProfileDetail) {
          var self = widget;

          self.isCreateOrderEnabled(false);
          if( SiteListingViewModel.activeSites().length == 1 ) {
            // a B2C user
            if (! self.isB2BUser(pProfileDetail)){
              if(pProfileDetail.hasIncompleteOrder){
                return widget.resources().completeOrderText;
              }
              else {
                self.isCreateOrderEnabled(true);
                return widget.resources().createText;
              }
            }else {                  //B2B user with 1 site
              var numOfOrganization = self.getProfileOrganizationsCount(
              pProfileDetail, false);
              if(numOfOrganization == 1){
                if(pProfileDetail.hasIncompleteOrder) {
                  return widget.resources().completeOrderText;
                }else {
                  self.isCreateOrderEnabled(true);
                  return widget.resources().createText;
                }
              }
            }
          }
          return widget.resources().selectCartLink;
        },
        
        /**
         * Function to return the organizations Count. We might have to change the logic when the 
         * decison is made to consider all or only active accounts and hence created as a separate
         * method.
         *
         * @name getProfileOrganizationsCount
         */
        getProfileOrganizationsCount: function(pProfileDetail, allAccounts){
          var count = (pProfileDetail.parentOrganization && (allAccounts || pProfileDetail.parentOrganization.active)) ? 1 : 0;
          var secondaryOrganizations = [];
          if(pProfileDetail.secondaryOrganizations){
            pProfileDetail.secondaryOrganizations.forEach(function(element){
            if(allAccounts || element.active){
              secondaryOrganizations.push(element.name);
            }
          });
          }
          
          count = count + (secondaryOrganizations ? secondaryOrganizations.length : 0);
          return count;
        },
        
        /**
         * Function to be invoked when the order of a particular user is clicked
         * @param <Object> data Object containing profile details
         * @param <String> pOrderId Clicked Order Id
         */
        clickOrderDetails: function (data, pOrderId) {
          var widget = this;
          widget.contextManager.getInstance().setSelectedSite(data.latestOrderSiteId);
          widget.contextManager.getInstance().setShopperProfileId(data.profileDetail ? data.profileDetail.id : data.id);
          widget.user().navigateToPage(this.links().AgentOrderDetails.route+"/"+pOrderId);
          return false;
        },
        
        /**
         * Function to be invoked when the orders of a particular user is clicked to 
         * load order history page for that user
         * @param <Object> data Object containing profile details
         * @param <String> pOrderId Clicked Order Id
         */
        clickOrders: function (data) {
          var widget = this;
          var customerId = data.profileDetail ? data.profileDetail.id : data.id;
          widget.contextManager.getInstance().setShopperProfileId(customerId);
          widget.user().navigateToPage(widget.links().agentOrderHistory.route+ "?customerId="+customerId);
          return false;
        },
        
        /**
         * Function to navigate to the checkout page 
         */
        loadCheckoutPage: function (pProfileData) {
          var widget = this;
          var navigateToCheckout = function () {
            var context = widget.contextManager.getInstance().export();//JSON.stringify(widget.contextManager.getInstance().export());
            var url = widget.links().agentCheckout.route;
            url = url+'?context='+ encodeURIComponent(context);
            widget.user().navigateToPage(url);
          }
          if(pProfileData.hasIncompleteOrder) {
            var data = {};
            data.profileId = pProfileData.id;
            // Update the shopperProfileId in AgentContext
            widget.contextManager.getInstance().setShopperProfileId(pProfileData.id);
            data.status = "incomplete";
            CCRestClient.request(CCConstants.ENDPOINT_ORDERS_SEARCH, data, 
              function(pData) {
                widget.contextManager.getInstance().setPriceListGroup(pData.priceListGroup.id);
                navigateToCheckout();
              },
              function(pError) {
                notifier.sendError(widget.widgetId(), pError.message, true);
              }
            );
          } else {
            navigateToCheckout();
          }
          return false;
        },
        
        /**
         * Function to navigate to profile page
         * @param <Object> data Object containing profile details
         */
        clickProfileDetails: function (data) {
          var widget = this;
          AgentContextManager.getInstance().setShopperProfileId(data.id);
          this.populateOrganizations(data);
          if(data.parentOrganization && data.parentOrganization.active){
            AgentUtils.addToStorage(CCConstants.LOCAL_STORAGE_ORGANIZATION_ID, data.parentOrganization.repositoryId);
          }else {
            AgentUtils.addToStorage(CCConstants.LOCAL_STORAGE_ORGANIZATION_ID, null);
            widget.user().currentOrganization(null);
            widget.user().rolesForCurrentOrganization([]);
          }
          widget.user().navigateToPage(widget.links().agentCustomerDetails.route + "?customerId="+data.id);
          return false;
        },

        isB2BUser: function(pData){
          var self = this;
          return (pData.profileType && pData.profileType == 'b2b_user');
        },
        
        /**
         * Displays the order details for a particular user
         * @param <Object> pCustomerDetails Customer Details of the particular customer
         * @param <boolean> pHasIncompleteOrder Indicates whether a customer has incomplete orders
         * @param popUpId the id received form the popup stack
         */
        showOrderDetails:function(pCustomerDetails, pHasIncompleteOrder, popUpId){
          var self = this; 
          var activeSites = SiteListingViewModel.activeSites();
          var numOfSites = activeSites.length;
          AgentContextManager.getInstance().resetHeaders();
          self.populateOrganizations(pCustomerDetails);
          if(!pHasIncompleteOrder && self.user().priceListGroup){
            AgentContextManager.getInstance().setPriceListGroup(self.user().priceListGroup.id());
          }
          if(pCustomerDetails && pCustomerDetails.profileType == 'b2b_user' && pCustomerDetails.secondaryOrganizations.length == 0 && (pCustomerDetails.parentOrganization == null || !pCustomerDetails.parentOrganization.active)) {
            notifier.sendError(self.widgetId(), self.translate("noActiveAccountsAssociated"), true);
          } else if( popUpId == null || numOfSites == 1  && (AccountAndSiteSelector.allOrganizations() && AccountAndSiteSelector.allOrganizations().length < 2)) {
            self.contextManager.getInstance().setShopperProfileId(pCustomerDetails.id);
            self.loadCheckoutPage(pCustomerDetails);
          } else {
            if( $(popUpId + " .modal-header").children("span").length == 0) {
              var div = document.createElement('span');
              div.textContent = CCi18n.t("ns.agentcustomercartsdialog:resources.selectCart");
              div.setAttribute('class', 'pull-left select-cart-header');
              $(popUpId+" .modal-header" )[0].appendChild(div);
            }
            self.displayCustomerCarts(popUpId,pCustomerDetails, pHasIncompleteOrder);
            return; 
          }
        },
        
        /**
         * Toggles the bootstrap modal to display the dialog. 
         * Also sets the isCustomerCartsModalOpened observable to true for further loading of the template
         * @param popUpId the id received form the popup stack
         * @param pCustomerDetails details of the customer whose carts is to be displayed
         * @param pHasIncompleteOrder whether the customer has any incomplete order 
         */
        displayCustomerCarts: function(popUpId, pCustomerDetails, pHasIncompleteOrder) {
          var self = this;
          var popup = $(popUpId);
          var popUpRegionContext = ko.dataFor(popup[0]);
          var customerCartsDialogWidget = popUpRegionContext.widgets()[0];
          //set the customerId
          AgentContextManager.getInstance().setShopperProfileId(pCustomerDetails.id);
          customerCartsDialogWidget.shopperContext.clearShopperContext();
          customerCartsDialogWidget.profileDetail = pCustomerDetails;
          customerCartsDialogWidget.incompleteOrders = pHasIncompleteOrder;
          customerCartsDialogWidget.customerCartsViewModel(customerCartsDialogWidget.instantiateCustomerCartsModel());
          $(popUpId).modal('toggle');
          $(popUpId).modal('show');

          $(popUpId).on("hide.bs.modal", function() {
            // put your default event here
            customerCartsDialogWidget.showIncompleteOrders(false);
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
          }.bind(self));
        },
        
        /**
         * Populates organizations
         * @param pProfileDetail Profile object
         */
        populateOrganizations : function(pProfileDetail){
          if(pProfileDetail.profileType && pProfileDetail.profileType == 'b2b_user'){
            AccountAndSiteSelector.populateOrganizations(pProfileDetail);
          } else {
            AccountAndSiteSelector.clearOrganizationDetails();
            AccountAndSiteSelector.activeSites(SiteListingViewModel.activeSites());
          }
        },
        
        
        /**
         * Function to to return a string with comma separated values of primary organizations naem followed by 
         * secondary Organization names.
         */
        getOrganizationNamesSeparatedWith: function(pProfileDetailContext,separationCharacter) {
          var self = this;
          // true passed to retrieve all the accounts.
          var allOrganizations = AccountAndSiteSelector.getOrganizations(pProfileDetailContext,false);
          if(allOrganizations.length == 0){
            return "";
          }else if(allOrganizations.length == 1){
            return allOrganizations[0].name;
          }else {
            var organizationNamesArray = [];
            allOrganizations.forEach(function(organizationData){
              organizationNamesArray.push(organizationData.name);
            });
            if(separationCharacter){
              return organizationNamesArray.join(separationCharacter);
            }
            return organizationNamesArray.join();
          }
        }
      }
    });
