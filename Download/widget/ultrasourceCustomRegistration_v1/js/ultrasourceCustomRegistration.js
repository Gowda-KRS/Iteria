define(
	//-------------------------------------------------------------------
	// DEPENDENCIES
	//-------------------------------------------------------------------
	['jquery', 'knockout', 'notifier', 'ccPasswordValidator', 'viewModels/selfRegistrationViewModel', 'viewModels/address', 'pubsub', 'CCi18n',
		'ccConstants', 'navigation', 'ccLogger', 'storageApi', 'ccRestClient', 'spinner'
	],

	//-------------------------------------------------------------------
	// MODULE DEFINITION
	//-------------------------------------------------------------------
	function ($, ko, notifier, CCPasswordValidator, selfRegistration, Address, pubsub, CCi18n, CCConstants, navigation, ccLogger, storageApi, ccRestClient, spinner) {
		"use strict";
		var getWidget = "";
		console.log("Inside custom");

		return {

			modalMessageType: ko.observable(''),
			verifiedemail: ko.observable(''),	
			oldCompanyName: ko.observable(''),
			modalMessageText: ko.observable(''),
			showErrorMessage: ko.observable(false),
			nextButtonError: ko.observable(false),
			saveButtonError:ko.observable(false),
			userCreated: ko.observable(false),
			isEmptyPrimaryBusiness: ko.observable(false),
			isEmptyAddressType: ko.observable(false),
			companyNameError: ko.observable("Company name is mandatory."),
			isCompanyNameError: ko.observable(false),
			addressTypeError: ko.observable("Please select type of address."),
			primaryBusinessError: ko.observable("Please select primary business."),
			ignoreBlur: ko.observable(false),
			selfRegistrationRequest: ko.observable(new selfRegistration()),
			radioSelectedOptionValue: ko.observable(),
			radioSelectedAddressValue: ko.observable(),
			ignoreOrgRequestEmailValidation: ko.observable(true),
			selectedTitle: ko.observable(),
			specialInstructions : ko.observable(),
			validAddresses: ko.observableArray([]),
			selectedBillingAddress2Type: ko.observable(),
			selectedShippingAddress2Type: ko.observable(),
			homePhoneNumber: ko.observable(),
			isInvalidMobilePhoneNumber: ko.observable(false),
			isInvalidFaxPhoneNumber: ko.observable(false),
			isInvalidOfficePhoneNumber: ko.observable(false),
			isInvalidHomePhoneNumber: ko.observable(false),
			isInvalidHomePhoneNumber1: ko.observable(false),
			isInvalidEmailAddress: ko.observable(false),
			isInvalidPrimaryPhoneNumber: ko.observable(false),
			isInvalidSecondaryPhoneNumber: ko.observable(false),
			invalidPhoneNumber: ko.observable("Please enter valid office number."),
			invalidPhoneNumber1: ko.observable("Office number is mandatory."),
			invalidPhoneNumber2: ko.observable("Please enter valid home number."),
			invalidPhoneNumber3: ko.observable("Home number is mandatory."),
			invalidSecondaryPhoneNumber: ko.observable("Please enter valid mobile number."),
			invalidFaxPhoneNumber: ko.observable("Please enter valid fax number."),
			noOfEmployees: ko.observable(),
			receiveEmail: ko.observable(true),
			userFound: ko.observable(false),
			organizationFound: ko.observable(false),
			annualRevenue: ko.observable(),
			secondaryBusiness: ko.observable(),
			primaryBusiness: ko.observable(),
			stateArray: ko.observableArray([]),
			revenueArray: ko.observableArray([]),
			employeeArray: ko.observableArray([]),
			billingAddressCopyCheck: ko.observable(false),
			primaryBusinessArray: ko.observableArray([]),
			secondaryBusinessArray: ko.observableArray([]),
			titleArray: ko.observableArray([]),
			rolesArray: ko.observableArray([]),
			addressArray: ko.observableArray([]),
			addressTypeArray: ko.observableArray([]),
			countryData: {},
			title: ko.observable(),
			role: ko.observable(),
			mobileNumber: ko.observable(),
			officeNumber: ko.observable(),
			faxNumber: ko.observable(),
			primaryNumber: ko.observable(),
			secondaryNumber: ko.observable(),
			receiveTexts: ko.observable(true),
			receiveMails: ko.observable(true),
			receiveCatalogs: ko.observable(true),
			//karthick added for new shipping custom checkboxes
			liftGateFee: ko.observable(false),
			insidePickup: ko.observable(false),
			resPickup: ko.observable(false),
			limitedAccessPickup: ko.observable(false),
			addressvalidationMessage: ko.observable(),
            activeIndex: ko.observable(),
			addressValidationRequest: ko.observable(),
			addressValidationRequest1: ko.observable(),
            selectedRegistrationOption: ko.observable(),

			beforeAppear: function (page) {
				console.log("Page :", page);
				getWidget.hideAllRegisterSections();
				setTimeout(function(){
				$('#CC-submitSelfRegistrationRequestType').show();
				    }, 1000);
				    
				    ////karthick added for new shipping custom checkboxes value
				getWidget.liftGateFee.subscribe(function (newValue) {
					console.log("liftGateFee",newValue);
					getWidget.liftGateFee(newValue);
					if(newValue == true){
				    	$("#customCheckboxLift").addClass("customCheckboxSelect");
				    	$("#customCheckboxLiftb2b").addClass("customCheckboxSelect");
					}
					else{
					    $("#customCheckboxLift").removeClass("customCheckboxSelect");
					    $("#customCheckboxLiftb2b").removeClass("customCheckboxSelect");
					}
				});
				
				getWidget.insidePickup.subscribe(function (newValue) {
					console.log("insidePickup",newValue);
					getWidget.insidePickup(newValue);
					if(newValue == true){
				    	$("#customCheckboxInside").addClass("customCheckboxSelect");
				    	$("#customCheckboxInsideb2b").addClass("customCheckboxSelect");
					}
					else{
					    $("#customCheckboxInside").removeClass("customCheckboxSelect");
					    $("#customCheckboxInsidb2be").removeClass("customCheckboxSelect");
					}
				});
				
				/*getWidget.resPickup.subscribe(function (newValue) {
					console.log("resPickup",newValue);
					getWidget.resPickup(newValue);
					if(newValue == true){
				    	$("#customCheckboxRes").addClass("customCheckboxSelect");
					}
					else{
					    $("#customCheckboxRes").removeClass("customCheckboxSelect");
					}
				});*/
				
				getWidget.limitedAccessPickup.subscribe(function (newValue) {
					console.log("limitedAccessPickup",newValue);
					getWidget.limitedAccessPickup(newValue);
					if(newValue == true){
				    	$("#customCheckboxLimit").addClass("customCheckboxSelect");
				    	$("#customCheckboxLimitb2b").addClass("customCheckboxSelect");
					}
					else{
					    $("#customCheckboxLimit").removeClass("customCheckboxSelect");
					    $("#customCheckboxLimitb2b").removeClass("customCheckboxSelect");
					}
				});
				

//				document.getElementById("CC-submitSelfRegistrationRequestType").style.display = "block";
					console.log("Display");
			},
			onLoad: function (widget) {
				var self = this;
				getWidget = widget;
				widget.billingAddressCopyCheck.subscribe(function (newValue) {
				    var type;
					if (widget.billingAddressCopyCheck() === true) {
						if (getWidget.radioSelectedOptionValue() === "Individual") {
							document.getElementById("billingAddressCopyCheck-Check").style.background = "#ff3333"
							document.getElementById("individual-shipping-add").selectedIndex = self.addressArray.indexOf(getWidget.selectedBillingAddress2Type());
							document.getElementById("CC-userRegistration-address11-label").style = "color:black";
                            document.getElementById("CC-userRegistration-address11").style = "border: 2px solid #d3d3d";
                            document.getElementById("CC-userRegistration-state1-label").style = "color:black";
                            document.getElementById("CC-userRegistration-state1").style = "border: 2px solid #d3d3d";
                            document.getElementById("CC-userRegistration-city1-label").style = "color:black";
                            document.getElementById("CC-userRegistration-city1").style = "border: 2px solid #d3d3d";
                            document.getElementById("CC-userRegistration-zipCode1-label").style = "color:black";
                            document.getElementById("CC-userRegistration-zipCode1").style = "border: 2px solid #d3d3d";
                            
						} else {
							document.getElementById("billingAddressCopyCheck-Check1").style.background = "#ff3333"
							document.getElementById("business-shipping-add").selectedIndex = self.addressArray.indexOf(getWidget.selectedBillingAddress2Type());
							document.getElementById("CC-userBusinessRegistration-shippingCompany-label").style = "color:black";
                            document.getElementById("CC-userBusinessRegistration-shippingCompany").style = "border: 2px solid #d3d3d";
                            document.getElementById("CC-userBusinessRegistration-address11-label").style = "color:black";
                            document.getElementById("CC-userBusinessRegistration-address11").style = "border: 2px solid #d3d3d";
                            document.getElementById("CC-userBusinessRegistration-state1-label").style = "color:black";
                            document.getElementById("CC-userBusinessRegistration-state1").style = "border: 2px solid #d3d3d";
                            $('.boxtype').append('<style>.boxtype:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
                            document.getElementById("CC-userBusinessRegistration-zipCode1-label").style = "color:black";
                            document.getElementById("CC-userBusinessRegistration-zipCode1").style = "border: 2px solid #d3d3d";
                            document.getElementById("CC-userBusinessRegistration-city1-label").style = "color:black";
                            document.getElementById("CC-userBusinessRegistration-city1").style = "border: 2px solid #d3d3d";
                            document.getElementById("CC-userBusinessRegistration-typeAddress-label").style = "color:black";
                            document.getElementById("CC-userBusinessRegistration-typeAddress").style = "border: 2px solid #d3d3d";
                            $('.box3').append('<style>.box3:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
                            $('.box4').append('<style>.box4:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');

						}
					    type=getWidget.selfRegistrationRequest().organization.secondaryAddresses()[1].address.type();
						getWidget.selectedShippingAddress2Type(getWidget.selectedBillingAddress2Type());
						widget.selfRegistrationRequest().organization.secondaryAddresses()[0].address.copyTo(widget.selfRegistrationRequest().organization.secondaryAddresses()[1].address);
						widget.selfRegistrationRequest().organization.secondaryAddresses()[1].address.type(type);
					
					} else {      //unchecked
					type=getWidget.selfRegistrationRequest().organization.secondaryAddresses()[1].address.type();
//					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[1].address.type

					
						widget.selfRegistrationRequest().organization.secondaryAddresses()[1].address.reset();
						widget.selfRegistrationRequest().organization.secondaryAddresses()[1].address.resetModified();
						widget.selfRegistrationRequest().organization.secondaryAddresses()[1].address.type(type);
						if (getWidget.radioSelectedOptionValue() === "Individual") {
							document.getElementById("billingAddressCopyCheck-Check").style.background = "white"
							document.getElementById("individual-shipping-add").selectedIndex = "0";

						} else {
							document.getElementById("billingAddressCopyCheck-Check1").style.background = "white"
							document.getElementById("business-shipping-add").selectedIndex = "0";
						}

					}
				});
				widget.primaryBusiness.subscribe(function (newValue) {
					widget.secondaryBusinessArray([]);
					if (newValue === "Meat & Meat Products" || newValue === "Poultry & Poultry Products") {
						widget.secondaryBusinessArray.push('Harvest/Slaughter', 'Further Processing', 'Custom Slaughter/Processing', 'Retail', 'Wholesaler', 'Co-Packer', 'Other');
					} else if (newValue === "Fish & Fish Products" || newValue === "Bread & Bakery" || newValue === "Snacks - Candy/Nut/Other" || newValue === "Restaurants & Country Clubs" || newValue === "Grocery Store" || newValue === "Pet Food") {
						widget.secondaryBusinessArray.push('Harvest/Slaughter', 'Further Processing', 'Retail', 'Wholesaler', 'Co-Packer', 'Other');
					} else if (newValue === "Dairy & Dairy Products") {
						widget.secondaryBusinessArray.push('Production', 'Further Processing', 'Retail', 'Wholesaler', 'Co-Packer', 'Other');
					} else if (newValue === "Farms - General/Crop" || newValue === "Fruits & Vegetables") {
						widget.secondaryBusinessArray.push('Production', 'Harvest', 'Further Processing', 'Retail', 'Wholesaler', 'Co-Packer', 'Other');
					} else if (newValue === "Schools - Elementary/Secondary/College" || newValue === "Medical - Offices/Hospitals/Manufacturers" || newValue === "Correctional Institutions" || newValue === "Other") {
						widget.secondaryBusinessArray([]);

					}
				});
				
				
				ko.bindingHandlers.enterkey = {
					init: function (element, valueAccessor, allBindings, viewModel) {
						var callback = valueAccessor();
						$(element).keypress(function (event) {
							var keyCode = (event.which ? event.which : event.keyCode);
							if (keyCode === 13) {
								console.log("enter was pressed");
								callback.call(viewModel);
								return true;
							}
							return true;
						});
						$(element).keydown(function (event) {
							var keyCode = (event.which ? event.which : event.keyCode);
							if (keyCode === 9 || keyCode === 13) {
								console.log("tab was pressed");
								callback.call(viewModel);
								return true;
							}
							return true;
						});
					}
				};
				//load the country and state data
				var queryParams = {};
				queryParams[CCConstants.REGIONS] = true;
				ccRestClient.request(CCConstants.LIST_COUNTRIES, queryParams, function (data) {
						for (var i = 0; i < data.length; i++) {
							if (data[i].countryCode == 'US') {
								var country = data[i];
								var countryArray = [];
								countryArray[0] = country;
								self.countryData = countryArray;
								//self.countryData = country;
								var states = country.regions;
								for (var k = 0; k < states.length; k++) {
									widget.stateArray.push(states[k].abbreviation);
								}
								break;
							}
						}
					},
					function () {});
				//widget.countryArray.push('United States');
				//if(navigation.getPath() === 'checkout' && !widget.user().loggedIn() ) {
				// navigation.goTo('/login');
				//}
				//else
				if (navigation.getPath() === 'login') {
					self.hideAllSections();
					$('#CC-loginUserPane').show();

				} else if (navigation.getPath() === 'registration') {
					self.hideAllRegisterSections();
					$('#CC-registerUserType').show();
				}

				self.Individual = ko.computed({
					read: function () {
						return self.radioSelectedOptionValue() == "Individual";
					},
					write: function (value) {
						if (value)
							self.radioSelectedOptionValue("Individual");
					}
				}, self);
				self.Business = ko.computed({
					read: function () {
						return self.radioSelectedOptionValue() == "Business";
					},
					write: function (value) {
						if (value)
							self.radioSelectedOptionValue("Business");
					}
				}, self);
				self.Distributor = ko.computed({
					read: function () {
						return self.radioSelectedOptionValue() == "Distributor";
					},
					write: function (value) {
						if (value)
							self.radioSelectedOptionValue("Distributor");
					}
				}, self);
				self.mobileNumber.extend({
					pattern: {
						params: "^[0-9()+ -]+$",
						message: CCi18n.t('ns.common:resources.invalidInput')
					},
					maxLength: {
						params: CCConstants.CYBERSOURCE_PHONE_NUMBER_MAXIMUM_LENGTH,
						message: CCi18n.t('ns.common:resources.invalidInput')
					}
				});
				self.homePhoneNumber.extend({
					pattern: {
						params: "^[0-9()+ -]+$",
						message: CCi18n.t('ns.common:resources.invalidInput')
					},
					maxLength: {
						params: CCConstants.CYBERSOURCE_PHONE_NUMBER_MAXIMUM_LENGTH,
						message: CCi18n.t('ns.common:resources.invalidInput')
					}
				});
				self.titleArray.push('', 'Mr.', 'Mrs.', 'Ms.','Miss.','Dr.');
				self.addressArray.push('', 'Suite', 'Apartment', 'Building', 'P.O. Box');
				self.addressTypeArray.push('', 'Business', 'Residential');
				self.rolesArray.push('Engineering', 'Finance/Legal', 'Maintenance', 'Management', 'OHSE', 'Operations/Production', 'Other', 'Purchasing', 'Sales');
				self.employeeArray.push(' 1 - 10', ' 11 - 25', ' 26 - 50', ' 51 - 100', ' 100 - 150', ' 151 - 200', ' 251 - 500', ' 500+');
				self.revenueArray.push('$0-$500k', '$500k-$1M', '$1M-$2.5M', '$2.5M-$5M', '$5M-$10M', '$10M-$25M', '$25M-$50M', '$50M+');
				self.primaryBusinessArray.push('Meat & Meat Products', 'Poultry & Poultry Products', 'Fish & Fish Products', 'Dairy & Dairy Products', 'Farms - General/Crop', 'Fruits & Vegetables', 'Bread & Bakery', 'Snacks - Candy/Nut/Other', 'Restaurants & Country Clubs', 'Grocery Store', 'Pet Food', 'Schools - Elementary/Secondary/College', 'Medical - Offices/Hospitals/Manufacturers', 'Correctional Institutions', 'Other');
				widget.user().ignoreEmailValidation(false);
				// To display success notification after redirection from customerProfile page.
				if (widget.user().delaySuccessNotification()) {
					notifier.sendSuccess(widget.WIDGET_ID, widget.translate('updateSuccessMsg'), true);
					widget.user().delaySuccessNotification(false);
				}

				// Handle widget responses when registration is successful or invalid
				$.Topic(pubsub.topicNames.USER_AUTO_LOGIN_SUCCESSFUL).subscribe(function (obj) {
					if (obj.widgetId === widget.WIDGET_ID) {
						self.userCreated(true);
						self.hideLoginModal();
						self.showErrorMessage(false);
						// Check if page refresh after auto login is completed, before displaying the notifier
						$.when(widget.user().autoLoginComplete).then(function () {
							notifier.clearSuccess(widget.WIDGET_ID);
							notifier.sendSuccess(widget.WIDGET_ID, widget.translate('createAccountSuccess'));
							$(window).scrollTop('0');
							widget.user().autoLoginComplete = $.Deferred();
						});
					}
				});

				$.Topic(pubsub.topicNames.USER_RESET_PASSWORD_SUCCESS).subscribe(function (data) {
					self.hideAllSections();
					self.hideLoginModal();
					//notifier.sendSuccess(widget.WIDGET_ID, CCi18n.t('ns.common:resources.resetPasswordMessage'), true);
					$('#CC-forgotPasswordMessagePane').show();
				});

				$.Topic(pubsub.topicNames.USER_RESET_PASSWORD_FAILURE).subscribe(function (data) {
					notifier.sendError(widget.WIDGET_ID, data.message, true);
				});

				$.Topic(pubsub.topicNames.USER_PASSWORD_GENERATED).subscribe(function (data) {
					$('#alert-modal-change').text(CCi18n.t('ns.common:resources.resetPasswordModalOpenedText'));
					widget.user().ignoreEmailValidation(false);
					self.hideAllSections();
					$('#CC-forgotPasswordSectionPane').show();
					$('#CC-forgotPwd-input').focus();
					widget.user().emailAddressForForgottenPwd('');
					widget.user().emailAddressForForgottenPwd.isModified(false);
				});

				$.Topic(pubsub.topicNames.USER_PASSWORD_EXPIRED).subscribe(function (data) {
					$('#alert-modal-change').text(CCi18n.t('ns.common:resources.resetPasswordModalOpenedText'));
					widget.user().ignoreEmailValidation(false);
					self.hideAllSections();
					$('#CC-forgotPasswordSectionPane').show();
					$('#CC-forgotPwd-input').focus();
					widget.user().emailAddressForForgottenPwd('');
					widget.user().emailAddressForForgottenPwd.isModified(false);
				});


				$.Topic(pubsub.topicNames.USER_CREATION_FAILURE).subscribe(function (obj) {
					if (obj.widgetId === widget.WIDGET_ID) {
						widget.user().resetPassword();
						self.modalMessageType("error");
						self.modalMessageText(obj.message);
						self.showErrorMessage(true);
					};
				});

				$.Topic(pubsub.topicNames.USER_LOGIN_FAILURE).subscribe(function (obj) {
					self.modalMessageType("error");

					if (obj.errorCode && obj.errorCode === CCConstants.ACCOUNT_ACCESS_ERROR_CODE) {
						self.modalMessageText(CCi18n.t('ns.common:resources.accountError'));
					} else {
						//self.modalMessageText(CCi18n.t('ns.common:resources.loginError'));
						self.modalMessageText('Invalid credentials');
					}
					self.modalMessageText('Invalid credentials');
					self.showErrorMessage(true);
				});

				$.Topic(pubsub.topicNames.USER_LOGIN_SUCCESSFUL).subscribe(function (obj) {
					self.hideLoginModal();
					self.showErrorMessage(false);
					notifier.clearSuccess(widget.WIDGET_ID);
					$('#CC-loginHeader-myAccount').focus();
					$('#CC-loginHeader-myAccount-mobile').focus();
				});

				// Replacing pubsub subscription with this. PubSub's getting called multiple times, causing this method to be called multiple times,
				// causing login modal to appear and disappears at times.
				navigation.setLoginHandler(function (data) {

					// Do a subscription to page ready.
					$.Topic(pubsub.topicNames.PAGE_READY).subscribe(function (pageEvent) {
						if (pageEvent) {
							// Check if the pageId is undefined. If so, set it to empty string.
							if (pageEvent.pageId == undefined) {
								pageEvent.pageId = "";
							}
							var loginHandlerPageParts = [];
							if (navigation.loginHandlerPage) {
								loginHandlerPageParts = navigation.loginHandlerPage.split('/');
							} else if (navigation.loginHandlerPage == "") {
								loginHandlerPageParts = [""];
							}
							if ((navigation.loginHandlerPage == undefined) || (navigation.loginHandlerPage == null) || (navigation.loginHandlerPage !== "" && pageEvent.path !== undefined && pageEvent.path !== null && navigation.loginHandlerPage.indexOf(pageEvent.path) == -1)) {
								return;
							}
						}
						if (data && data[0] && data[0].linkToRedirect) {
							widget.user().pageToRedirect(data[0].linkToRedirect);
							if (widget.user().loggedInUserName() != '' && !widget.user().isUserSessionExpired()) {
								widget.user().handleSessionExpired();
							}
						}

						setTimeout(function () {
							$('#CC-headermodalpane').modal('show');
							self.hideAllSections();
							self.userCreated(false);
							$('#CC-loginUserPane').show();
							$('#CC-headermodalpane').on('shown.bs.modal', function () {
								if (!widget.user().loggedIn() && !widget.user().isUserLoggedOut() && widget.user().login() &&
									widget.user().login() != '' && widget.user().isUserSessionExpired()) {
									widget.user().populateUserFromLocalData(true);
									$('#CC-login-password-input').focus();
									widget.user().password.isModified(false);
								} else {
									$('#CC-login-input').focus();
									widget.user().login.isModified(false);
								}
								// Set the login handler page to null now
								navigation.loginHandlerPage = null;
							});

							$('#CC-headermodalpane').on('hidden.bs.modal', function () {
								if (!(self.userCreated() || widget.user().loggedIn()) &&
									(($('#CC-loginUserPane').css('display') == 'block') ||
										($('#CC-registerUserPane').css('display') == 'block') ||
										($('#CC-updatePasswordPane').css('display') == 'block') ||
										($('#CC-forgotPasswordSectionPane').css('display') == 'block') ||
										($('#CC-forgotPasswordMessagePane').css('display') == 'block') ||
										($('#CC-updatePasswordErrorMessagePane').css('display') == 'block'))) {
									self.cancelLoginModal(widget);
								}
							});
						}, CCConstants.PROFILE_UNAUTHORIZED_DEFAULT_TIMEOUT);
					});
				});

				// This pubsub checks for the page parameters and if there is a token
				// in the page URL, validates it and then starts the update expired/
				// forgotten password modal.
				$.Topic(pubsub.topicNames.PAGE_PARAMETERS).subscribe(function () {
					var token = this.parameters.occsAuthToken;
					// Proceed only if there is a token on the parameters
					if (token) {
						// Validate the token to make sure that it is valid
						// before proceeding to update the password.
						widget.user().validateTokenForPasswordUpdate(token,
							// Success callback
							function (data) {
								// Let's try and update the password.
								$('#CC-headermodalpane').modal('show');
								self.hideAllSections();
								$('#CC-updatePasswordPane').show();
								$('#CC-headermodalpane').on('shown.bs.modal', function () {
									$('#CC-updatePassword-email').focus();
								});
							},
							// Error callback
							function (data) {
								// Error function - show error message
								$('#CC-headermodalpane').modal('show');
								self.hideAllSections();
								$('#CC-updatePasswordErrorMessagePane').show();
							});
					}
				});
				//self.selfRegistrationRequest(new selfRegistration());
				if (self.countryData.length) {
					self.addAddressToOrganization(self.countryData);
				} else {
					//load the country and state data
					var queryParams = {};
					queryParams[CCConstants.REGIONS] = true;
					ccRestClient.request(CCConstants.LIST_COUNTRIES, queryParams, function (data) {
							for (var i = 0; i < data.length; i++) {
								if (data[i].countryCode == 'US') {
									var country = data[i];
									var countryArray = [];
									countryArray[0] = country;
									self.countryData = countryArray;
									var states = country.regions;
									for (var k = 0; k < states.length; k++) {
										widget.stateArray.push(states[k].abbreviation);
									}
									break;
								}
							}
							//self.countryData = data;
							self.addAddressToOrganization(self.countryData);
						},
						function () {});
				}
				self.addValidationsForSelfRegistration();
				$(document).on('hide.bs.modal', '#CC-headermodalpane', function () {
					if ($('#CC-loginUserPane').css('display') == 'block') {
						$('#alert-modal-change').text(CCi18n.t('ns.common:resources.loginModalClosedText'));
					} else if ($('#CC-registerUserPane').css('display') == 'block') {
						$('#alert-modal-change').text(CCi18n.t('ns.common:resources.registrationModalClosedText'));
					} else if ($('#CC-forgotPasswordSectionPane').css('display') == 'block') {
						$('#alert-modal-change').text(CCi18n.t('ns.common:resources.resetPasswordModalClosedText'));
					} else if ($('#CC-updatePasswordPane').css('display') == 'block') {
						$('#alert-modal-change').text(CCi18n.t('ns.common:resources.updatePasswordModalClosedText'));
					}
				});
				$(document).on('show.bs.modal', '#CC-headermodalpane', function () {
					if ($('#CC-loginUserPane').css('display') == 'block') {
						$('#alert-modal-change').text(CCi18n.t('ns.common:resources.loginModalOpenedText'));
					} else if ($('#CC-registerUserPane').css('display') == 'block') {
						$('#alert-modal-change').text(CCi18n.t('ns.common:resources.registrationModalOpenedText'));
					} else if ($('#CC-forgotPasswordSectionPane').css('display') == 'block') {
						$('#alert-modal-change').text(CCi18n.t('ns.common:resources.resetPasswordModalOpenedText'));
					} else if ($('#CC-updatePasswordPane').css('display') == 'block') {
						$('#alert-modal-change').text(CCi18n.t('ns.common:resources.updatePasswordModalOpenedText'));
					}
				});

				// Added handlers to catch the ESC button when the password related models are open and closed with ESC.
				$(document).on('hidden.bs.modal', '#CC-headermodalpane', function () {
					if (!(self.userCreated() || widget.user().loggedIn()) &&
						($('#CC-updatePasswordMessagePane').css('display') == 'block') ||
						($('#CC-updatePasswordPane').css('display') == 'block') ||
						($('#CC-forgotPasswordSectionPane').css('display') == 'block') ||
						($('#CC-forgotPasswordMessagePane').css('display') == 'block') ||
						($('#CC-updatePasswordErrorMessagePane').css('display') == 'block')) {
						self.cancelLoginModal(widget)
					}
				});

				jQuery(document).ready(function () {

					if (jQuery(window).width() < 500) {


						var div7 = jQuery('#roles-div1');
						var div8 = jQuery('#rolesB2B');
						var div1 = jQuery('#roles-div');
						var div2 = jQuery('#rolesB2C');
						

						var tdiv7 = div7.clone();
						var tdiv8 = div8.clone();
						var tdiv1 = div1.clone();
						var tdiv2 = div2.clone();
						
	//				    $('#CC-individualUserContactInfo').show();						     


						if (!div7.is(':empty')) {
							div7.replaceWith(tdiv8);
							div8.replaceWith(tdiv7);
						}
						if (!div1.is(':empty')) {
							div1.replaceWith(tdiv2);
							div2.replaceWith(tdiv1);
						}
						
	/*						
var divonedata=$('#Instructions-Div1').html();
var divtwodata=$('#saveBack-Div1').html();
var divthreedata=$('#back-Div1').html();
var divthreedatafe=$('#roles-div1').html();

if(divonedata !== ''){
    $('#Instructions-Div1').html(divtwodata);
    $('#saveBack-Div1').html(divthreedata);
    $('back-Div1').html(divonedata);
}

*/


					}
				});


			}, //end of onload

			removeMessageFromPanel: function () {
				var message = this;
				var messageId = message.id();
				var messageType = message.type();
				notifier.deleteMessage(messageId, messageType);
			},
			emailAddressFocused: function (data) {
				// $('#CC-userRegistration-emailAddress-error1').hide(); 
				getWidget.isInvalidEmailAddress(false);
				if (getWidget.ignoreBlur && getWidget.ignoreBlur()) {
					return true;
				}
				getWidget.user().ignoreEmailValidation(true);
				return true;
			},

			emailAddressLostFocus: function (data) {
				$('#CC-userRegistration-emailAddress-error1').hide();
				if (getWidget.ignoreBlur && getWidget.ignoreBlur()) {
					return true;
				}
				getWidget.user().ignoreEmailValidation(false);
				if([null,undefined,''].indexOf(getWidget.selfRegistrationRequest().profile.email()) === -1){
				if(!getWidget.validateEmail(getWidget.selfRegistrationRequest().profile.email())) {
						getWidget.isInvalidEmailAddress(true);
				}
				else{
				    document.getElementById("CC-userRegistration-emailAddress-label").style = "color:black"
                    document.getElementById("CC-userRegistration-emailAddress").style = "border: 2px solid #d3d3d"
				    getWidget.isInvalidEmailAddress(false);
				    getWidget.userSearch();
				}
				}
				//getWidget.userSearch();
				return true;
			},

			passwordFieldFocused: function (data) {
				if (getWidget.ignoreBlur && getWidget.ignoreBlur()) {
					return true
				}
				getWidget.user().ignorePasswordValidation(true);
				return true;
			},

			passwordFieldLostFocus: function (data) {
				if (getWidget.ignoreBlur && getWidget.ignoreBlur()) {
					return true;
				}
				getWidget.user().ignorePasswordValidation(false);
				return true;
			},

			confirmPwdFieldFocused: function (data) {
				if (getWidget.ignoreBlur && getWidget.ignoreBlur()) {
					return true;
				}
				getWidget.user().ignoreConfirmPasswordValidation(true);
				return true;
			},

			confirmPwdFieldLostFocus: function (data) {
				if (getWidget.ignoreBlur && getWidget.ignoreBlur()) {
					return true;
				}
				getWidget.user().ignoreConfirmPasswordValidation(false);
				return true;
			},

			handleLabelsInIEModals: function () {
				if (!!(navigator.userAgent.match(/Trident/))) {
					$("#CC-LoginRegistrationModal label").removeClass("inline");
				}
			},

			/**
			 * Registration will be called when register is clicked
			 */
			registerUser: function (data, event) {
				if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
					notifier.clearError(this.WIDGET_ID);
					//removing the shipping address if anything is set
					data.user().shippingAddressBook([]);
					data.user().updateLocalData(false, false);
					if (data.user().validateUser()) {
						$.Topic(pubsub.topicNames.USER_REGISTRATION_SUBMIT).publishWith(data.user(), [{
							message: "success",
							widgetId: data.WIDGET_ID
						}]);
					}
				}
				return true;
			},

			/**
			 * this method is invoked to hide the login modal
			 */
			hideLoginModal: function () {
				$('#CC-headermodalpane').modal('hide');
				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();
			},

			/**
			 * Invoked when Login method is called
			 */
			handleLogin: function (data, event) {
				if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
					notifier.clearError(this.WIDGET_ID);
					if (data.user().validateLogin()) {
						data.user().updateLocalData(false, false);
						$.Topic(pubsub.topicNames.USER_LOGIN_SUBMIT).publishWith(data.user(), [{
							message: "success"
						}]);
					}
				}
				return true;
			},

			/**
			 * Invoked when cancel button is clicked on login modal
			 */
			handleCancel: function (data, event) {
				if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
					notifier.clearError(this.WIDGET_ID);
					if (data.user().isUserSessionExpired()) {
						$.Topic(pubsub.topicNames.USER_LOGOUT_SUBMIT).publishWith([{
							message: "success"
						}]);
						this.hideLoginModal();
					}
				}
				return true;
			},
			/**
			 * this method is triggered when the user clicks on the save
			 * on the update password model
			 */
			savePassword: function (data, event) {

				if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
					notifier.clearError(this.WIDGET_ID);
					data.user().ignoreConfirmPasswordValidation(false);
					data.user().ignoreEmailValidation(false);
					data.user().emailAddressForForgottenPwd.isModified(true);
					if (data.user().isPasswordValid(true) &&
						data.user().emailAddressForForgottenPwd &&
						data.user().emailAddressForForgottenPwd.isValid()) {
						data.user().updateExpiredPasswordUsingToken(data.user().token,
							data.user().emailAddressForForgottenPwd(), data.user().newPassword(),
							data.user().confirmPassword(),
							function (retData) {
								// Success function
								data.hideAllSections();
								navigation.goTo('/login')
								//$('#CC-updatePasswordMessagePane').show();
								// $('#CC-updatePasswordMsgContinue').focus();
							},
							function (retData) {
								// Error function - show error message
								data.hideAllSections();
								$('#CC-updatePasswordErrorMessagePane').show();
							}
						);
					}
				}
				return true;
			},

			/**
			 * Invoked when cancel button is called on
			 */
			cancelLoginModal: function (widget) {
				if (widget.hasOwnProperty("user")) {
					widget.user().handleCancel();
					if (widget.user().pageToRedirect() && widget.user().pageToRedirect() == widget.links().checkout.route && widget.cart().items().length > 0) {
						var hash = widget.user().pageToRedirect();
						widget.user().pageToRedirect(null);
						navigation.goTo(hash);
					} else {
						navigation.cancelLogin();
					}
					widget.user().pageToRedirect(null);
					notifier.clearError(widget.WIDGET_ID);
					widget.user().clearUserData();
					widget.user().profileRedirect();
				} else {
					navigation.cancelLogin();
				}
			},

			/**
			 * Invoked when Logout method is called
			 */
			handleLogout: function (data) {
				// returns if the profile has unsaved changes.
				if (data.isUserProfileEdited()) {
					return true;
				}
				// Clearing the auto-login success message
				notifier.clearSuccess(this.WIDGET_ID);
				// Clearing any other notifications
				notifier.clearError(this.WIDGET_ID);
				data.updateLocalData(data.loggedinAtCheckout(), false);
				$.Topic(pubsub.topicNames.USER_LOGOUT_SUBMIT).publishWith([{
					message: "success"
				}]);
			},
			/**
			 * Invoked when the modal dialog for registration is closed
			 */
			cancelRegistration: function (data) {
				notifier.clearSuccess(this.WIDGET_ID);
				notifier.clearError(this.WIDGET_ID);
				this.hideLoginModal();
				data.user().reset();
				this.showErrorMessage(false);
				data.user().pageToRedirect(null);
			},
			validateAddressType: function(index,event){
			    	if (event !== undefined) {
					if ('click' === event.type || 'keydown' === event.type || 'keypress' === event.type || 'change' === event.type || 'mouseout' === event.type) {
						var address = getWidget.selfRegistrationRequest().organization.secondaryAddresses()[1].address;
						var isAddressValid = false;
						if (address.type()) {
						getWidget.isEmptyAddressType(false);    
					    }
					    else{
					       getWidget.isEmptyAddressType(true); 
					    }
			    	}
			    	}
			},
			validatePrimaryBusiness: function(index,event){
			    	if (event !== undefined) {
					if ('click' === event.type || 'keydown' === event.type || 'keypress' === event.type || 'change' === event.type || 'mouseout' === event.type) {
						if ([null,undefined,''].indexOf(getWidget.primaryBusiness()) === -1) {
						    console.log("Inside validatePrimaryBusiness")
						getWidget.isEmptyPrimaryBusiness(false);    
					    }
					    else{
					       getWidget.isEmptyPrimaryBusiness(true); 
					    }
			    	}
			    	}
			},
			validateNoOfEmployees: function(index,event){
			    	if (event !== undefined) {
					if ('click' === event.type || 'keydown' === event.type || 'keypress' === event.type || 'change' === event.type || 'mouseout' === event.type) {
						if ([null,undefined,''].indexOf(getWidget.noOfEmployees()) === -1) {
						    console.log("Inside validatePrimaryBusiness")
//						getWidget.isEmptyPrimaryBusiness(false);    
					    }
					    else{
//					       getWidget.isEmptyPrimaryBusiness(true); 
					    }
			    	}
			    	}
			},
			validateAnnualRevenue: function(index,event){
			    	if (event !== undefined) {
					if ('click' === event.type || 'keydown' === event.type || 'keypress' === event.type || 'change' === event.type || 'mouseout' === event.type) {
						if ([null,undefined,''].indexOf(getWidget.annualRevenue()) === -1) {
						    console.log("Inside validatePrimaryBusiness")
//						getWidget.isEmptyPrimaryBusiness(false);    
					    }
					    else{
//					       getWidget.isEmptyPrimaryBusiness(true); 
					    }
			    	}
			    	}
			},
			
			validateAddress: function (index, event) {
				if (event !== undefined) {
				    if (event.keyCode == 9) {
					//if ('click' === event.type  || 'change' === event.type || 'mouseout' === event.type) {
			 		var orderRefreshIndicatorOptions = {
											parent: '#main',
											posTop: '20em',
											posLeft: '50%'
											}
											$('#main').addClass('loadingIndicator');
											$('#main').css('position', 'relative');
											spinner.create(orderRefreshIndicatorOptions);
						var address = getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address;
						var isAddressValid = false;
						if ((address.address1() && address.city() && address.postalCode() && address.country() && address.state()) || (address.address2())) {
							if (address.validateForShippingMethod()) {
								var request = {};
								  
								//if (!getWidget.billingAddressCopyCheck()) {
									if (address) {
										if (index === "0") {
											request = {
												"address1": address.address1(),
												"special_delivery_instructions":getWidget.specialInstructions(),
												"address2": getWidget.selectedBillingAddress2Type() + " " + address.address2(),
												"city": address.city(),
												"state": address.state(),
												"postalCode": address.postalCode(),
												"country": address.country()
											};
											getWidget.activeIndex(index);
										} else if (index === "1") {
											request = {
												"address1": address.address1(),
												
												"address2": getWidget.selectedShippingAddress2Type() + " " + address.address2(),
												"city": address.city(),
												"state": address.state(),
												"postalCode": address.postalCode(),
												"country": address.country()
											};
											getWidget.activeIndex(index);
										}
										var settings = {
											"url": "/ccstorex/custom/v1/addressValidation",
											"method": "POST",
											"data": JSON.stringify(request),
											"async": false,
											"contentType": "application/json"
										};
										var matched = false;
										if (index === "0") {
											if (JSON.stringify(getWidget.addressValidationRequest) !== JSON.stringify(request)) {
												matched = true;
											}else
											{
											    $('#main').removeClass('loadingIndicator');
												spinner.destroy();
											}
										} else {
											if (JSON.stringify(getWidget.addressValidationRequest1) !== JSON.stringify(request)) {
												matched = true;
											}else
											{
											   	$('#main').removeClass('loadingIndicator');
												spinner.destroy();
											}
										}
										if (matched) {
										    
										    getWidget.billingAddressCopyCheck(false);
										  	
										
											if (index === "0") {
												getWidget.addressValidationRequest = request;
											} else {
												getWidget.addressValidationRequest1 = request;
											}

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
									}
									return isAddressValid;
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
			closesuggesionmodal: function () {
				$('#CC-addressSuggestionMessagePane').hide();

				return true;
			},

			/**
			 * Invoked when registration link is clicked
			 */
			clickRegistration: function (data) {
				notifier.clearSuccess(this.WIDGET_ID);
				notifier.clearError(this.WIDGET_ID);
				data.reset();
				this.hideAllSections();
				$('#CC-registerUserPane').show();
				this.showErrorMessage(false);
				$('#CC-headermodalpane').on('shown.bs.modal', function () {
					$('#CC-userRegistration-firstname').focus();
					data.firstName.isModified(false);
				});
			},
			companySearch: function (data, event) {
				var self = this;
				if ([null, undefined, ''].indexOf(self.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName()) !== -1) {
                        self.isCompanyNameError(true);
				} else {
				    
				    if(getWidget.oldCompanyName()===self.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName().trim()){
				        
				        
				    }else{
				        
				     				    self.isCompanyNameError(false);
					var request = {
						"orgName": self.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName().trim()
					};
					getWidget.oldCompanyName(self.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName().trim());
					var orderRefreshIndicatorOptions = {
						parent: '#main',
						posTop: '20em',
						posLeft: '50%'
					}
					$('#main').addClass('loadingIndicator');
					$('#main').css('position', 'relative');
					spinner.create(orderRefreshIndicatorOptions);


					$.ajax({
						url: '/ccstorex/custom/v1/orgSearch',
						method: 'POST',
						contentType: 'application/json',
						data: JSON.stringify(request)
					}).done(function (obj) {
						$('#main').removeClass('loadingIndicator');
						spinner.destroy();
						console.log("Success : ", obj)
						if (obj.hasOwnProperty('successCode')) {
							self.organizationFound(true);
							//self.hideAllRegisterSections();
							// $('#CC-accountExistMessagePane').modal('show')
							$('#CC-companyAlreadyRegistered-Modal').show();
						}else{
						    self.organizationFound(false);
						}
					}).fail(function (error) {
						    self.organizationFound(false);
						$('#main').removeClass('loadingIndicator');
						spinner.destroy();
						console.log("error", error)
					});
					
				     
				        
				    }
				    

				}
			},

			userSearch: function (data, event) {

				var self = this;
				
				if ([null,undefined,''].indexOf(self.selfRegistrationRequest().profile.email()) !== -1 ){
				    $("#CC-userRegistration-emailAddress").blur();
				}else if(!self.validateEmail(self.selfRegistrationRequest().profile.email())) {
						getWidget.isInvalidEmailAddress(true);
				} else {
				if(getWidget.verifiedemail()===self.selfRegistrationRequest().profile.email()){   //checking wheather already checked or not
				    
				}else{
				    getWidget.verifiedemail(self.selfRegistrationRequest().profile.email());

					getWidget.isInvalidEmailAddress(false);
					var orderRefreshIndicatorOptions = {
						parent: '#main',
						posTop: '20em',
						posLeft: '50%'
					}
					$('#main').addClass('loadingIndicator');
					$('#main').css('position', 'relative');
					spinner.create(orderRefreshIndicatorOptions);

					var request = {
						"email": self.selfRegistrationRequest().profile.email().toLowerCase()
					};
					$.ajax({
						url: '/ccstorex/custom/v1/userSearch',
						method: 'POST',
						contentType: 'application/json',
						data: JSON.stringify(request)
					}).done(function (obj) {
						$('#main').removeClass('loadingIndicator');
						spinner.destroy();
						console.log("Success : ", obj)
						if (obj.hasOwnProperty('items')) {
							if (obj.items.length > 0) {
								//self.hideAllRegisterSections();
								self.userFound(true);
								$('#CC-Email-Modal').modal('show')
							} else {
								self.userFound(false);
							}
						}
					}).fail(function (error) {
						$('#main').removeClass('loadingIndicator');
						spinner.destroy();
						self.userFound(false);
						console.log("error", error)
					});				    
				    
				    
				    
				    
				    
				}

				    

					
					
					
					
					
					
					
				}
			},    //END OF userSearch
			createContactRequest: function (data, event) {
				var self = this;

				var orderRefreshIndicatorOptions = {
					parent: '#main',
					posTop: '20em',
					posLeft: '50%'
				}
				$('#main').addClass('loadingIndicator');
				$('#main').css('position', 'relative');
				spinner.create(orderRefreshIndicatorOptions);
				if (self.selfRegistrationRequest().profile.email() === undefined || self.selfRegistrationRequest().profile.email() === '') {
					notifier.sendError("contact-creation", "Please enter the email address", true);
					$('#main').removeClass('loadingIndicator');
					spinner.destroy();

					return;
				}

				var receiveEmailCheck = '';
				if (self.receiveEmail()) {
					receiveEmailCheck = 'yes';
				} else {
					receiveEmailCheck = 'no';
				}

				var profile = {
					"firstName": self.selfRegistrationRequest().profile.firstName(),
					"email": self.selfRegistrationRequest().profile.email(),
					"lastName": self.selfRegistrationRequest().profile.lastName(),
					"name_title": self.selectedTitle(),
					"office_number": self.officeNumber(),
					"home_phone_number": self.homePhoneNumber(),
					"fax_number": self.faxNumber(),
					"mobile_number": self.mobileNumber(),
					"receive_texts": self.receiveTexts(),
					"receive_mailings_special_offers": self.receiveMails(),
					"receive_catalog": self.receiveCatalogs(),
					"receiveEmail": receiveEmailCheck,
					"position_title": self.title(),
					"org_role": self.role()
				}
				var requestedOrganization = {
					"name": self.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName()
				}


				ccRestClient.request(CCConstants.ENDPOINT_CREATE_PROFILE_REQUEST, {
						"requestedOrganization": requestedOrganization,
						"profile": profile
					},
					function (success) {
						console.log("success" + success);
						$('#main').removeClass('loadingIndicator');
						spinner.destroy();
						//if (!self.organizationFound()) {
						//	navigation.goTo('/accountConfirmation');
						//}
						self.hideAllSections();
						$('#CC-companyAlreadyRegistered-Modal').hide();
						$('#CC-businessUserContactInfo').hide();

						$('#CC-emailRequestSent').show();


					}, // defined elsewhere
					function (error) {
						console.log("error" + error);
						notifier.sendError("contact-creation", "Error while processing request", true);
						$('#main').removeClass('loadingIndicator');
						spinner.destroy();

						$('#CC-companyAlreadyRegistered-Modal').hide();

					},
					null);
			},
			/**
			 * Invoked when login link is clicked
			 */
			clickLogin: function (data) {
				notifier.clearSuccess(this.WIDGET_ID);
				notifier.clearError(this.WIDGET_ID);
				data.reset();
				this.hideAllSections();
				$('#CC-loginUserPane').show();
				this.showErrorMessage(false);
				$('#CC-headermodalpane').on('shown.bs.modal', function () {
					if (!data.loggedIn() && data.login() && data.login() != '' && data.isUserSessionExpired()) {
						data.populateUserFromLocalData(true);
						$('#CC-login-password-input').focus();
						data.password.isModified(false);
					} else {
						$('#CC-login-input').focus();
						data.login.isModified(false);
					}
					// Set the login handler page to null now
					navigation.loginHandlerPage = null;
				});
			},

			/**
			 * Ignores the blur function when mouse click is up
			 */
			handleMouseUp: function (data) {
				data.ignoreBlur(false);
				data.user().ignoreConfirmPasswordValidation(false);
				return true;
			},
			setSelectedAddress: function () {
				getWidget.closesuggesionmodal();
				if(getWidget.activeIndex())
				    {
				        var index = parseInt(getWidget.activeIndex());
				        var request = {};
			    	if (getWidget.radioSelectedOptionValue() === "Business" || getWidget.radioSelectedOptionValue() === "Distributor") {
				 
				    
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.address1(getWidget.validAddresses()[0].line1);
					if (getWidget.validAddresses()[0].line2 !== "") {
						getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.address2(getWidget.validAddresses()[0].line2);
					}
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.postalCode(getWidget.validAddresses()[0].postalCode);
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.city(getWidget.validAddresses()[0].city);
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.country(getWidget.validAddresses()[0].country);
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.state(getWidget.validAddresses()[0].region);
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.selectedState(getWidget.validAddresses()[0].region);
					if(index === 0){
    					request = {
    						"orgAddress": {
    							"address1": getWidget.validAddresses()[0].line1,
    							"country": getWidget.validAddresses()[0].country,
    							"address2": getWidget.selectedBillingAddress2Type() + ' ' + getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.address2(),
    							"postalCode": getWidget.validAddresses()[0].postalCode,
    							"city": getWidget.validAddresses()[0].city,
    							"state": getWidget.validAddresses()[0].region
    						}
    					};
			    	}else if(index === 1){
			    	    request = {
						"orgAddress": {
							"address1": getWidget.validAddresses()[0].line1,
							"country": getWidget.validAddresses()[0].country,
							"address2": getWidget.selectedShippingAddress2Type() + ' ' + getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.address2(),
							"postalCode": getWidget.validAddresses()[0].postalCode,
							"city": getWidget.validAddresses()[0].city,
							"state": getWidget.validAddresses()[0].region
						}
					};
			    	}

					var settings = {
						url: "/ccstorex/custom/v1/orgSearchOnAddress",
						method: "POST",
						contentType: 'application/json',
						data: JSON.stringify(request)
					};

					$.ajax(settings).done(function (response) {
						console.log("Response :: ", response);
						if (response) {
							if (response.items) {
								if (response.items.length > 0) {
									getWidget.organizationFound(true);
									//getWidget.hideAllRegisterSections();
								} else {
									getWidget.organizationFound(false);
								}
							}
							console.log("response" + response);

							//                    $('#CC-accountExistMessagePane').modal('show')
							$('#CC-companyAlreadyRegistered-Modal').show();
						}
					}).fail(function (error) {
						getWidget.organizationFound(false);
						console.log("error", error);
					});

					/*
			
			*/
				} else {
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.address1(getWidget.validAddresses()[0].line1);
					if (getWidget.validAddresses()[0].line2 !== "") {
						getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.address2(getWidget.validAddresses()[0].line2);
					}
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.postalCode(getWidget.validAddresses()[0].postalCode);
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.city(getWidget.validAddresses()[0].city);
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.country(getWidget.validAddresses()[0].country);
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.state(getWidget.validAddresses()[0].region);
					getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.selectedState(getWidget.validAddresses()[0].region);
				}
				
				
				var request1;
				
							if (index === 0) {
											 request1 = {
                        							"address1": getWidget.validAddresses()[0].line1,
                        							"address2": getWidget.selectedBillingAddress2Type() + ' ' + getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.address2(),
    			                    				"city": getWidget.validAddresses()[0].city,
    			                    				"state": getWidget.validAddresses()[0].region,
    			                    				"postalCode": getWidget.validAddresses()[0].postalCode,
    			                    				"country": getWidget.validAddresses()[0].country
											};
											
											
											
											

											
											
											
											
											
											
											
											getWidget.addressValidationRequest = request1;
										} else if (index === 1) {
											 request1 = {
                        							"address1": getWidget.validAddresses()[0].line1,
    			                    				"address2": getWidget.selectedBillingAddress2Type() + ' ' + getWidget.selfRegistrationRequest().organization.secondaryAddresses()[index].address.address2(),
    			                    				"city": getWidget.validAddresses()[0].city,
    	                    						"state": getWidget.validAddresses()[0].region,
    			                    				"postalCode": getWidget.validAddresses()[0].postalCode,
    			                    				"country": getWidget.validAddresses()[0].country
    					                    		
    		                    					
    					                    		
											};
											getWidget.addressValidationRequest1 = request1;

										}
				

				
				
			}
			},

			/**
			 * Ignores the blur function when mouse click is down
			 */
			handleMouseDown: function (data) {
				data.ignoreBlur(true);
				data.user().ignoreConfirmPasswordValidation(true);
				return true;
			},

			/**
			 * Ignores the blur function when mouse click is down outside the modal dialog(backdrop click).
			 */
			handleModalDownClick: function (data, event) {
				if (event.target === event.currentTarget) {
					this.ignoreBlur(true);
					this.user().ignoreConfirmPasswordValidation(true);
				}
				return true;
			},

			/**
			 * Invoked when register is clicked on login modal
			 */
			showRegistrationSection: function (data) {
				$('#alert-modal-change').text(CCi18n.t('ns.common:resources.registrationModalOpenedText'));
				this.hideAllSections();
				$('#CC-registerUserPane').show();
				$('#CC-userRegistration-firstname').focus();
				data.user().firstName.isModified(false);
				notifier.clearError(this.WIDGET_ID);
				notifier.clearSuccess(this.WIDGET_ID);
				data.user().reset();
				this.showErrorMessage(false);
			},

			navigateToLogin: function () {
				navigation.goTo('/login?email=' + getWidget.selfRegistrationRequest().profile.email() );
				return true;
			},
			/**
			 * Invoked when forgotten Password link is clicked.
			 */
			showForgotPasswordSection: function (data) {
				$('#alert-modal-change').text(CCi18n.t('ns.common:resources.forgottenPasswordModalOpenedText'));
				this.user().ignoreEmailValidation(false);
				this.hideAllSections();
				$('#CC-forgotPasswordSectionPane').show();
				$('#CC-forgotPwd-input').focus();
				this.user().emailAddressForForgottenPwd('');
				this.user().emailAddressForForgottenPwd.isModified(false);
			},

			/**
			 * Hides all the sections of  modal dialogs.
			 */
			hideAllSections: function () {
				$('#CC-loginUserPane').hide();
				$('#CC-registerUserPane').hide();
				$('#CC-forgotPasswordSectionPane').hide();
				$('#CC-updatePasswordPane').hide();
				$('#CC-updatePasswordMessagePane').hide();
				$('#CC-forgotPasswordMessagePane').hide();
				$('#CC-updatePasswordErrorMessagePane').hide();
				$('#CC-verfication-emaillink').hide();
				$('#CC-companyAlreadyRegistered-Modal').hide();
				$('#CC-verfication-emaillink').hide();


			},

			/**
			 * Hides all the sections of  modal dialogs.
			 */
			hideAllRegisterSections: function () {
				$('#CC-registerBusinessUserPane').hide();
				$('#CC-submitSelfRegistrationRequestPane').hide();
				$('#CC-submitSelfRegistrationRequestType').hide();
				$('#CC-individualUserContactInfo').hide();
				$('#CC-businessUserContactInfo').hide();
				$('#CC-businessUserShippingBillingContactInfo').hide();


			},
			showIndividualUserContactInfo: function (data, event) {
				var valid = true;
				if ([null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.firstName()) !== -1){
					valid = false;
					data.nextButtonError(true);
					document.getElementById("CC-userRegistration-firstname-label").style = "color:#f33";
                    document.getElementById("CC-userRegistration-firstname").style = "border: 2px solid #f33";
				}
				if([null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.lastName()) !== -1){
					valid = false;
					data.nextButtonError(true);
					//$("#CC-userRegistration-lastname").blur();
					document.getElementById("CC-userRegistration-lastname-label").style = "color:#f33";
                    document.getElementById("CC-userRegistration-lastname").style = "border: 2px solid #f33";
				}
				if([null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.email()) !== -1)
				{
					valid = false;
					//$("#CC-userRegistration-emailAddress").blur();
					data.nextButtonError(true);
					document.getElementById("CC-userRegistration-emailAddress-label").style = "color:#f33";
                    document.getElementById("CC-userRegistration-emailAddress").style = "border: 2px solid #f33";
				}
				if([null, undefined, ''].indexOf(data.homePhoneNumber()) !== -1) 
				{				
					valid = false;
					data.nextButtonError(true);
					//$("#CC-userRegistration-emailAddress").blur();
					//getWidget.isInvalidHomePhoneNumber1(true);
					document.getElementById("CC-userRegistration-homeNumber-label").style = "color:#f33";
				    document.getElementById("CC-userRegistration-homeNumber").style = "border: 2px solid #f33";
				}
				if( getWidget.isInvalidHomePhoneNumber()){
					valid = false;
					//data.nextButtonError(false);
					document.getElementById("CC-userRegistration-homeNumber-label").style = "color:#f33";
					document.getElementById("CC-userRegistration-homeNumber").style = "border: 2px solid #f33";
				} 
				if([null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.email()) === -1 && getWidget.isInvalidEmailAddress()){
					valid = false;
					//data.nextButtonError(false);
					document.getElementById("CC-userRegistration-emailAddress-label").style = "color:#f33";
					document.getElementById("CC-userRegistration-emailAddress").style = "border: 2px solid #f33";
				}
				if(getWidget.isInvalidMobilePhoneNumber()) {
					valid = false;
					//data.nextButtonError(false);
					document.getElementById("CC-userRegistration-mobileNumber-label").style = "color:#f33";
					document.getElementById("CC-userRegistration-mobileNumber").style = "border: 2px solid #f33";
				}
				if(getWidget.isInvalidFaxPhoneNumber())
				{
					valid = false;
					//data.nextButtonError(false);
					document.getElementById("CC-userRegistration-faxNumber-label").style = "color:#f33";
				    document.getElementById("CC-userRegistration-faxNumber").style = "border: 2px solid #f33";
				}
				if ([null, undefined, ''].indexOf(data.homePhoneNumber()) === -1  && [null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.lastName()) === -1 && [null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.email()) === -1 && [null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.firstName()) === -1 )
				{
				    data.nextButtonError(false);
				}
				
				if(valid){
				     if(getWidget.userFound()){
				        $('#CC-Email-Modal').modal('show');
				    }else{
                        $('#CC-Email-Modal').modal('hide');
    					data.hideAllRegisterSections();
    					data.nextButtonError(false);
    					data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.selectedCountry('US');
    					data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.selectedCountry('US');
    					$('#CC-individualUserContactInfo').show();
				    }
				}
				
				return false;
			},
			showBusinessUserContactInfo: function (data, event) {
				var valid= true;
				if ([null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.firstName()) !== -1){
					valid = false;
				    //	$("#CC-userRegistration-firstname").blur();
				    data.nextButtonError(true);
					document.getElementById("CC-userBusinessRegistration-firstname-label").style = "color:#f33";
                    document.getElementById("CC-userBusinessRegistration-firstname").style = "border: 2px solid #f33";
				}
				if([null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.lastName()) !== -1)
				{
					valid = false;
					//$("#CC-userRegistration-lastname").blur();
					data.nextButtonError(true);
					document.getElementById("CC-userBusinessRegistration-lastname-label").style = "color:#f33";
                    document.getElementById("CC-userBusinessRegistration-lastname").style = "border: 2px solid #f33";			
				}
				if( [null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.email()) !== -1 )
				{
					valid = false;
					data.nextButtonError(true);
					//$("#CC-userRegistration-emailAddress").blur();
					document.getElementById("CC-userBusinessRegistration-emailAddress-label").style = "color:#f33";
                    document.getElementById("CC-userBusinessRegistration-emailAddress").style = "border: 2px solid #f33";
				}
				if([null, undefined, ''].indexOf(data.officeNumber()) !== -1)
				{		
					valid=false;
					$("#CC-userBusinessRegistration-officeNumber").blur();
					//getWidget.isInvalidHomePhoneNumber1(true);
					data.nextButtonError(true);
					//document.getElementById("CC-userBusinessRegistration-officeNumber-label").style = "color:#f33";
				    //document.getElementById("CC-userBusinessRegistration-officeNumber").style = "border: 2px solid #f33";

				} 
				if (getWidget.isInvalidHomePhoneNumber()){
					valid = false;
					//data.nextButtonError(false);
					document.getElementById("CC-userBusinessRegistration-officeNumber-label").style = "color:#f33";
				    document.getElementById("CC-userBusinessRegistration-officeNumber").style = "border: 2px solid #f33";
				}
				if(getWidget.isInvalidEmailAddress())
				{
					valid = false;
					//data.nextButtonError(false);
					document.getElementById("CC-userBusinessRegistration-emailAddress-label").style = "color:#f33";
                    document.getElementById("CC-userBusinessRegistration-emailAddress").style = "border: 2px solid #f33";	
				}
				
				if([null, undefined, ''].indexOf(data.role()) !== -1){
					valid= false;
					//data.nextButtonError(false);
					data.nextButtonError(true);
				    document.getElementById("CC-userBusinessRegistration-role-label").style = "color:#f33";
					document.getElementById("CC-userBusinessRegistration-role").style = "border: 2px solid #f33";
				}
				
				if(getWidget.isInvalidMobilePhoneNumber()){
					valid= false;
					//data.nextButtonError(false);
				    document.getElementById("CC-userBusinessRegistration-mobileNumber-label").style = "color:#f33";
					document.getElementById("CC-userBusinessRegistration-mobileNumber").style = "border: 2px solid #f33";
				}
				
				if ([null, undefined, ''].indexOf(data.officeNumber()) === -1  && [null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.lastName()) === -1 && [null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.email()) === -1 && [null, undefined, ''].indexOf(getWidget.selfRegistrationRequest().profile.firstName()) === -1  && [null, undefined, ''].indexOf(data.role()) === -1)
				{
				    data.nextButtonError(false);
				}
				
			
				if(valid){
                    if(getWidget.userFound()){
					valid = false;
					data.nextButtonError(false);
				    $('#CC-Email-Modal').modal('show');
				    }else{
					data.hideAllRegisterSections();
					data.nextButtonError(false);
					data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.selectedCountry('US');
					data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.selectedCountry('US');
					$('#CC-businessUserContactInfo').show();
                }
				}
			
				return false;
			},
			backContactIndividual: function (data, event) {
				data.hideAllRegisterSections();
				$('#CC-submitSelfRegistrationRequestType').show();
				return false;
			},
			backAddressIndividual: function (data, event) {
				data.hideAllRegisterSections();
				$("#CC-submitSelfRegistrationRequestPane").show();
				return false;
			},
			backContactBusiness: function (data, event) {
				data.hideAllRegisterSections();
				$('#CC-submitSelfRegistrationRequestType').show();
				return false;
			},
			backAddressBusiness: function (data, event) {
				data.hideAllRegisterSections();
				$("#CC-registerBusinessUserPane").show();
				return false;
			},

			/*
			 * Method to supports multiple addresses in organization
			 */
			addAddressToOrganization: function (countryList) {
				var self = this;
				// Translation helper for address
				var translateHelper = {
					translate: function (key, options) {
						return CCi18n.t('ns.common:resources.' + key, options);
					}
				};
				var address = new Address(CCConstants.ACCOUNTS, null, translateHelper, countryList);
				//var parentOrganization = new Address(CCConstants.ORGANIZATION, null,translateHelper);
				address.country.rules.remove(function (item) {
					return item.rule == "required";
				});
				address.country.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address.city() || address.postalCode() || address.phoneNumber() ||
								address.address1() || address.address2())
						},
						message: CCi18n.t('ns.common:resources.countryMandatoryText')
					}
				});
				address.state.rules.remove(function (item) {
					return item.rule == "required";
				});
				address.state.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address.city() || address.postalCode() || address.phoneNumber() ||
								address.address1() || address.address2() || address.country())
						},
						message: CCi18n.t('ns.common:resources.stateMandatoryText')
					}
				});
				address.address1.rules.remove(function (item) {
					return item.rule == "required";
				});
				address.address1.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address.city() || address.postalCode() ||
								address.country() || address.phoneNumber() || address.address2())
						},
						message: CCi18n.t('ns.common:resources.addressOneMandatoryText')
					}
				});
				address.companyName.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address.city() || address.postalCode() ||
								address.country() || address.phoneNumber() || address.address2() || address.address1() )
						},
						message: "Company name is mandatory"
					}
				});
				address.city.rules.remove(function (item) {
					return item.rule == "required";
				});
				address.city.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address.address1() || address.postalCode() || address.country() ||
								address.phoneNumber() || address.address2())
						},
						message: CCi18n.t('ns.common:resources.cityMandatoryText')
					},
					maxLength: {
						params: CCConstants.CYBERSOURCE_CITY_MAXIMUM_LENGTH,
						message: CCi18n.t('ns.common:resources.invalidInput')
					}
				});
				address.postalCode.rules.remove(function (item) {
					return item.rule == "required";
				});
				address.postalCode.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address.address1() || address.city() || address.country() || address.phoneNumber() ||
								address.address2());
						},
						message: CCi18n.t('ns.common:resources.postalMandatoryText')
					},
					maxLength: {
						params: CCConstants.CYBERSOURCE_POSTAL_CODE_MAXIMUM_LENGTH,
						message: CCi18n.t('ns.common:resources.invalidInput')
					}
				});
				address.phoneNumber.rules.remove(function (item) {
					return item.rule == "required";
				});
				address.phoneNumber.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address.address1() || address.postalCode() || address.country() ||
								address.city() || address.address2());
						},
						message: CCi18n.t('ns.common:resources.phoneNumberMandatoryText')
					},
					pattern: {
						params: "^[0-9()+ -]+$",
						message: CCi18n.t('ns.common:resources.invalidInput')
					},
					maxLength: {
						params: CCConstants.CYBERSOURCE_PHONE_NUMBER_MAXIMUM_LENGTH,
						message: CCi18n.t('ns.common:resources.invalidInput')
					}
				});
				var address_1 = new Address(CCConstants.ACCOUNTS, null, translateHelper, countryList);
				//var parentOrganization = new Address(CCConstants.ORGANIZATION, null,translateHelper);
				address_1.country.rules.remove(function (item) {
					return item.rule == "required";
				});
				address_1.country.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address_1.city() || address_1.postalCode() || address_1.phoneNumber() ||
								address_1.address1() || address_1.address2())
						},
						message: CCi18n.t('ns.common:resources.countryMandatoryText')
					}
				});
				address_1.state.rules.remove(function (item) {
					return item.rule == "required";
				});
				address_1.state.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address_1.city() || address_1.postalCode() || address_1.phoneNumber() ||
								address_1.address1() || address_1.address2() || address_1.country())
						},
						message: CCi18n.t('ns.common:resources.stateMandatoryText')
					}
				});
				address_1.address1.rules.remove(function (item) {
					return item.rule == "required";
				});
				address_1.address1.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address_1.city() || address_1.postalCode() ||
								address_1.country() || address_1.phoneNumber() || address_1.address2())
						},
						message: CCi18n.t('ns.common:resources.addressOneMandatoryText')
					}
				});
				address_1.city.rules.remove(function (item) {
					return item.rule == "required";
				});
				address_1.city.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address_1.address1() || address_1.postalCode() || address_1.country() ||
								address_1.phoneNumber() || address_1.address2())
						},
						message: CCi18n.t('ns.common:resources.cityMandatoryText')
					},
					maxLength: {
						params: CCConstants.CYBERSOURCE_CITY_MAXIMUM_LENGTH,
						message: CCi18n.t('ns.common:resources.invalidInput')
					}
				});
				address_1.postalCode.rules.remove(function (item) {
					return item.rule == "required";
				});
				address_1.postalCode.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address_1.address1() || address_1.city() || address_1.country() || address_1.phoneNumber() ||
								address_1.address2());
						},
						message: CCi18n.t('ns.common:resources.postalMandatoryText')
					},
					maxLength: {
						params: CCConstants.CYBERSOURCE_POSTAL_CODE_MAXIMUM_LENGTH,
						message: CCi18n.t('ns.common:resources.invalidInput')
					}
				});
				address_1.phoneNumber.rules.remove(function (item) {
					return item.rule == "required";
				});
				address_1.phoneNumber.extend({
					required: {
						params: true,
						onlyIf: function () {
							return (address_1.address1() || address_1.postalCode() || address_1.country() ||
								address_1.city() || address_1.address2());
						},
						message: CCi18n.t('ns.common:resources.phoneNumberMandatoryText')
					},
					pattern: {
						params: "^[0-9()+ -]+$",
						message: CCi18n.t('ns.common:resources.invalidInput')
					},
					maxLength: {
						params: CCConstants.CYBERSOURCE_PHONE_NUMBER_MAXIMUM_LENGTH,
						message: CCi18n.t('ns.common:resources.invalidInput')
					}
				});
				address.selectedCountry('US');
				address_1.selectedCountry('US');
				self.selfRegistrationRequest().organization.secondaryAddresses.push({
					address: address
				}, {
					address: address_1
				});
				//self.selfRegistrationRequest.organization.parentOrganization.push({address:address});
			},
			/**
			 * Resets the password for the entered email id.
			 */
			resetForgotPassword: function (data, event) {
				if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
					data.user().ignoreEmailValidation(false);
					data.user().emailAddressForForgottenPwd.isModified(true);
					if (data.user().emailAddressForForgottenPwd && data.user().emailAddressForForgottenPwd.isValid()) {
						data.user().resetForgotPassword();
					}
				}
				return true;
			},

			createOrganizationRequest: function (data, event) {
				var self = this;
		
					var shippingAddress = data.selfRegistrationRequest().organization.secondaryAddresses()[1].address;
					var billingAddress = data.selfRegistrationRequest().organization.secondaryAddresses()[0].address;
                    var valid = true;
                    if([null,undefined,''].indexOf(shippingAddress.companyName()) !== -1){
    					valid = false;
    					data.saveButtonError(true);
    					//$("#individual-Shippingaddress1").blur()
    					document.getElementById("CC-userBusinessRegistration-shippingCompany-label").style = "color:#f33";
                        document.getElementById("CC-userBusinessRegistration-shippingCompany").style = "border: 2px solid #f33";
    				}
    				if([null,undefined,''].indexOf(shippingAddress.address1()) !== -1){
    					valid = false;
    					data.saveButtonError(true);
    					//$("#individual-Shippingaddress1").blur()
    					document.getElementById("CC-userBusinessRegistration-address11-label").style = "color:#f33";
                        document.getElementById("CC-userBusinessRegistration-address11").style = "border: 2px solid #f33";
    				}
    				if([null,undefined,''].indexOf(shippingAddress.city()) !== -1)
    				{
    					valid = false;
    					data.saveButtonError(true);
    					//$("#individual-Shippingcity").blur();
    					document.getElementById("CC-userBusinessRegistration-city1-label").style = "color:#f33";
                        document.getElementById("CC-userBusinessRegistration-city1").style = "border: 2px solid #f33";
    				}
    				if([null,undefined,''].indexOf(shippingAddress.postalCode()) !== -1)
    				{
    					valid = false;
    					data.saveButtonError(true);
    					//$("#individual-Shippingzipcode").blur();
    					document.getElementById("CC-userBusinessRegistration-zipCode1-label").style = "color:#f33";
                        document.getElementById("CC-userBusinessRegistration-zipCode1").style = "border: 2px solid #f33";
    				}
    				if([null,undefined,''].indexOf(shippingAddress.type()) !== -1)
    				{
    					valid = false;
    					data.saveButtonError(true);
    					//data.isEmptyAddressType(true);
    					$('.box4').append('<style>.box4:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    					document.getElementById("CC-userBusinessRegistration-typeAddress-label").style = "color:#f33"
                        document.getElementById("CC-userBusinessRegistration-typeAddress").style = "border: 2px solid #f33"
    				}
    				if([null,undefined,''].indexOf(shippingAddress.state()) !== -1)
    				{
    					//$("#individual-ShippingState").blur()
    					valid = false;
    					data.saveButtonError(true);
    					document.getElementById("CC-userBusinessRegistration-state1-label").style = "color:#f33";
    					$('.box3').append('<style>.box3:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
                        document.getElementById("CC-userBusinessRegistration-state1").style = "border: 2px solid #f33";
    				}
    				if([null,undefined,''].indexOf(billingAddress.address1()) !== -1)
    				{
    					valid= false;
    					data.saveButtonError(true);
    					//$("#individual-Billingaddress1").blur()
    					document.getElementById("CC-userBusinessRegistration-address1-label").style = "color:#f33"
                        document.getElementById("CC-userBusinessRegistration-address1").style = "border: 2px solid #f33"
    				}
    				if([null,undefined,''].indexOf(billingAddress.companyName()) !== -1){
    					valid = false;
    					data.saveButtonError(true);
    					//$("#individual-Shippingaddress1").blur()
    					document.getElementById("CC-userBusinessRegistration-billingCompany-label").style = "color:#f33";
                        document.getElementById("CC-userBusinessRegistration-billingCompany").style = "border: 2px solid #f33";
    				}
    				if([null,undefined,''].indexOf(billingAddress.city()) !== -1)
    				{
    					valid = false;
    					data.saveButtonError(true);
    					//$("#individual-Billingcity").blur()
    					document.getElementById("CC-userBusinessRegistration-city-label").style = "color:#f33"
                        document.getElementById("CC-userBusinessRegistration-city").style = "border: 2px solid #f33"
    				}
    				if([null,undefined,''].indexOf(billingAddress.postalCode()) !== -1)
    				{
    					valid=false;
    					data.saveButtonError(true);
    					//$("#individual-Billingzipcode").blur()
    					document.getElementById("CC-userBusinessRegistration-zipCode-label").style = "color:#f33"
                        document.getElementById("CC-userBusinessRegistration-zipCode").style = "border: 2px solid #f33"
    				}
    				if([null,undefined,''].indexOf(billingAddress.state()) !== -1)
    				{
    					valid=false;
    					data.saveButtonError(true);
    					//$("#individual-BillingState").blur()
    					$('.box1').append('<style>.box1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    					document.getElementById("CC-userBusinessRegistration-state-label").style = "color:#f33"
                        document.getElementById("CC-userBusinessRegistration-state").style = "border: 2px solid #f33"
    				}
    				 if([null,undefined,''].indexOf(data.primaryBusiness()) !== -1){
				            //data.isEmptyPrimaryBusiness(true);
				            valid=false;
        					data.saveButtonError(true);
        					//$("#individual-BillingState").blur()
        					$('.boxprimarybusiness').append('<style>.boxprimarybusiness:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
        					document.getElementById("CC-userBusinessRegistration-primaryBusiness-label").style = "color:#f33"
                            document.getElementById("CC-userBusinessRegistration-primaryBusiness").style = "border: 2px solid #f33"
				        }
				        
    				 if([null,undefined,''].indexOf(data.noOfEmployees()) !== -1){
				            //data.isEmptyPrimaryBusiness(true);
				            valid=false;
        					data.saveButtonError(true);
        					//$("#individual-BillingState").blur()
        					$('.boxprimarybusiness1').append('<style>.boxprimarybusiness1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
        					document.getElementById("CC-userBusinessRegistration-numberOfEmployees-label").style = "color:#f33"
                            document.getElementById("CC-userBusinessRegistration-numberOfEmployees").style = "border: 2px solid #f33"
				        }
			        if([null,undefined,''].indexOf(data.annualRevenue()) !== -1){
			            
				            //data.isEmptyPrimaryBusiness(true);
				            valid=false;
        					data.saveButtonError(true);
        					//$("#individual-BillingState").blur()
        					$('.boxprimarybusiness2').append('<style>.boxprimarybusiness2:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
        					document.getElementById("CC-userBusinessRegistration-annualRevenue-label").style = "color:#f33"
                            document.getElementById("CC-userBusinessRegistration-annualRevenue").style = "border: 2px solid #f33"
				        }
				        
				        
				        
				        
				        
				        
				        
				        
				        
				        
				        
    				if(valid)				
    				{
    				     if (data.organizationFound()) {
				        	$('#CC-companyAlreadyRegistered-Modal').show();
			        	} else {
                        data.isEmptyAddressType(false);
                        data.isEmptyPrimaryBusiness(false);
                        data.saveButtonError(false);
						var orderRefreshIndicatorOptions = {
							parent: '#main',
							posTop: '20em',
							posLeft: '50%'
						}
						$('#main').addClass('loadingIndicator');
						$('#main').css('position', 'relative');
						spinner.create(orderRefreshIndicatorOptions);
						data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.isDefaultBillingAddress(true);
						data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.isDefaultShippingAddress(true);
						data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.isDefaultAddress(true);
						data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.isDefaultAddress(true);
						data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.address2(data.selectedShippingAddress2Type() + ' ' + shippingAddress.address2());
						data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.address2(data.selectedBillingAddress2Type() + ' ' + billingAddress.address2());
						data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.country("US");
						data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.country("US");
						data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.state(data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.selectedState());
						data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.state(data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.selectedState());
						
						data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.x_account_type=data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.type();
						data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.x_account_type=data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.type();
						
						
						data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.special_delivery_instructions= getWidget.specialInstructions();
						data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.special_delivery_instructions= getWidget.specialInstructions();
						
						
						
						
						if (data.selfRegistrationRequest().profile.email() === undefined || data.selfRegistrationRequest().profile.email() === '') {
							notifier.sendError("contact-creation", "Please enter the email address", true);
							$('#main').removeClass('loadingIndicator');
							spinner.destroy();

							return;
						}

						var receiveEmailCheck = '';
						if (data.receiveEmail()) {
							receiveEmailCheck = 'yes';
						} else {
							receiveEmailCheck = 'no';
						}
						
						
                        var address1 = {
						    'address' :{
          "alias": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.alias(),
          "prefix": data.selectedTitle(),
          "firstName": data.selfRegistrationRequest().profile.firstName(),
          "middleName": "",
          "lastName": data.selfRegistrationRequest().profile.lastName(),
          "suffix": "",
          "country": "US",
          "postalCode": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.postalCode(),
          "address1": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.address1(),
          "address2": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.address2(),
          "address3": "",
          "city": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.city(),
          "state": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.state(),
          "county": "",
          "phoneNumber": "",
          "email": data.selfRegistrationRequest().profile.email(),
          "jobTitle": "",
          "companyName": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName(),
          "faxNumber": data.faxNumber(),
          "addressType": [],
          "type": "",
          "repositoryId": "",
          "isDefaultBillingAddress": true,
          "isDefaultShippingAddress": false,
          "predefinedAddressTypes": [],
          "isTypeModified": false,
          "computedDefaultBilling":false,
          "computedDefaultShipping": false,
          "selectedCountry": "US",
          "selectedState": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.state(),          
          "selectedAddressTypes": [],
          "isDefaultAddress": true,
          "dynamicProperties": [],
          "computedAddressType": [],
          "computedCountry": [
            "US"
          ],
//          "x_account_type": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.type(),
//          "special_delivery_instructions": getWidget.specialInstructions(),
          "Address_Status": true,
          "types": []
						    },
"addressType":data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.alias(),
						    
						}
						
                var address2 = {
						    'address' :{
          "alias": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.alias(),
          "prefix": data.selectedTitle(),
          "firstName": data.selfRegistrationRequest().profile.firstName(),
          "middleName": "",
          "lastName": data.selfRegistrationRequest().profile.lastName(),
          "suffix": "",
          "country": "US",
          "postalCode": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.postalCode(),
          "address1": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.address1(),
          "address2": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.address2(),
          "address3": "",
          "city": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.city(),
          "state": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.state(),
          "county": "",
          "phoneNumber": "",
          "email": data.selfRegistrationRequest().profile.email(),
          "jobTitle": "",
          "companyName": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.companyName(),
          "faxNumber": data.faxNumber(),
          "addressType": [],
          "type": "",
          "repositoryId": "",
          "isDefaultBillingAddress": false,
          "isDefaultShippingAddress": true,
          "predefinedAddressTypes": [],
          "isTypeModified": false,
          "computedDefaultBilling":false,
          "computedDefaultShipping": false,
          "selectedCountry": "US",
          "selectedState": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.state(),          
          "selectedAddressTypes": [],
          "isDefaultAddress": true,
          "dynamicProperties": [],
          "computedAddressType": [],
          "computedCountry": [
            "US"
          ],
          "x_account_type": data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.type(),
          "special_delivery_instructions": getWidget.specialInstructions(),
          //karthick added for shipping custom properties
          "LIFT_GATE":getWidget.liftGateFee(),
		"INDE_INPU":getWidget.insidePickup(),
		/*"RESI_PU_DEL":getWidget.resPickup(),*/
		"LAPU_LADL":getWidget.limitedAccessPickup(),
          
          "Address_Status": true,
          "types": []
						    },
						    "addressType":data.selfRegistrationRequest().organization.secondaryAddresses()[1].address.alias(),
						}
						
						
                        var addressess = [];
						addressess[0] = address1;
						addressess[1] = address2;



						var profile = {
	/*						"firstName": data.selfRegistrationRequest().profile.firstName(),
							"email": data.selfRegistrationRequest().profile.email(),
							"lastName": data.selfRegistrationRequest().profile.lastName(),
							"name_title": data.selectedTitle(),
							"home_phone_number": data.homePhoneNumber(),
							"office_number": data.officeNumber(),
							"fax_number": data.faxNumber(),
							"mobile_number": data.mobileNumber(),
							"receive_texts": data.receiveTexts(),
							"receive_mailings_special_offers": data.receiveMails(),
							"receiveEmail": receiveEmailCheck,
						
*/							
	"firstName": data.selfRegistrationRequest().profile.firstName(),
    "email": data.selfRegistrationRequest().profile.email(),
    "lastName": data.selfRegistrationRequest().profile.lastName(),
    "name_title": data.selectedTitle(),
    "home_phone_number":data.homePhoneNumber(),
    "office_number": data.officeNumber(),
    "fax_number": data.faxNumber(),
    "mobile_number": data.mobileNumber(),
    "receive_texts": data.receiveTexts(),
    "receive_mailings_special_offers": data.receiveMails(),
    "receive_catalog": data.receiveCatalogs(),
    "receiveEmail":  receiveEmailCheck,
    "position_title": data.title(),
	"org_role": data.role()

						}
						var organization = {
							"name": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName(),
							"secondaryAddresses": addressess,
							"primary_business": data.primaryBusiness(),
							"secondary_business": data.secondaryBusiness(),
							"num_of_employees": data.noOfEmployees(),
							"annual_revenue": data.annualRevenue(),
							"org_type":data.radioSelectedOptionValue()
						}

						ccRestClient.request(CCConstants.ENDPOINT_CREATE_ORGANIZATION_REQUEST, {
								"organization": organization,
								"profile": profile,
								"name": data.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName()
							},
							function (success) {
								console.log("success" + success);
								$('#main').removeClass('loadingIndicator');
								spinner.destroy();
								navigation.goTo('/accountConfirmation');

								$('#CC-verfication-emaillink').show();

							}, // defined elsewhere
							function (error) {
								notifier.sendError("contact-creation", "Error while processing request", true);
								$('#main').removeClass('loadingIndicator');
								spinner.destroy();

							},
							null);


					}

    				}
				
			},

			createCustomer: function (data, event) {


				var shippingAddress = data.selfRegistrationRequest().organization.secondaryAddresses()[1].address;
				var billingAddress = data.selfRegistrationRequest().organization.secondaryAddresses()[0].address;
				var valid = true;

				if([null,undefined,''].indexOf(shippingAddress.address1()) !== -1){
					valid = false;
					data.saveButtonError(true);
					//$("#individual-Shippingaddress1").blur()
					document.getElementById("CC-userRegistration-address11-label").style = "color:#f33";
                    document.getElementById("CC-userRegistration-address11").style = "border: 2px solid #f33";
				}
				if([null,undefined,''].indexOf(shippingAddress.city()) !== -1)
				{
					valid = false;
					data.saveButtonError(true);
					//$("#individual-Shippingcity").blur();
					document.getElementById("CC-userRegistration-city1-label").style = "color:#f33";
                    document.getElementById("CC-userRegistration-city1").style = "border: 2px solid #f33";
				}
				if([null,undefined,''].indexOf(shippingAddress.postalCode()) !== -1)
				{
					valid = false;
					data.saveButtonError(true);
					//$("#individual-Shippingzipcode").blur();
					document.getElementById("CC-userRegistration-zipCode1-label").style = "color:#f33";
                    document.getElementById("CC-userRegistration-zipCode1").style = "border: 2px solid #f33";
				}
				if([null,undefined,''].indexOf(shippingAddress.type()) !== -1)
				{
					valid = false;
					data.saveButtonError(true);
					//data.isEmptyAddressType(true);
					$('.boxtype').append('<style>.boxtype:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
					document.getElementById("CC-userRegistration-typeAddress-label").style = "color:#f33"
                    document.getElementById("CC-userRegistration-typeAddress").style = "border: 2px solid #f33"
				}
				if([null,undefined,''].indexOf(shippingAddress.state()) !== -1)
				{
					//$("#individual-ShippingState").blur()
					valid = false;
					data.saveButtonError(true);
					document.getElementById("CC-userRegistration-state1-label").style = "color:#f33";
					$('.box1').append('<style>.box1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
                    document.getElementById("CC-userRegistration-state1").style = "border: 2px solid #f33";
				}
				if([null,undefined,''].indexOf(billingAddress.address1()) !== -1)
				{
					valid= false;
					data.saveButtonError(true);
					//$("#individual-Billingaddress1").blur()
					document.getElementById("CC-userRegistration-address1-label").style = "color:#f33"
                    document.getElementById("CC-userRegistration-address1").style = "border: 2px solid #f33"
				}
				if([null,undefined,''].indexOf(billingAddress.city()) !== -1)
				{
					valid = false;
					data.saveButtonError(true);
					//$("#individual-Billingcity").blur()
					document.getElementById("CC-userRegistration-city-label").style = "color:#f33"
                    document.getElementById("CC-userRegistration-city").style = "border: 2px solid #f33"
				}
				if([null,undefined,''].indexOf(billingAddress.postalCode()) !== -1)
				{
					valid=false;
					data.saveButtonError(true);
					//$("#individual-Billingzipcode").blur()
					document.getElementById("CC-userRegistration-zipCode-label").style = "color:#f33"
                    document.getElementById("CC-userRegistration-zipCode").style = "border: 2px solid #f33"
				}
				if([null,undefined,''].indexOf(billingAddress.state()) !== -1)
				{
					valid=false;
					data.saveButtonError(true);
					//$("#individual-BillingState").blur()
					$('.box1').append('<style>.box1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
					document.getElementById("CC-userRegistration-state-label").style = "color:#f33"
                    document.getElementById("CC-userRegistration-state").style = "border: 2px solid #f33"
				} 
				if(valid)				
				{
				    data.saveButtonError(false);
					var self = this;
					var orderRefreshIndicatorOptions = {
						parent: '#main',
						posTop: '20em',
						posLeft: '50%'
					}
					$('#main').addClass('loadingIndicator');
					$('#main').css('position', 'relative');
					spinner.create(orderRefreshIndicatorOptions);

					//				var shippingAddress = data.selfRegistrationRequest().organization.secondaryAddresses()[1].address;
					shippingAddress.validateNow();
					//              var billingAddress = data.selfRegistrationRequest().organization.secondaryAddresses()[0].address;
					billingAddress.validateNow();
					if (billingAddress.city() === '' || billingAddress.postalCode() === '') {
						notifier.sendError("register", "Mandatory Fields are missing", true);
						return;
					}
					if (shippingAddress.city() === '' || shippingAddress.postalCode() === '') {
						notifier.sendError("register", "Mandatory Fields are missing", true);
						return;
					}

					if (data.selfRegistrationRequest().profile.lastName() === '' || data.selfRegistrationRequest().profile.firstName() === '' || data.selfRegistrationRequest().profile.email() === undefined || data.selfRegistrationRequest().profile.email() === '' || shippingAddress.country() === '' || shippingAddress.city() === '' || shippingAddress.state() === '' || billingAddress.country() === '' || billingAddress.city() === '' || billingAddress.state() === '') {
						notifier.sendError("register", "Please enter all mandatory Fields", true);
						$('#main').removeClass('loadingIndicator');
						spinner.destroy();
						return;
					}

					var userShippingAddress = {
						"lastName": data.selfRegistrationRequest().profile.lastName(),
						"country": shippingAddress.country(),
						"address3": shippingAddress.address3(),
						"address2": data.selectedShippingAddress2Type() + ' ' + shippingAddress.address2(),
						"city": shippingAddress.city(),
						"address1": shippingAddress.address1(),
						"special_delivery_instructions":getWidget.specialInstructions(),
						"postalCode": shippingAddress.postalCode(),
						"companyName": shippingAddress.companyName(),
						"isDefaultAddress": true,
						"isDefaultShippingAddress":true,
						"firstName": data.selfRegistrationRequest().profile.firstName(),
						"phoneNumber": shippingAddress.phoneNumber(),
						"alias": shippingAddress.alias(),
						"state": shippingAddress.state(),
						"selectedCountry": shippingAddress.selectedCountry(),
						"selectedState": shippingAddress.selectedState(),
						"type": shippingAddress.type(),
						"x_account_type":shippingAddress.type(),
						"x_billing_contact":data.selfRegistrationRequest().profile.firstName()+" "+ data.selfRegistrationRequest().profile.lastName(),
						"x_shipping_contact":data.selfRegistrationRequest().profile.firstName()+" "+ data.selfRegistrationRequest().profile.lastName(),
						"x_main_contact":data.selfRegistrationRequest().profile.firstName()+" "+ data.selfRegistrationRequest().profile.lastName(),
						//karthick added for shipping custom property
						"LIFT_GATE":getWidget.liftGateFee(),
						"INDE_INPU":getWidget.insidePickup(),
						/*"RESI_PU_DEL":getWidget.resPickup(),*/
						"LAPU_LADL":getWidget.limitedAccessPickup(),
						
					}
					var userBillingAddress = {
						"lastName": data.selfRegistrationRequest().profile.lastName(),
						"country": billingAddress.country(),
						"address3": billingAddress.address3(),
						"address2": data.selectedBillingAddress2Type() + ' ' + billingAddress.address2(),
						"city": billingAddress.city(),
						"address1": billingAddress.address1(),
						"special_delivery_instructions":getWidget.specialInstructions(),
						"postalCode": billingAddress.postalCode(),
						"companyName": billingAddress.companyName(),
						"isDefaultAddress": false,
						"isDefaultBillingAddress":true,
						"firstName": data.selfRegistrationRequest().profile.firstName(),
						"phoneNumber": billingAddress.phoneNumber(),
						"alias": billingAddress.alias(),
						"state": billingAddress.state(),
						"selectedCountry": billingAddress.selectedCountry(),
						"selectedState": billingAddress.selectedState(),
						"type": billingAddress.type(),
						"x_account_type":shippingAddress.type(),
						"x_billing_contact":data.selfRegistrationRequest().profile.firstName()+" "+ data.selfRegistrationRequest().profile.lastName(),
						"x_shipping_contact":data.selfRegistrationRequest().profile.firstName()+" "+ data.selfRegistrationRequest().profile.lastName(),
						"x_main_contact":data.selfRegistrationRequest().profile.firstName()+" "+ data.selfRegistrationRequest().profile.lastName(),
					}
					var shippingAddresses = [];

					if(!getWidget.billingAddressCopyCheck()){
          					shippingAddresses[0] = userBillingAddress; 
					}
					if(shippingAddresses.length>0){
				shippingAddresses[1]= userShippingAddress;					    
					}else{
     			shippingAddresses[0]= userShippingAddress;
					}
					

				

					
					


				    
				   
					
					var receiveEmailCheck = '';
					if (data.receiveEmail()) {
						receiveEmailCheck = 'yes';
					} else {
						receiveEmailCheck = 'no';
					}

					var payload = {
						"firstName": data.selfRegistrationRequest().profile.firstName(),
						"lastName": data.selfRegistrationRequest().profile.lastName(),
						"email": data.selfRegistrationRequest().profile.email(),
						"password": data.user().newPassword(),
						"name_title": data.selectedTitle(),
						"home_phone_number": data.homePhoneNumber(),
						"mobile_number": data.mobileNumber(),
						"receive_texts": data.receiveTexts(),
						"receive_mailings_special_offers": data.receiveMails(),
						"receive_catalog": data.receiveCatalogs(),
						"shippingAddresses": shippingAddresses,
						"default_billingAddress_data":userBillingAddress,
						"receiveEmail": receiveEmailCheck,

					}

                    console.log( data.selfRegistrationRequest().organization.secondaryAddresses(), "Secondary addresses")
					ccRestClient.request(CCConstants.ENDPOINT_CREATE_PROFILE,
						payload,
						function (success) {
							console.log("success" + success);
							$('#main').removeClass('loadingIndicator');
							spinner.destroy();
							//if (!getWidget.organizationFound()) {
								navigation.goTo('/accountConfirmation');
						//	}
						}, // defined elsewhere
						function (error) {
							notifier.sendError("contact-creation", "Error while processing request", true);
							$('#main').removeClass('loadingIndicator');
							spinner.destroy();
						}, // defined elsewhere
						null);

				}

			},

			submitSelfRegistrationRequest: function (data, event) {
				var self = data;
				if ('click' === event.type || 'blur' === event.type  || event.keyCode === 9) {
				    if(event.target.value === "")
				    {
				        event.target.style = "border: 2px solid #f33";
				        if(event.target.id !== null){
				            var label = event.target.id + "-label"; 
    				        document.getElementById(label).style = "color:#f33";
    				        if(event.target.id === "CC-userRegistration-state1" || event.target.id === "CC-userRegistration-state")
    				        {
    				           $('.box1').append('<style>.box1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>')
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-role")
    				        {
    				           $('.boxrole1').append('<style>.box1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>')
    				        }
    				        if(event.target.id === "CC-userRegistration-typeAddress")
    				        {
    				            $('.boxtype').append('<style>.boxtype:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-state1")
    				        {
    				           $('.box3').append('<style>.box3:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-state")
    				        {
    				           $('.box1').append('<style>.box1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-typeAddress")
    				        {
    				            $('.box4').append('<style>.box4:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-primaryBusiness")
    				        {
    				            $('.boxprimaryBusiness').append('<style>.boxprimaryBusiness:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
				        }
				    }
				    else
				    {
				        event.target.style = "border: 2px solid #d3d3d";
				        if(event.target.id !== null){
				            var label = event.target.id + "-label"; 
    				        document.getElementById(label).style = "color:black";
    				        if(event.target.id === "CC-userRegistration-state1" || event.target.id === "CC-userRegistration-state")
    				        {
    				           $('.box1').append('<style>.box1:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>')
    				        }
    				         if(event.target.id === "CC-userBusinessRegistration-role")
    				        {
             		            $('.boxrole1').append('<style>.boxtype:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				        if(event.target.id === "CC-userRegistration-typeAddress")
    				        {
    				            $('.boxtype').append('<style>.boxtype:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				        
    				        if(event.target.id === "CC-userBusinessRegistration-state1")
    				        {
    				           $('.box3').append('<style>.box3:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-state")
    				        {
    				           $('.box1').append('<style>.box1:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-typeAddress")
    				        {
    				            $('.box4').append('<style>.box4:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				         if(event.target.id === "CC-userBusinessRegistration-primaryBuiness")
    				        {
    				            $('.boxprimaryBusiness').append('<style>.boxprimaryBusiness:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
				        }
				        if(event.target.id  === "CC-userRegistration-emailAddress")
				        {
				            self.emailAddressLostFocus();
				        }
				         if(event.target.id  === "CC-userBusinessRegistration-emailAddress")
				        {
				            self.emailAddressLostFocus();
				        }
				    }
				    /**if([null,undefined,''].indexOf(self.selfRegistrationRequest().profile.firstName()) !== -1 )
		            {
		                
		                document.getElementById("CC-userRegistration-firstname-label").style = "color:#f33";
                        document.getElementById("CC-userRegistration-firstname").style = "border: 2px solid #f33";
		            }else
		            {
		                document.getElementById("CC-userRegistration-firstname-label").style = "color:black"
                        document.getElementById("CC-userRegistration-firstname").style = "border: 2px solid #d3d3d"
		            }
		            if([null,undefined,''].indexOf(self.selfRegistrationRequest().profile.lastName()) !== -1 )
		            {
		                document.getElementById("CC-userRegistration-lastname-label").style = "color:#f33";
                        document.getElementById("CC-userRegistration-lastname").style = "border: 2px solid #f33";
		            }else
		            {
		                document.getElementById("CC-userRegistration-lastname-label").style = "color:black"
                        document.getElementById("CC-userRegistration-lastname").style = "border: 2px solid #d3d3d"
		            }**/
				}
				if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
					self.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName(self.selfRegistrationRequest().name());
					console.log(self.selfRegistrationRequest().organization.secondaryAddresses()[0].address);
					var address = self.selfRegistrationRequest().organization.secondaryAddresses()[0].address;
					if (!self.userFound()) {
						self.selfRegistrationRequest.createSelfRegistrationRequest(self.createOrganizationRequestSuccess.bind(self), self.createOrganizationRequestFailure.bind(self));
					}
				}
				return true;
			},

			redirectToLogin: function () {
				var self = this;
				self.hideAllRegisterSections();
				$('#CC-Email-Modal').hide();
				$('.modal-backdrop').remove();
				navigation.goTo('/login?email=' + getWidget.selfRegistrationRequest().profile.email() );
				return true;

			},
			showRegistrationModal: function () {
				var self = this;
				if(self.radioSelectedOptionValue() === self.selectedRegistrationOption()){
				    if(self.radioSelectedOptionValue() === "Individual")
				    {
				        self.hideAllRegisterSections();
				        $('#CC-submitSelfRegistrationRequestPane').show();
				    }else if( self.radioSelectedOptionValue() === "Business" || self.radioSelectedOptionValue() === "Distributor")
				    {
				        self.hideAllRegisterSections();
				        $('#CC-registerBusinessUserPane').show();
				    }
				}else{
				if (self.radioSelectedOptionValue() === "Individual") {
				    self.selectedRegistrationOption("Individual");
					//self.selfRegistrationRequest.reset();
					self.hideAllRegisterSections();
					self.homePhoneNumber('');
					self.mobileNumber('');
					self.isInvalidEmailAddress(false);
					self.isInvalidHomePhoneNumber1(false);
					self.isInvalidHomePhoneNumber(false);
					self.isInvalidMobilePhoneNumber(false);
					self.mobileNumber('');
					self.role('');
					self.faxNumber('');
					self.receiveEmail(true);
					self.receiveTexts(true);
					self.receiveMails(true);
					self.receiveCatalogs(true);
					self.selectedTitle('');
					self.isInvalidFaxPhoneNumber(false)
					self.selfRegistrationRequest().reset();
					$('#CC-submitSelfRegistrationRequestPane').show();
				} else if (self.radioSelectedOptionValue() === "Business") {
				     self.selectedRegistrationOption("Business");
					self.selfRegistrationRequest().reset();
					self.homePhoneNumber('');
					self.faxNumber('');
					self.selectedTitle('');
					self.officeNumber(''); -
					self.isInvalidMobilePhoneNumber(false);
					self.isInvalidHomePhoneNumber(false);
					self.isInvalidHomePhoneNumber1(false);
					self.role('');
					self.receiveEmail(true);
					self.receiveTexts(true);
					self.receiveMails(true);
					self.receiveCatalogs(true);
					self.mobileNumber('');
					self.isInvalidFaxPhoneNumber(false)
					self.isInvalidEmailAddress(false);
					//self.selfRegistrationRequest.reset();
					self.hideAllRegisterSections();
					$('#CC-registerBusinessUserPane').show();

				}else if(self.radioSelectedOptionValue() === "Distributor"){
				     self.selectedRegistrationOption("Distributor");
					self.selfRegistrationRequest().reset();
					self.homePhoneNumber('');
					self.faxNumber('');
					self.selectedTitle('');
					self.officeNumber(''); -
					self.isInvalidMobilePhoneNumber(false);
					self.isInvalidHomePhoneNumber(false);
					self.isInvalidHomePhoneNumber1(false);
					self.role('');
					self.receiveEmail(true);
					self.receiveTexts(true);
					self.receiveMails(true);
					self.receiveCatalogs(true);
					self.mobileNumber('');
					self.isInvalidFaxPhoneNumber(false)
					self.isInvalidEmailAddress(false);
					//self.selfRegistrationRequest.reset();
					self.hideAllRegisterSections();
					$('#CC-registerBusinessUserPane').show();
				}   
                }
			},
			showShippingBillingContactInfo: function (data, event) {
				data.hideAllRegisterSections();
				$('#CC-businessUserShippingBillingContactInfo').show();
			},
			addValidationsForSelfRegistration: function () {
				var self = this;
				//Adding validations for first name, last name, company name and emailAddress
				self.selfRegistrationRequest().profile.firstName.extend({
				required: {
						params: true,
						//message: CCi18n.t('ns.common:resources.firstNameRequired')
					},
					maxLength: {
						params: CCConstants.REPOSITORY_STRING_MAX_LENGTH,
						message: CCi18n.t('ns.common:resources.maxlengthValidationMsg', {
							maxLength: CCConstants.REPOSITORY_STRING_MAX_LENGTH
						})
					}
				});
				self.selfRegistrationRequest().profile.email.extend({
					required: {
						params: true,
						//message: CCi18n.t('ns.common:resources.emailAddressRequired')
					},
					email: {
						params: true,
						onlyIf: function () {
							return !self.ignoreOrgRequestEmailValidation()
						},
						message: CCi18n.t('ns.common:resources.emailAddressInvalid')
					},
					maxLength: {
						params: CCConstants.EMAIL_ID_MAX_LENGTH,
						message: CCi18n.t('ns.common:resources.maxlengthValidationMsg', {
							maxLength: CCConstants.EMAIL_ID_MAX_LENGTH
						})
					}
				});
				self.selfRegistrationRequest().profile.lastName.extend({
					required: {
						params: true,
						//message: CCi18n.t('ns.common:resources.lastNameRequired')
					},
					maxLength: {
						params: CCConstants.REPOSITORY_STRING_MAX_LENGTH,
						message: CCi18n.t('ns.common:resources.maxlengthValidationMsg', {
							maxLength: CCConstants.REPOSITORY_STRING_MAX_LENGTH
						})
					}
				});
				self.selfRegistrationRequest().name.extend({
					required: {
						params: true,
						message: CCi18n.t('ns.common:resources.companyNameRequired')
					},
					maxLength: {
						params: CCConstants.ORG_REQ_NAME_MAX_LENGTH,
						message: CCi18n.t('ns.common:resources.maxlengthValidationMsg', {
							maxLength: CCConstants.ORG_REQ_NAME_MAX_LENGTH
						})
					}
				});
				self.selfRegistrationRequest().requesterComments.extend({
					maxLength: {
						params: 1000,
						message: CCi18n.t('ns.common:resources.requesterCommentMaxLengthText')
					}
				});
				self.selfRegistrationRequest().relatedOrganizationName.extend({
					maxLength: {
						params: CCConstants.REPOSITORY_STRING_MAX_LENGTH,
						message: CCi18n.t('ns.common:resources.maxlengthValidationMsg', {
							maxLength: CCConstants.REPOSITORY_STRING_MAX_LENGTH
						})
					}
				});
			},

			validateOfficePhoneNumber: function (data, event) {


				if (event.target.value === "" || event.target.value === null) {
					getWidget.isInvalidOfficePhoneNumber(false);
				} else {
					var number = ("" + event.target.value).replace(/\D/g, '');
					var token = number.match(/^(\d{3})(\d{3})(\d{4})$/);

					if (token !== null) {
						getWidget.isInvalidOfficePhoneNumber(false);
					} else {
						getWidget.isInvalidOfficePhoneNumber(true);
					}
				}
			},
			validateMobilePhoneNumber: function (data, event) {
				if (event.target.value === "" || event.target.value === null) {
					getWidget.isInvalidMobilePhoneNumber(false);
				} else {
				    event.target.style = "border: 2px solid #d3d3d";
				    if(event.target.id !== null){
                				var label = event.target.id + "-label"; 
                    			document.getElementById(label).style = "color:black";
				        }
				           
					var number = ("" + event.target.value).replace(/\D/g, '');
					var token = number.match(/^(\d{3})(\d{3})(\d{4})$/);

					if (token !== null) {
						getWidget.isInvalidMobilePhoneNumber(false);
                        event.target.style = "border: 2px solid #d3d3d";
    				    if(event.target.id !== null){
                    		var label = event.target.id + "-label"; 
                        	document.getElementById(label).style = "color:black";
    				    }
					} else {
						getWidget.isInvalidMobilePhoneNumber(true);
						event.target.style = "border: 2px solid #f33";
				        if(event.target.id !== null){
				            var label = event.target.id + "-label"; 
    				        document.getElementById(label).style = "color:#f33";
				        }
					}
				}
			},
			validateFaxPhoneNumber: function (data, event) {


				if (event.target.value === "" || event.target.value === null) {
					getWidget.isInvalidFaxPhoneNumber(false);
				} else {
					var number = ("" + event.target.value).replace(/\D/g, '');
					var token = number.match(/^(\d{3})(\d{3})(\d{4})$/);

					if (token !== null) {
						getWidget.isInvalidFaxPhoneNumber(false);
						document.getElementById("CC-userRegistration-faxNumber-label").style = "color:black"
                        document.getElementById("CC-userRegistration-faxNumber").style = "border: 2px solid #d3d3d"
					} else {
						getWidget.isInvalidFaxPhoneNumber(true);
						document.getElementById("CC-userRegistration-faxNumber-label").style = "color:#f33";
					    document.getElementById("CC-userRegistration-faxNumber").style = "border: 2px solid #f33";
					}
				}
			},
			validatePrimaryPhoneNumber: function (data, event) {


				if (event.target.value === "" || event.target.value === null) {
					getWidget.isInvalidPrimaryPhoneNumber(false);
				} else {
					var number = ("" + event.target.value).replace(/\D/g, '');
					var token = number.match(/^(\d{3})(\d{3})(\d{4})$/);

					if (token !== null) {
						getWidget.isInvalidPrimaryPhoneNumber(false);
					} else {
						getWidget.isInvalidPrimaryPhoneNumber(true);
					}
				}
			},
			validateSecondaryPhoneNumber: function (data, event) {


				if (event.target.value === "" || event.target.value === null) {
					getWidget.isInvalidSecondaryPhoneNumber(false);
				} else {
					var number = ("" + event.target.value).replace(/\D/g, '');
					var token = number.match(/^(\d{3})(\d{3})(\d{4})$/);

					if (token !== null) {
						getWidget.isInvalidSecondaryPhoneNumber(false);
					} else {
						getWidget.isInvalidSecondaryPhoneNumber(true);
					}
				}
			},
			validateHomePhoneNumber: function (data, event) {

				//getWidget.isInvalidHomePhoneNumber1(true);

				if (event.target.value === "" || event.target.value === null) {
					getWidget.isInvalidHomePhoneNumber1(true);
					getWidget.isInvalidHomePhoneNumber(false);
				} else {
				     event.target.style = "border: 2px solid #d3d3d";
				    if(event.target.id !== null){
                				var label = event.target.id + "-label"; 
                    			document.getElementById(label).style = "color:black";
				        }
				           
					getWidget.isInvalidHomePhoneNumber1(false);
					var number = ("" + event.target.value).replace(/\D/g, '');
					var token = number.match(/^(\d{3})(\d{3})(\d{4})$/);

					if (token !== null) {
						getWidget.isInvalidHomePhoneNumber(false);
					    event.target.style = "border: 2px solid #d3d3d";
    				    if(event.target.id !== null){
                    		var label = event.target.id + "-label"; 
                        	document.getElementById(label).style = "color:black";
    				    }
					} else {
						getWidget.isInvalidHomePhoneNumber(true);
						event.target.style = "border: 2px solid #f33";
				        if(event.target.id !== null){
				            var label = event.target.id + "-label"; 
    				        document.getElementById(label).style = "color:#f33";
				        }
					}
				}
			},
			validateEmail: function (email) {
			    console.log("Inside email validation")
			//	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			//	const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
				const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
				return re.test(email);
			},
			translate: function (key) {
				return CCi18n.t('ns.common:resources.' + key);
			},
			handleCustomLogout: function (data) {
				console.log(data);
				var self = data;
				$.Topic(pubsub.topicNames.USER_CLEAR_CART).publish([{
					message: "success"
				}]);

				var successFunc = function () {
					$.Topic(pubsub.topicNames.USER_LOGOUT_SUCCESSFUL).publish([{
						message: "success"
					}]);
					storageApi.getInstance().removeItem(CCConstants.LOCAL_STORAGE_SHOPPER_CONTEXT);
					storageApi.getInstance().removeItem(CCConstants.LOCAL_STORAGE_CURRENT_CONTEXT);
					ccRestClient.clearStoredValue(CCConstants.LOCAL_STORAGE_PRICELISTGROUP_ID);
					self.clearUserData();

					if (self.refreshPageAfterContactLogout()) {
						self.refreshPageAfterContactLogout(false);

					} else {
						//Refreshing layout to set Content Variation Slots, if any.
						var eventData = {
							'pageId': navigation.getPath()
						};
						$.Topic(pubsub.topicNames.PAGE_VIEW_CHANGED).publish(eventData);
					}

					navigation.goTo('/home')


				};

				if (self.loggedIn()) {
					if (self.parentOrganization && self.parentOrganization.name()) {
						self.refreshPageAfterContactLogout(true);
					}
					self.client().logout(successFunc, errorFunc);
				} else {
					self.clearUserData();
					$.Topic(pubsub.topicNames.USER_LOGOUT_SUCCESSFUL).publish([{
						message: "success"
					}]);
					self.profileRedirect();
				}
				var errorFunc = function (pResult) {
					self.clearUserData();
					self.profileRedirect();
					window.location.assign(self.contextData.global.links.home.route);
				};
			}
		};
		
	}
);