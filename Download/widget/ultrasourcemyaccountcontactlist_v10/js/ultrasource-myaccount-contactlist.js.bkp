/**
 * @fileoverview Delegated Admin Contacts List Widget.
 *
 *
 */
/*global $ */
/*global define */
define(
  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['knockout', 'pubsub', 'ccLogger', 'notifier', 'ccConstants', 'jquery', 'ccRestClient', 'navigation', 'spinner', 'viewModels/delegatedAdminContacts'],

  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko, pubsub, log, notifier, CCConstants, $, CCRestClient, navigation, spinner, DelegatedAdminContacts) {

    "use strict";

    return {
      WIDGET_ID: "delegatedAdminContacts",
      interceptedLink: null,
      contactDetailsMode: ko.observable(false),
      removedContact: ko.observable(false),	
      contactSearchValue: ko.observable(""),
      fetchSize: ko.observable(15),
      firstName: ko.observable(null),
      isFirstNameModified: false,
      contactId: ko.observable(null),
      lastName: ko.observable(null),
      isLastNameModified: false,
      emailAddress: ko.observable(null),
      isEmailAddressModified: false,
      roles: ko.observable(null),
      isRolesModified: false,
      status: ko.observable(true),
      disableActive: ko.observable(false),
      inMultipleAccounts: ko.observable(false),
      statusTranslation: ko.observable("active"),
      isStatusModified: false,
      state: ko.observable(null),
      isCurrentUser: ko.observable(false),
      delegatedAdminContactsListGrid: ko.observableArray([]),
      punchoutUserId: ko.observable(null),
      roleFilterText: ko.observable(""),
      isDelegatedAdminFormEdited: false,
      subscriptions: [],
      currentOrganizationSubscription: {},
      opDynamicProperty: ko.observable(),
      sortDirections: ko.observable({"firstName":"both","lastName":"both","email":"both"}),
      listingIndicatorOptions: {
        parent: '#CC-delegatedAdminContactsList',
        posTop: '10%',
        posLeft: '50%'
      },
      organizationRoles: ko.observableArray([]),
      organizationRolesFilterList: ko.observableArray([]),
      contactRoles: ko.observableArray([]),
      homeRoute: "",
      dynamicProperties: ko.observableArray([]),
      cachedDynamicPropertySpec: {},

      onLoad: function(widget) {
        var self = this;
        widget.isDelegatedAdminFormEdited = false;
        widget.listingViewModel = ko.observable();
        widget.listingViewModel(new DelegatedAdminContacts());
        widget.listingViewModel().fetchByRepositoryId = true;
        widget.listingViewModel().itemsPerPage = widget.fetchSize();
        widget.listingViewModel().blockSize = widget.fetchSize();
        widget.punchoutUserId(widget.user().currentOrganization() ? widget.user().currentOrganization().punchoutUserId : null);

        // Define property validation for first name.
        widget.firstName.extend({
          required: {
            params: true,
            message: widget.translate('firstNameRequired'),
          },
          maxLength: {
            params: CCConstants.REPOSITORY_STRING_MAX_LENGTH,
            message: widget.translate('maxlengthValidationMsg', {
              fieldName: widget.translate('firstNameText'),
              maxLength: CCConstants.REPOSITORY_STRING_MAX_LENGTH
            })
          }
        });

        // Define property validation for last name.
        widget.lastName.extend({
          required: {
            params: true,
            message: widget.translate('lastNameRequired'),
          },
          maxLength: {
            params: CCConstants.REPOSITORY_STRING_MAX_LENGTH,
            message: widget.translate('maxlengthValidationMsg', {
              fieldName: widget.translate('lastNameText'),
              maxLength: CCConstants.REPOSITORY_STRING_MAX_LENGTH
            })
          }
        });

        // Define property validation for email address.
        widget.emailAddress.extend({
          required: {
            params: true,
            message: widget.translate('emailAddressRequired'),
          },
          maxLength: {
            params: CCConstants.REPOSITORY_STRING_MAX_LENGTH,
            message: widget.translate('maxlengthValidationMsg', {
              fieldName: widget.translate('emailAddressText'),
              maxLength: CCConstants.REPOSITORY_STRING_MAX_LENGTH
            })
          },
          pattern: {
            params: /^([\d\w-\.]+@([\d\w-]+\.)+[\w]{2,4})?$/,
            message: widget.translate('invalidEmailAddress'),
          }
        });

        // Define property validation for roles.
        widget.roles.extend({
          required: {
            params: true,
            message: widget.translate('rolesRequired'),
          }
        });

        widget.validationModel = ko.validatedObservable({
          firstName: widget.firstName,
          lastName: widget.lastName,
          emailAddress: widget.emailAddress,
          roles: widget.roles
        });
        
        widget.delegatedAdminContactsListGrid = ko.computed(function() {
          var numElements, start, end, width;
          var rows = [];
          var orders;
            var startPosition, endPosition;
            // Get the orders in the current page
            startPosition = (widget.listingViewModel().currentPage() - 1) * widget.listingViewModel().itemsPerPage;
            endPosition = startPosition + parseInt(widget.listingViewModel().itemsPerPage,10);
            orders = widget.listingViewModel().data.slice(startPosition, endPosition);
          
          if (!orders) {
            return;
          }
          numElements = orders.length;
          width = parseInt(widget.listingViewModel().itemsPerRow(), 10);
          start = 0;
          end = start + width;
          while (end <= numElements) {
            rows.push(orders.slice(start, end));
            start = end;
            end += width;
          }
          if (end > numElements && start < numElements) {
            rows.push(orders.slice(start, numElements));
          }
          //Generating localized roleString for each user
          if(rows.length >= 0) {
            var rowsLength = rows.length;
            for(var row = 0; row < rowsLength; row++) {
              rows[row][0]["roleString"] = widget.getRoleString(rows[row][0]["roles"]);
            }
          }
          return rows;
        }, widget);

        widget.homeRoute = widget.links().home.route;
        if (window.isAgentApplication) {
          widget.homeRoute = widget.links().agentHome.route;
        }
        
        $.Topic(pubsub.topicNames.DELEGATED_CONTACTS_LIST_FAILED).subscribe(function(data) {
          if (this.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
            widget.user().handleSessionExpired();
            if (navigation.isPathEqualTo(widget.links().profile.route) || navigation.isPathEqualTo(widget.links().delegatedAdminContacts.route)) {
              navigation.doLogin(navigation.getPath(), widget.homeRoute);
            }
          } else {
        	  notifier.clearError(widget.WIDGET_ID);
              notifier.clearSuccess(widget.WIDGET_ID);
              notifier.sendError("delegatedAdminContacts", this.message ? this.message : this.translate('ListingErrorMsg'), true);
          }
        });
        if(window.isAgentApplication) {
          $.Topic(pubsub.topicNames.PAGE_CHANGED).subscribe(widget.triggerPageChangeEvent.bind(widget));
        }
      },
      
      /**
       * Called when toggle switch is operated via keyboard:
       */
      toggleSwitch: function(data, event) {
        if((event.keyCode || event.charCode) && ((event.keyCode == 13 || event.charCode == 13) || (event.keyCode == 32 || event.charCode == 32))) {
          if(this.isCurrentUser() === false)
          {
            if(this.status()) {
              this.status(false);
            }
            else if(!this.status()) {
              this.status(true);
            }
          }
          return true;
        }
        else if(event.keyCode == 9) {
          return true;
        }
      },
      
      /**
       * Called each time a contact is clicked to view the details from the contacts listing page:
       * @data : Contact information that needs to be populated 
       * @index : Index of the row object in the listing table. We will need this to refresh the table with the details later
       */
      clickContactDetails: function(data, index) {
        var widget = this;
        widget.resetContactData();
        widget.subscribeForChanges();
        if (data && data[0] !== null && data[0] !== undefined) {
          widget.contactId(data[0].repositoryId);
          widget.firstName(data[0].firstName);
          widget.lastName(data[0].lastName);
          widget.emailAddress(data[0].email);
          if(widget.user().emailAddress() == widget.emailAddress()) {
        	  widget.isCurrentUser(true);
          }
          if(data[0].parentOrganization != null){
        	  if(data[0].secondaryOrganizationsCount > 0){
        		  widget.inMultipleAccounts(true);
        	  } else {
        		  widget.inMultipleAccounts(false);
        	  }
          }else{
        	  if(data[0].secondaryOrganizationsCount > 1){
        		  widget.inMultipleAccounts(true);
        	  }else {
        		  widget.inMultipleAccounts(false);
        	  }
          }
          if (data[0].active) {
            widget.status(true);
          } else {
            widget.status(false);
          }
          if (data[0].roles) {
            var roleLength = widget.contactRoles().length;
            for (var role = 0; role < roleLength; role++) {
              var dataRolesLength = data[0].roles.length;
              //Flag is set to true if clicked user has this role.
              for(var currentRole = 0; currentRole < dataRolesLength; currentRole++) {
                if(widget.contactRoles()[role]["function"] === data[0].roles[currentRole]["function"]) {
                  widget.contactRoles()[role]["isRoleSelected"](true);
                  widget.roles(true);
                  break;
                }
              }
           }}
           if(!widget.isCurrentUser() && !widget.inMultipleAccounts()) {
        	   widget.disableActive(false);
           }else {
        	   widget.disableActive(true);
          }

          CCRestClient.request(CCConstants.ENDPOINT_GET_CONTACT_BY_ORGANIZATION, null, this.getMemberSuccessFunction.bind(this),
               this.getMemberFailureFunction.bind(this), this.contactId());
        } else {
          this.roles(true);
          this.isFirstNameModified = true;
          this.isLastNameModified = true;
          this.isEmailAddressModified = true;
          this.isRolesModified = true;
          this.isStatusModified = true;
          if (CCRestClient.profileType === "agentUI") {
            this.populateDynamicPropertiesForNewContact();
          }
        }
        widget.isDelegatedAdminFormEdited = false;
        widget.contactDetailsMode(true);
        $("#cc-contact-first-name").focus();
        
        return false;
      },
      roleFilterChanged: function(data, event){
        var widget = this;
        var filterLength=widget.organizationRolesFilterList().length;
        for(var i = 0; i < filterLength; i++) {
        	if(widget.organizationRolesFilterList()[i]["function"] === widget.roleFilterText()){
        		widget.listingViewModel().roleValue = widget.organizationRolesFilterList()[i]["repositoryId"];
        	}
          }
        if(event.originalEvent) {
          widget.listingViewModel().itemsPerPage = widget.fetchSize();
          widget.listingViewModel().blockSize = widget.fetchSize();
          widget.listingViewModel().refinedFetch();
        }
      },

      /**
  	   * Subscription function called for performing validations when any value in the subscription list is changed by the user:
  	   * @type {function}
  	   */
      subscribeForChanges: function() {
        this.subscriptions.push(this.firstName.subscribe(function(value) {
          this.isDelegatedAdminFormEdited = true ;
          this.isFirstNameModified = true;
        }, this));
        this.subscriptions.push(this.lastName.subscribe(function(value) {
            this.isDelegatedAdminFormEdited = true;
            this.isLastNameModified = true;
        }, this));
        this.subscriptions.push(this.emailAddress.subscribe(function(value) {
            this.isDelegatedAdminFormEdited = true;
            this.isEmailAddressModified = true;
        }, this));
        this.subscriptions.push(this.status.subscribe(function(value) {
            this.isDelegatedAdminFormEdited = true;
            this.isStatusModified = true;
            if(this.status()) {
              this.statusTranslation(this.translate("active"));
            } else {
              this.statusTranslation(this.translate("inactive"));
            }
        }, this));
        var rolesLength = this.contactRoles().length;
        for(var role = 0; role < rolesLength; role++) {
          this.subscriptions.push(this.contactRoles()[role]["isRoleSelected"].subscribe(function(value) {
            this.isDelegatedAdminFormEdited = true;
            this.roles(true);
            this.isRolesModified = true;
          }, this));
        }

      },
      
      /**
  	   * Called when the user enters a contact in the search box on the contact listing page:
  	   * @page {param}
  	   * @type {function}
  	   */
      searchContactDetails: function(data, event) {
        var widget = this;
        if(this.contactSearchValue() != "") {
        	this.contactSearchValue(this.contactSearchValue().trim());
        }
        widget.listingViewModel().searchValue = this.contactSearchValue();
        widget.listingViewModel().refinedFetch();
      },
      
      /**
  	   * Called before the widget is displayed on the page each and every time:
  	   * @page {param}
  	   * @type {function}
  	   */
      beforeAppear: function(page) {
        var widget = this;
        if (widget.user().loggedIn() == false) {
          navigation.doLogin(navigation.getPath(), widget.homeRoute);
        } else {
          if(widget.user().roles().length == 0 && widget.user().id() == "") {
            widget.user().isDelegatedAdmin(true);
            return;
          }
          
          // On organization change refresh the contacts
          if(window.isAgentApplication){
            widget.currentOrganizationSubscription = widget.user().currentOrganization.subscribe(function(){
              if (widget.user().active() && widget.user().isDelegatedAdmin() && widget.user().currentOrganization() && widget.listingViewModel().orgValue !== widget.user().currentOrganization().repositoryId) {
                widget.updateOrganizationRoles(widget.user().organizations()[0]["relativeRoles"]());
                widget.listingViewModel().orgValue = widget.user().currentOrganization().repositoryId;
                widget.listingViewModel().refinedFetch();
              }
            });	
          }
          
          // For agent widget, render the widget only for active and admin contacts
          if (!widget.user().isDelegatedAdmin() || (window.isAgentApplication && !widget.user().active())) {
            notifier.clearError(widget.WIDGET_ID);
            notifier.clearSuccess(widget.WIDGET_ID);
          }else{
            widget.roleFilterText("");
            widget.listingViewModel().clearOnLoad = true;
            widget.listingViewModel().orgValue = widget.user().currentOrganization() ? widget.user().currentOrganization().repositoryId : null;
            widget.listingViewModel().load(1, 1);
            widget.contactDetailsMode(false);
            if(widget.user().organizations()[0]) {
              //Currently hardcoded for first organization, as multiple organization is out of scope.
              widget.updateOrganizationRoles(widget.user().organizations()[0]["relativeRoles"]());
            } else {
              widget.userOrganizationsSubscription = widget.user().organizations.subscribe(function(newValue) {
                if(newValue[0]) {
                  //Currently hardcoded for first organization, as multiple organization is out of scope.
                  widget.updateOrganizationRoles(newValue[0]["relativeRoles"]());
                  widget.userOrganizationsSubscription.dispose();
                }
              });
            }
            var contactPramas = {};
            contactPramas[CCConstants.PARENT] = CCConstants.ENDPOINT_SHOPPER_TYPE_PARAM;
            //getting dynamic property meta-data for contact and populating in view model
            if (widget.listingViewModel && widget.listingViewModel().dynamicPropertyMetaInfo &&
                widget.listingViewModel().dynamicPropertyMetaInfo.dynamicPropertyMetaCache && 
                !widget.listingViewModel().dynamicPropertyMetaInfo.dynamicPropertyMetaCache.hasOwnProperty(CCConstants.ENDPOINT_SHOPPER_TYPE_PARAM)) {
              CCRestClient.request(CCConstants.ENDPOINT_GET_ITEM_TYPE, contactPramas,
                //success callback
                this.getItemTypeSuccessFunction.bind(this),
                //error callback
                this.getItemTypeFailureFunction.bind(this),
                CCConstants.ENDPOINT_SHOPPER_TYPE_PARAM);
            }
          }
        }
        widget.opDynamicProperty("update");
      },
      /**
       * Called when the user clicks on "Save" button to save the contact data to the server:
       * @type {function}
       */
      saveContactData: function(isRedirectionNeeded) {
        //We will need to check if the data entered is valid.
        var widget = this;
        if (this.validationModel.isValid()) {
          var contactData = this.koToJS();
          if (CCRestClient.profileType === "agentUI") {
            if (!widget.validateDynamicProperties()) {
              //notify if needed
              return ;
            }
            var isDynPropertyModified = widget.getDynamicPropertyChanges(contactData);
            if (isDynPropertyModified) {
              widget.isDelegatedAdminFormEdited = true;
            }
          }
          
          if(widget.isDelegatedAdminFormEdited) {
            if (this.contactId() !== null) {
              CCRestClient.request(CCConstants.ENDPOINT_UPDATE_CONTACTS_BY_ORGANIZATION, contactData, this.updateMemberSuccessFunction.bind(this,isRedirectionNeeded), this.updateMemberFailureFunction.bind(this), this.contactId());
            } else {
              CCRestClient.request(CCConstants.ENDPOINT_CREATE_CONTACTS_BY_ORGANIZATION, contactData, this.createMemberSuccessFunction.bind(this,isRedirectionNeeded), this.createMemberFailureFunction.bind(this));
            }
          }else{
        	  this.redirectToContactListingPage(true);
          }
          /*if(isRedirectionNeeded == true) {
        	  this.redirectToContactListingPage(true);
          }*/
        } else {
          this.validationModel.errors.showAllMessages();
          notifier.clearError(widget.WIDGET_ID);
          notifier.clearSuccess(widget.WIDGET_ID);
          notifier.sendError(this.WIDGET_ID, this.translate('ErrorMsg'), true);
          return;
        }
      },
      
      /**
       * Called when the user clicks on "Yes" button to remove the contact
       * @type {function}
       */
      confirmRemoveContact: function(isRedirectionNeeded) {
        //We will need to check if the data entered is valid.
        var widget = this;
        this.removedContact(true);
        var input = {};
        input["members"]=[];
        input["members"].push(this.contactId());
        CCRestClient.request(CCConstants.REMOVE_CONTACTS, input,this.updateMemberSuccessFunction.bind(this,isRedirectionNeeded), this.updateMemberFailureFunction.bind(this)); 
      },
      
      
      /**
       * Success Call back function for a contact creation:
       * @data {Response from the server}
       * @type {function}
       */
      createMemberSuccessFunction: function(isRedirectionNeeded,data) {
        notifier.sendSuccess(this.WIDGET_ID, this.translate('ContactCreationSuccessMsg'), true);
        this.isDelegatedAdminFormEdited = false;
        if(this.user().organizations()[0]) {
          this.user().organizations()[0].updatenumberOfActiveApprovers();
        }
      	if(data && data.id) {
      		this.contactId(data.id);
      	} 
      	if(isRedirectionNeeded == true) {
      	  this.redirectToContactListingPage(true);
        }
      },
      
      /**
       * Failure Call back function for a contact creation:
       * @data {Response from the server}
       * @type {function}
       */
      createMemberFailureFunction: function(data) {
    	var widget = this;
        notifier.clearError(this.WIDGET_ID);
        notifier.clearSuccess(this.WIDGET_ID);
        if (data.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
            widget.user().handleSessionExpired();
            if (navigation.isPathEqualTo(widget.links().profile.route)) {
              navigation.doLogin(navigation.getPath(), widget.homeRoute);
            }
        }
        else {
          notifier.sendError(widget.WIDGET_ID, data.message, true);
        }
      },
      
      /**
       * Success Call back function for a getting item type:
       * @data {Response from the server}
       * @type {function}
       */
      getItemTypeSuccessFunction: function(dynamicPropData) {
        if (dynamicPropData) {
          this.cachedDynamicPropertySpec = dynamicPropData.specifications;
          this.listingViewModel().dynamicPropertyMetaInfo.intializeDynamicProperties(dynamicPropData.specifications,
            CCConstants.ENDPOINT_SHOPPER_TYPE_PARAM);
        }
      },

      /**
       * Failure Call back function for a get item type:
       * @data {Response from the server}
       * @type {function}
       */
      getItemTypeFailureFunction: function(data) {
        var widget = this;
        notifier.clearError(this.WIDGET_ID);
        notifier.clearSuccess(this.WIDGET_ID);
        if (data.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
          widget.user().handleSessionExpired();
          if (navigation.isPathEqualTo(widget.links().profile.route)) {
            navigation.doLogin(navigation.getPath(), widget.homeRoute);
          }
        }
        else {
          notifier.sendError(widget.WIDGET_ID, data.message, true);
        }
      },
      
      /**
       * Success Call back function for a getting contact:
       * @data {Response from the server}
       * @type {function}
       */
      getMemberSuccessFunction: function(data) {
        if (data) {
          ko.mapping.fromJS(data, {}, this.listingViewModel());
          this.isDelegatedAdminFormEdited = false;
          if (CCRestClient.profileType === "agentUI") {
            this.populateDynamicProperties(data.dynamicProperties);
          }
        }
      },
      
      
      /**
       * Failure Call back function for get contact:
       * @data {Response from the server}
       * @type {function}
       */
      getMemberFailureFunction: function(data) {
        var widget = this;
        notifier.clearError(this.WIDGET_ID);
        notifier.clearSuccess(this.WIDGET_ID);
        if (data.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
          widget.user().handleSessionExpired();
          if (navigation.isPathEqualTo(widget.links().profile.route)) {
            navigation.doLogin(navigation.getPath(), widget.homeRoute);
          }
        }
        else {
          notifier.sendError(widget.WIDGET_ID, data.message, true);
        }
      },
      
      /**
       * Success Call back function for update contact:
       * @data {Response from the server}
       * @type {function}
       */
      updateMemberSuccessFunction: function(isRedirectionNeeded,data) {
        var widget = this;
    	notifier.clearError(this.WIDGET_ID);
        notifier.clearSuccess(this.WIDGET_ID);
        if(this.removedContact()){
        	notifier.sendSuccess(this.WIDGET_ID, this.translate('contactRemovedMsg'), true);
            this.removedContact(false);
        }else{
        	notifier.sendSuccess(this.WIDGET_ID, this.translate('SuccessMsg'), true);
        	this.isDelegatedAdminFormEdited = false;
        }
        if(this.user().organizations()[0]) {
          this.user().organizations()[0].updatenumberOfActiveApprovers();
        }
        if(isRedirectionNeeded == true) {
      	  this.redirectToContactListingPage(true);
        }
        
        // refresh the user view model to update the observables
        if(window.isAgentApplication){
          widget.user().getCurrentUser(null, null, null, null);
        }
      },
      
      /**
       * Failure Call back function for update contact:
       * @data {Response from the server}
       * @type {function}
       */
      updateMemberFailureFunction: function(data) {
    	var widget = this;
        notifier.clearError(this.WIDGET_ID);
        notifier.clearSuccess(this.WIDGET_ID);
        if (data.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
            widget.user().handleSessionExpired();
            if (navigation.isPathEqualTo(widget.links().profile.route)) {
              navigation.doLogin(navigation.getPath(), widget.homeRoute);
            }
        }
        else {
          notifier.sendError(this.WIDGET_ID, data.message, true);
        }
      },
      
      /**
       * Function for JSON object construction that needs to be passed as a pay load to the server during contact creation and edit:
       * @type {function}
       */
      koToJS: function() {
        var widget = this;
        var data = {};
        if(this.isFirstNameModified) {
          data[CCConstants.FIRST_NAME_TEXT] = this.firstName();
        }
        if(this.isLastNameModified) {
          data[CCConstants.LAST_NAME_TEXT] = this.lastName();
        }
        if(this.isEmailAddressModified) {
          data[CCConstants.EMAIL_ADDRESS_TEXT] = this.emailAddress();
        }
        if(this.isStatusModified) {
          data[CCConstants.ACTIVE_TEXT] = this.status();
        }
        if(!this.contactId()) {
          data[CCConstants.RECEIVE_MAIL_TEXT] = CCConstants.YES_TEXT;
        }
        if(this.isRolesModified) {
          data[CCConstants.ROLES_TEXT] = widget.getSelectedRoles();          
        }
        
        return data;
      },

      /**
       * Called when the user clicks on "Cancel" button. We will check if the form is dirty and display a data discard modal:
       */
      cancelContactData: function() {
        if (this.isDelegatedAdminFormEdited) {
          // create new 'shown' event handler
          $('#cc-cancel-contacts-ModalContainer').on('show.bs.modal', function() {
            $('#cc-cancel-contacts-ModalContainer-modal-dialog').show();
          });
          // create new 'hidden' event handler
          $('#cc-cancel-contacts-ModalContainer').on('hide.bs.modal', function() {
            $('#cc-cancel-contacts-ModalContainer-modal-dialog').hide();
            $("div").remove(".modal-backdrop");
            $("body").removeClass("no-scroll modal-open");
            $("body").addClass("modal-close");
          });
          // open modal
          $('#cc-cancel-contacts-ModalContainer').modal('show');
        } else {
          this.redirectToContactListingPage(true);
        }
      },
      
      /**
       * Called when the user clicks on "Cancel" button after selecting remove contact. We will redirect to contact listing page.
       */
      cancelRemoveContact: function() {
          this.redirectToContactListingPage(true);
      },

      /**
       * Called when the user clicks on "Remove Contact" button. We will check if the form is dirty and display a data discard modal:
       */
      removeContactData: function() {
          // create new 'shown' event handler
          $('#cc-remove-contact-ModalContainer').on('show.bs.modal', function() {
            $('#cc-remove-contact-ModalContainer-modal-dialog').show();
          });
          // create new 'hidden' event handler
          $('#cc-remove-contact-ModalContainer').on('hide.bs.modal', function() {
            $('#cc-remove-contact-ModalContainer-modal-dialog').hide();
            $("div").remove(".modal-backdrop");
            $("body").removeClass("no-scroll modal-open");
            $("body").addClass("modal-close");
          });
          // open modal
          $('#cc-remove-contact-ModalContainer').modal('show');
      },

      /**
       * Populate dynamic property array from data.
       * 
       */
      populateDynamicProperties: function (pPropertiesArray) {
        var data = pPropertiesArray;
        this.dynamicProperties([]);
        var metaData = this.listingViewModel().dynamicPropertyMetaInfo.dynamicPropertyMetaCache[CCConstants.ENDPOINT_SHOPPER_TYPE_PARAM];
        var dynPropArray = [];
        var dynPropValue ;
        var dynPropObj;
        for (var i = 0; i < metaData.length; ++i) {
          var id = metaData[i].id();
          dynPropObj = $.extend(true,{},metaData[i]);//should deep copy 
          for (var j = 0; j < data.length; ++j) {
            if (id === data[j].id) {
              dynPropValue = data[j].value;
              dynPropObj.value(dynPropValue);
              dynPropArray.push(dynPropObj);
              break;
            }
          }
        }
        this.dynamicProperties(this.dynamicProperties().concat(dynPropArray));
      },

      /**
       * Populate dynamic property array from data.
       * 
       */
      populateDynamicPropertiesForNewContact: function () {
        //resetting cache of dynamic property meta container to default values received during page load
        if (this.cachedDynamicPropertySpec) {
          this.listingViewModel().dynamicPropertyMetaInfo.intializeDynamicProperties(this.cachedDynamicPropertySpec,
                    CCConstants.ENDPOINT_SHOPPER_TYPE_PARAM);
        }
        this.dynamicProperties([]);
        var metaData = this.listingViewModel().dynamicPropertyMetaInfo.dynamicPropertyMetaCache[CCConstants.ENDPOINT_SHOPPER_TYPE_PARAM];
        this.dynamicProperties(this.dynamicProperties().concat(metaData));
      },

      /**
       * Validate dynamic properties value
       */
      validateDynamicProperties: function () {
        var dynProps = this.dynamicProperties();
        for (var i = 0; i < dynProps.length; ++i) {
          if (!dynProps[i].value.isValid()) {
            return false;
          }
        }
        return true;
      },

      getDynamicPropertyChanges: function (pParams) {
        var dynProps = this.dynamicProperties();
        var dynProp ;
        var isDynPropModified = false;
        for (var i = 0; i < dynProps.length; ++i) {
          dynProp = dynProps[i];
          if (dynProp.value.isModified && dynProp.value.isModified()) {
            pParams[dynProp.id()] = dynProp.value();
            isDynPropModified = true;
          }
        }
        return isDynPropModified;
      },

      /**
       * Called when the user presses "Enter" key for search after the search term is entered:
       */
      searchContactKeyPress: function(data, event) {
          var widget = this;
          try {
            if (event.which == 13) {
              widget.searchContactDetails();
                return false;
            }
            return true;
          }catch(e){}
      },
      
      /**
       * Called when the user clicks on "Yes" button on the cancel modal:
       */
      handleModalUpdate: function() {
    	var isSaveSuccess = this.saveContactData(true);
        $("#cc-cancel-contacts-ModalContainer").modal('hide');
    	$('body').removeClass('modal-open');
    	$('.modal-backdrop').remove();
      },
      
      /**
       * Called when the user clicks on "No" button on the cancel modal:
       */
      handleModalCancelUpdateDiscard: function() {
    	  var widget = this;
    	  widget.redirectToContactListingPage(true); 
      },

      /**
       * Helper function when the user clicks on "No" button on the cancel modal:
       */
      redirectToContactListingPage: function(isServiceCallNeeded) {
    	if(isServiceCallNeeded) {
    	  if(this.contactSearchValue() != "") {
              this.contactSearchValue(this.contactSearchValue().trim());
          }
    	  this.listingViewModel().searchValue = this.contactSearchValue();
    	  if(this.interceptedLink == "/cart") {
    		  this.interceptedLink = "/delegatedAdminContacts";
    	  }
    	  if(this.interceptedLink == null || this.interceptedLink == undefined || this.interceptedLink == "" || this.interceptedLink == "/delegatedAdminContacts") {
    	    this.listingViewModel().refinedFetch();
    	  }
    	}
        this.user().isSearchInitiatedWithUnsavedChanges(false);
        if(this.interceptedLink != null && this.interceptedLink != undefined && this.interceptedLink != "" && !navigation.isPathEqualTo(this.interceptedLink)) {
        	this.isDelegatedAdminFormEdited = false;
        	navigation.goTo(this.interceptedLink);
        }
        else {
            this.contactDetailsMode(false);
        }
        this.isDelegatedAdminFormEdited = false;
        $("#cc-cancel-contacts-ModalContainer").modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        notifier.clearError(this.WIDGET_ID);
        //notifier.clearSuccess(this.WIDGET_ID);
      },
      
      /**
       * Called when the user sorts the contact list based on first name, last name, email:
       * @param sortOrder : order of sort either ascending or descending
       * @param sortTerm : attribute on which the sort needs to be performed
       */
      clickContactSort: function(sortOrder,sortTerm){
        var widget=this;
       widget.sortDirections()[sortTerm]=sortOrder;
       if(sortTerm=="firstName"){
         widget.sortDirections()["lastName"]="both";
         widget.sortDirections()["email"]="both";
       }else if(sortTerm=="lastName"){
         widget.sortDirections()["firstName"]="both";
         widget.sortDirections()["email"]="both";
       }else if(sortTerm=="email"){
         widget.sortDirections()["lastName"]="both";
         widget.sortDirections()["firstName"]="both";
       }
       widget.sortDirections.valueHasMutated();
        var sortString=sortTerm+":"+sortOrder;
        widget.listingViewModel().sortProperty=sortString;
        widget.listingViewModel().refinedFetch();
      
      },

      /**
       * Invoked when a contact is selected from the contact listing page to view the details:
       */
      resetContactData: function() {
        this.firstName(null);
        this.interceptedLink = null;
        this.lastName(null);
        this.emailAddress(null);
        this.isDelegatedAdminFormEdited = false;
        this.roles(null);
        this.status(true);
        this.state(null);
        this.contactId(null);
        this.isCurrentUser(false);
        this.isFirstNameModified = false;
        this.isLastNameModified = false;
        this.isEmailAddressModified = false;
        this.isStatusModified = false;
        this.isRolesModified = false;
        this.statusTranslation(this.translate("active"));
        this.validationModel.errors.showAllMessages(false);
        this.resetContactRoles();
        var length = this.subscriptions.length;
        for(var i=0; i < length; i++) {
          this.subscriptions[i].dispose();
        }
        
      },

      /**
       * Updates the organizationRoles and organizationRolesFilterList arrays
       */
      updateOrganizationRoles: function(relativeRoles) {
        var widget = this;
        var filterList = [];
        widget.organizationRoles([]);
        widget.organizationRolesFilterList([]);
        
        filterList.push({
          "function": "",
          "displayText": ko.observable(widget.translate('allOption')),
          "repositoryId": ""
        });
        relativeRoles = relativeRoles.sort(widget.sortByProperty(CCConstants.ROLES_TEXT_PROPERTY));
        var roleLength = relativeRoles.length;
        for(var role = 0; role < roleLength; role++) {
          var roleToPush = {};
          roleToPush["function"] = relativeRoles[role]["function"];
          roleToPush["displayText"] = ko.observable(widget.translate(relativeRoles[role]["function"] + 'Text'));
          roleToPush["repositoryId"] = relativeRoles[role]["repositoryId"];
          roleToPush["relativeTo"] = relativeRoles[role]["relativeTo"];
          widget.organizationRoles.push(roleToPush);
          if(roleToPush["function"] !== "buyer") {
            filterList.push(roleToPush);
          }
        }
        widget.organizationRolesFilterList(filterList);
      },

      /**
       * Get roleString
       * Returns roleString with roles converted to title case
       * @param {Array} roles
       */
      getRoleString: function(roles) {
        var widget = this;
        var roleString = '';
        roles = roles.sort(widget.sortByProperty(CCConstants.ROLES_TEXT_PROPERTY));
        var roleLength = roles.length;
        for(var role = 0; role < roleLength; role++) {
          roleString = roleString + widget.translate(roles[role]["function"] + 'Text') + ', ';
        }
        roleString = roleString.substring(0, roleString.length - 2);
        return roleString;
      },

      /**
       * Resets the contactRoles array
       */
      resetContactRoles: function() {
        var widget = this;
        widget.contactRoles([]);
        var roleLength = widget.organizationRoles().length;
        for (var role = 0; role < roleLength; role++) {
          var roleToPush = {};
          roleToPush["function"] = widget.organizationRoles()[role]["function"];
          roleToPush["displayText"] = widget.organizationRoles()[role]["displayText"];
          roleToPush["relativeTo"] = widget.organizationRoles()[role]["relativeTo"];
          //Setting buyer role by default
          if(widget.organizationRoles()[role]["function"] === "buyer") {
            roleToPush["isRoleSelected"] = ko.observable(true);
          } else {
            roleToPush["isRoleSelected"] = ko.observable(false);
          }
          widget.contactRoles.push(roleToPush);
        }
      },

      /**
       * Find all roles enabled for selected contact
       * Returns array of enabled roles for selected contact
       */
      getSelectedRoles: function() {
        var widget = this;
        var selectedRoles = [];
        var roleLength = widget.contactRoles().length;
        for(var role = 0; role < roleLength; role++) {
          var roleToPush = {};
          if(widget.contactRoles()[role]["isRoleSelected"]()) {
            roleToPush["function"] = widget.contactRoles()[role]["function"];
            var relativeTo = {};
            relativeTo["id"] = widget.user().currentOrganization().id ? widget.user().currentOrganization().id : widget.user().currentOrganization().repositoryId;
            roleToPush["relativeTo"] = relativeTo;
            selectedRoles.push(roleToPush);
          }
        }
        return selectedRoles;
      },
      
      /**
       * Custom sorting of any array of roles.
       * @param property {String} property name to sort the array by 
       */
      sortByProperty: function(property) {
    	    var sortOrder = 1;
    	    if(property[0] === "-") {
    	        sortOrder = -1;
    	        property = property.substr(1);
    	    }
    	    return function (a,b) {
    	        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    	        return result * sortOrder;
    	    }
    	},
      
      /**
       * On page change, remove all subscriptions in widget
       */
      triggerPageChangeEvent: function () {
        var widget = this;
        var length = widget.subscriptions.length;
        for (var i = 0; i < length; i++){
          widget.subscriptions[i].dispose();
        }
        if (widget.currentOrganizationSubscription && widget.currentOrganizationSubscription.dispose) {
          widget.currentOrganizationSubscription.dispose();
        }
        
        if (widget.userOrganizationsSubscription && widget.userOrganizationsSubscription.dispose) {
          widget.userOrganizationsSubscription.dispose();
        }
      }
    
    };
  });