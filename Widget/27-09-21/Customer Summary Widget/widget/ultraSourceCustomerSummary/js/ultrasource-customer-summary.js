/**
 * @fileoverview User Summary Widget.
 * 
 * 
 */
define(

  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['knockout', 'agentViewModels/account-site-selector', 'spinner', 'notifier', 'CCi18n', 'agentViewModels/agent-context-manager', 'agentViewModels/agentNavigationHistory'],
    
  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko, accountSiteSelector, spinner, notifier, CCi18n, AgentContextManager, AgentNavigationHistory) {
  
    "use strict";

    return {
      WIDGET_ID:   "customerSummary",
      
      onLoad: function(widget) {
        var self = this;
      },
      spinnerOptions :  {
        parent : '#CC-customerSummary',
        posTop : 'calc(50% - 2.5rem)',
        posLeft : 'calc(50% - 4.5rem)'
      },
              
      /**
       * Triggered when a site is selected
       */
      handleSiteSelection : function() {
        var widget = this;
        var failureCallback = function(){
         notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.customersummary:resources.customerDetailRetrievalErrorText'));
        };
        widget.user().getCurrentUser(null, null, null, failureCallback);
        //refresh the tab page with the selected site from the site-selector.
        widget.refreshCustomerSummary();
      },

      /**
       * Triggered when sites are loaded after organization change
       * @param pValue
       */
      handleOrganizationSelection : function(pOrganization) {
        var self = this;
        var user = self.user();
        var failureCallback = function(){
          notifier.sendError(self.WIDGET_ID, CCi18n.t('ns.customersummary:resources.customerDetailRetrievalErrorText'));
        };
        user.getCurrentUser(null, null, null, failureCallback);
        if (this.elements.hasOwnProperty('site-selector')) {
          spinner.create(this.spinnerOptions);
          accountSiteSelector.fetchSiteListForOrganization(null, this.destroySpinnersCallBack, this.destroySpinnersCallBack);
        }
        //refresh the tab page with the selected organization from the organization-selector.
        this.refreshCustomerSummary();
      },

      /*
       * Method to handle page refresh after every site and organization change from the selector in the summary.
       */
      refreshCustomerSummary : function(){
        var widget = this;
        var agentNavigationHistory = AgentNavigationHistory;
        var historyStackLength = agentNavigationHistory.historyStack.length;
        widget.user().navigateToPage("/" + agentNavigationHistory.historyStack[historyStackLength-1].pageId + "?customerId="+AgentContextManager.getInstance().getShopperProfileId());
      },
      
      /**
       * destroy spinner when widget become ready
       */
      destroySpinnersCallBack : function(){
        spinner.destroy();
      }
    };
  }
);
