/**
 * @fileoverview Widget to get customer order history.
 */
define(

    // -------------------------------------------------------------------
    // DEPENDENCIES
    // -------------------------------------------------------------------
    [ 'knockout', 'spinner', 'ccRestClient', 'agentViewModels/order-search', 'jquery', 'pubsub', 'agentViewModels/agentUtils/agent-utils', 'agentViewModels/agent-context-manager',
      'ccConstants', 'viewModels/site-listing', 'currencyHelper', 'agentViewModels/agentConfiguration', 'notifier', 'CCi18n'],

    // -------------------------------------------------------------------
    // MODULE DEFINITION
    // -------------------------------------------------------------------
    function(ko, spinner, CCRestClient, AgentOrderSearchViewModel, $, pubsub, AgentUtils, 
             agentContextManager, CCConstants, SiteListingViewModel, currencyHelper, AgentConfiguration, notifier, CCi18n) {

      'use strict';

      /**
       * Widget to get customer order history
       */
      return {
        disableSubmittedInLastDaysField : true,
        MIN_CHARACTERS : 3,
        MAX_RESULTS : 100,
        productSearchValue : ko.observable(),
        accountSearchValue : ko.observable(),
        orderStatesMap: ko.observableArray([]),
        sites: ko.observableArray([]),
        countries: ko.observableArray([]),
        regions: ko.observableArray([]),
        spinnerOptions: {
                parent : '#page',
                posTop : '50%',
                posLeft : '50%'
            },
        onLoad : function(widget) {
          widget.initOrderSearchCriteriaViewModel();
          widget.initAdvancedSearchCriteria();

	      widget.selectedCurrency = ko.observable(currencyHelper.currencyObject());

          // Clear the AgentContextHeader and catalogId from in-memory storage.
          agentContextManager.getInstance().clearAgentContextHeader();
          // Clear the header details set if any in agent context header
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_ORGANIZATION_ID);
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_AGENT_CONTEXT);
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_SITE_ID);
          agentContextManager.getInstance().removeCatalogId();

          widget.orderSearchViewModel = new AgentOrderSearchViewModel();
          widget.orderSearchViewModel.itemsPerPage = parseInt(widget.itemsPerPage());

          var data = {};
          widget.orderSearchViewModel.loadOrderStates(data, widget.loadOrderStatesSuccess.bind(widget), widget.loadOrderStatesFailure.bind(widget));
          widget.loadOrderSites();
          var dataCountries = {
        	        sortByCode : false,
        	        regions : true
        	      };
          widget.orderSearchViewModel.loadCountries(dataCountries, widget.loadCountriesSuccess.bind(widget), widget.loadCountriesFailure.bind(widget));

          widget.timeUnits.push(widget.resources().days);
          widget.timeUnits.push(widget.resources().weeks);
          widget.timeUnits.push(widget.resources().months);

          widget.searchOptions.push(widget.resources().advancedSearchBillingAndShipping);
          widget.searchOptions.push(widget.resources().advancedSearchBilling);
          widget.searchOptions.push(widget.resources().advancedSearchShipping);

          /**
           * 'Submitted in Last' field enable/disable according to selection of startDate/endDate in advanced search.
           */
          widget.disableSubmittedInLastDaysField = ko.computed(function() {
            var self = this;
            if (self.isAdvancedSearch() && (self.startDate() || self.endDate())) {
              self.timeValueForLastOrders('');
              self.timeUnitForLastOrders(widget.resources().days);
              return false;
            } else if (!self.startDate() && !self.endDate()) {
              return true;
            }
          }, widget);
        },

        beforeAppear : function(page) {
          this.sites(SiteListingViewModel.activeSites());
          agentContextManager.getInstance().clearAgentContextHeader();
          // Clear the header details set if any in agent context header
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_ORGANIZATION_ID);
          AgentUtils.removeFromStorage(CCConstants.LOCAL_STORAGE_AGENT_CONTEXT);
        },
        
        performOrderSearch : function() {
          spinner.create(this.spinnerOptions);
          var searchCriteriaData = AgentConfiguration.isTextSearchEnabled() ? this.getTextSearchCriteria() : this.getSCIMSearchCriteria();
          this.orderSearchViewModel.performSearch(0, searchCriteriaData, this.createSpinnerCallBack.bind(this), this.distroySpinnerCallBack.bind(this), this.onSearchFailure.bind(this));
        },

        /**
         * Search failure callback.
         */
        onSearchFailure: function (pResult) {
          var widget = this;
          notifier.sendError(widget.widgetId(), pResult.message, true);
        },

        distroySpinnerCallBack: function() {
        	spinner.destroy();
        },
        
        createSpinnerCallBack: function() {
            spinner.create(this.spinnerOptions);
        },
        
        /**
         * @funtion
         * @name OrderSearchViewModel#loadOrderStatesSuccess
         * Success handler for requesting Order States.
         * 
         * @param pData
         *          {Object} the orders search response
         */
        loadOrderStatesSuccess: function(pData) {
          this.orderStatesMap(pData);
        },

        /**
         * @funtion
         * @name OrderSearchViewModel#loadOrderStatesFailure
         * Error handler for when a Order States load request fails.
         * @param pData
         *          {Object} the orders search response
         */
        loadOrderStatesFailure: function(pData) {
          var headerText = this.resources().orderStatesListingErrorText;
          var message = pData.message;
          var errorCode =  pData.errorCode;
          AgentUtils.notifyErrorMessage(headerText, message, errorCode);
        },
        
        /**
         * @funtion
         * @name OrderSearchViewModel#loadOrderSites
         * Loads all the active sites.
         */
        loadOrderSites: function() { 
          var self = this;
          SiteListingViewModel.sites.subscribe(function() {
            self.sites(SiteListingViewModel.activeSites());
          });
        },
        
        
        /**
         * @funtion
         * @name OrderSearchViewModel#loadCountriesSuccess
         * Success function for loadCountries
         * 
         * @name loadCountriesSuccess
         * @param {Object}
         *          data The data contains customer information.
         */
        loadCountriesSuccess: function (pData) {
          this.countries(pData);
        },

        /**
         * @funtion
         * @name OrderSearchViewModel#loadCountriesFailure
         * Failure function for loadCountries.
         *
         * @name loadCountriesFailure
         * @param {Object}
         *       result The response error data
         */
        loadCountriesFailure: function (pResult) {
          var headerText = this.resources().countryListingErrorText;
          var message = pResult.message;
          var errorCode =  pResult.errorCode;
          AgentUtils.notifyErrorMessage(headerText, message, errorCode);
        },
        
        /**
         * Order Search Criteria View Model
         * @name OrderSearchCriteria
         * @class OrderSearchCriteria The order search criteria view model is used to 
         * contain search criterion for both basic and advanced search.
         * 
         * @property {observableArray<string>} accountNameSelected holds the selected account name.
         * @property {observable<string>} orderId contains order id.
         * @property {observable<string>} email contains order email.
         * @property {observable<string>} firstName contains first name.
         * @property {observable<string>} lastName contains last name.
         * @property {observable<string>} account contains account.
         * @property {observable<string>} approver contains approver.
         * @property {observable<string>} selectedSite contains selected site.
         * @property {observable<string>} selectedOrderState contains selected order state.
         * @property {observable<string>} skuId contains sku Id.
         * @property {observable<string>} productId contains product Id.
         * @property {observable<string>} timeValueForLastOrders.
         * @property {observable<string>} timeUnitForLastOrders.
         * @property {observable<string>} phone contains phone number.
         * @property {observable<string>} isEditPhone contains boolean.
         * @property {observable<object>} advancedSearchCriteria contains advancedSearchCriteria.
         * @property {observable<string>} isAdvancedSearch contains boolean.
         * @property {observable<string>} isTimeSpanEntered contains boolean.
         * @property {observableArray<string>} timeUnits contains weeks, days, month values.
         */
        initOrderSearchCriteriaViewModel: function () {
          var self = this;
          self.accountNameSelected = ko.observableArray([]);
          self.orderId = ko.observable('');
          self.email = ko.observable('');
          self.firstName = ko.observable('');
          self.lastName = ko.observable('');
          self.account = ko.observable('');
          self.approver = ko.observable('');
          self.selectedSite = ko.observable('');
          self.selectedOrderState = ko.observable('');
          self.skuId = ko.observable('');
          self.productId = ko.observable('');
          self.timeValueForLastOrders = ko.observable('');
          self.timeUnitForLastOrders = ko.observable('');
          self.phone = ko.observable('');
          self.isEditPhone = ko.observable(false);
          self.isAdvancedSearch = ko.observable(false);
          self.timeUnits = [];

          //Time Value Validation
          self.timeValueForLastOrders.extend({ 
            pattern: {
              params: "^[0-9]",
              message: self.resources().timeValueValidationMessage
            },
            max: {
              params: CCConstants.SEARCH_CREATED_IN_LAST_FIELD_MAXIMUM_VALUE,
              message: self.resources().maxCreatedInLastValidationMsg
            }
          });

          self.isEditPhone.subscribe(function(newValue) {
            if(!newValue) {
              self.phone(self.phone().replace(/[^0-9]+/g, ''));
            }
          });
        },
        
        //This function will update the producId from product-search element
        updateProductId: function (itemId) {
          this.productId(itemId);
        },

        /**
         * Returns true if the search criteria contains createdWithin field.
         */
        isTimeSpanEntered: function() {
          if (this.timeValueForLastOrders()) { 
            return true;
          }
          return false;
        },

        /**
         * Function to update selected account name of 'account-search' element dropdown.
         * For initial load of element, update the selected account name with the search criteria value.
         */
        handleAccountSearchValueUpdate: function (data, pInitialLoad) {
          var self = this;
          if (pInitialLoad && self.orderSearchViewModel.searchCriteria.account) {
            self.elements["account-search"].accountSearchValue(self.orderSearchViewModel.searchCriteria.account);
          } else {
        	data = data ? self.accountNameSelected([data]) : self.accountNameSelected([]);
          }
        },

        /**
         * Order Search Criteria View Model --> AdvancedSearchCriteria
         * @name AdvancedSearchCriteria
         * @class AdvancedSearchCriteria Holds the different Advanced Search Criteria to be used for
         * searching the orders.
         * 
         * @property {observable<string>} startDate contains start date.
         * @property {observable<boolean>} isStartDateValid contains boolean.
         * @property {observable<string>} endDate contains end date.
         * @property {observable<boolean>} isEndDateValid contains boolean.
         * @property {observable<string>} endDate contains end date.
         * @property {observable<string>} searchType contains search tsype.
         * @property {observable<string>} firstName contains end first name.
         * @property {observable<string>} lastName contains last nsame.
         * @property {observable<string>} country contains country.
         * @property {observable<string>} addressLine1 contains addressLine1.
         * @property {observable<string>} addressLine2 contains addressLine2.
         * @property {observable<string>} city contains city.
         * @property {observable<string>} state contains state.
         * @property {observable<string>} postalCode contains postalCode.
         * @property {observable<Array>} searchOptions contains search options.
         * 
         */
        initAdvancedSearchCriteria: function() {
          var self = this;
          self.startDate = ko.observable();
          self.isStartDateValid = ko.observable(true);
          self.endDate = ko.observable();
          self.isEndDateValid = ko.observable(true);
          self.searchType = ko.observable(self.resources().advancedSearchBillingAndShipping);
          self.billingFirstName = ko.observable('');
          self.billingLastName = ko.observable('');
          self.country = ko.observable('');
          self.addressLine1 = ko.observable('');
          self.addressLine2 = ko.observable('');
          self.city = ko.observable('');
          self.state = ko.observable('');
          self.postalCode = ko.observable('');
          self.searchOptions = [];
          self.startDate.subscribe(self.validateStartDate.bind(self));
          self.endDate.subscribe(self.validateEndDate.bind(self));
          

          /**
           * Listen for changes to selectedCountry.
           */
          self.country.subscribe(function(newValue) {
            if(newValue) {
              var countryLength = self.countries().length;
              for(var countryIndex=0; countryIndex <= countryLength; countryIndex++) {
                if(newValue == self.countries()[countryIndex].countryCode) {
                  self.regions(self.countries()[countryIndex].regions);
                  break;
                }
              }
            } else {
              self.regions([]);
            }
          });
        },
        

        /**
         * @funtion
         * @name OrderSearchViewModel#toggleAdvancedSearch
         * Used to show or hide the Advanced Search form and change the icon
         * accordingly.
         */
        toggleAdvancedSearch: function() {
          if (this.isAdvancedSearchEnabled()) {
            this.setAdvancedSearchFlag(false);
          } else {
            this.setAdvancedSearchFlag(true);
          }
        },
        

        /**
         * Callback function for start date optionChange event
         * Used to display and clear validation message
         */
        validateStartDate: function(pEvent, pData) {
          var self = this;
          if(pData && pData.value && (pData.value.length > 0)) {
            if(pData.value[0].severity === 4){
              self.isStartDateValid(false);
            }
            else {
              self.isStartDateValid(true);
            }
          }
          else {
            self.isStartDateValid(true);
          }
        },

        /**
         * Callback function for end date optionChange event
         * Used to display and clear validation message
         */
        validateEndDate: function(pEvent, pData) {
          var self = this;
          if(pData && pData.value && (pData.value.length > 0)) {
            if(pData.value[0].severity === 4) {
              self.isEndDateValid(false);
            }
            else {
              self.isEndDateValid(true);
            }
          }
          else {
            self.isEndDateValid(true);
          }
        },
        
        /**
         * Gets the Text search criteria.
         */
        getTextSearchCriteria: function() {
          var self = this;
          var searchCriteria = self.getBasicSearchCriteria();
          searchCriteria[CCConstants.LIMIT] = this.orderSearchViewModel.itemsPerPage;
          searchCriteria[CCConstants.REQUIRE_COUNT] = false;
          return searchCriteria;
        },
        
        /**
         * Gets the search criteria for basic search.
         */
        getBasicSearchCriteria: function() {
          var searchFields = {};
          if (this.orderId()) {
            searchFields[CCConstants.ORDER_ID] = this.orderId();
          }
          if (this.firstName()) {
            searchFields[CCConstants.PROFILE_FIRST_NAME] = this.firstName();
          }
          if (this.lastName()) {
            searchFields[CCConstants.PROFILE_LAST_NAME] = this.lastName();
          }
          if (this.accountNameSelected()[0]) {
              searchFields[CCConstants.ORDER_ACCOUNT] = this.accountNameSelected()[0];
          }
          if (this.approver()) {
              searchFields[CCConstants.APPROVER] = this.approver();
          }
          if (this.email()) {
            searchFields[CCConstants.PROFILE_EMAIL] = this.email();
          }
          if (this.selectedSite()) {
            searchFields[CCConstants.SITE_ID] = this.selectedSite();
          }
          
          if (this.selectedOrderState()) {
            searchFields[CCConstants.ORDER_STATE] = this.selectedOrderState();
          }
          
          
          if (this.skuId()) {
            searchFields[CCConstants.SKU_ID] = this.skuId();
          }
          if (this.productId()) {
            searchFields[CCConstants.PRODUCT_ID] = this.productId();
          }
          if(this.isTimeSpanEntered()) {
            var startDate = this.getStartDateFromTimeSpan();

            //Setting the start time and end time of the particular days and also removing time zone offset
            //because toISOString() adds a timezone offset to GMT (browser time) 
            startDate.setHours(0, -startDate.getTimezoneOffset(), 0, 0);

            searchFields[CCConstants.ORDER_SEARCH_START_DATE] = startDate.toISOString();
          }
          if (this.phone()) {
              searchFields[CCConstants.ADDRESS_PHONE] = this.phone();
          }
          if(this.isAdvancedSearch()) {
            searchFields = this.getAdvancedSearchCriteria(searchFields);
          }

          return searchFields;
        },


        /**
         * Gets the search criteria for both advanced search.
         */
        getAdvancedSearchCriteria: function(searchFields) {
          var fieldPrefix = {};
          var self = this;

          if (self.startDate()) {
            //Input to be a date object and not a string.
            var startDate = new Date(self.startDate());
            if(!isNaN(startDate)) {
              startDate.setHours(0, 0, 0, 0);
              searchFields[CCConstants.ORDER_SEARCH_START_DATE] = startDate.toISOString();
            }
          }
          if (self.endDate()) {
            //Input to be a date object and not a string.
            var endDate = new Date(self.endDate());
            if(!isNaN(endDate)) {
              endDate.setHours(23, 59, 59, 0);
              searchFields[CCConstants.ORDER_SEARCH_END_DATE] = endDate.toISOString();
            }
          }

          if (self.searchType() === self.searchOptions[0]) {
            fieldPrefix = [CCConstants.BILLING, CCConstants.SHIPPING];
          } else if (self.searchType() === self.searchOptions[1]) {
            fieldPrefix = [CCConstants.BILLING];
          } else if (self.searchType() === self.searchOptions[2]) {
            fieldPrefix = [CCConstants.SHIPPING];
          }

          var searchFieldNames = [CCConstants.ADDRESS_FIRST_NAME,
                                  CCConstants.ADDRESS_LAST_NAME,
                                  CCConstants.ADDRESS_ADDRESS_LINE1,
                                  CCConstants.ADDRESS_ADDRESS_LINE2,
                                  CCConstants.ADDRESS_CITY, 
                                  CCConstants.ADDRESS_COUNTRY,
                                  CCConstants.ADDRESS_STATE,
                                  CCConstants.ADDRESS_POSTAL_CODE];

          var searchFieldValues = [self.billingFirstName(), self.billingLastName(),
                                   self.addressLine1(), self.addressLine2(), 
                                   self.city(), self.country(), 
                                   self.state(), self.postalCode()];

          var noOfFields = searchFieldNames.length;
          for (var fieldIndex = 0; fieldIndex < noOfFields; fieldIndex++) {
            if (searchFieldValues[fieldIndex]) {
              var noOfPrefixes = fieldPrefix.length;
              var searchKey = '';
              for (var prefixIndex = 0; prefixIndex < noOfPrefixes; prefixIndex++) {
                if (prefixIndex) {
                  searchKey = searchKey + ',';
                }
                searchKey = searchKey + fieldPrefix[prefixIndex] + searchFieldNames[fieldIndex];
              }
              searchFields[searchKey] = searchFieldValues[fieldIndex];
            }
          }
          return searchFields;
        },

        /**
         * Resets the advanced search fields.
         */
        resetAdvancedSearchFields: function() {
          var self = this;
          self.startDate('');
          self.endDate('');
          self.searchType(self.resources().advancedSearchBillingAndShipping);
          self.billingFirstName('');
          self.billingLastName('');
          self.addressLine1('');
          self.addressLine2('');
          self.city('');
          self.country('');
          self.state('');
          self.postalCode('');
        },
        

        /**
         * Resets the basic search fields.
         */
        resetBasicSearch: function() {
          this.orderId('');
          this.email('');
          this.firstName('');
          this.lastName('');
          this.accountNameSelected([]);
          this.approver('');
          this.selectedSite('');
          this.selectedOrderState('');
          this.timeValueForLastOrders('');
          this.timeUnitForLastOrders(this.resources().days);
          this.skuId('');
          this.productId('');
          this.phone('');

          if (this.isAdvancedSearch()) { 
            this.resetAdvancedSearchFields();
          }
          
          // To reset the account-search element dropdown.
          $.Topic(pubsub.topicNames.SEARCH_RESET).publishWith(this, []);
          if(this.elements['product-search']) {
            this.elements['product-search'].resetSearch();
          }
        },

        /**
         * Returns true if any advanced search criteria is present.
         */
        hasAdvancedSearchCriteriaInfo: function() {
          var self = this;
          if (self.startDate() || 
              !self.isStartDateValid() || 
              !self.isEndDateValid() ||
              self.endDate() ||
              self.billingFirstName() ||
              self.billingLastName() ||
              self.addressLine1() ||
              self.addressLine2() ||
              self.city() ||
              self.country() ||
              self.state() ||
              self.postalCode()) { 
            return true; 
          }
          return false;
        },
        

        /**
         * Returns true if any basic search criteria is present.
         */
        hasBasicCriteriaInfo: function() {
          if (this.firstName() ||
              this.orderId() ||
              this.email() ||
              this.lastName() ||
              this.accountNameSelected()[0] ||
    	  this.approver() ||
    	  this.selectedSite() ||
    	  this.selectedOrderState() ||
              this.timeValueForLastOrders() ||
              this.skuId() ||
              this.productId() ||
              this.phone()) { 
            return true; 
          } else if (this.isAdvancedSearch() && this.hasAdvancedSearchCriteriaInfo()) {
            return true;
          }
          return false;
        },
        
        
        /**
         * Returns true if the entered search criteria is valid.
         */
        isValid: function() {
          if (!(this.isStartDateValid() && this.isEndDateValid())) {
            return false;
          }
          if (this.timeValueForLastOrders.isValid()) { 
            return true;
          }
          return false;
        },

        /**
         * Sets the advanced search flag according to passed value.
         * 
         *@param value : a boolean value that needs to be set.
         */
        setAdvancedSearchFlag: function(pValue) {
          this.isAdvancedSearch(pValue);
        },

        /**
         * Returns whether the advanced search is enabled.
         */
        isAdvancedSearchEnabled: function() {
          return this.isAdvancedSearch();
        },

        /**
         * Returns the start date from time span entered in search.
         */
        getStartDateFromTimeSpan: function() {
           var startDate = new Date();
            if (this.timeUnitForLastOrders() === this.timeUnits[0]) {
                startDate.setDate(startDate.getDate() - this.timeValueForLastOrders());
              } else if (this.timeUnitForLastOrders() === this.timeUnits[1]) {
                startDate.setDate(startDate.getDate() - (7 * this.timeValueForLastOrders()));
              } else if (this.timeUnitForLastOrders() === this.timeUnits[2]) {
                startDate.setMonth(startDate.getMonth() - this.timeValueForLastOrders());
              }
            return startDate;
        },

        /**
         * @funtion
         * @name #formatSiteText returns the site name and site production url based on the site selection
         * @name formatSiteText
         * @param - {object} pSite - Site object
         */
        formatSiteText : function(pSite) {
          return AgentUtils.formatSiteText(pSite);
        },

        /**
         * @funtion
         * @name #enableSearchButton Used to enable the Search Button when there are no errors in the search fields
         */
        enableSearchButton : function() {
          var self = this;
          if (self.hasBasicCriteriaInfo() && self.isValid()) {
            return true;
          }
          return false;
        },

        /**
         * @funtion
         * @name #enableResetButton Used to enable the Reset Button.
         */
        enableResetButton : function() {
          var self = this;
          if (self.hasBasicCriteriaInfo()) {
            return true;
          }
          return false;
        },
        
        /**
         * Gets the SCIM search criteria.
         */
        getSCIMSearchCriteria: function() {
          var self = this;
          var data = {};
          //To Do:
          var orderStatesMap = {"APPROVED":"Approved","PROCESSING":"Being processed","AGENT_REJECTED":"Cancelled by agent","FAILED":"Failed","NO_PENDING_ACTION":"Fulfilled","PENDING_APPROVAL":"Pending approval","PENDING_PAYMENT":"Pending payment","PENDING_REMOVE":"Pending removal","PENDING_CUSTOMER_RETURN":"Pending return from customer","QUOTE_REQUEST_FAILED":"Quote Request failed","FAILED_APPROVAL":"Rejected","REMOVED":"Removed","SUBMITTED":"Submitted to fulfillment","QUOTED":"This order is a quote","REJECTED_QUOTE":"This quote has been rejected","PENDING_QUOTE":"This quote is pending"}
          data.q = self.getSCIMBasicSearchCriteria(orderStatesMap);
          data.queryFormat = CCConstants.PARAM_QUERY_FORMAT_SCIM;
          data.limit = 20;
          data.sort = "submittedDate" + ':' + "desc";
          data.fields = "id,priceGroupId,siteId,submittedDate,state,profile,priceInfo,payShippingInSecondaryCurrency,payTaxInSecondaryCurrency,secondaryCurrencyCode,organization";
          return data;
        },
        

        /**
         * Gets the SCIM search criteria for basic search.
         * This function constructs SCIM search query.
         * Example: if firstName = "kim" and orderId = "o12457" in search criteria
         *          Query should be: [profile.firstName sw "kim" and id sw "o12457"]
         */
        getSCIMBasicSearchCriteria: function(pOrderStatesMap) {
          var self = this
          var queryList = [];
          var searchQuery;
          var searchFieldNames = [CCConstants.SCIM_EMAIL,
                                  CCConstants.SCIM_ORDER_PHONE_NUMBER,
                                  CCConstants.SCIM_FIRST_NAME,
                                  CCConstants.SCIM_LAST_NAME,
                                  CCConstants.SCIM_ORDER_ID,
                                  CCConstants.SITE_ID,
                                  CCConstants.SCIM_PRODUCT_ID,
                                  CCConstants.SCIM_SKU_ID,
                                  CCConstants.SCIM_ACCOUNT];
          var searchFieldValues = [self.email(), self.phone(),
                                   self.firstName(), self.lastName(),
                                   self.orderId(), self.selectedSite(),
                                   self.productId(), self.skuId(),
                                   self.accountNameSelected()[0]];

          var noOfFields = searchFieldNames.length;
          for (var fieldIndex = 0; fieldIndex < noOfFields; fieldIndex++) {
            if(searchFieldValues[fieldIndex]) {
              searchQuery = searchFieldNames[fieldIndex] + CCConstants.BLANK_SPACE + "sw \"" + searchFieldValues[fieldIndex] + "\"";
              queryList.push(searchQuery);
            }
          }
          // if order state is not selected in search criteria then we need to search in only the states that are searchable.
          if(!self.selectedOrderState()) {
            var orderStatesList = Object.keys(pOrderStatesMap);
            var stateQuery = "";
            orderStatesList.forEach(function(orderState, index) {
              var subQuery = CCConstants.SCIM_STATUS  + CCConstants.BLANK_SPACE + "eq \"" + orderState + "\"";
              if(index) {
                stateQuery = stateQuery + CCConstants.BLANK_SPACE +  CCConstants.OR_TEXT + CCConstants.BLANK_SPACE + subQuery;
              } else {
                stateQuery = subQuery;
              }
            });
            stateQuery = CCConstants.LEFT_PARENTHISIS  + stateQuery + CCConstants.RIGHT_PARENTHISIS;
            queryList.push(stateQuery);
          } else {
            searchQuery = CCConstants.SCIM_STATUS + CCConstants.BLANK_SPACE + "eq \"" + self.selectedOrderState() + "\"";
            queryList.push(searchQuery);
          }
          if (self.approver()) {
             searchQuery = CCConstants.LEFT_PARENTHISIS +  CCConstants.SCIM_APPROVER_FIRST_NAME + CCConstants.BLANK_SPACE + "sw \"" +  self.approver() + "\""
                             + CCConstants.BLANK_SPACE + CCConstants.OR_TEXT + CCConstants.BLANK_SPACE + CCConstants.SCIM_APPROVER_LAST_NAME + CCConstants.BLANK_SPACE + "sw \"" + self.approver() + "\"" + CCConstants.RIGHT_PARENTHISIS;
             queryList.push(searchQuery);
          }
          if(self.isTimeSpanEntered()) {
            var startDate = self.getStartDateFromTimeSpan();
            //Setting the start time and end time of the particular days and also removing time zone offset
            //because toISOString() adds a timezone offset to GMT (browser time)
            startDate.setHours(0, -startDate.getTimezoneOffset(), 0, 0);
            searchQuery = CCConstants.SUBMITTED_DATE + CCConstants.BLANK_SPACE + "ge \"" + startDate.toISOString() + "\"";
            queryList.push(searchQuery);
          }

          if(self.isAdvancedSearch()) {
            queryList = self.getSCIMAdvancedSearchCriteria(queryList);
          }

          var query = self.andBuilder(queryList);
          return query;
        },
        
        /**
         * Builder function which appends 'and' for each query in the list and returns a final query.
         * Example : queryList = [test1, test2];
         * output : test1 and test2;
         */
        andBuilder: function(pQueryList) {
          var self = this;
          var finalQuery;
          pQueryList.forEach(function(query, index) {
            if(index) {
              finalQuery = finalQuery + CCConstants.BLANK_SPACE  + CCConstants.AND_TEXT + CCConstants.BLANK_SPACE +  query;
            } else {
              finalQuery = query;
            }
          });
          return finalQuery;
        },
        

        /**
        * Gets the SCIM search criteria for advanced search.
        */
        getSCIMAdvancedSearchCriteria: function(pQueryList) {
          var self = this;
          var fieldPrefix = [];

          if (self.startDate()) {
            //Input to be a date object and not a string.
            var startDate = new Date(self.startDate());
            if(!isNaN(startDate)) {
              startDate = new Date(startDate.getTime() + (startDate.getTimezoneOffset()*60000));
              startDate.setHours(0, 0, 0, 0);
              var query = CCConstants.SUBMITTED_DATE + CCConstants.BLANK_SPACE + "ge \"" + startDate.toISOString() + "\"";
              pQueryList.push(query);
            }
          }
          if (self.endDate()) {
            //Input to be a date object and not a string.
            var endDate = new Date(self.endDate());
            if(!isNaN(endDate)) {
              endDate = new Date(endDate.getTime() + (endDate.getTimezoneOffset()*60000));
              endDate.setHours(23, 59, 59, 0);
              var query = CCConstants.SUBMITTED_DATE + CCConstants.BLANK_SPACE + "le \"" + endDate.toISOString() + "\"";
              pQueryList.push(query);
            }
          }

          if (self.searchType() === self.searchOptions[0]) {
            fieldPrefix = [CCConstants.SHIPPING_GROUPS, CCConstants.PAYMENT_GROUPS];
          } else if (self.searchType() === self.searchOptions[1]) {
            fieldPrefix = [CCConstants.PAYMENT_GROUPS];
          } else if (self.searchType() === self.searchOptions[2]) {
            fieldPrefix = [CCConstants.SHIPPING_GROUPS];
          }

          var searchFieldNames = [CCConstants.FIRST_NAME_TEXT,
                                  CCConstants.LAST_NAME_TEXT,
                                  CCConstants.ORG_ADDRESS_1,
                                  CCConstants.ORG_ADDRESS_2,
                                  CCConstants.ORG_CITY,
                                  CCConstants.ORG_COUNTRY,
                                  CCConstants.STATE_ADDRESS,
                                  CCConstants.ORG_POSTAL_CODE];

          var searchFieldValues = [self.billingFirstName(), self.billingLastName(),
                                   self.addressLine1(), self.addressLine2(),
                                   self.city(), self.country(),
                                   self.state(), self.postalCode()];

          var noOfFields = searchFieldNames.length;
          for (var fieldIndex = 0; fieldIndex < noOfFields; fieldIndex++) {
            if (searchFieldValues[fieldIndex]) {
              var finalQuery = "";
              fieldPrefix.forEach(function(prefix, index) {
                var subQuery = prefix + "." + searchFieldNames[fieldIndex] + CCConstants.BLANK_SPACE + "sw \"" + searchFieldValues[fieldIndex] + "\"";
                if(index) {
                  finalQuery = finalQuery + CCConstants.BLANK_SPACE + CCConstants.OR_TEXT + CCConstants.BLANK_SPACE + subQuery;
                } else {
                  finalQuery = subQuery;
                }
              });
              finalQuery = CCConstants.LEFT_PARENTHISIS + finalQuery  + CCConstants.RIGHT_PARENTHISIS ;
              pQueryList.push(finalQuery);
            }
          }
          return pQueryList;
        },
        
        /**
         * @funtion
         * @name #productSearchSuccessCallback Handles search by product id.
         */
        productSearchSuccessCallback: function(pProductId) {
          var self = this;
          self.productId(pProductId);
          this.enableSearchButton();
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
 	    isSiteExists: function (pData){
 	      return AgentUtils.doesSiteExist(pData.siteId);
 	    },
 	    
 	    clickOrderDetails: function (data, pOrderId) {
 	      var widget = this;
 	      // This check is needed so that shopper profile is not set for anonymous user.
 	      if(data.profile && data.profile.firstName) {
 	        agentContextManager.getInstance().setShopperProfileId(data.profile.profileId);
 	      }
 	      var siteId = data.siteId;
 	      agentContextManager.getInstance().setSelectedSite(siteId);
 	      widget.user().navigateToPage(this.links().AgentOrderDetails.route+"/"+pOrderId);
 	      return false;
	    },

	    /** 
	     * returns the translatedOrder states
	     * if the submitted order in queued state, returns the default value appended with the key
	     * @param - pKey 
	     */
	    translateOrderStates: function (pKey) {
		 var widget = this;
		 var result = widget.translate(pKey);
		 if(pKey == CCConstants.QUEUED_ORDER_KEY) {
		  result = result + ' (' + pKey +')' ;
		 }
		 return result;
 	   },

     /**
         * Gets order states
         * if the submitted order in queued, the state/value will be appended with the key
         * Otherwise returns the default values
         */
     getStateLabel : function(pKey){
          return pKey == CCConstants.QUEUED_ORDER_KEY ? CCi18n.t('ns.common:resources.'+pKey) + ' (' + pKey +')' 
              : CCi18n.t('ns.common:resources.'+ pKey);
        }

      }
    });
