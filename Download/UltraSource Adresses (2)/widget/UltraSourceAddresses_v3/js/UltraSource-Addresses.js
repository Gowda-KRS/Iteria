/**
 * @fileoverview Address Book Widget.
 *
 * 
 * 		
 */
define(
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['knockout', 'pubsub', 'navigation', 'viewModels/address', 'notifier', 'ccConstants', 'CCi18n',"spinner",'ccRestClient'],
    
  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function (ko, PubSub, navigation, Address, notifier, CCConstants, CCi18n,spinner,CCRestClient) {
  
    "use strict";
        var getWidget;
    return {
      
      WIDGET_ID: "addressBook",
          addressExisted: ko.observable(false),
   allAddressesCheck: ko.observableArray([]),
   
      ignoreBlur: ko.observable(false),
      allfieldserror: ko.observable(false),
      allfieldserror1: ko.observable(false),      
      currentEdit: ko.observable(""),
      addressLine2Part1: ko.observable(""),
      addressLine2Part2: ko.observable(""),
      // Property to show edit screen.
      isUserProfileShippingEdited:        ko.observable(false),
      isUserProfileDefaultAddressEdited : ko.observable(false),
      isUserProfileBillingEdited:        ko.observable(false),
      interceptedLink: ko.observable(null),
      isUserProfileInvalid: ko.observable(false),
      isProfileLocaleNotInSupportedLocales : ko.observable(),
      companyName : ko.observable(),
      firstName : ko.observable(),
      lastName : ko.observable(),
      fullName: ko.observable(),
      address1 : ko.observable(),
    alias : ko.observable(),
      address2 : ko.observable(),
      address3 : ko.observable(),
      errormessage: ko.observable(),
    addressvalidationMessage: ko.observable(),
      city : ko.observable(),
  	addressValidationRequest: ko.observable(),
 	addressValidationRequest1: ko.observable(),
      state : ko.observable(),
      postalCode : ko.observable(),
      country : ko.observable(),
      addressStatus: ko.observable(),
      	addressArray: ko.observableArray([]),
ContactList: ko.observableArray([]),
    customDefaultBillingAddress: ko.observable(),
stateArray: ko.observableArray([]),
			addressTypeArray: ko.observableArray([]),
			      type : ko.observable(),
      selectedState: ko.observable(),
      validAddresses: ko.observableArray([]),
      beforeAppear: function (page) {
         // Every time the user goes to the profile page,
         // it should fetch the data again and refresh it.
        var widget = this;
        
        widget.addressExisted.subscribe(function(newValue){
    if(newValue){
        $('#CC-companyAddressAlreadyRegistered-Modal').show();
    }else{
        $('#CC-companyAddressAlreadyRegistered-Modal').hide();
    }
})

        //pubsub event to discard the address changes (IF ANY) if save button of account details or update password 
        //is clicked 
         $.Topic(PubSub.topicNames.DISCARD_ADDRESS_CHANGES).subscribe(widget.handleCancelUpdateForAddressBook);
        // Checks whether the user is logged in or not
        // If not the user is taken to the home page
        // and is asked to login.
        if (widget.user().loggedIn() == false) {
          navigation.doLogin(navigation.getPath(), widget.links().home.route);
        } else if (widget.user().isSessionExpiredDuringSave()) {
          widget.user().isSessionExpiredDuringSave(false);
        } else {
          //reset all the password detals
          widget.user().resetPassword();
          widget.showViewProfile(true);
          notifier.clearError(widget.WIDGET_ID);
          notifier.clearSuccess(widget.WIDGET_ID);
          widget.user().isUserProfileEdited(false);
        }
        
        
        
        
        
        
        
        
        
        
      },
      
      onLoad: function(widget) {
        var self = this;
        getWidget=widget;
        var isModalVisible = ko.observable(false);
        var clickedElementId = ko.observable(null);
        var isModalSaveClicked = ko.observable(false);
        widget.ContactList().push({"name":widget.user().firstName()+"  "+widget.user().lastName(),"id":widget.user().id()})
          widget.fullName = ko.pureComputed(function () {
        return widget.user().firstName() + " " + widget.user().lastName();
    }, widget);
    
        
        widget.ErrorMsg = widget.translate('updateErrorMsg');
        widget.passwordErrorMsg = widget.translate('passwordUpdateErrorMsg');
					self.addressArray.push('', 'Suite', 'Apartment', 'Building', 'P.O. Box'); 
					self.addressTypeArray.push('', 'Business', 'Residential');
				if(widget.user().parentOrganization!==null){	}
				else{
				    				var i=0;	
			for(i=0;i<widget.user().dynamicProperties().length;i++){
			    if(widget.user().dynamicProperties()[i].id()=="default_billingAddress_data"){
			        
			        widget.customDefaultBillingAddress(widget.user().dynamicProperties()[i].value())
			        
			        if(widget.user().dynamicProperties()[i].value() != null){
			        
			        
		      var billing=widget.user().dynamicProperties()[i].value().replaceAll("=",":").replaceAll(" ","");

		      var billingArray=["companyName","address1","address2","address3","city","state","postalCode","country","firstName","lastName","alias"];
		      
		      for(var t=0;t<billingArray.length;t++){
		  
		  if(billingArray[t]=="companyName"){
		      widget.companyName(widget.billingAddressParse(billing,billingArray[t]));
		  }
		  else if(billingArray[t]=="firstName"){
		      widget.firstName(widget.billingAddressParse(billing,billingArray[t]));		      
		  }
		  else if(billingArray[t]=="lastName"){
		      widget.lastName(widget.billingAddressParse(billing,billingArray[t]));		      
		  }
		  else if(billingArray[t]=="address1"){
		      widget.address1(widget.billingAddressParse(billing,billingArray[t]));		      
		  }
		  else if(billingArray[t]=="address2"){
		      widget.address2(widget.billingAddressParse(billing,billingArray[t]));		      
		      var da=widget.billingAddressParse(billing,billingArray[t]);
		      

		      
		      
		      
		      
		      
		      
		      
		      
		      
		      
		      
		                                  if([null,undefined,""].indexOf(da) == -1){
                      if((da.toLowerCase().indexOf("suite") !== -1)){
                          
                   widget.addressLine2Part1(da.substring(0,5));    
                  widget.addressLine2Part2(da.substring(5,da.length));    
                   
                   
                }else  if((da.toLowerCase().indexOf("apartment") !== -1)){
                    
                  widget.addressLine2Part1(da.substring(0,9));    
                  widget.addressLine2Part2(da.substring(9,da.length));    
                  

                }else  if((da.toLowerCase().indexOf("building") !== -1)){
                
                 widget.addressLine2Part1(da.substring(0,8));    
                  widget.addressLine2Part2(da.substring(8,da.length));    
                  
                }else  if((da.toLowerCase().indexOf("p.o.") !== -1)){
                    
                   widget.addressLine2Part1(da.substring(0,8));    
                  widget.addressLine2Part2(da.substring(8,da.length));    
                   
                }else{
                   widget.addressLine2Part1("");    
                  widget.addressLine2Part2(da);  
                }
        }else{
                   widget.addressLine2Part1("");    
                  widget.addressLine2Part2("");  
        }
        
        
		      
		      
		  }
		  else if(billingArray[t]=="address3"){
		      widget.address3(widget.billingAddressParse(billing,billingArray[t]));		      
		  }
		  else if(billingArray[t]=="city"){
		      widget.city(widget.billingAddressParse(billing,billingArray[t]));		      
		  }
		  else if(billingArray[t]=="state"){
		      widget.state(widget.billingAddressParse(billing,billingArray[t]));		      
		  }
		  else if(billingArray[t]=="postalCode"){
		      widget.postalCode(widget.billingAddressParse(billing,billingArray[t]));		      
		  }
  		  else if(billingArray[t]=="alias"){
		      widget.alias(widget.billingAddressParse(billing,billingArray[t]));		      
		  }
		  else if(billingArray[t]=="country"){
		      widget.country(widget.billingAddressParse(billing,billingArray[t]));		      
		  }
		  
		      }
		      
			        }
		  
		  
		      
		      
			   }
			    
			}
				}
					
					
					
					
			
			
        widget.showViewProfile = function (refreshData) {
          // Fetch data in case it is modified or requested to reload.
          // Change all div tags to view only.
          if(refreshData) {
            widget.user().getCurrentUser(false);
          }
          widget.isUserProfileShippingEdited(false);
          widget.isUserProfileDefaultAddressEdited(false);
        };
        
        // Reload shipping address.
        widget.reloadShipping = function() {
          //load the shipping address details
          if (widget.user().updatedShippingAddressBook) {
            var shippingAddresses = [];
            for (var k = 0; k < widget.user().updatedShippingAddressBook.length; k++)
            {
              var shippingAddress = new Address('user-shipping-address', widget.ErrorMsg, widget, widget.shippingCountries(), widget.defaultShippingCountry());
              shippingAddress.countriesList(widget.shippingCountries());
              
              shippingAddress.copyFrom(widget.user().updatedShippingAddressBook[k], widget.shippingCountries());
              shippingAddress.resetModified();
              shippingAddress.country(widget.user().updatedShippingAddressBook[k].countryName);
              shippingAddress.state(widget.user().updatedShippingAddressBook[k].regionName);
              shippingAddresses.push(shippingAddress);
            }
           
           for(var t=0;t<shippingAddresses.length;t++){
               if(shippingAddresses[t].isDefaultAddress()){
//                   document.getElementById("CC-customerProfile-select-default-addr-btnnew-"+t).click();
// $("#CC-customerProfile-select-default-addr-btnnew-"+t).click();
   
               }
           }
           
               if(shippingAddresses.length>0){
        widget.allAddressesCheck([])
        for(var i=0;i<shippingAddresses.length;i++){
            widget.allAddressesCheck().push({
                "address1":shippingAddresses[i].address1(),
                "address2":shippingAddresses[i].address2(),
                "city":shippingAddresses[i].city(),
                "state":shippingAddresses[i].selectedState(),
                 "postalCode":shippingAddresses[i].postalCode(),
                "country":shippingAddresses[i].selectedCountry()
            })
        }
    }
              
            widget.user().shippingAddressBook(shippingAddresses);
          }
        };

        /**
         * Ignores the blur function when mouse click is up
         */
        widget.handleMouseUp = function() {
            this.ignoreBlur(false);
            return true;
          };
          
          /**
           * Ignores the blur function when mouse click is down
           */
        widget.handleMouseDown = function() {
            this.ignoreBlur(true);
            return true;
          };
        // hide the challange dialog box
        widget.hideModal = function () {
          if(isModalVisible() || widget.user().isSearchInitiatedWithUnsavedChanges()) {
            $("#CC-customerProfile-modal-3").modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
          }
        };
        
        widget.showModal = function () {
          $("#CC-customerProfile-modal-3").modal('show');
          isModalVisible(true);
        };
        
        // Handle cancel update.
        widget.handleCancelUpdateForAddressBook = function () {
          widget.showViewProfile(true);
          widget.user().editShippingAddress(null);
          widget.reloadShipping();
          notifier.clearError(widget.WIDGET_ID);
          notifier.clearSuccess(widget.WIDGET_ID);
          widget.user().isUserProfileEdited(false);
          widget.hideModal();
        };
        
        // Discards user changes and navigates to the clicked link.
        widget.handleModalCancelUpdateDiscard = function () {
          widget.handleCancelUpdateForAddressBook();
          if ( widget.user().isSearchInitiatedWithUnsavedChanges() ) {
            widget.hideModal();
            widget.user().isSearchInitiatedWithUnsavedChanges(false);
          }
          else {
            widget.navigateAway();
          }
        };
        
        // Add new Shipping address, then display for editing.
        widget.handleCreateShippingAddress = function () {
       
            widget.addressLine2Part1("");    
                  widget.addressLine2Part2("");  
                  
          var addr = new Address('user-shipping-address', widget.ErrorMsg, widget, widget.shippingCountries(), widget.defaultShippingCountry());
            widget.currentEdit("new");
          widget.editShippingAddress(addr);
        },
        
        widget.editShippingAddress = function (addr) {
            if(widget.currentEdit() == "new"){
                 widget.currentEdit("new");                
                 
                 var	request = {
				"address1": "",
				"address2":" ",
				"city": "",
				"state": "",
				"postalCode": "",
     			"country": ""
		    	};
getWidget.addressValidationRequest1(request)                

                 
            }else{
                widget.currentEdit("ship");
                
/*                if((addr.address2().toLowerCase().indexOf("suite") !== -1) || (addr.address2().toLowerCase().indexOf("apartment") !== -1) || (addr.address2().toLowerCase().indexOf("building") !== -1) 
                || (addr.address2().toLowerCase().indexOf("p.o.") !== -1)
                ){
                    
                widget.addressPart1();
                widget.addressPart2();
                }*/
                
                



                
                if((addr.address2().toLowerCase().indexOf("suite") !== -1)){
                   widget.addressLine2Part1(addr.address2().substring(0,5));
                   widget.addressLine2Part2(addr.address2().substring(6,addr.address2().length));    
                }else  if((addr.address2().toLowerCase().indexOf("apartment") !== -1)){
                   widget.addressLine2Part1(addr.address2().substring(0,9));
                   widget.addressLine2Part2(addr.address2().substring(10,addr.address2().length));    
                }else  if((addr.address2().toLowerCase().indexOf("building") !== -1)){
                   widget.addressLine2Part1(addr.address2().substring(0,8));
                   widget.addressLine2Part2(addr.address2().substring(9,addr.address2().length));    
                }else  if((addr.address2().toLowerCase().indexOf("p.o.") !== -1)){
                   widget.addressLine2Part1(addr.address2().substring(0,8));
                   widget.addressLine2Part2(addr.address2().substring(9,addr.address2().length));    
                }else{
                    widget.addressLine2Part1("");
                   widget.addressLine2Part2(addr.address2());
                }
                
var	request = {
				"address1": addr.address1(),
				"address2": getWidget.addressLine2Part1()+" "+getWidget.addressLine2Part2(),
				"city": addr.city(),
				"state": addr.state(),
				"postalCode": addr.postalCode(),
     			"country": addr.country()
		    	};
getWidget.addressValidationRequest1(request)                
                

                
            }

        	widget.user().isUserProfileEdited(true);
          notifier.clearError(widget.WIDGET_ID);
          notifier.clearSuccess(widget.WIDGET_ID);
          addr.country("US")

          widget.user().editShippingAddress(addr);
          widget.isUserProfileShippingEdited(true);
          widget.isUserProfileBillingEdited(false);
          
          
          
          document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  
          $('#CC-customerProfile-sfirstname').focus();
          if (widget.shippingCountries().length == 0) {
            $('#CC-customerProfile-shippingAddress-edit-region input').attr('disabled', true);
          }
        };
        
        
        
        
    widget.editBillingAddress1 = function (addr) {
        widget.currentEdit("bill");
        	widget.user().isUserProfileEdited(true);
          notifier.clearError(widget.WIDGET_ID);
          notifier.clearSuccess(widget.WIDGET_ID);
          widget.user().editShippingAddress(addr);
          widget.isUserProfileShippingEdited(true);
          widget.isUserProfileBillingEdited(false);
          
          $('#CC-customerProfile-sfirstname').focus();
          if (widget.shippingCountries().length == 0) {
            $('#CC-customerProfile-shippingAddress-edit-region input').attr('disabled', true);
          }
        };
        
        

        
        widget.handleSelectDefaultShippingAddress = function (addr) {
          widget.selectDefaultShippingAddress(addr);
                    addr.country("US")
               addr["isDefaultShippingAddress"](true);
          widget.user().editShippingAddress(addr);
          
            widget.createNewProfileAddress1(widget.convertToData(),widget.user().editShippingAddress().repositoryId);
            
          widget.isUserProfileDefaultAddressEdited(true);
        };
        
        widget.handleRemoveShippingAddress = function (addr) {
          widget.user().shippingAddressBook.remove(addr);
          widget.user().deleteShippingAddress(true);
          
          // If addr was the default address, reset the default address to be the first entry.
          if (addr.isDefaultAddress() && widget.user().shippingAddressBook().length > 0) {
            widget.selectDefaultShippingAddress(widget.user().shippingAddressBook()[0]);
          }
          
          // If we delete the last user address, notify other modules that might have
          // cached it.
          if (widget.user().shippingAddressBook().length === 0) {
          	$.Topic(PubSub.topicNames.USER_PROFILE_ADDRESSES_REMOVED).publish();
          }
          
          widget.handleUpdateProfileForAddressBook();
        };
        
        widget.selectDefaultShippingAddress = function (addr) {
          widget.user().selectDefaultAddress(addr);
        };
        
        // Handles User profile update for shipping address modification
        widget.handleUpdateProfileForAddressBook = function () {
          // Sends message for update
          if( ([null,undefined,""].indexOf(widget.user().editShippingAddress().x_account_type()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().address1 ()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().city()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().selectedState()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().postalCode()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().country()) == -1) ){


for(var t=0;t<widget.user().shippingAddressBook().length;t++){
    if(widget.user().shippingAddressBook()[t].repositoryId ==  widget.user().editShippingAddress().repositoryId ){
     widget.user().shippingAddressBook()[t].address2(widget.addressLine2Part1()+" "+widget.addressLine2Part2())
          widget.user().shippingAddressBook()[t].country("US")
    }
}

          widget.createNewProfileAddress1(widget.convertToData(),widget.user().editShippingAddress().repositoryId);
          
//          $.Topic(PubSub.topicNames.USER_PROFILE_UPDATE_SUBMIT).publishWith(widget.user(), [{message: "success"}]);    

    

            widget.currentEdit("");
          
          }else{
              widget.allfieldserror(true);
          }
          

        };
        
                // Handles User profile update for shipping address modification
        widget.handleUpdateProfileForAddressBookNew = function () {
          // Sends message for update
          if( ([null,undefined,""].indexOf(widget.user().editShippingAddress().x_account_type()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().address1 ()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().city()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().state()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().postalCode()) == -1) 
          && ([null,undefined,""].indexOf(widget.user().editShippingAddress().country()) == -1) ){


/*for(var t=0;t<widget.user().shippingAddressBook().length;t++){
    if(widget.user().shippingAddressBook()[t].repositoryId ==  widget.user().editShippingAddress().repositoryId ){
     widget.user().shippingAddressBook()[t].address2(widget.addressLine2Part1()+" "+widget.addressLine2Part2())
    }
}
*/





    var r="";
    for(var i=0;i<widget.user().dynamicProperties().length;i++){
        if(widget.user().dynamicProperties()[i].id()=="home_phone_number"){
            r=widget.user().dynamicProperties()[i].value();
        }
    }
    
    var addree=
{
"addressType":"Address"+(widget.user().shippingAddresses().length),
"address":{
"address1":widget.user().editShippingAddress().address1(),
"address2":widget.user().editShippingAddress().address2(),
"address3":widget.user().editShippingAddress().address3(),
"county":"IL",
"country":widget.user().editShippingAddress().country(),
"state":widget.user().editShippingAddress().state(),
"firstName":widget.user().editShippingAddress().firstName(),
"lastName":widget.user().lastName(),
"companyName":widget.user().editShippingAddress().alias(),
"city":widget.user().editShippingAddress().city(),
"postalCode":widget.user().editShippingAddress().postCode,
"phoneNumber": r
}}

//                               CCRestClient.request(CCConstants.ENDPOINT_UPDATE_PROFILE, contactData, this.updateMemberSuccessFunction.bind(this,isRedirectionNeeded), this.updateMemberFailureFunction.bind(this), this.contactId());
          widget.createNewProfileAddress(widget.convertToData());
          

          
          }else{
              widget.allfieldserror(true);
          }
          

        };
        
        
        
        // Handles User profile update for shipping address modification and navigates to the clicked link.
        widget.handleModalUpdateProfile = function () {
          isModalSaveClicked(true);
          if ( widget.user().isSearchInitiatedWithUnsavedChanges() ) {
            widget.handleUpdateProfileForAddressBook();
            widget.hideModal();
            widget.user().isSearchInitiatedWithUnsavedChanges(false);
            return;
          }
          if (clickedElementId != "CC-loginHeader-myAccount") {
            widget.user().delaySuccessNotification(true);
          }
          widget.handleUpdateProfileForAddressBook();
        };
        
       // Handles if data does not change. 
        $.Topic(PubSub.topicNames.USER_PROFILE_UPDATE_NOCHANGE).subscribe(function() {
          // Resetting profile.
          widget.showViewProfile(false);
          // Hide the modal.
          widget.hideModal();
        });

        //handle if the user logs in with different user when the session expiry prompts to relogin
        $.Topic(PubSub.topicNames.USER_PROFILE_SESSION_RESET).subscribe(function() {
          // Resetting profile.
          widget.showViewProfile(false);
          // Hide the modal.
          widget.hideModal();
        });
        
        // Handles if data is invalid.
        $.Topic(PubSub.topicNames.USER_PROFILE_UPDATE_INVALID).subscribe(function() {
                        $('#Error-Modal').modal('show');
//          notifier.sendError(widget.WIDGET_ID, widget.ErrorMsg, true);
          if (isModalSaveClicked()) {
            widget.isUserProfileInvalid(true);
            isModalSaveClicked(false);
          }
          widget.user().delaySuccessNotification(false);
          // Hide the modal.
          widget.hideModal();
        });
        
        // Handles if user profile update is saved.
        $.Topic(PubSub.topicNames.USER_PROFILE_UPDATE_SUCCESSFUL).subscribe(function() {
        	widget.user().isUserProfileEdited(false);
          widget.showViewProfile(true);
          // Clears error message.
          notifier.clearError(widget.WIDGET_ID);
          notifier.clearSuccess(widget.WIDGET_ID);
          if (!widget.user().delaySuccessNotification()) {
                        $('#Save-Modal').modal('show');

                        
//            notifier.sendSuccess(widget.WIDGET_ID, widget.translate('updateSuccessMsg'), true);
          }
          widget.hideModal();
          if (isModalSaveClicked()) {
            isModalSaveClicked(false);
            widget.navigateAway();
          }
        });
        
        // Handles if user profile update is failed.
        $.Topic(PubSub.topicNames.USER_PROFILE_UPDATE_FAILURE).subscribe(function(data) {
          if (isModalSaveClicked()) {
            widget.isUserProfileInvalid(true);
            isModalSaveClicked(false);
          }
          widget.user().delaySuccessNotification(false);
          // Hide the modal.
          widget.hideModal();
          if (data.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
            widget.user().isSessionExpiredDuringSave(true);
            navigation.doLogin(navigation.getPath());
          } else {
            var msg = widget.passwordErrorMsg;
            notifier.clearError(widget.WIDGET_ID);
            notifier.clearSuccess(widget.WIDGET_ID);
            if (data.errorCode === CCConstants.USER_PROFILE_INTERNAL_ERROR) {
              msg = data.message;
              // Reloading user profile and shipping data in edit mode.
              widget.user().getCurrentUser(false);
              widget.reloadShipping();
            } else if (data.errors && data.errors.length > 0 && 
              (data.errors[0].errorCode === CCConstants.USER_PROFILE_SHIPPING_UPDATE_ERROR)) {
              msg = data.errors[0].message;
            } else {
              msg = data.message;
            }
                                    $('#Error-Modal').modal('show');
                    getWidget.errormessage(msg)
//            notifier.sendError(widget.WIDGET_ID, msg, true);
            widget.hideModal();
          }
        });
        
        $.Topic(PubSub.topicNames.USER_LOAD_SHIPPING).subscribe(function() {
          widget.reloadShipping();
        });
        
        $.Topic(PubSub.topicNames.UPDATE_USER_LOCALE_NOT_SUPPORTED_ERROR).subscribe(function() {
          widget.isProfileLocaleNotInSupportedLocales(true);
        });
        
        /**
         *  Navigates window location to the interceptedLink OR clicks checkout/logout button explicitly.
         */
        widget.navigateAway = function() {

          if (clickedElementId === "CC-header-checkout" || clickedElementId === "CC-loginHeader-logout" || clickedElementId === "CC-customerAccount-view-orders" 
              || clickedElementId === "CC-header-language-link" || clickedElementId.indexOf("CC-header-languagePicker") != -1) {
            widget.removeEventHandlersForAnchorClick();
            widget.showViewProfile(false);
            // Get the DOM element that was originally clicked.
            var clickedElement = $("#"+clickedElementId).get()[0];
            clickedElement.click();
          } else if (clickedElementId === "CC-loginHeader-myAccount") {
            // Get the DOM element that was originally clicked.
            var clickedElement = $("#"+clickedElementId).get()[0];
            clickedElement.click();
          } else {
            if (!navigation.isPathEqualTo(widget.interceptedLink)) {
              navigation.goTo(widget.interceptedLink);
              widget.removeEventHandlersForAnchorClick();
            }
          }
        };
        
        // handler for anchor click event.
        var handleUnsavedChanges = function(e, linkData) {
          var usingCCLink = linkData && linkData.usingCCLink;
          
          widget.isProfileLocaleNotInSupportedLocales(false);
          // If URL is changed explicitly from profile.
//          if(!usingCCLink && !navigation.isPathEqualTo(widget.links().profile.route)) {
//            widget.showViewProfile(false);
//            widget.removeEventHandlersForAnchorClick();
//            return true;
//          }
          if (widget.user().loggedIn()) {
            clickedElementId = this.id;
            widget.interceptedLink = e.currentTarget.pathname;
            if (widget.isUserProfileShippingEdited() || widget.isUserProfileDefaultAddressEdited()) {
              widget.showModal();
              usingCCLink && (linkData.preventDefault = true);
              return false;
            }
            else {
              widget.showViewProfile(false);
            }
          }
        };
        
        var controlErrorMessageDisplay = function(e) {
          widget.isProfileLocaleNotInSupportedLocales(false);
        };
        
        /**
         *  Adding event handler for anchor click.
         */
        widget.addEventHandlersForAnchorClick = function() {
          $("body").on("click.cc.unsaved","a",handleUnsavedChanges);
          $("body").on("mouseleave", controlErrorMessageDisplay);
        };
        
        /**
         *  removing event handlers explicitly that has been added when anchor links are clicked.
         */
        widget.removeEventHandlersForAnchorClick = function(){
          $("body").off("click.cc.unsaved","a", handleUnsavedChanges);
        };
      },
          createNewProfileAddress: function(pData) {
      var widget = this;
//      widget.operationPerformedOnAddresses("created");
      //AgentApplication - User id required in agent application
      if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
        CCRestClient.request(CCConstants.END_POINT_ADD_PROFILE_ADDRESS, pData, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget), widget.user().id());
      } else {
        CCRestClient.request(CCConstants.END_POINT_ADD_PROFILE_ADDRESS, pData, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget));
      }
    },
    
      createNewProfileAddress1: function(pData,id) {
      var widget = this;
//      widget.operationPerformedOnAddresses("created");
      //AgentApplication - User id required in agent application
        CCRestClient.request(CCConstants.END_POINT_UPDATE_PROFILE_ADDRESS, pData, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget), id);
//        CCRestClient.request(CCConstants.END_POINT_UPDATE_PROFILE_ADDRESS, pData, widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget));

    },
    
    
    /**
     * address to data object
     */
    convertToData: function(pData) {
      var widget = this;
      var data = {};
      
      
      
      if(widget.user().editShippingAddress().alias()){
      data[CCConstants.ORG_ADDRESS_TYPE] = widget.user().editShippingAddress().alias();          
      }else{
    data[CCConstants.ORG_ADDRESS_TYPE] = "Address"+(widget.user().shippingAddresses().length);
      }

      
      var address = {};
      
       address['Address_Status'] = widget.user().editShippingAddress().Address_Status();
       
      address[CCConstants.ORG_ADDRESS_1] = widget.user().editShippingAddress().address1();
      if(widget.addressLine2Part2() || widget.addressLine2Part1()) {
        address[CCConstants.ORG_ADDRESS_2] =widget.addressLine2Part1()+" "+widget.addressLine2Part2();
      //  address[CCConstants.ORG_ADDRESS_2] ="";
      }else{
        address[CCConstants.ORG_ADDRESS_2] ="";
      }
      address["x_account_type"]=widget.user().editShippingAddress().x_account_type()

      
      if((widget.user().editShippingAddress().address3() === null || widget.user().editShippingAddress().address3() === undefined || widget.user().editShippingAddress().address3() === "")) {
        address[CCConstants.ORG_ADDRESS_3] ="";
      }else{
        address[CCConstants.ORG_ADDRESS_3] =widget.user().editShippingAddress().address3();
      }
      if((widget.user().editShippingAddress().county() === null || widget.user().editShippingAddress().county() === undefined || widget.user().editShippingAddress().county() === "")) {
        address[CCConstants.ORG_COUNTY] ="";
      }else{
        address[CCConstants.ORG_COUNTY] =widget.user().editShippingAddress().county();
      }
      address[CCConstants.ORG_COUNTRY] = "US";
      if([null,undefined,""].indexOf(widget.user().editShippingAddress().state())!= -1) {
        address[CCConstants.ORG_STATE] = "";
      } else {
        address[CCConstants.ORG_STATE] = widget.user().editShippingAddress().state();
      }
      
      if(widget.currentEdit() == "new"){
                address["state"]=widget.user().editShippingAddress().state();
      }else{
      address["state"]=widget.user().editShippingAddress().selectedState();          
      }
      

      
      
      
      widget.user().editShippingAddress().state()
      
      if((widget.user().editShippingAddress().firstName() === null || widget.user().editShippingAddress().firstName() === undefined || widget.user().editShippingAddress().firstName() === "")) {
        address[CCConstants.PROFILE_FIRST_NAME]=""
      }else{
        address[CCConstants.PROFILE_FIRST_NAME] = widget.user().editShippingAddress().firstName();
      }
      if((widget.user().editShippingAddress().lastName() === null || widget.user().editShippingAddress().lastName() === undefined || widget.user().editShippingAddress().lastName() === "")) {
        address[CCConstants.PROFILE_LAST_NAME]="";
      }else{
        address[CCConstants.PROFILE_LAST_NAME] = widget.user().editShippingAddress().lastName();
      } 
      if((widget.user().editShippingAddress().companyName() === null || widget.user().editShippingAddress().companyName() === undefined || widget.user().editShippingAddress().companyName() === "")){
        address[CCConstants.ORG_COMPANY_NAME] = "";
      }else{
        address[CCConstants.ORG_COMPANY_NAME] =  widget.user().editShippingAddress().companyName();
      }  
      address[CCConstants.ORG_CITY] = widget.user().editShippingAddress().city();
      address[CCConstants.ORG_POSTAL_CODE] = widget.user().editShippingAddress().postalCode();
      if((widget.user().editShippingAddress().phoneNumber() === null || widget.user().editShippingAddress().phoneNumber() === undefined || widget.user().editShippingAddress().phoneNumber() === "")) {
        address[CCConstants.ORG_PHONE_NUMBER] = "";
      }else{
        address[CCConstants.ORG_PHONE_NUMBER] =widget.user().editShippingAddress().phoneNumber();        
      }  
      
      address["special_delivery_instructions"]=widget.user().editShippingAddress().special_delivery_instructions();
      address["selectedCountry"] = widget.user().editShippingAddress().selectedCountry();
      address[CCConstants.ORG_IS_DEFAULT_BILLING_ADDRESS] = widget.user().editShippingAddress().isDefaultBillingAddress();
      address[CCConstants.ORG_IS_DEFAULT_SHIPPING_ADDRESS] = widget.user().editShippingAddress().isDefaultShippingAddress();
      //For B2C user, make the first address as default shipping address

        address[CCConstants.ORG_IS_DEFAULT_SHIPPING_ADDRESS] = false;

/*      for(var i = 0; i< widget.dynamicProperties().length; i++) {
        if (widget.dynamicProperties()[i].type() === "enum") {
          address[widget.dynamicProperties()[i].id()] = widget.dynamicProperties()[i].values;
        } else {
          address[widget.dynamicProperties()[i].id()] = widget.dynamicProperties()[i].value();
        }
      }*/
          address["isDefaultShippingAddress"]=widget.user().editShippingAddress().isDefaultShippingAddress()
      data[CCConstants.ORG_ADDRESS] = address;
      return data;
    },
    
    
      editBillingAddress: function(){
          
          
          getWidget.isUserProfileBillingEdited(true);
          $('#edit-billing-address').show();
          $("#b2cAddresses").hide();
      },
      billingAddressParse: function(str,name){
str.indexOf(name)
str.indexOf(":",str.indexOf(name))
var last;
if(str.indexOf(",",str.indexOf(name))==-1){
  last=str.indexOf("}",str.indexOf(name))
}else{
   last=str.indexOf(",",str.indexOf(name))    
}

return str.substring(str.indexOf(":",str.indexOf(name))+1,last);

      },
    billingAddressMerge: function(str,name){

var last;
if(str.indexOf(",",str.indexOf(name))==-1){
  last=str.indexOf("}",str.indexOf(name))
}else{
   last=str.indexOf(",",str.indexOf(name))    
}

return str.substring(str.indexOf(":",str.indexOf(name))+1,last);

      },
         backToMyaccount: function(){
 navigation.goTo('/myaccount');
     },
     
     
     
     
           			validateAddress1: function (index, event,data3) {
      			    
				if (event !== undefined) {
				     if (event.keyCode == 9) {
				//	if ('click' === event.type  || 'change' === event.type || 'mouseout' === event.type) {
			 		var orderRefreshIndicatorOptions = {
											parent: '#main',
											posTop: '20em',
											posLeft: '50%'
											}
											$('#main').addClass('loadingIndicator');
											$('#main').css('position', 'relative');
											spinner.create(orderRefreshIndicatorOptions);
					
						var isAddressValid = false;
						
/*						getWidget.addresses()

					getWidget.currentAddress()
*/					
 

	
						
						if ([null, undefined, ''].indexOf(data3.address1()) == -1 &&
[null, undefined, ''].indexOf(data3.city()) == -1 &&
[null, undefined, ''].indexOf(data3.postalCode()) == -1 &&
[null, undefined, ''].indexOf(data3.country()) == -1 &&
[null, undefined, ''].indexOf(data3.state()) == -1) {
    
						    
			          			   
      			   	if(getWidget.currentEdit() == "new"){
            			    var data={
                                "address1": data3.address1(),
                                "address2": getWidget.addressLine2Part1()+" "+getWidget.addressLine2Part2(),
                                "city":data3.city(),
                                "state":data3.state(),
                                "postalCode":data3.postalCode(),
                                "country":data3.country()
                                 }
                                        var flag=getWidget.addressExisted();
                for(var i=0;i<getWidget.allAddressesCheck().length;i++){
            	if (JSON.stringify(getWidget.allAddressesCheck()[i]).toLowerCase().replaceAll(" ","") === JSON.stringify(data).toLowerCase().replaceAll(" ","")) {
            	      flag=true;
            	      $('#CC-addressSuggestionMessagePane1').hide();
            	      $('#main').removeClass('loadingIndicator');
												spinner.destroy();
						
                    /*	     if(!flag){
                    	    getWidget.addressExisted(true)
            	    }*/
                    	    break;
            	}else{
            	      flag=false;
                      	 /*   getWidget.addressExisted(false)*/
            	    
            	}
                }  //end of for loop

  if(getWidget.addressExisted() !== flag ){
                    	    getWidget.addressExisted(flag)
            	              }

            			}
      			    
      			    
							if (!getWidget.addressExisted()) {
								var request = {};
											request = {
												"address1": data3.address1(),
												"address2": getWidget.addressLine2Part1()+" "+getWidget.addressLine2Part2(),
												"city": data3.city(),
												"state": data3.state(),
												"postalCode": data3.postalCode(),
												"country": data3.country()
											};
										var settings = {
											"url": "/ccstorex/custom/v1/addressValidation",
											"method": "POST",
											"data": JSON.stringify(request),
											"async": false,
											"contentType": "application/json"
										};
										var matched = false;
											if (JSON.stringify(getWidget.addressValidationRequest1()) !== JSON.stringify(request)) {
												matched = true;
											}else
											{
											    $('#main').removeClass('loadingIndicator');
												spinner.destroy();
											}
										
										if (matched) {
										getWidget.addressValidationRequest1(request);
											$.ajax(settings).done(function (response) {
												$('#main').removeClass('loadingIndicator');
												spinner.destroy();
												console.log("Response :: ", response);
												if (response) {
													if (response.validatedAddresses) {
														console.log("Under valid ADDRESS");
														if (response.hasOwnProperty('messages')) {
															getWidget.addressvalidationMessage(response.messages[0].summary);
															getWidget.validAddresses([]);
															$('#CC-addressSuggestionMessagePane1').show();
														} else {
															if (response.validatedAddresses.length > 0) {
																//spinner.destroy();
																console.log("Under valid ADDRESS LENGTH");
																getWidget.addressvalidationMessage("");
																getWidget.validAddresses(response.validatedAddresses);
																$('#CC-addressSuggestionMessagePane1').show();
															}
														}
													}
												}
											})
										} //end of checking two requests
										else{
										    console.log("already have");
										}
									
									return true;
						//		}
							}else{
							    
							    
							  
							    	$('#main').removeClass('loadingIndicator');
												spinner.destroy();
							}
						}
						else
						{
						    	$('#main').removeClass('loadingIndicator');
												spinner.destroy();
						}
					}
				}
				return true;
			},
      
            			validateAddress: function (index, event) {
				if (event !== undefined) {
				     if (event.keyCode == 9) {
//					if ('click' === event.type  || 'change' === event.type || 'mouseout' === event.type) {
			 		var orderRefreshIndicatorOptions = {
											parent: '#main',
											posTop: '20em',
											posLeft: '50%'
											}
											$('#main').addClass('loadingIndicator');
											$('#main').css('position', 'relative');
											spinner.create(orderRefreshIndicatorOptions);
					
						var isAddressValid = false;
						
						if ([null, undefined, ''].indexOf(getWidget.address1()) == -1 &&
[null, undefined, ''].indexOf(getWidget.city()) == -1 &&
[null, undefined, ''].indexOf(getWidget.postalCode()) == -1 &&
[null, undefined, ''].indexOf(getWidget.country()) == -1 &&
[null, undefined, ''].indexOf(getWidget.state()) == -1) {
						    
						    
						    
						    
						    
						    
						    
							if (true) {
								var request = {};
											request = {
												"address1": getWidget.address1(),
												"address2": getWidget.address3()+" "+getWidget.address2(),
												"city": getWidget.city(),
												"state": getWidget.state(),
												"postalCode": getWidget.postalCode(),
												"country": getWidget.country()
											};
										var settings = {
											"url": "/ccstorex/custom/v1/addressValidation",
											"method": "POST",
											"data": JSON.stringify(request),
											"async": false,
											"contentType": "application/json"
										};
										var matched = false;
											if (JSON.stringify(getWidget.addressValidationRequest()) !== JSON.stringify(request)) {
												matched = true;
											}else
											{
											    $('#main').removeClass('loadingIndicator');
												spinner.destroy();
											}
										
										if (matched) {
										getWidget.addressValidationRequest(request);
											$.ajax(settings).done(function (response) {
												$('#main').removeClass('loadingIndicator');
												spinner.destroy();
												console.log("Response :: ", response);
												if (response) {
													if (response.validatedAddresses) {
														console.log("Under valid ADDRESS");
														if (response.hasOwnProperty('messages')) {
															getWidget.addressvalidationMessage(response.messages[0].summary);
															getWidget.validAddresses([]);
															$('#CC-addressSuggestionMessagePane').show();
														} else {
															if (response.validatedAddresses.length > 0) {
																//spinner.destroy();
																console.log("Under valid ADDRESS LENGTH");
																getWidget.addressvalidationMessage("");
																getWidget.validAddresses(response.validatedAddresses);
																$('#CC-addressSuggestionMessagePane').show();
															}
														}
													}
												}
											})
										} //end of checking two requests
										else{
										    console.log("already have");
										}
									
									return true;
						//		}
							}else{
							    	$('#main').removeClass('loadingIndicator');
												spinner.destroy();
							}
						}
						else
						{
						    	$('#main').removeClass('loadingIndicator');
												spinner.destroy();
						}
					}
				}
				return true;
			},
			closecompanyexistmodal: function () {
				$('#CC-companyAlreadyRegistered-Modal').hide();

				return true;
			},
					closecompanyaddressexistmodal: function () {
				$('#CC-companyAddressAlreadyRegistered-Modal').hide();

				return true;
			},
			closesuggesionmodal: function () {
				$('#CC-addressSuggestionMessagePane').hide();

				return true;
			},
		closesuggesionmodal1: function () {
				$('#CC-addressSuggestionMessagePane1').hide();

				return true;
			},

			      	setSelectedAddress: function () {
/*    							getWidget.address1(getWidget.validAddresses()[0].line1)
    							getWidget.address2(getWidget.validAddresses()[0].line2)
    							getWidget.address3(getWidget.validAddresses()[0].line3)
    							getWidget.postalCode(getWidget.validAddresses()[0].postalCode)
    							getWidget.city(getWidget.validAddresses()[0].city)
    							getWidget.state(getWidget.validAddresses()[0].region)
*/    							

												getWidget.address1(getWidget.validAddresses()[0].line1)
										//		 getWidget.address3()+" "+getWidget.address2(),
												 getWidget.city(getWidget.validAddresses()[0].city)
												 getWidget.state(getWidget.validAddresses()[0].region)
												 getWidget.postalCode(getWidget.validAddresses()[0].postalCode)
												//getWidget.country()
												
    							
    							
/*    						getWidget.currentAddress().address.address1=getWidget.validAddresses()[0].line1;
    							getWidget.currentAddress().address.address3=getWidget.validAddresses()[0].line3;
//				      getWidget.addressLine2Part1(getWidget.validAddresses()[0].line2)
											getWidget.currentAddress().address.city=getWidget.validAddresses()[0].city
											getWidget.currentAddress().address.state=getWidget.validAddresses()[0].region
										getWidget.currentAddress().address.postalCode=getWidget.validAddresses()[0].postalCode

    							var dataa=getWidget.currentAddress();
//    							getWidget.currentAddress("")
    							getWidget.currentAddress(dataa)*/
    							
    							
    							
    							
    							
    							
    								$('#CC-addressSuggestionMessagePane').hide();
    								
				return true;
			      	},      
			      	
			      	
      	setSelectedAddress1: function () {
/*    							getWidget.address1(getWidget.validAddresses()[0].line1)
    							getWidget.address2(getWidget.validAddresses()[0].line2)
    							getWidget.address3(getWidget.validAddresses()[0].line3)
    							getWidget.postalCode(getWidget.validAddresses()[0].postalCode)
    							getWidget.city(getWidget.validAddresses()[0].city)
    							getWidget.state(getWidget.validAddresses()[0].region)
*/    							
getWidget.user().editShippingAddress().address1(getWidget.validAddresses()[0].line1)
getWidget.user().editShippingAddress().city(getWidget.validAddresses()[0].city)
getWidget.user().editShippingAddress().state(getWidget.validAddresses()[0].region)
getWidget.user().editShippingAddress().postalCode(getWidget.validAddresses()[0].postalCode)



							          			    if(getWidget.currentEdit() == "new"){
      			         var data={
                                "address1": getWidget.validAddresses()[0].line1,
                                "address2": getWidget.addressLine2Part1()+" "+getWidget.addressLine2Part2(),
                                "city":getWidget.validAddresses()[0].city,
                                "state":getWidget.validAddresses()[0].region,
                                "postalCode":getWidget.validAddresses()[0].postalCode,
                                "country":"us"
                                 }
                                    var flag=getWidget.addressExisted();
                                     for(var i=0;i<getWidget.allAddressesCheck().length;i++){
            	if (JSON.stringify(getWidget.allAddressesCheck()[i]).toLowerCase() === JSON.stringify(data).toLowerCase()) {
                    	   if(!flag){
                    	    getWidget.addressExisted(true)
            	    }
//                    	     $('#CC-companyAddressAlreadyRegistered-Modal').show();
                    	    break;
            	}else{
  //          	     $('#CC-companyAddressAlreadyRegistered-Modal').hide();
                      	    getWidget.addressExisted(false)
            	    
            	}
                }
      			    }   //end of checking new or not
      			    
/*												getWidget.address1(getWidget.validAddresses()[0].line1)
										//		 getWidget.address3()+" "+getWidget.address2(),
												 getWidget.city(getWidget.validAddresses()[0].city)
												 getWidget.state(getWidget.validAddresses()[0].region)
												 getWidget.postalCode(getWidget.validAddresses()[0].postalCode)
												//getWidget.country()
												
    							
    							getWidget.user().editShippingAddress()
*/    							
/*    						getWidget.currentAddress().address.address1=getWidget.validAddresses()[0].line1;
    							getWidget.currentAddress().address.address3=getWidget.validAddresses()[0].line3;
//				      getWidget.addressLine2Part1(getWidget.validAddresses()[0].line2)
											getWidget.currentAddress().address.city=getWidget.validAddresses()[0].city
											getWidget.currentAddress().address.state=getWidget.validAddresses()[0].region
										getWidget.currentAddress().address.postalCode=getWidget.validAddresses()[0].postalCode

    							var dataa=getWidget.currentAddress();
//    							getWidget.currentAddress("")
    							getWidget.currentAddress(dataa)*/
    							
    							
    							
    							
    							
    							
    								$('#CC-addressSuggestionMessagePane1').hide();
    								
				return true;
			      	},   
			      	
     
     
     
      updateBilling: function(address){
          console.log("updating the billing address");
                   var widget=this;     
                   
    if(([null,undefined,""].indexOf(getWidget.address1()) === -1 ) && ([null,undefined,""].indexOf(getWidget.address1()) === -1 ) && ([null,undefined,""].indexOf(getWidget.address1()) === -1 ) && ([null,undefined,""].indexOf(getWidget.address1()) === -1 ) && ([null,undefined,""].indexOf(getWidget.address1()) === -1 ) ){

//  getWidget.user().dynamicProperties()[6].id()

  //"default_billingAddress_data"

for(var i=0;i<getWidget.user().dynamicProperties().length;i++){
    if(getWidget.user().dynamicProperties()[i].id() == "default_billingAddress_data"){
        var billaddr=getWidget.user().dynamicProperties()[i].value();
        

billaddr=billaddr.substring(0,billaddr.indexOf("companyName")+12)+getWidget.companyName()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("companyName")));

billaddr=billaddr.substring(0,billaddr.indexOf("alias")+6)+getWidget.alias()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("alias")));

billaddr=billaddr.substring(0,billaddr.indexOf("address1")+9)+getWidget.address1()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("address1")));

billaddr=billaddr.substring(0,billaddr.indexOf("address2")+9)+getWidget.addressLine2Part1()+""+getWidget.addressLine2Part2()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("address2")));

billaddr=billaddr.substring(0,billaddr.indexOf("address3")+9)+getWidget.address3()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("address3")));

billaddr=billaddr.substring(0,billaddr.indexOf("city")+5)+getWidget.city()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("city")));

billaddr=billaddr.substring(0,billaddr.indexOf("state")+6)+getWidget.state()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("state")));

billaddr=billaddr.substring(0,billaddr.indexOf("postalCode")+11)+getWidget.postalCode()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("postalCode")));

billaddr=billaddr.substring(0,billaddr.indexOf("country")+8)+getWidget.country()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("country")));

billaddr=billaddr.substring(0,billaddr.indexOf("firstName")+10)+getWidget.firstName()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("firstName")));

billaddr=billaddr.substring(0,billaddr.indexOf("lastName")+9)+getWidget.lastName()+billaddr.substring(billaddr.indexOf(",",billaddr.indexOf("lastName")));

        
getWidget.user().dynamicProperties()[i].value(billaddr);
        
    }
}

var req={default_billingAddress_data:billaddr}

CCRestClient.request(CCConstants.ENDPOINT_UPDATE_PROFILE, req, widget.profileCreateOrUpdateSuccess.bind(widget) ,  widget.profileAddressSaveFailure.bind(widget) , getWidget.user().id());
  
//              $.Topic(PubSub.topicNames.USER_PROFILE_UPDATE_SUBMIT).publishWith(getWidget.user(), [{message: "success"}]);

           $("#edit-billing-address").hide();
           $("#b2cAddresses").show();
           
        
    }else{
        getWidget.allfieldserror1(true);
    }
        
  /*
  var add={"addressType":CCRestClient.profileType,"address":address};
  CCRestClient.request(CCConstants.END_POINT_UPDATE_ADDRESSES, add, widget.createOrUpdateSuccess.bind(widget), widget.saveFailure.bind(widget),widget.repositoryId);
  */

           
      },
            			validatingData: function (data, event,user) {
				var self = data;
				  var label;
				if ('click' === event.type || 'blur' === event.type  || event.keyCode === 9) {
				    if(event.target.value === "")
				    {
				        console.log("data is null");	
    				
						event.target.style = "border: 2px solid #f33";
				        if(event.target.id !== null){
				            label = event.target.id + "-label"; 
    				        document.getElementById(label).style = "color:#f33";				        
				        }

				        



				    }else{
				        console.log("data is not null");
				        
						event.target.style = "border: 2px solid #d3d3d";
				        if(event.target.id !== null){
				            label = event.target.id + "-label"; 
    				        document.getElementById(label).style = "color:black";				        
				        }

				    }
				}
				return true;
        			},
        			
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
    
        profileCreateOrUpdateSuccess: function(pResponse) {
      var widget = this;

        	widget.user().isUserProfileEdited(false);
          widget.showViewProfile(true);
                      widget.currentEdit("");
                        $('#Save-Modal').modal('show');
                        
               $("#edit-shipping-address").hide();
           $("#b2cAddresses").show();


    },
    
    changestatus: function(index){
getWidget.user().shippingAddressBook()[index].Address_Status(false);
getWidget.user().organizationAddressBook[index].Address_Status=false;
getWidget.user().editShippingAddress(getWidget.user().shippingAddressBook()[index])

  getWidget.createNewProfileAddress1(getWidget.convertToData(),getWidget.user().editShippingAddress().repositoryId);
 // widget.profileCreateOrUpdateSuccess.bind(widget), widget.profileAddressSaveFailure.bind(widget)
//    CCRestClient.request(CCConstants.END_POINT_UPDATE_ADDRESSES, getWidget.convertToData() , getWidget.profileCreateOrUpdateSuccess.bind(getWidget), getWidget.profileAddressSaveFailure.bind(getWidget),getWidget.user().editShippingAddress().repositoryId);
  
/*var da=getWidget.addressStatus();
      getWidget.addressStatus("");
      getWidget.addressStatus(da);
*/      
      
/*var da=getWidget.user().organizationAddressBook;
getWidget.user().organizationAddressBook=[];
*/
// $.Topic(PubSub.topicNames.USER_PROFILE_UPDATE_SUBMIT).publishWith(getWidget.user(), [{message: "success"}]);
//getWidget.handleUpdateProfileForAddressBook();

//getWidget.user().organizationAddressBook=da

            },
            
            	closecompanyexistmodal: function () {
				$('#CC-companyAlreadyRegistered-Modal').hide();

				return true;
			},
			closesuggesionmodal: function () {
				$('#CC-addressSuggestionMessagePane').hide();

				return true;
			},
			
			     updateShippingAddressContact: function(data,event,type) {
      var widget = this;
/*if(event.originalEvent){
for(var i=0;i<widget.secondaryAddresses().length;i++){
    if(widget.secondaryAddresses()[i].address.repositoryId == data.address.repositoryId ){
          CCRestClient.request(CCConstants.END_POINT_UPDATE_ADDRESSES, data , widget.createOrUpdateSuccess.bind(widget), widget.saveFailure.bind(widget),data.address.repositoryId);
}    
}
}*/
    },
    
    
			
    changestatus1: function(index){
        getWidget.user().shippingAddressBook()[index].Address_Status(true);
        getWidget.user().organizationAddressBook[index].Address_Status=true;

getWidget.user().editShippingAddress(getWidget.user().shippingAddressBook()[index])
getWidget.createNewProfileAddress1(getWidget.convertToData(),getWidget.user().editShippingAddress().repositoryId);
  
          
          
            },
      backtomain: function(){
          getWidget.isUserProfileShippingEdited(false);
         $("#edit-billing-address").hide();
           $("#b2cAddresses").show();
      }
    };
  }
);
