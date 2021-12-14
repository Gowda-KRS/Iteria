/**
 * @fileoverview Registration Request Search Widget.
 * 
 */
 define(
  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  [ 'knockout', 'CCi18n', 'ccConstants', 'viewModels/registrationRequestSearch', 'spinner'],

  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function (ko, CCi18n, CCConstants, RegistrationRequestSearchViewModel, spinner) {
  
    "use strict";
        
    return {      
      firstName: ko.observable(),
      lastName: ko.observable(),
      email: ko.observable(),
      companyName: ko.observable(),
      requestNumber: ko.observable(),
      queryParamString: "",
      currentFilterOption: ko.observable(),
      filterQuery: "",
      sortDirections: ko.observable(),
      resultListTemplate: ko.observable(),
      spinnerOptions: {
        parent : 'body',
        posTop : '50%',
        posLeft : '50%'
       },
      columnList : ko.observable(),
      
      /**
       * Widget onLoad.
       * @param {Object} widget.
       */
      onLoad: function(widget) {
    	  widget.setTableMetaData();  
        widget.filterOptions= [{
                                   value: "all",
                                   label: CCi18n.t('ns.registrationRequestSearch:resources.filterTextAll')
                                 },
                                 {
                                   value: "rejected",
                                   label: CCi18n.t('ns.registrationRequestSearch:resources.registrationRequestRejectedText')
                                 }, 
                                 {
                                   value: "moreInfoNeeded",
                                   label: CCi18n.t("ns.registrationRequestSearch:resources.registrationRequestMoreInfoText")
                                 }, 
                                 {
                                   value: "review",
                                   label: CCi18n.t("ns.registrationRequestSearch:resources.registrationRequestReviewText")
                                 }, 
                                 {
                                   value: "new",
                                   label: CCi18n.t("ns.registrationRequestSearch:resources.registrationRequestNewText")
                                 }];   
        widget.registrationRequestSearchViewModel = new RegistrationRequestSearchViewModel(widget.createSpinner.bind(widget),widget.destroySpinner.bind(widget));
        widget.currentFilterOption(widget.filterOptions[0].value);     
        // If the configuration is set by user for pagination count, use that or else use default value as  10.        
        if(widget.registrationRequestItemsPerPage && widget.registrationRequestItemsPerPage()) {
          widget.registrationRequestSearchViewModel.itemsPerPage = parseInt(widget.registrationRequestItemsPerPage());
        } else {
           widget.registrationRequestSearchViewModel.itemsPerPage = 10; 
        }
        widget.registrationOptions = [{
            value: true,
            label: CCi18n.t('ns.registrationRequestSearch:resources.accountText')
          }, {
            value: false,
            label: CCi18n.t("ns.registrationRequestSearch:resources.contactText")
          }];
        widget.registrationRequestSearchViewModel.isAccountSearch.subscribe(function(pValue) {
          widget.registrationRequestSearchViewModel.isSearchPerformed(false);
          if(pValue){
            widget.sortDirections(widget.accountRequestSortOptions);
            widget.columnList(widget.accountRequestColumnOptions);
          }else{
            widget.sortDirections(widget.contactRequestSortOptions);
            widget.columnList(widget.contactRequestColumnOptions);
          }
        })
        widget.registrationRequestSearchViewModel.isAccountSearch(true);
      },
      
      /**
       * sets the table meta data for contact and Account requests
       */
      setTableMetaData : function() {
        // sort options and column options for account requests
        this.accountRequestSortOptions = {}
        this.accountRequestSortOptions[CCConstants.REGISTRATION_REQUEST_ID] = "both";
        this.accountRequestSortOptions[CCConstants.ORG_NAME] = "both";
        this.accountRequestSortOptions[CCConstants.REGISTRATION_REQUEST_DATE] = "both";
        this.accountRequestSortOptions[CCConstants.REGISTRATION_REQUEST_STATUS] = "both";
        this.accountRequestColumnOptions = [{
          columnNameHeader : "idText",
          columnSortKey : CCConstants.REGISTRATION_REQUEST_ID,
          allowSort : true
        }, {
          columnNameHeader : "companyNameText",
          columnSortKey : CCConstants.ORG_NAME,
          allowSort : true
        }, {
          columnNameHeader : "createdTimeText",
          columnSortKey : CCConstants.REGISTRATION_REQUEST_DATE,
          allowSort : true
        }, {
          columnNameHeader : "statusText",
          columnSortKey : CCConstants.REGISTRATION_REQUEST_STATUS,
          allowSort : true
        }, ]

        // sort options and column options for contact requests
        this.contactRequestSortOptions = {}
        this.contactRequestSortOptions[CCConstants.REGISTRATION_REQUEST_ID] = "both";
        this.contactRequestSortOptions[CCConstants.SCIM_EMAIL] = "both";
        this.contactRequestSortOptions[CCConstants.SCIM_FIRST_NAME] = "both";
        this.contactRequestSortOptions[CCConstants.SCIM_LAST_NAME] = "both";
        this.contactRequestSortOptions[CCConstants.SITE_ID] = "both";
        this.contactRequestSortOptions[CCConstants.REGISTRATION_REQUEST_DATE] = "both";
        this.contactRequestSortOptions[CCConstants.REGISTRATION_REQUEST_STATUS] = "both";

        this.contactRequestColumnOptions = [ {
          columnNameHeader : "idText",
          columnSortKey : CCConstants.REGISTRATION_REQUEST_ID,
          allowSort : true
        }, {
          columnNameHeader : "emailText",
          columnSortKey : CCConstants.SCIM_EMAIL,
          allowSort : true
        }, {
          columnNameHeader : "lastNameText",
          columnSortKey : CCConstants.SCIM_LAST_NAME,
          allowSort : true
        }, {
          columnNameHeader : "firstNameText",
          columnSortKey : CCConstants.SCIM_FIRST_NAME,
          allowSort : true
        }, {
          columnNameHeader : "siteText",
          columnSortKey : CCConstants.SITE_ID,
          allowSort : false
        }, {
          columnNameHeader : "createdTimeText",
          columnSortKey : CCConstants.REGISTRATION_REQUEST_DATE,
          allowSort : true
        }, {
          columnNameHeader : "statusText",
          columnSortKey : CCConstants.REGISTRATION_REQUEST_STATUS,
          allowSort : true
        }, ]
      },
      
      /**
       * Widget beforeAppear.
       * @param {Object} page.
       */
      beforeAppear: function (page) {
      },
      
      /**
       * Redirects to the registration request details page.
       * @param {String} pId.
       * @param {Object} pData.
       * @param {Object} pEvent object.
       */
      redirectToRequestDetailsPage: function (pId, pData, pEvent) {
        var widget = this;
        if (widget.registrationRequestSearchViewModel.isAccountSearch()) {
          widget.user().navigateToPage(window.applicationContextPath+this.links().agentRegistrationRequestDetail.route+"/"+pId);
        } else {
          widget.user().navigateToPage(window.applicationContextPath+this.links().agentRegistrationRequestDetail.route+"/"
           + pId + "?"+ CCConstants.CONTACT_SEARCH_IDENTIFIER);
        }
      },
      
      /**
       * Performs the search on click of the search button.
       */
      performSearch: function() {
        var widget = this;
        widget.createSpinner();
        widget.currentFilterOption(widget.filterOptions[0].value); 
        widget.sortDirections()["createdTime"]="desc";
        widget.filterQuery = "";
        widget.queryParamString = "status ne "+"\"approved\"";
        widget.sortDirections()["createdTime"]="desc";
        if(widget.firstName()){
          if(widget.queryParamString){
            widget.queryParamString += " and "
          }
          var firstNameValue = widget.getSCIMCompatibleString(widget.firstName());
          widget.queryParamString += " profile.firstName co " + '\"' + firstNameValue + '\"' ;
        }
        if(widget.lastName()){
          if(widget.queryParamString){
            widget.queryParamString += " and "
          }
          var lastNameValue = widget.getSCIMCompatibleString(widget.lastName());
          widget.queryParamString +=  " profile.lastName co " +   '\"' + lastNameValue  + '\"';
        }
        if(widget.email()){
          if(widget.queryParamString){
            widget.queryParamString += " and "
          }
          var emailValue = widget.getSCIMCompatibleString(widget.email());
          widget.queryParamString += " profile.email co " + '\"' + emailValue  + '\"';
        }
        if(widget.requestNumber()){
          if(widget.queryParamString){
            widget.queryParamString += " and "
          }
          var requestNumberValue = widget.getSCIMCompatibleString(widget.requestNumber());
          widget.queryParamString += " id co " +'\"' + requestNumberValue + '\"' ;
        }
        if(widget.companyName()){
          if(widget.queryParamString){
            widget.queryParamString += " and "
          }
          var companyNameValue = widget.getSCIMCompatibleString(widget.companyName());
          var nameVal = widget.registrationRequestSearchViewModel.isAccountSearch() ? " name co ": " requestedOrganizationName co "
          widget.queryParamString += nameVal + '\"' + companyNameValue + '\"' ;    
        }
        
        var data = {};
        data.q = widget.queryParamString;
        data.sort = "createdTime:desc";
        widget.registrationRequestSearchViewModel.performSearch(1, data, widget.parseResponseItem.bind(widget));      
      },
      
      /**
       * Resets the data on click of the reset button.
       */
      reset: function() {
        var widget = this;
        widget.firstName('');
        widget.lastName('');
        widget.email('');
        widget.companyName('');
        widget.requestNumber('');
        widget.filterQuery = "";
        widget.registrationRequestSearchViewModel.isSearchPerformed(false); 
        widget.registrationRequestSearchViewModel.clearData();
      },
      
      /**
       * Returns SCIM compatible string.
       * @param {String} scimSearchString.
       */
      getSCIMCompatibleString: function(pScimSearchString){
         var widget = this;
         pScimSearchString = pScimSearchString.replace(/\\/g, "\\\\");
         pScimSearchString = pScimSearchString.replace(/"/g, "\\\"");
         return pScimSearchString;
      },
      
      /**
       * Parse the response item.
       * @param {Object} pItem.
       */
      parseResponseItem: function(pItem) {
        var widget = this;
        var parsedItem = {};
        parsedItem[CCConstants.REGISTRATION_REQUEST_ID] = pItem.id;
        parsedItem[CCConstants.ORG_NAME] = pItem.name;
        parsedItem[CCConstants.REGISTRATION_REQUEST_DATE] = widget.formatRegistrationRequestDate(pItem.createdTime);
        parsedItem[CCConstants.REGISTRATION_REQUEST_STATUS] = widget.getRequestStatus(pItem.status);
        parsedItem[CCConstants.REGISTRATION_REQUEST_ID] = pItem.id;
        //Add additional fields for contact requests
        if(!widget.registrationRequestSearchViewModel.isAccountSearch()){
          parsedItem[CCConstants.SCIM_EMAIL] =  pItem.profile ?  pItem.profile.email: CCi18n.t("ns.registrationRequestSearch:resources.nameNotRetainedText");
          parsedItem[CCConstants.SCIM_FIRST_NAME] = pItem.profile ? pItem.profile.firstName : CCi18n.t("ns.registrationRequestSearch:resources.nameNotRetainedText");
          parsedItem[CCConstants.SCIM_LAST_NAME] = pItem.profile ? pItem.profile.lastName : CCi18n.t("ns.registrationRequestSearch:resources.nameNotRetainedText");
          parsedItem[CCConstants.SITE_ID] = pItem.site ? (pItem.site.name ? pItem.site.name : pItem.site.id) : "";
        }
        
        //add status icons
        if(pItem.status=="rejected"){
          parsedItem.statusIcon = "fa fa-times-circle rejectedIcon"
        }else if(pItem.status=="moreInfoNeeded"){
          parsedItem.statusIcon = "fa fa-question-circle moreInfoNeededIcon"
        }
        return parsedItem;
      },
      
     /**
      * Format the date as per locale.
      * @param: {object} date string
      */
      formatRegistrationRequestDate: function(pInputDate) {
        var widget = this;
        var formattedDate = pInputDate;
        var locale = (widget.locale()) ? widget.locale() : "en";
        if(pInputDate) {
          var date = new Date(pInputDate);
          //Defaulting to localeString value
          formattedDate = date.toLocaleString();
          if (Intl && Intl.DateTimeFormat) {
            var dateFormatter = new Intl.DateTimeFormat(locale, { month: "long", day: "numeric", year: "numeric"});
            formattedDate = dateFormatter.format(date);
          }
        }
        return formattedDate;
      },
      
      /**
       * Method to get the proper locale text for Status of each
       * request
       * @param {String} Status string.
       */
      getRequestStatus: function(pStatus) {
        var status = "";
        if(pStatus) {
        switch(pStatus){
          case CCConstants.REGISTRATION_REQUEST_TYPES_REJECT:
            status = CCi18n.t('ns.registrationRequestSearch:resources.registrationRequestRejectedText');
            break;
          case CCConstants.REGISTRATION_REQUEST_TYPES_MORE_INFO_NEEDED:
            status = CCi18n.t("ns.registrationRequestSearch:resources.registrationRequestMoreInfoText");
            break;
          case CCConstants.REGISTRATION_REQUEST_TYPES_REVIEW:
            status = CCi18n.t("ns.registrationRequestSearch:resources.registrationRequestReviewText");
            break;
          case CCConstants.REGISTRATION_REQUEST_TYPES_NEW:
            status = CCi18n.t("ns.registrationRequestSearch:resources.registrationRequestNewText");
            break;
          }
        }
        return status;
      },
       
      /**
       * On filter option change
       * @param pWidget Widget instance
       * @param pEvent Event object
       */
      onFilterOptionChange: function(pWidget, pEvent) {
        var widget = this;
        widget.createSpinner();
        var filterOption = pEvent.target.value;
         
        filterOption =  (filterOption !== "all") ? (widget.queryParamString + "and status eq " +"\""+ filterOption +"\"") : widget.queryParamString;
        widget.filterQuery = filterOption;
        var data = {};
        data.q = filterOption;
        data.sort = "createdTime:desc";
        this.registrationRequestSearchViewModel.performSearch(1, data, widget.parseResponseItem.bind(widget));
      },

      /**
       * On sort icon click.
       * @param pSortItem Item on which sorting is done.
       * @param pSortOrder Ascending or descending.
       * @param pWidget Widget instance
       * @param pEvent Event object
       */
      sort: function(pSortItem, pSortOrder, pWidget, pEvent) {
        var widget = this;
        if(pEvent.type === "keyup") {
          var keyCode = (pEvent.which ? pEvent.which : pEvent.keyCode);
          if(keyCode != CCConstants.KEY_CODE_ENTER) {
            return;
          }
        }
        
        widget.createSpinner();
        widget.updateSortDirections(pSortItem, pSortOrder);
        widget.sortDirections.valueHasMutated();
        var sortParameter = pSortItem + ":" + pSortOrder;
        
        var data = {};
        if(widget.filterQuery){
          data.q = widget.filterQuery;
        } else {
          data.q = widget.queryParamString; 
        }
        data.sort = sortParameter;
        this.registrationRequestSearchViewModel.performSearch(this.registrationRequestSearchViewModel.currentPage(), data,
        widget.parseResponseItem.bind(widget));   
      },
      
      updateSortDirections : function(pSortItem, pSortOrder){
        var self = this;
        self.sortDirections()[pSortItem] = pSortOrder;
        for (var prop in self.sortDirections()) {
          if(prop !==pSortItem){
            self.sortDirections()[prop] = "both";
          } 
        }
      },
      
       /**
         * Destroy spinner.
         */
        destroySpinner: function() {
          spinner.destroy();
        },
             
        /**
         * Create spinner.
         */
        createSpinner: function() {
          spinner.create(this.spinnerOptions);
        },
    }
  }
);
