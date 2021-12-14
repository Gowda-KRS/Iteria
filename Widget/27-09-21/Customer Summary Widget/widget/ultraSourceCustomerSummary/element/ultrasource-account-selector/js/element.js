define(
	// -------------------------------------------------------------------
	// DEPENDENCIES
	// -------------------------------------------------------------------
	[ 'jquery', 'knockout', 'ccConstants', 'agentViewModels/account-site-selector', 'storageApi' ],

	// -------------------------------------------------------------------
	// MODULE DEFINITION
	// -------------------------------------------------------------------
	function ( $, ko, CCConstants, AccountAndSiteSelector, storageApi ) {
		"use strict";

		return {
			elementName: 'ultrasource-account-selector',
			disableAccountSelector: ko.observable( false ),
			onLoad: function ( widget ) {
				var self = this;
				self.accountAndSiteSelector = AccountAndSiteSelector;
				self.isB2BProfile = ko.observable( false );
				var profileDetails = {};
				// get the profile details
				if ( widget.profileDetail ) {
					profileDetails = widget.profileDetail;
					self.isB2BProfile( widget.profileDetail.profileType == CCConstants.B2B_PROFILE_TYPE ? true : false );
				} else {
					self.isB2BProfile( widget.user().isB2BProfileType() );
				}

				if ( self.isB2BProfile() ) {
					var organization = storageApi.getInstance().readFromMemory( CCConstants.LOCAL_STORAGE_ORGANIZATION_ID ) ? storageApi.getInstance().readFromMemory( CCConstants.LOCAL_STORAGE_ORGANIZATION_ID ) : null;
					self.accountAndSiteSelector.currentOrganizationId( organization );
					if ( self.accountAndSiteSelector.allOrganizations().length == 0 ) {
						self.accountAndSiteSelector.fetchOrganizations( null, null, widget.user().id() );
					}
				} else {
					self.accountAndSiteSelector.currentOrganizationId( null );
				}
				self.disableAccountSelector = ko.computed( function () {
					return ( widget.cart() && widget.cart().currentOrderState() == 'QUOTED' ) || ( self.accountAndSiteSelector.allOrganizations().length == 1 )
				} );
			},

			/**
			 * Triggered when account is changed
			 */
			handleOrganizationSelection: function ( pEvent ) {
				if ( typeof this.handleOrganizationSelection === "function" ) {
					this.handleOrganizationSelection();
				}
			}
		};
	} );