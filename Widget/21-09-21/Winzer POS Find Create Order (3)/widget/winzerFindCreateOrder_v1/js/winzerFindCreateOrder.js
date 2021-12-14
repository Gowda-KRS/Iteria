/**
 * @fileoverview Widget to Find Customer.
 */
define(

	//-------------------------------------------------------------------
	// DEPENDENCIES
	//-------------------------------------------------------------------
	[ 'knockout', 'spinner', 'CCi18n', 'agentViewModels/customer-search', 'jquery', 'ccConstants', 'ccRestClient',
		'pubsub', 'agentViewModels/agentUtils/agent-utils', 'agentViewModels/agent-context-manager',
		'viewModels/site-listing', 'agentViewModels/agentConfiguration', 'agentViewModels/account-site-selector', 'notifier', 'viewModels/shopperContext', 'navigation'
	],

	// MODULE DEFINITION
	//-------------------------------------------------------------------
	function ( ko, spinner, CCi18n, AgentCustomerSearchViewModel, $, CCConstants, CCRestClient, pubsub, AgentUtils,
		AgentContextManager, SiteListingViewModel, AgentConfiguration, AccountAndSiteSelector, notifier, ShopperContextViewModel, navigation ) {

		'use strict';
		var getWidget;
		return {
			sites: ko.observableArray( [] ),
			customerSearchViewModel: new AgentCustomerSearchViewModel(),
			isCreateOrderEnabled: ko.observable( true ),
			customerCartsViewModel: ko.observable(),
			contextManager: AgentContextManager,
			profileOffset: ko.observable(0),
			
			accountUniqueId: ko.observable(""),
			accountUniqueIdArray: ko.observableArray(),
			
			//MB 06/17/21 - start
// 			isCreditHold: ko.observable(false),
			//MB 06/17/21 - end
			
			accountNumber:ko.observable(),
			allAddresses: ko.observableArray(),
			allDiscountPrnts: ko.observableArray([]),
			totalProfileAddresses: ko.observable(0),
			opDynamicProperty: ko.observable(),
			inheritedAddresses: ko.observableArray([]),
            secondaryAddresses: ko.observableArray([]),
            profileAddresses: ko.observableArray([]),
            addresses: ko.observableArray([]),
            isEditMode: ko.observable(false),
			contextManager: AgentContextManager,
			offset: ko.observable(0),
            countriesList: ko.observableArray([]),
             profileOffset: ko.observable(0),
             countriesList: ko.observableArray([]),
             accountOffset: ko.observable(0),
			accountNumberText:ko.observable(),
			limit: ko.observable(40),
			isCustomerCartsModalOpened: ko.observable( false ),
			isCreditHoldArray: ko.observableArray(),				//Phani Sekhar on 07/01/21 added to display Credit Hold
			isSlowPayArray: ko.observableArray(),  //MB 09/09/21 - slow pay
			spinnerOptions: {
				parent: '#page',
				posTop: '50%',
				posLeft: '50%'
			},
			//MB - 08/11/2021
			lineOfBusiness: ko.observableArray([]),
			//MB - end 08/11/2021

			onLoad: function ( widget ) {
				console.log( "Entering - onLoad()" );
				getWidget=widget;
				//MB - 8/11/2021
				
				
			//	setTimeout(function(){ 
				    getWidget.getCurrentAdminProfile();
				//MB - end 8/11/2021
				// spinner options
				if ( widget.itemsPerPage ) {
					widget.customerSearchViewModel.itemsPerPage = parseInt( widget.itemsPerPage );
				} else {
					widget.customerSearchViewModel.itemsPerPage = 15;
				}
				    
			//	}, 1000);
				widget.initCustomerSearchCriteria();
				AgentContextManager.getInstance().clearAgentContextHeader();
				// Clear the header details set if any in agent context header
				AgentUtils.removeFromStorage( CCConstants.LOCAL_STORAGE_ORGANIZATION_ID );
				AgentUtils.removeFromStorage( CCConstants.LOCAL_STORAGE_AGENT_CONTEXT );
				AgentUtils.removeFromStorage( CCConstants.LOCAL_STORAGE_SITE_ID );
				ko.bindingHandlers.enterkey = {
					init: function ( element, valueAccessor, allBindings, viewModel ) {
						var callback = valueAccessor();
						$( element ).keypress( function ( event ) {
							var keyCode = ( event.which ? event.which : event.keyCode );
							if ( keyCode === 13 ) {
								console.log( "enter was pressed" );
								callback.call( viewModel );
								return false;
							}
							return true;
						} );
						/*$( element ).keydown( function ( event ) {
							var keyCode = ( event.which ? event.which : event.keyCode );
							if ( keyCode === 9 || keyCode === 13 ) {
								console.log( "tab was pressed" );
								callback.call( viewModel );
								return false;
							}
							return true;
						} );*/
					}
				};
				/**
				 * Function to enable or disable search button.
				 */
				widget.isSearchEnabled = function () {
					if ( this.accountNumber() || this.businessName() || this.phoneNumber()
					     || this.address1() || this.city() || this.state() || this.postalCode() ) {
						console.log( "Search Enabled" );
						return true;
					}
					return false;
				};
			},
			NavigatetoPage: function ( pageId ) {
				var self = this;

				if ( pageId == "Order_History" ) {
					navigation.goTo( "/pos_findOrderHistory" );
				} else if ( pageId == "Find_Customer" ) {
					navigation.goTo( "/pos_findCustomer" );
				} else if ( pageId == "Store_Cart" ) {
					navigation.goTo( "/pos_findStoreCart" );
				} else if ( pageId == "AddressBook" ) {
					navigation.goTo( "/pos_findAddressBook" );
				} else if ( pageId == "Find_Order" ) {
					navigation.goTo( "/pos_findOrder" );
				} else if ( pageId == "New_Order" ) {
					navigation.goTo( "/pos_findNewOrder" );
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
          
          console.log("load1",data);
        });
        /*widget.showProfileAddress(true);*/
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
        /*  widget.showLoadMorePAddress(true);*/            
        }else{
          /*widget.showLoadMorePAddress(false);*/
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

    	populateSiteAndOrganization : function () {
        var widget = this;
        if(widget.contextManager) {
          widget.siteFilter(widget.contextManager.getSelectedSite());
          widget.organizationFilter(widget.contextManager.getCurrentOrganizationId()); 	
        }    	  
    },
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


			findOrderHistory: function ( profileId ) {
				var self = this;
				navigation.goTo( "/pos_orderHistory/" + profileId );
			},

			/**
			 * Displays the order history for a selected user
			 * @param <Object> pCustomerDetails Order history of the selected customer
			 */
			clickOrderHistory: function ( pCustomerDetails,data,uniqueId ) {
				console.log( "Entering clickOrderHistory()" );
				var self = this;
				self.populateOrganizations( pCustomerDetails );
				AgentContextManager.getInstance().setShopperProfileId( pCustomerDetails.id );
				var user = self.user();
				var siteId = pCustomerDetails.latestOrderSiteId;
				if ( siteId === undefined && siteId === null ) {
					siteId = user.contextData.global.site.siteInfo.repositoryId;
				}
				AgentContextManager.getInstance().setSelectedSite( siteId );
				navigation.goTo( '/occs-agent/pos_orderHistory' + '/' + pCustomerDetails.id );
				console.log( "Exiting clickOrderHistory()" );
			},
			clickAddressBook: function () {
				console.log( "Entering clickAddressBook()" );
				var widget = this;
				var user = widget.user();
				console.log( "widget--->" + JSON.stringify( widget ) );
				console.log( "widget.user()" );
				console.log( user );
				var profileId = user.contextData.global.user.id;
				console.log( "Profile Id" );
				console.log( profileId );

				// This check is needed so that shopper profile is not set for anonymous user.
				if ( profileId !== undefined && profileId !== null ) {
					AgentContextManager.getInstance().setShopperProfileId( profileId );
				}
				var siteId = user.contextData.global.site.siteInfo.repositoryId;
				console.log( "Site Id" );
				console.log( siteId );
				AgentContextManager.getInstance().setSelectedSite( siteId );
				navigation.goTo( '/occs-agent/pos_addressBook' + '/' + profileId );
				//user.navigateToPage(this.links().pos_addressBook.route+"/"+profileId);

				console.log( "Exiting clickAddressBook()" );
			},
			
			beforeAppear: function ( page ) {
			    var widget=this;
			    widget.allAddresses([]);
			    widget.accountUniqueIdArray([]);
			    widget.isCreditHoldArray([]);                        //Phani Sekhar on 07/01/21 added to display Credit Hold
			    widget.isSlowPayArray([]);  //MB 09/09/21 - slow pay
				console.log( "Entering - beforeAppear()" );
				AgentContextManager.getInstance().resetHeaders();
				this.initCustomerSearchCriteria();
				AgentContextManager.getInstance().clearAgentContextHeader();
				// Clear the header details set if any in agent context header
				AgentUtils.removeFromStorage( CCConstants.LOCAL_STORAGE_ORGANIZATION_ID );
				AgentUtils.removeFromStorage( CCConstants.LOCAL_STORAGE_AGENT_CONTEXT );
				AgentUtils.removeFromStorage( CCConstants.LOCAL_STORAGE_SITE_ID );
				this.clearShopperContext( this.customerSearch.bind( this ) );
				this.reset.bind( this );
				this.customerSearchViewModel.isSearchPerformed( false );

				if(this.user().roles().length == 0 && this.user().id() == "") {
          this.user().isDelegatedAdmin(true);
          this.loadCountries(); 
          return;
        } else {
          this.loadCountries();
      	}
	},

			/**
			 * clears the shopperContext
			 * @param pCallback - callback function
			 */
			clearShopperContext: function ( pCallback ) {
				var shopperContext = ShopperContextViewModel.getInstance();
				if ( shopperContext.isExternalContext() ) {
					spinner.create( this.spinnerOptions );
					var populatePLGandCatalogData = shopperContext.populatePLGandCatalogData.bind( shopperContext, pCallback );
					shopperContext.getOrderDynamicPropertiesWithDefaultValues( populatePLGandCatalogData );
				} else {
					if ( pCallback ) {
						pCallback();
					}
				}
			},



			/**
			 * Function to call perform search method of customerSearchViewModel.
			 */
			customerSearch: function ( page ) {
				console.log( "Entering - customerSearch()" );
                
                var widget = this;
				var self = this;
				//MB 09/09/21 - reset credit hold and slow pay array before searching for customers
				widget.isCreditHoldArray([]);
			    widget.isSlowPayArray([]);
			    widget.allAddresses([]);
			    widget.accountUniqueIdArray([]);
				if ( !self.isSearchEnabled() ) {
					spinner.destroy();
					return;
				}
				spinner.create( this.spinnerOptions );
				var data = {};
				if ( AgentConfiguration.isTextSearchEnabled() ) {
					//Text Search Query
					data = self.getSearchCriteria();
				} else {
					// SCIM search Query.
					data.q = self.getSearchQuery();
					data.queryFormat = CCConstants.PARAM_QUERY_FORMAT_SCIM;
					data.limit = 20;
					data.sort = "id" + ':' + "desc";
					data.includeOrderDetails = true;
				}
			//	widget.accountUniqueIdArray.push("");
			//	widget.isCreditHoldArray.push("");            //Phani Sekhar on 07/01/21 added to display Credit Hold
			//	widget.isSlowPayArray.push("");  //MB 09/09/21 - slow pay
                /*widget.customerSearchViewModel="";
               widget.customerSearchViewModel = new AgentCustomerSearchViewModel();*/
               console.log("wwww",widget.customerSearchViewModel);
               widget.customerSearchViewModel.data("");
				widget.customerSearchViewModel.performSearch( 0, data, this.createSpinnerCallBack.bind( this ), this.destroySpinnersCallBack.bind( this ), this.onSearchFailure.bind( this ) );
			},
			

			/**
			 * Search failure callback.
			 */
			onSearchFailure: function ( pResult ) {
				var returnCodeLabel = CCi18n.t( 'ns.common:resources.returnCodeLabel' );
				var errorMessage = pResult.message + returnCodeLabel + ':' + pResult.errorCode;
				notifier.sendError( pResult.code, errorMessage, true );
			},

			/**
			 * To destroy spinners.
			 */
			destroySpinnersCallBack: function () {
				
				setTimeout(function()
			    {
			        
			        if( getWidget.customerSearchViewModel.data().length>0){
			            
			     //   customerSearchViewModel.data()[0].parentOrganization.repositoryId
			     console.log("123456789", getWidget.customerSearchViewModel.data()[0].parentOrganization.repositoryId);
			     
			     
			     //   localStorage.setItem('accountNumber', getWidget.customerSearchViewModel.data()[0].parentOrganization.repositoryId);
			     //localStorage.setItem('businessName', getWidget.customerSearchViewModel.data()[0].parentOrganization.name);
			        
			        for(var i = 0; i < getWidget.customerSearchViewModel.data().length;i++) {
			            var AccUniqueId = getWidget.customerSearchViewModel.data()[i].parentOrganization.repositoryId;
			        
			        getWidget.getUniqueId(AccUniqueId);
			        console.log("1111",getWidget.isSlowPayArray());
			        
			        
                     getWidget.user().id(getWidget.customerSearchViewModel.data()[i].id);
        			    getWidget.loadProfileAddresses();
        			    getWidget.loadAddresses(); 
                    }
			    }
                 }, 1000);
			},
			
			
			getUniqueId: function (AccUniqueId) {
        var widget = this;
        
                  $.ajax({
						url: '/ccadmin/v1/login?grant_type=client_credentials',
						headers: {
							//'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwZTFmOGNkYy0xZDRkLTQ1MGYtYTNhNC04YzBkNmJlNWQxMGIiLCJpc3MiOiJhcHBsaWNhdGlvbkF1dGgiLCJleHAiOjE2MzcxMjczNjEsImlhdCI6MTYwNTU5MTM2MX0=.Q4upoYcBt7mHf05J1K3A+5bzyzLUC73qoSEBxTRuA0A=",
							 'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyY2RhZWM0NS00ZWY2LTQ1Y2MtOWFjNC1mMWEwZGU5OWM3YjgiLCJpc3MiOiJhcHBsaWNhdGlvbkF1dGgiLCJleHAiOjE2NTE2NTMwOTMsImlhdCI6MTYyMDExNzA5M30=.ho4TAi3qAHWUKJOm7nmBtNcatIaSqKld+NV2X/YSZco=",
							'Content-Type': "application/x-www-form-urlencoded",
						},
						method: 'POST',
						processData: false,
						contentType: false,
						
						success: function(token) {
							console.log(token);
							console.log(token.access_token);
						console.log("Front Acc Numberrrr : ", widget.accountNumber());
				
				        $.ajax({
                            url: "/ccadmin/v1/organizations/"+AccUniqueId,
     		                headers: {
									'Authorization': "Bearer " + token.access_token,
									'Content-Type': "application/json"
								    },
                            method: 'GET',
                            dataType: "json",
                            processData: false,
                            contentType: false,
                            cache: false,
                            data: JSON.stringify(),
        
                        success: function ( data ) {
                           // console.log("Acc uniqueIddddd data",JSON.stringify(data));
                            console.log("AJAX_",data.uniqueId);
                            /*getWidget.isSlowPayArray.push("");
                            getWidget.isCreditHoldArray.push("");*/
                
                            getWidget.accountUniqueId(data.uniqueId);
                            getWidget.accountUniqueIdArray.push(data.uniqueId);
                            //Phani Sekhar on 07/01/21 added to display Credit Hold
                            var creditHold = data.x_credit_hold;
                            getWidget.isCreditHoldArray.push(creditHold);
                            
                            //MB 09/09/21 - slow pay
                            getWidget.isSlowPayArray.push(data.x_slow_pay);
                            spinner.destroy();
                            //notifier.sendSuccess( getWidget.WIDGET_ID, "UniqueId got successfully", true );
                            // sweetAlert(" New Account created successfully ", "success");
                            // setTimeout(function(){ window.location.href = 'https://p7666520c1dev-admin.occa.ocs.oraclecloud.com/occs-agent/pos_findCustomerCatalog'; }, 2000);
    
                        },
                        error: function( error ){
                            notifier.sendError( getWidget.WIDGET_ID, "Failed to get UniqueId . Please try after some time", false );
                        },

                        });
						},
						error: function(error) {
							notifier.sendError(this.WIDGET_ID, "Unable to get inventory", false);
						}
				});
    },
            
    
			
// 			destroySpinnersCallBack: function () {
// 			    spinner.destroy();
// 			    setTimeout(function()
// 			    {
// 			        if( getWidget.customerSearchViewModel.data().length>0){
			            
// 			     //   customerSearchViewModel.data()[0].parentOrganization.repositoryId
// 			     console.log("123456789", getWidget.customerSearchViewModel.data()[0].parentOrganization.repositoryId);
// 			     var AccUniqueId = getWidget.customerSearchViewModel.data()[0].parentOrganization.repositoryId;
			     
// 			     getWidget.getUniqueId(AccUniqueId);
			     
			     
// 			        localStorage.setItem('accountNumber', getWidget.customerSearchViewModel.data()[0].parentOrganization.repositoryId);
// 			     localStorage.setItem('businessName', getWidget.customerSearchViewModel.data()[0].parentOrganization.name);
// 			        }
			        
// 			        for(var i = 0; i < getWidget.customerSearchViewModel.data().length;i++) {
//                      getWidget.user().id(getWidget.customerSearchViewModel.data()[i].id)
//         			    getWidget.loadProfileAddresses();
//         			    getWidget.loadAddresses(); 
//                     }
//                  }, 1000);
            			    
				
				
// 			},

			createSpinnerCallBack: function () {
				spinner.create( this.spinnerOptions );
			},

			/**
			 * Function to reset customer search fields.
			 */
			reset: function () {
				console.log( "Inside reset" );
				var self = this;
				self.accountNumber( '' );
				self.businessName( '' );
				self.phoneNumber( '' );
				self.address1( '' );
				self.city( '' );
				self.state( '' );
				self.postalCode( '' );
				console.log( "Inside reset" );
				$( "#account-number" ).val( "" );
				$( "#business-name" ).val( "" );
				$( "#phone-number" ).val( "" );
				$( "#address1" ).val( "" );
				$( "#city" ).val( "" );
				$( "#state" ).val( "" );
				$( "#postalCode" ).val( "" );
				this.customerSearchViewModel.isSearchPerformed( false );
				//MB 09/09/21 - reset credit hold and slow pay arrays when clicking clear all
				this.isCreditHoldArray.push("");
			    this.isSlowPayArray.push("");
			    this.accountUniqueIdArray.push("");
			    this.allAddresses.push("");
			},

			/**
			 * Function to create search criteria.
			 *
			 * @property {<string>} id.
			 * @property {<string>} accountNumber.
			 * @property {<string>} businessName.
			 * @property {<string>} phoneNumber.
			 * @property {<string>} address1.
			 * @property {<string>} city.
			 * @property {<string>} state.
			 * @property {<string>} postalCode.
			 *
			 */
			initCustomerSearchCriteria: function ( pId, pAccountNumber, pBusinessName,
				pPhoneNumber, pAddress1, pCity, pState, pPostalCode ) {
				var self = this;
				//MB
				self.lineOfBusiness = ko.observableArray([]);
				//MB end
				self.accountNumber = ko.observable( pAccountNumber || '' );
				self.businessName = ko.observable( pBusinessName || '' );
				self.phoneNumber = ko.observable( pPhoneNumber || '' );
				self.isEditPhone = ko.observable( false );
				self.address1 = ko.observable ( pAddress1 || '' );
				self.city = ko.observable ( pCity || '' );
				self.state = ko.observable ( pState || '' );
				self.postalCode = ko.observable ( pPostalCode || '' );
				self.isEditPhone = ko.observable( false );
				self.phoneNumber.subscribe( function ( newValue ) {
					$( ".main-btn-left" ).prop( 'disabled', false );
					$( ".main-btn-right" ).prop( 'disabled', false );

					if ( !newValue ) {
						$( ".main-btn-left" ).prop( 'disabled', true );
						$( ".main-btn-right" ).prop( 'disabled', true );
						self.phoneNumber( self.phoneNumber().replace( /[^0-9]+/g, '' ) );
					}
				} );
				self.accountNumber.subscribe( function ( newValue ) {
					$( ".main-btn-left" ).prop( 'disabled', false );
					$( ".main-btn-right" ).prop( 'disabled', false );

					if ( !newValue ) {
						$( ".main-btn-left" ).prop( 'disabled', true );
						$( ".main-btn-right" ).prop( 'disabled', true );
					}
				} );
				self.businessName.subscribe( function ( newValue ) {
					$( ".main-btn-left" ).prop( 'disabled', false );
					$( ".main-btn-right" ).prop( 'disabled', false );

					if ( !newValue ) {
						$( ".main-btn-left" ).prop( 'disabled', true );
						$( ".main-btn-right" ).prop( 'disabled', true );
					}
				} );
				self.phoneNumber.subscribe( function ( newValue ) {
					$( ".main-btn-left" ).prop( 'disabled', false );
					$( ".main-btn-right" ).prop( 'disabled', false );

					if ( !newValue ) {
						$( ".main-btn-left" ).prop( 'disabled', true );
						$( ".main-btn-right" ).prop( 'disabled', true );
					}
				} );
				self.address1.subscribe( function ( newValue ) {
					$( ".main-btn-left" ).prop( 'disabled', false );
					$( ".main-btn-right" ).prop( 'disabled', false );

					if ( !newValue ) {
						$( ".main-btn-left" ).prop( 'disabled', true );
						$( ".main-btn-right" ).prop( 'disabled', true );
					}
				} );
				self.city.subscribe( function ( newValue ) {
					$( ".main-btn-left" ).prop( 'disabled', false );
					$( ".main-btn-right" ).prop( 'disabled', false );

					if ( !newValue ) {
						$( ".main-btn-left" ).prop( 'disabled', true );
						$( ".main-btn-right" ).prop( 'disabled', true );
					}
				} );
				self.state.subscribe( function ( newValue ) {
					$( ".main-btn-left" ).prop( 'disabled', false );
					$( ".main-btn-right" ).prop( 'disabled', false );

					if ( !newValue ) {
						$( ".main-btn-left" ).prop( 'disabled', true );
						$( ".main-btn-right" ).prop( 'disabled', true );
					}
				} );
				self.postalCode.subscribe( function ( newValue ) {
					$( ".main-btn-left" ).prop( 'disabled', false );
					$( ".main-btn-right" ).prop( 'disabled', false );

					if ( !newValue ) {
						$( ".main-btn-left" ).prop( 'disabled', true );
						$( ".main-btn-right" ).prop( 'disabled', true );
					}
				} );

				// Clear the header details set if any in agent context header
				AgentUtils.removeFromStorage( CCConstants.LOCAL_STORAGE_ORGANIZATION_ID );
				AgentUtils.removeFromStorage( CCConstants.LOCAL_STORAGE_AGENT_CONTEXT );
			},


			/**
			 * Function to update selected account name of 'account-search' element dropdown.
			 * For initial load of element, update the selected account name with the search criteria value.
			 */
			handleAccountSearchValueUpdate: function ( data, pInitialLoad ) {
				var self = this;
				if ( pInitialLoad && self.customerSearchViewModel.searchCriteria.account ) {
					self.elements[ "account-search" ].accountSearchValue( self.customerSearchViewModel.searchCriteria.account );
				} else {
					data = data ? self.accountNameSelected( [ data ] ) : self.accountNameSelected( [] );
				}
			},

			/**
			 * Function to return search criteria JSON object for TextSearch
			 */
			getSearchCriteria: function () {
				var self = this;
				var searchFields = {};
				var searchFieldNames = [ 'accountNumber',
					CCConstants.ORG_NAME,
					CCConstants.PROFILE_PHONE_NUMBER,
					'parentOrganization.active'
				];
				var searchFieldValues = [ self.accountNumber(),
					self.businessName(),
					self.phoneNumber(),
					true,
					self.address1(),
					self.city(),
					self.state(),
					self.postalCode()
				];

				var noOfFields = searchFieldNames.length;
				for ( var fieldIndex = 0; fieldIndex < noOfFields; fieldIndex++ ) {
					if ( searchFieldValues[ fieldIndex ] ) {
						searchFields[ searchFieldNames[ fieldIndex ] ] = searchFieldValues[ fieldIndex ];
					}
				}

				return searchFields;
			},



            //ToGetUniqueId
            

			/**
			 * returns the site name and site production url based
			 * on the site selection
			 * @name formatSiteText
			 * @param - {object}
			 * 		pSite - Site object
			 */
			formatSiteText: function ( pSite ) {
				var self = this;
				return AgentUtils.formatSiteText( pSite );
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
			isSiteExists: function ( pData ) {
				return AgentUtils.doesSiteExist( pData.siteId );
			},

			getSearchQuery: function () {
				var self = this;
				var subQuery = "";
				var finalQuery = "";
				var queryList = [];
				var searchFieldNames = [ 'parentOrganization.uniqueId',
					CCConstants.SCIM_PARENT_ORGANIZATION_NAME,
					'parentOrganization.secondaryAddresses.phoneNumber',
					'parentOrganization.active',
					'parentOrganization.secondaryAddresses.address1',
					'parentOrganization.secondaryAddresses.city',
					'parentOrganization.secondaryAddresses.state',
					'parentOrganization.secondaryAddresses.postalCode'
				];
				var searchFieldValues = [ self.accountNumber(),
					self.businessName(),
					self.phoneNumber(),
					true,
					self.address1(),
					self.city(),
					self.state(),
					self.postalCode()
				];
				//MB - 08/11/2021
				if(self.lineOfBusiness().length !== 0) {
				    searchFieldNames.push('parentOrganization.x_line_of_business');
				    searchFieldValues.push(self.lineOfBusiness());
				}
				//MB - end 08/11/2021
				var noOfFields = searchFieldNames.length;
				for ( var fieldIndex = 0; fieldIndex < noOfFields; fieldIndex++ ) {
					if ( searchFieldValues[ fieldIndex ] ) {
					    if ( searchFieldNames[ fieldIndex ] !== 'parentOrganization.active' ) {
						    subQuery = searchFieldNames[ fieldIndex ] + CCConstants.BLANK_SPACE + "sw \"" + searchFieldValues[ fieldIndex ] + "\"";
					    } else {
					        subQuery = searchFieldNames[ fieldIndex ] + " eq "  + searchFieldValues[ fieldIndex ];
					    }
					    queryList.push( subQuery );
					}
				}
				
				finalQuery = self.andBuilder( queryList );
				return finalQuery;
			},
			
			//MB lookup role for filtering customer search results based on site description (LOB) - 08/11/2021
			getCurrentAdminProfile: function ( pSuccessCallBack, pFailureCallBack ) {
        		var self = this;
        		var data = {};
        		console.log('getCurrentAdminProfile');
        		CCRestClient.request( '/ccagent/v1/adminProfiles/current', data, self.getCurrentAdminProfileSuccess.bind( self, pSuccessCallBack ), self.getCurrentAdminProfileFailure.bind( self, pFailureCallBack ) );
        	},
        	getCurrentAdminProfileSuccess: function ( pSuccessCallBack, pResult ) {
        		var self = this;
        		for ( var i = 0; i < pResult.roles.length; i++ ) {
        			if ( pResult.roles[ i ] !== null && pResult.roles[ i ] !== '' ) {
        			    var data = {};
        			    if(!isNaN(pResult.roles[ i ].repositoryId)) {
        			        self.getSiteDescription(pResult.roles[ i ].repositoryId);
        			    }
        			}
        		}
        	},
        	getCurrentAdminProfileFailure: function ( pFailureCallBack, pResult ) {
        		console.log( 'error: ' + pResult.errors );
        		notifier.sendError( ADMIN_PROFILE_CURRENT, pResult.message, true );
        		if ( pFailureCallBack ) {
        			pFailureCallBack();
        		}
        	},
        	getSiteDescription: function( pData ) {
        	    var self = this;
        	    $.ajax( {
                	url: '/ccadmin/v1/login?grant_type=client_credentials',
                	headers: {
                		'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyY2RhZWM0NS00ZWY2LTQ1Y2MtOWFjNC1mMWEwZGU5OWM3YjgiLCJpc3MiOiJhcHBsaWNhdGlvbkF1dGgiLCJleHAiOjE2NTE2NTMwOTMsImlhdCI6MTYyMDExNzA5M30=.ho4TAi3qAHWUKJOm7nmBtNcatIaSqKld+NV2X/YSZco=",
                		'Content-Type': "application/x-www-form-urlencoded",
                	},
                	method: 'POST',
                	success: function ( token ) {
                		$.ajax( {
                			url: '/ccadmin/v1/sites/' + pData,
                			headers: {
                				'Authorization': "Bearer " + token.access_token,
                				'Content-Type': "application/json"
                			},
                			method: 'GET',
                			success: function ( result ) {
                				console.log("site description:::", JSON.stringify(result.description));
                				if(!self.lineOfBusiness().includes(result.description)) {
                				    self.lineOfBusiness.push(result.description);
                				}
                			},
                			error: function ( error ) {
                				notifier.sendError( this.WIDGET_ID, "Unable to get site response", false );
                			}
                		} );
                	},
                	error: function ( error ) {
                		notifier.sendError( this.WIDGET_ID, "Unable to get token", false );
                	}
                } );
        	},
			//MB - end 08/11/2021

			/**
			 * Builder function which appends 'and' for each query in the list and returns a final query.
			 * Example : queryList = [test1, test2];
			 * output : "test1 and test2";
			 */
			andBuilder: function ( pQueryList ) {
				var self = this;
				var finalQuery = '';
				pQueryList.forEach( function ( query, index ) {
					if ( index ) {
						finalQuery = finalQuery + CCConstants.BLANK_SPACE + CCConstants.AND_TEXT + CCConstants.BLANK_SPACE + query;
					} else {
						finalQuery = query;
					}
				} );
				return finalQuery;
			},


			/**
			 * Function to display the hypher link text based on the incomplete order
			 * and sites.
			 *
			 * @name generateOrderText
			 * @param widget widget view of the present
			 */
			generateOrderText: function ( widget, pProfileDetail ) {
				var self = widget;

				self.isCreateOrderEnabled( false );
				if ( SiteListingViewModel.activeSites().length == 1 ) {
					// a B2C user
					if ( !self.isB2BUser( pProfileDetail ) ) {
						if ( pProfileDetail.hasIncompleteOrder ) {
							return widget.resources().completeOrderText;
						} else {
							self.isCreateOrderEnabled( true );
							return widget.resources().createText;
						}
					} else { //B2B user with 1 site
						var numOfOrganization = self.getProfileOrganizationsCount(
							pProfileDetail, false );
						if ( numOfOrganization == 1 ) {
							if ( pProfileDetail.hasIncompleteOrder ) {
								return widget.resources().completeOrderText;
							} else {
								self.isCreateOrderEnabled( true );
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
			getProfileOrganizationsCount: function ( pProfileDetail, allAccounts ) {
				var count = ( pProfileDetail.parentOrganization && ( allAccounts || pProfileDetail.parentOrganization.active ) ) ? 1 : 0;
				var secondaryOrganizations = [];
				if ( pProfileDetail.secondaryOrganizations ) {
					pProfileDetail.secondaryOrganizations.forEach( function ( element ) {
						if ( allAccounts || element.active ) {
							secondaryOrganizations.push( element.name );
						}
					} );
				}

				count = count + ( secondaryOrganizations ? secondaryOrganizations.length : 0 );
				return count;
			},

			/**
			 * Function to be invoked when the order of a particular user is clicked
			 * @param <Object> data Object containing profile details
			 * @param <String> pOrderId Clicked Order Id
			 */
			clickOrderDetails: function ( data, pOrderId ) {
				var widget = this;
				widget.contextManager.getInstance().setSelectedSite( data.latestOrderSiteId );
				widget.contextManager.getInstance().setShopperProfileId( data.profileDetail ? data.profileDetail.id : data.id );
				widget.user().navigateToPage( this.links().AgentOrderDetails.route + "/" + pOrderId );
				return false;
			},

			/**
			 * Function to be invoked when the orders of a particular user is clicked to
			 * load order history page for that user
			 * @param <Object> data Object containing profile details
			 * @param <String> pOrderId Clicked Order Id
			 */
			clickOrders: function ( data ) {
				var widget = this;
				widget.contextManager.getInstance().setShopperProfileId( data.profileDetail ? data.profileDetail.id : data.id );
				widget.user().navigateToPage( this.links().pos_orderHistory.route );
				return false;
			},

			/**
			 * Function to navigate to the checkout page
			 */
			loadCheckoutPage: function ( pProfileData ) {
				console.log( "Entering - loadCheckoutPage()" )
				var widget = this;
				var navigateToCheckout = function () {
					var context = widget.contextManager.getInstance().export(); //JSON.stringify(widget.contextManager.getInstance().export());
					console.log( "Context" );
					console.log( context );
					//var url = widget.links().agentCheckout.route;
					var url = '/occs-agent/pos_new_cart'.route;
					console.log( "URL" );
					console.log( url );
					//navigation.goTo('/occs-agent/pos_checkout');
					url = url + '?context=' + encodeURIComponent( context );
					console.log( "URL + context" );
					console.log( url );
					widget.user().navigateToPage( url );
				};
				if ( pProfileData.hasIncompleteOrder ) {
					var data = {};
					data.profileId = pProfileData.id;
					// Update the shopperProfileId in AgentContext
					widget.contextManager.getInstance().setShopperProfileId( pProfileData.id );
					data.status = "incomplete";
					CCRestClient.request( CCConstants.ENDPOINT_ORDERS_SEARCH, data,
						function ( pData ) {
							if ( pData !== null && pData !== undefined ) {
								widget.contextManager.getInstance().setPriceListGroup( pData.priceListGroup.id );
								//navigateToCheckout();
								navigation.goTo( '/occs-agent/pos_new_cart' );
							} else {
								widget.contextManager.getInstance().setPriceListGroup( "in-Store_Price" );
								//navigateToCheckout();
								navigation.goTo( '/occs-agent/pos_new_cart' );
							}
						},
						function ( pError ) {
							notifier.sendError( widget.widgetId(), pError.message, true );
						}
					);
				} else {
					//navigateToCheckout();
					navigation.goTo( '/occs-agent/pos_new_cart' );
				}
				console.log( "Exiting - loadCheckoutPage()" )
				return false;
			},

			/**
			 * Function to navigate to profile page
			 * @param <Object> data Object containing profile details
			 */
			clickProfileDetails: function ( data ) {
				console.log( "Entering clickProfileDetails()" );
				var widget = this;
				console.log( "Widget" );
				console.log( widget );
				console.log( "Profile Data" );
				console.log( ko.utils.unwrapObservable( data ) );
				console.log( ko.utils.unwrapObservable( data.id ) );
				AgentContextManager.getInstance().setShopperProfileId( data.id );
				//this.populateOrganizations(data);
				if ( data.parentOrganization && data.parentOrganization.active ) {
					AgentUtils.addToStorage( CCConstants.LOCAL_STORAGE_ORGANIZATION_ID, data.parentOrganization.repositoryId );
				} else {
					AgentUtils.addToStorage( CCConstants.LOCAL_STORAGE_ORGANIZATION_ID, null );
					//widget.user().currentOrganization(null);
					//widget.user().rolesForCurrentOrganization([]);
				}
				//widget.user().navigateToPage(widget.links().agentCustomerDetails.route);
				//widget.user().navigateToPage('/occs-agent/pos_customerInformation');
				navigation.goTo( '/occs-agent/pos_customerInformation' );
				console.log( "Exiting clickProfileDetails()" );
				return false;

			},


			loadProfileAddresses: function(){
      //load profile addresses
      var widget = this;


//      if((widget.accountNumber()!=null)&&(widget.businessName()!=null) && (widget.phoneNumber()!=null) && (widget.address1()!=null) && (widget.city()!=null) && (widget.sate()!=null) && (widget.postalCode()!=null) ){
        if(["",null,undefined].indexOf(widget.accountNumber()) == -1 || ["",null,undefined].indexOf(widget.businessName()) == -1 || ["",null,undefined].indexOf(widget.phoneNumber()) == -1 || ["",null,undefined].indexOf(widget.address1()) == -1 || ["",null,undefined].indexOf(widget.city()) == -1 || ["",null,undefined].indexOf(widget.state()) == -1 || ["",null,undefined].indexOf(widget.postalCode()) == -1){    
      
      var url = CCConstants.END_POINT_LIST_PROFILE_ADDRESSES;
      var input = {};
      input[CCConstants.OFFSET] = widget.profileOffset();
      input[CCConstants.LIMIT] = widget.limit();
      // AgentApplication - If we are in agent application the user id is required for getting the list of profile address
      console.log("Loading profile addresses...");
      console.log(widget.user().id());
      
      if (CCRestClient.profileType === CCConstants.PROFILE_TYPE_AGENT) {
        CCRestClient.request(url,input, widget.loadProfileAddressSuccess.bind(widget),widget.fetchAddressesFailure.bind(widget),widget.user().id());
      } else {
        CCRestClient.request(url,input, widget.loadProfileAddressSuccess.bind(widget),widget.fetchAddressesFailure.bind(widget));
      }
      console.log("22222",widget.accountNumber());
      if(widget.allAddresses().length>0)
          console.log("21111",widget.allAddresses());
          
			}     
    },


    loadAddresses: function(){
       console.log("Entering - loadAddresses()");
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
      //if (!widget.user().isB2BUser() || widget.organizationFilter() !== null) {
          if (!widget.user().isB2BUser()) {
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
     console.log("Loaddd111::",widget.profileAddresses());
     console.log("Exiting - loadAddresses()");
   },

   loadCountriesSuccess: function(data) {
           var widget = this;


        if(data.length>0){

            for(var iter = 0;iter <data.length; iter++){
                widget.countriesList.push(data[iter]);

            //     if (data[iter].countryCode == "US")
            //     {
            //          if(data[iter].regions.length>0){

            //              for(var iter2 = 0;iter2 <data[iter].regions.length; iter2++){
            //                  widget.availableStates.push(data[iter].regions[iter2].abbreviation);

            //              }
            //          }
            //          widget.availableStates.sort();
            //          break;
            //     }
            }
        }
        
        widget.isEditMode(false);
        widget.populateSiteAndOrganization();
        widget.loadAddresses();

    },

    	loadCountries:  function(data) {

           var widget=this;


        // 	var url= CCConstants.ENDPOINT_LIST_COUNTRIES;

        	var url= CCConstants.ENDPOINT_COUNTRY_REGION_LIST_COUNTRIES;


        	var inputData = {};
            // inputData["orgId"]=widget.user().currentOrganization().repositoryId;
            // inputData[CCConstants.INCLUDE]=CCConstants.ENDPOINT_SHIPPING_REGIONS_LIST_SHIPPING_REGIONS;
            inputData[CCConstants.OFFSET] = widget.offset();
            inputData["regions"] = true;
            // inputData[CCConstants.LIMIT] = widget.limit();

            // Test
            // widget.stateList.push("IL");
            // widget.availableStates = widget.stateList;

            CCRestClient.request(url, inputData, widget.loadCountriesSuccess.bind(widget), widget.loadCountriesError.bind(widget));

            // widget.stateList([]);
            // for (var i=0; i<widget.countriesList().length; i++) {
            // if (widget.countriesList()[i].countryCode === widget.country()) {
            //   widget.stateList(widget.countriesList()[i].regions);
            //   widget.state(widget.stateList()[0]);
            //   // Postal code pattern match. Currently hardcoded
            //   // into the JS file. Maybe the pattern can be sent
            //   // from the repository.
            //   if (widget.country() === CCConstants.UNITED_STATES) {
            //     widget.postalCodePattern(widget.US_POSTAL_CODE_PATTERN);
            //   }

            //   else if (widget.country() === CCConstants.CANADA) {
            //     widget.postalCodePattern(widget.CANADA_POSTAL_CODE_PATTERN);
            //   }
            //   else {
            //     widget.postalCodePattern(widget.DEFAULT_POSTAL_CODE_PATTERN);
            //   }
            // }
       },

       loadCountriesError: function(result) {

      var widget = this;
      notifier.clearError(widget.WIDGET_ID);
      notifier.clearSuccess(widget.WIDGET_ID);
      if (result.status == CCConstants.HTTP_UNAUTHORIZED_ERROR) {
          widget.user().handleSessionExpired();
          if (navigation.isPathEqualTo(widget.links().profile.route) || navigation.isPathEqualTo(widget.links().accountAddresses.route)) {
            navigation.doLogin(navigation.getPath(), widget.links().home.route);
          }
      }
      else {
        notifier.sendError(widget.WIDGET_ID, result.message, true);
      }
    },

    clickBrowseCatalog: function ( pCustomerDetails, pHasIncompleteOrder ) {
				var self = this;
				console.log( "Entering clickBrowseCatalog()" );
				var siteId = self.user().contextData.global.site.siteInfo.repositoryId;
				console.log('---------------------------  ' + siteId);
				AgentContextManager.getInstance().setSelectedSite( siteId );
				self.populateOrganizations( pCustomerDetails );
				if ( !pHasIncompleteOrder ) {
					AgentContextManager.getInstance().setPriceListGroup( self.user().priceListGroup.id() );
				}
				var data = {};
					data.profileId = pCustomerDetails.id;
					data.status = "incomplete";
					self.contextManager.getInstance().setShopperProfileId( pCustomerDetails.id );
					CCRestClient.request( CCConstants.ENDPOINT_ORDERS_SEARCH, data,
						function ( pData ) {
							if ( pData !== null && pData !== undefined ) {
								self.contextManager.getInstance().setPriceListGroup( pData.priceListGroup.id );
								// navigat?ion.goTo( '/occs-agent/pos_catalogBrowse' );
							} else {
								self.contextManager.getInstance().setPriceListGroup( "in-Store_Price" );
								// navigation.goTo( '/occs-agent/pos_catalogBrowse' );
							}
						},
						function ( pError ) {
							notifier.sendError( self.widgetId(), pError.message, true );
						}
					);
				    self.browseCatalog();
				console.log( "Exiting clickBrowseCatalog()" );
				return false;
			},

			browseCatalog: function () {
				var widget = this;
				spinner.create( widget.spinnerOptions );
				var data = {};
				data[ CCConstants.DEPTH ] = CCConstants.DEPTH_MIN;
				data[ CCConstants.CATALOG_MAXLEVEL_PARAM ] = CCConstants.CATALOG_MAXLEVEL_1000;
				data[ CCConstants.EXPAND_QUERY_PARAM ] = CCConstants.EXPAND_CHILD_CATEGORIES;
				data[ CCConstants.CATALOG ] = this.user().catalogId();
				CCRestClient.request( CCConstants.ENDPOINT_COLLECTIONS_GET_COLLECTION, data,
					function ( pData ) {
						spinner.destroy();
						widget.user().navigateToPage( pData.childCategories[ 0 ].route );
					},
					function ( pResult ) {
						spinner.destroy();
						notifier.sendError( widget.WIDGET_ID, pResult.message, true );
					}, CCConstants.ROOT_CATEGORY_ID );
			},

			isB2BUser: function ( pData ) {
				var self = this;
				return ( pData.profileType && pData.profileType == 'b2b_user' );
			},

			/**
			 * Displays the order details for a particular user
			 * @param <Object> pCustomerDetails Customer Details of the particular customer
			 * @param <boolean> pHasIncompleteOrder Indicates whether a customer has incomplete orders
			 * @param popUpId the id received form the popup stack
			 */
			showOrderDetails: function ( pCustomerDetails, pHasIncompleteOrder, popUpId ) {
				var self = this;
				var widget = this;
				var activeSites = SiteListingViewModel.activeSites();
				var numOfSites = activeSites.length;
				AgentContextManager.getInstance().resetHeaders();
				self.populateOrganizations( pCustomerDetails );
				if ( !pHasIncompleteOrder ) {
					AgentContextManager.getInstance().setPriceListGroup( self.user().priceListGroup.id() );
				}
				if ( pCustomerDetails && pCustomerDetails.profileType === 'b2b_user' && pCustomerDetails.secondaryOrganizations.length === 0 && ( pCustomerDetails.parentOrganization === null || !pCustomerDetails.parentOrganization.active ) ) {
					notifier.sendError( self.widgetId(), self.translate( "noActiveAccountsAssociated" ), true );
					//} else if ( popUpId === null || numOfSites === 1 && ( AccountAndSiteSelector.allOrganizations() && AccountAndSiteSelector.allOrganizations().length < 2 ) ) {
				} else if ( ( AccountAndSiteSelector.allOrganizations() && AccountAndSiteSelector.allOrganizations().length < 2 ) ) {
					self.contextManager.getInstance().setShopperProfileId( pCustomerDetails.id );
					self.loadCheckoutPage( pCustomerDetails );
				   self.shopperContext.populatePLGandCatalogData(self.navigateToCheckoutPos.bind(self));
				    // self.navigateToCheckoutPos();
				}
				//Karthick Added for redirect to new order - 18-01-2021
				 else {
				 	if(widget.shopperContext && widget.shopperContext.dynamicProperties() && widget.shopperContext.dynamicProperties().length > 0 && widget.shopperContext.isContextNotNull()){
          widget.shopperContext.populatePLGandCatalogData(widget.navigateToCheckout.bind(widget));
          console.log("TRUE");
        } else{
          console.log("FALSE");  
          widget.navigateToCheckoutPos();
        }
				 }
			},
			
			
			navigateToCheckoutPos : function() {
        console.log("Entering - navigateToCheckoutPos()");
        var widget = this;
        var profileId = ko.utils.unwrapObservable(widget.profileId);
        var data = {};
        
        if  (profileId !== undefined && profileId !== null) {
            AgentContextManager.getInstance().setShopperProfileId(profileId);
        }
        
        data.status = "incomplete";
        data.profileId = profileId;
        CCRestClient.request(ccConstants.ENDPOINT_ORDERS_SEARCH, data, 
            function(pData) {
              if (pData !== null && pData !== undefined) {
                  AgentContextManager.getInstance().setPriceListGroup("defaultPriceGroup");
                    widget.user().orderId('');
                  navigation.goTo('/occs-agent/pos_new_cart');
              }else{
                  AgentContextManager.getInstance().setPriceListGroup("defaultPriceGroup");
                  widget.user().orderId('');
                  navigation.goTo('/occs-agent/pos_new_cart');
              }
            },
            function(pError) {
              notifier.sendError(widget.widgetId(), pError.message, true);
            }
          );
          
        console.log("Exiting - navigateToCheckoutPos()");
      },
      
      
      //karthick added for saved carts 16-06-2021
      
      showSavedOrderDetails:function(pCustomerDetails, pHasIncompleteOrder, popUpId){
        var self = this; 
        var activeSites = SiteListingViewModel.activeSites();
        var numOfSites = activeSites.length;
        AgentContextManager.getInstance().resetHeaders();
        self.populateOrganizations(pCustomerDetails);
        if(!pHasIncompleteOrder){
          AgentContextManager.getInstance().setPriceListGroup(self.user().priceListGroup.id());
        }
        if(pCustomerDetails && pCustomerDetails.profileType === 'b2b_user' && pCustomerDetails.secondaryOrganizations.length === 0 && (pCustomerDetails.parentOrganization === null || !pCustomerDetails.parentOrganization.active)) {
          notifier.sendError(self.widgetId(), self.translate("noActiveAccountsAssociated"), true);
        } else if( popUpId === null || numOfSites === 1  && (AccountAndSiteSelector.allOrganizations() && AccountAndSiteSelector.allOrganizations().length < 2)) {
          self.contextManager.getInstance().setShopperProfileId(pCustomerDetails.id);
          self.loadCheckoutPage(pCustomerDetails);
        } else {
          if( $(popUpId + " .modal-header").children("span").length === 0) {
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
			displayCustomerCarts: function ( popUpId, pCustomerDetails, pHasIncompleteOrder ) {
				var self = this;
				var popup = $( popUpId );
				var popUpRegionContext = ko.dataFor( popup[ 0 ] );
				var customerCartsDialogWidget = popUpRegionContext.widgets()[ 0 ];
				//set the customerId
				AgentContextManager.getInstance().setShopperProfileId( pCustomerDetails.id );
				// customerCartsDialogWidget.shopperContext.clearShopperContext();
				customerCartsDialogWidget.profileDetail = pCustomerDetails;
				customerCartsDialogWidget.incompleteOrders = pHasIncompleteOrder;
				customerCartsDialogWidget.customerCartsViewModel( customerCartsDialogWidget.instantiateCustomerCartsModel() );
				$( popUpId ).modal( 'toggle' );
				$( popUpId ).modal( 'show' );

				$( popUpId ).on( "hide.bs.modal", function () {
					// put your default event here
					customerCartsDialogWidget.showIncompleteOrders( false );
					$( 'body' ).removeClass( 'modal-open' );
					$( '.modal-backdrop' ).remove();
				}.bind( self ) );
			},

			/**
			 * Populates organizations
			 * @param pProfileDetail Profile object
			 */
			populateOrganizations: function ( pProfileDetail ) {
				if ( pProfileDetail.profileType && pProfileDetail.profileType == 'b2b_user' ) {
					AccountAndSiteSelector.populateOrganizations( pProfileDetail );
				} else {
					AccountAndSiteSelector.clearOrganizationDetails();
					AccountAndSiteSelector.activeSites( SiteListingViewModel.activeSites() );
				}
			},

			/**
			 * Function to to return a string with comma separated values of primary organizations naem followed by
			 * secondary Organization names.
			 */
			getOrganizationNamesSeparatedWith: function ( pProfileDetailContext, separationCharacter ) {
				var self = this;
				// true passed to retrieve all the accounts.
				var allOrganizations = AccountAndSiteSelector.getOrganizations( pProfileDetailContext, false );
				if ( allOrganizations.length === 0 ) {
					return "";
				} else if ( allOrganizations.length === 1 ) {
					return allOrganizations[ 0 ].name;
				} else {
					var organizationNamesArray = [];
					allOrganizations.forEach( function ( organizationData ) {
						organizationNamesArray.push( organizationData.name );
					} );
					if ( separationCharacter ) {
						return organizationNamesArray.join( separationCharacter );
					}
					return organizationNamesArray.join();
				}
			},
			
		};
	} );