/**
 * @fileoverview Order History Details.
 * 
 */
define(
 
  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['knockout', 'pubsub', 'notifier','spinner', 'CCi18n','jquery', 'ccRestClient', 'ccDate', 'ccConstants', 'navigation','pageLayout/currency',
   'viewModels/site-listing', 'agentViewModels/orderDetailsWrapperViewModel','agentViewModels/comments', 'agentViewModels/agent-context-manager',
	  'pageLayout/site','agentViewModels/agentUtils/cpq-childItems-utils','pageLayout/scheduled-order','pageLayout/product','viewModels/dynamicPropertyMetaContainer',
	  'viewModels/address', 'agentViewModels/country-region-data', 'agentViewModels/account-site-selector', 'productDetailsUtils','agentViewModels/agentUtils/agent-utils'],
    
  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko, pubsub, notifier,spinner, CCi18n, $, CCRestClient,ccDate ,CCConstants, navigation, CurrencyViewModel, SiteListingViewModel, 
		  OrderDetailsWrapperViewModel, CommentsViewModel, AgentContextManager,SiteViewModel,CPQChildItemsUtils, ScheduledOrderViewModel,
		  ProductViewModel,DynamicPropertyMetaContainer,Address,countryRegionData, AccountAndSiteSelector, ProductDetailsUtils, AgentUtils) {

    "use strict";

 return {
   WIDGET_ID: "ultraSourceOrderDetailsAgent",
   CCConstants : CCConstants,
   coupons: ko.observableArray([]),
   orderDetails: ko.observable(),
   isExchangeOrder: ko.observable(false),
   exchangePaymentInfo: ko.observable(),
   couponMultiPromotions: ko.observableArray([]),
   originalOrderId :ko.observable(),
   orderApproverName: ko.observable(""),
   authorizedGiftCards : ko.observableArray([]),
   authorizedCreditCards : ko.observableArray([]),
   //with multi-payment, we can have multiple invoice and cash payments.
   authorizedInvoicePayments : ko.observableArray([]),
   cashPaymentDetails : ko.observableArray([]),
   authorizedVirtualPayments : ko.observableArray([]),
   authorizedStoreCreditPayments : ko.observableArray([]),
   paymentDue : ko.observable(),
   orderDetailsWrapper: ko.observable(),
   orderSite :ko.observable(null),
   contextManager: AgentContextManager,
   selectedCartItemsOfPurchaseList: ko.observableArray([]),
   allCartItemsArray :[],
   cartItemsSelectedArray : ko.observableArray([]),
   selectedProduct : ko.observableArray([]),
   selectedOrder: ko.observable(),
   approverComments : ko.observable(""),
   shoppingCartDetails : ko.observableArray([]),
   selectedShippingGroupForTracking : ko.observable(0),
   currencySymbol : '',
   isAgentApplication: false,
   /** Default options for creating a spinner on widget*/
   scheduledOrderIndicator: '#main',
   scheduledOrderIndicatorOptions : {
     parent:  '#main',
     posTop: '20em',
     posLeft: '50%'
   },
   
   /** Default options for creating a spinner on widget*/
   orderRefreshIndicator: '#main',
   orderRefreshIndicatorOptions : {
     parent:  '#main',
     posTop: '20em',
     posLeft: '50%'
   },
   
   
   /** Scheduled order viewmodel observable */
   scheduledOrder :ko.observable(),
   /** Display observable for page load*/
   display : ko.observable(false),
   isOwner: ko.observable(true),
   /** Holds true if a valid back link is available **/
   isBackLinkAvailable: ko.observable(false),
   opDynamicProperty: ko.observable(),
   date_regex: /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20|21)\d{2}$/,
//   dynamicProperties: ko.observable(),
   
   onLoad : function(widget) {
    widget.CCi18n = CCi18n;
    widget.isAgentApplication = window.isAgentApplication;
    widget.opDynamicProperty(CCConstants.DYNAMIC_PROPERTY_VIEW_ONLY);
    var isModalVisible = ko.observable(false);
    var isModalNoClicked = ko.observable(false);
    var isModalYesClicked = ko.observable(false);
    
    widget.modalObject = ko.observable(null);
    widget.dynamicProperties = ko.observableArray([]);
    widget.dynamicPropertiesLoaded = $.Deferred();
    widget.dynamicPropertyMetaInfo =  DynamicPropertyMetaContainer.getInstance();

    widget.orderDetailsWrapper = OrderDetailsWrapperViewModel.getInstance();
    if(!widget.orderDetailsWrapper.orderDetails() || (widget.orderDetailsWrapper.orderDetails() &&
        !widget.orderDetailsWrapper.orderDetails().id)){
      var orderId = widget.cart().currentOrderId();
      var data = null;
      if(orderId){
        data = {};
      }
      widget.orderDetailsWrapper = OrderDetailsWrapperViewModel.getInstance(data,orderId);
    }
    widget.orderDetails(widget.orderDetailsWrapper.orderDetails());
    /**
     * Method to provide Get Address Dynamic Properties Success callback
     */
    widget.getAddressDynamicPropertiesMetaDataSuccessCallback = function(pResult) {
      widget.dynamicPropertyMetaInfo.intializeDynamicProperties(
        pResult.specifications, CCConstants.ENDPOINT_CONTACT_INFO_TYPE);
      widget.dynamicPropertiesLoaded.resolve();
    };

    /**
     * Method to provide Get Address Dynamic Properties Failure callback
     */
    widget.getAddressDynamicPropertiesMetaDataFailureCallback = function(pResult){
      widget.dynamicPropertiesLoaded.resolve();
    };

    widget.showSwitchOrganizationModal = function () {
     widget.display(false);
     isModalVisible(true);
     $("#CC-scheduleOrderDetails-modal").modal('show');
     $('#CC-scheduleOrderDetails-modal').on('hidden.bs.modal', function () {
         if((!isModalYesClicked() && !isModalNoClicked() && isModalVisible())) {
           $("#CC-scheduleOrderDetailsContextChangeMsg").show();
         }
     });
   };

   widget.checkIfExchangeEnabled = function() {
     return (widget.isExchangeEnabled &&  widget.orderDetailsWrapper.isExchangeOrder()) ||
      (widget.orderDetailsWrapper.orderDetails().state === CCConstants.ORDER_STATE_NO_PENDING_ACTION);
    };

    widget.checkIfReturnEnabled = function() {
     return (widget.orderDetailsWrapper.isReturnOrder()) ||
      (widget.orderDetailsWrapper.orderDetails().state === CCConstants.ORDER_STATE_NO_PENDING_ACTION);
    };

    $.Topic(pubsub.topicNames.REREQUEST_REJECT_QUOTE_ORDER_SUCCESS).subscribe(function(pData){
      widget.invalidateOrder(pData);
    });

    widget.scheduledOrder(ScheduledOrderViewModel.getInstance());
    widget.display(false);
    
    // Bind callback methods context.
    widget.saveScheduledOrderSuccess = widget.saveScheduledOrderSuccess.bind(widget);
    widget.saveScheduledOrderError = widget.saveScheduledOrderError.bind(widget);
    widget.deleteScheduledOrderSuccess = widget.deleteScheduledOrderSuccess.bind(widget);
    widget.deleteScheduledOrderError = widget.deleteScheduledOrderError.bind(widget);
    

    // Define computed properties.
    widget.suspended = ko.pureComputed({read: widget.isSuspended, write: widget.setSuspended}, widget);
    widget.parsedStartDate = ko.pureComputed({read: widget.getStartDate, write: widget.setStartDate}, widget);
    widget.parsedEndDate = ko.pureComputed({read: widget.getEndDate, write: widget.setEndDate}, widget);
    
    // Define property validator.
    widget.scheduledOrder().name.extend({
      required: {
        params: true,
        message: widget.translate('nameRequired')
      },
      maxLength: {
        params: CCConstants.REPOSITORY_STRING_MAX_LENGTH,
        message: widget.translate('maxlengthValidationMsg', {
          fieldName: widget.translate('nameText'),
          maxLength:CCConstants.REPOSITORY_STRING_MAX_LENGTH
        })
      }
    });

      widget.scheduledOrder().startDate.extend({
        required: {
          params: true,
          message: widget.translate('startDateRequired')
        }
      });
//    widget.scheduledOrder().startDate.extend({
//     validation: [{
//      validator: function (obj) {
//          var currentDate = new Date();
//          var startDate = new Date(obj);
//          return startDate >= currentDate;
//      },
//      message: widget.translate('startDateGreaterThanCurrentDate'),
//      onlyIf: function () {
//          return widget.scheduledOrder().startDate();
//      }
//    },{
//      validator: function (obj) {
//          var startDate = new Date(obj);
//          return !(startDate === "Invalid Date");
//      },
//      message: widget.translate('startDateRequired'),
//      onlyIf: function () {
//          return widget.scheduledOrder().startDate();
//      }
//    }],
//      required: {
//        params: true,
//        message: widget.translate('startDateRequired')
//      }
//    });

     widget.scheduledOrder().endDate.extend({
      validation: [{
          validator: function(obj) {
            var endDate = new Date(obj);
            var startDate = new Date(widget.scheduledOrder().startDate());
            return startDate < endDate;
          },
          message: widget.translate('endDateGreaterThanStartDateText'),
          onlyIf: function() {
            return widget.scheduledOrder().endDate();
          }
        }]
     });
    
    $.Topic(pubsub.topicNames.REREQUEST_REJECT_QUOTE_ORDER_SUCCESS).subscribe(function(pData){
      widget.invalidateOrder(pData);
    });

    widget.scheduledOrder().daysOfWeek.extend({
      validation: [{
        validator: function(obj, params) {
          return obj.length >= params;
        },
        message: widget.translate('daysOfWeekRequired'),
        params: 1,
        onlyIf: function() {
          return widget.isDaysOfWeekEnabled();
        }
      }]
    });

    widget.scheduledOrder().weeksInMonth.extend({
      validation: [{
        validator: function(obj, params) {
          return obj.length >= params;
        },
        message: widget.translate('weeksInMonthRequired'),
        params: 1,
        onlyIf: function() {
          return widget.isWeeksInMonthEnabled();
        }
      }
      ]});
    
    widget.validationModel = ko.validatedObservable({
     name: widget.scheduledOrder().name,
     startDate: widget.scheduledOrder().startDate,
     endDate: widget.scheduledOrder().endDate,
     daysOfWeek: widget.scheduledOrder().daysOfWeek,
     weeksInMonth: widget.scheduledOrder().weeksInMonth
   });

    // Define Reference data for creating the scheduleMode select options (including opt groups)
    widget.scheduleModeOptGroups = [
      {
        label: widget.translate('daily'),
        options: [
          {
            text: widget.translate('onceADay'),
            value: CCConstants.SCHEDULE_MODE_ONCE_DAILY
          }
        ]
      },
      {
        label: widget.translate('weekly'),
        options: [
          {
            text: widget.translate('weekly'),
            value: CCConstants.SCHEDULE_MODE_WEEKLY
          }
        ]
      },
      {
        label: widget.translate('monthly'),
        options: [
          {
            text: widget.translate('onceAMonth'),
            value: CCConstants.SCHEDULE_MODE_ONCE_MONTHLY
          },
          {
            text: widget.translate('everyTwoMonths'),
            value: CCConstants.SCHEDULE_MODE_BI_MONTHLY
          },
          {
            text: widget.translate('quarterly'),
            value: CCConstants.SCHEDULE_MODE_QUARTERLY
          }
        ]
      }
    ];

    //To check if the logged in user is the owner of the order. This 
    //is user to control options to edit the order by approver
    widget.isOwner = ko.computed( function(){
      if( widget.user() && widget.scheduledOrder() && 
        widget.user().id() == widget.scheduledOrder().profileId()){
        if( widget.scheduledOrder().templateOrder() && (widget.scheduledOrder().templateOrder().state === CCConstants.PENDING_SCHEDULED_ORDER_APPROVAL ||
            widget.scheduledOrder().templateOrder().state === CCConstants.SCHEDULED_ORDER_STATE_REJECTED)){
          return false;
        }
        return true;
      }
      return false;
    });

    widget.setRenderedCompleteToTrue = function(pNewValue){
      if(pNewValue){
        AgentContextManager.getInstance().setSelectedSite(null);
        widget.orderDetailsWrapper.isRenderComplete(true);
      }
    }
    // Due to asynchronous nature, endpoint validAction is getting called first
    // and widget is not loaded at that time, then the subscriber method is not getting executed
    // So we have added this check to listen to the observable variable.
    if(widget.orderDetailsWrapper.isValidActionEndpointFailure()){
      widget.setRenderedCompleteToTrue(true);
    }

    //user().id() was becoming empty post refresh. So we need to set it to shopper context id
    if(AgentContextManager.getInstance().getShopperProfileId() && !widget.user().id()){
      widget.user().id(AgentContextManager.getInstance().getShopperProfileId());
    }
    widget.orderDetailsWrapper.isValidActionEndpointFailure.subscribe(widget.setRenderedCompleteToTrue.bind(widget));

    widget.isEligibleToCompletePayment = ko.computed(
      function(){
        if(widget.user() && widget.scheduledOrder() && widget.scheduledOrder().profileId() &&
           widget.user().id() === widget.scheduledOrder().profileId() && widget.orderApproverName() != null &&
           widget.scheduledOrder().templateOrder() &&
           widget.scheduledOrder().templateOrder().state === CCConstants.PENDING_PAYMENT_TEMPLATE ){
          var payments = widget.scheduledOrder().templateOrder().paymentGroups ? widget.scheduledOrder().templateOrder().paymentGroups:
                      widget.scheduledOrder().templateOrder().payments;
          var remainingTotal = 0;
          var paymentFailed = false;
          for ( var i = 0; i < payments.length; i++) {
            if (payments[i].paymentMethod != CCConstants.GIFT_CARD_PAYMENT_TYPE) {
              remainingTotal += payments[i].amount;
            }
            if(payments[i].paymentState === CCConstants.PAYMENT_GROUP_STATE_AUTHORIZED_FAILED ||
                payments[i].paymentState === CCConstants.PAYMENT_GROUP_STATE_PAYMENT_REQUEST_FAILED){
              paymentFailed = true;
            }
          }
          if(remainingTotal > 0 || paymentFailed === true || payments.length === 0){
            return true;
          }
      }
      return false;
   },widget);

    // Define a destroy spinner function with spinner id
    widget.destroySpinner = function(pSpinnerId) {
      $(pSpinnerId).removeClass('loadingIndicator');
      spinner.destroyWithoutDelay(pSpinnerId);
    };
    // Define a create spinner function with spinner options
    widget.createSpinner = function(pSpinner, pSpinnerOptions) {
      $(pSpinner).css('position', 'relative');
      $(pSpinner).addClass('loadingIndicator');
      spinner.create(pSpinnerOptions);
    };

    // To append locale for Order details link
    widget.detailsLinkWithLocale = function(pOrderId) {
         if(widget.isAgentApplication) {
          return  widget.user().navigateToPage(this.links().AgentOrderDetails.route+'/'+ pOrderId); 
        } else {
          return widget.user().navigateToPage('/orderDetails/'+'/'+ pOrderId);
        }
     };

    // To append locale for Order details link
    widget.profileDetailsLinkWithLocale = function() {
       if(widget.isAgentApplication) {
        var  userId = widget.user().id;
        // This scenario will appear only when customer's profile is accessed from 
        //approver's context. The example being agent has opened an order belonging to
        // some other buyer, then on click of customer name, agent is redirected to Buyer's
        // profile. That is why before navigating the profile id needs to set to the buyer's 
        //profile id.
        if(widget.user().id != widget.orderDetailsWrapper.orderDetails().profileId) {
           userId = widget.orderDetailsWrapper.orderDetails().profileId;
           AgentContextManager.getInstance().setShopperProfileId(userId);
        }
        // The reason behind clearing organization Id before navigating to profileDetails
        // to order details is to solve the case of invalid organization Id. The profile would 
        // load with default organization.
        AccountAndSiteSelector.clearOrganizationDetails();
        widget.user().navigateToPage(widget.links().agentCustomerDetails.route + "?customerId="+userId);
      } else {
         widget.user().validateAndRedirectPage(widget.links().profile.route);
      }
    };
   },  

   beforeAppear: function (page) {
 	   var widget = this;
     var scheduledOrderId = "";
     widget.scheduledOrderCreatedSuccess = function() {
       AgentContextManager.getInstance().setProperty(CCConstants.AGENT_PARAM_IS_SCHEDULED_ORDER, true);
       if(page.contextId) scheduledOrderId = page.contextId;
       else scheduledOrderId = page.path.split("/")[1];
       var link = (widget.links().AgentOrderDetails.route);
       widget.user().validateAndRedirectPage(link + "/" + scheduledOrderId +'?isScheduledOrder=true');
     };
     $.Topic(pubsub.topicNames.SCHEDULED_ORDER_SUBMISSION_SUCCESS).subscribe(widget.scheduledOrderCreatedSuccess.bind(widget));
     widget.scheduledOrder().reset();
     widget.isBackLinkAvailable(true);
     if (!widget.isPreview() && !widget.historyStack.length) {
       this.isBackLinkAvailable(false);
    }
    if(!widget.orderDetailsWrapper.orderDetails()){
      var data = {};
      var orderId = widget.cart().currentOrderId();
      widget.orderDetailsWrapper = OrderDetailsWrapperViewModel.getInstance(data,orderId);
    }
    if ((widget.orderDetailsWrapper.orderDetails() && !widget.orderDetailsWrapper
      .orderDetails().id && (navigation.getQueryString() && (navigation.getQueryString().indexOf(
        CCConstants.ORDER_PENDING_PAYMENT) > -1))) || !widget.orderDetailsWrapper.orderDetails()) {
      var orderId;
      // Reason for adding the emptyData object is getInstance method of ODWVM, expects
      // first param as an object. 
      var emptyData = {};
      // Below check is added as pending payment scenario requires the currentOrderId to be set
      if (navigation.getQueryString() && (navigation.getQueryString().indexOf(
          CCConstants.ORDER_PENDING_PAYMENT) > -1)) {
        orderId = AgentUtils.getUrlParamValue(page.parameters,CCConstants.ORDER_ID);
        widget.cart().currentOrderState(CCConstants.PENDING_PAYMENT);
        widget.cart().currentOrderId(orderId);
      } else {
        orderId = widget.cart().currentOrderId();
      }
      widget.orderDetailsWrapper = OrderDetailsWrapperViewModel
      .getInstance(emptyData, orderId);
    }
    widget.orderDetails(widget.orderDetailsWrapper.orderDetails());
    var items = [];
    if (widget.orderDetails && widget.orderDetails() && widget.orderDetails().order) {
      items = widget.orderDetails().order.items;
    }
    widget.orderDetailsWrapper.isRenderComplete.subscribe(function(newValue) {
      if(newValue && widget.orderDetailsWrapper.orderDetails().id) {
        widget.populateOrderDetails();
      } else {
        widget.coupons([]);
        widget.orderDetails(null);
        widget.isExchangeOrder(false);
        widget.exchangePaymentInfo(null);
        widget.couponMultiPromotions([]);
        widget.originalOrderId(null);
        widget.orderApproverName(""),
        widget.authorizedGiftCards([]);
        widget.authorizedCreditCards([]);
        widget.authorizedInvoicePayments([]);
        widget.cashPaymentDetails([]);
        widget.authorizedVirtualPayments([]);
        widget.authorizedStoreCreditPayments([]);
        widget.paymentDue(null);
        widget.orderDetailsWrapper.isPayShippingInSecondaryCurrency(false);
        widget.orderDetailsWrapper.isPayTaxInSecondaryCurrency(false);
        widget.orderDetailsWrapper.isMultiCurrencyOrder(false);
        widget.orderSite(null);
        widget.selectedCartItemsOfPurchaseList([]);
        widget.allCartItemsArray = [];
        widget.cartItemsSelectedArray ([]);
        widget.selectedProduct ([]);
        widget.selectedOrder(null);
        AgentContextManager.getInstance().setProperty(CCConstants.AGENT_PARAM_IS_SCHEDULED_ORDER, false);
        widget.orderDetailsWrapper.cacheHandler.addItemToCache(CCConstants.SHOW_SCHEDULED_ORDER, false);
        widget.display(false);
      }
    });

     //load the template after the data is loaded from rest endpoint
     widget.loadTemplate = function() {
       //The shopperProfileId would be different than the profileId of the scheduledOrder during refresh,
       // when approver opens an order of any other shopper to approve.
       if(!widget.contextManager.getInstance().getShopperProfileId() && widget.scheduledOrder().profileId()){
         widget.user().id(widget.scheduledOrder().profileId());
       }
       widget.validationModel.errors.showAllMessages(false);
       widget.destroySpinner(widget.scheduledOrderBodyIndicator);
       if(widget.user().currentOrganization()&&widget.scheduledOrder().organizationId()!=
          (typeof widget.user().currentOrganization().repositoryId === 'function'?
           widget.user().currentOrganization().repositoryId():widget.user().currentOrganization().repositoryId)){
           widget.showSwitchOrganizationModal();
           widget.display(false);
       }
       else{
            widget.display(true);
       }
       if(this.message) {
         notifier.clearError(widget.WIDGET_ID);
         notifier.clearSuccess(widget.WIDGET_ID);
         notifier.sendError(widget.WIDGET_ID, this.message, true);
       }
       widget.registerDatepickerEvents();
     };

     //Notify user if error occur when fetching data from server
     widget.loadErrorTemplate = function(){
       widget.validationModel.errors.showAllMessages(false);
       widget.destroySpinner(widget.scheduledOrderBodyIndicator);
       notifier.clearError(widget.WIDGET_ID);
       notifier.clearSuccess(widget.WIDGET_ID);
       notifier.sendError(widget.WIDGET_ID, this.message, true);
       $.Topic(pubsub.topicNames.SCHEDULED_ORDER_LOAD_ERROR).unsubscribe(widget.loadErrorTemplate);
     };

     $.Topic(pubsub.topicNames.SCHEDULED_ORDER_LOAD_SUCCESS_AGENT).subscribe(widget.loadTemplate);

     widget.selectedProduct([]);
     var orderId = page.contextId;

     var createExpandFlag = function (item) {
       item.childItems[j].expanded = ko.observable(false);
       for (var j = 0; j < item.childItems.length; j++) {
         if (item.childItems[j].childItems && item.childItems[j].childItems.length > 0) {
           createExpandFlag(item.childItems[j]);
         }
       }
     };
     for (var i = 0; items && i < items.length; i++) {
       var item = items[i];
       if (item.childItems && item.childItems.length > 0) {
         createExpandFlag(item);
       }
     }

     AgentContextManager.getInstance().getShopperProfileId();
     if( (page.parameters && page.parameters === "isScheduledOrder=true") ||
       AgentContextManager.getInstance().getProperty(CCConstants.AGENT_PARAM_IS_SCHEDULED_ORDER) ||
       widget.orderDetailsWrapper.cacheHandler.getItemFromCache(CCConstants.SHOW_SCHEDULED_ORDER).result ) {
      if(page.contextId) scheduledOrderId = page.contextId;
      else scheduledOrderId = page.path.split("/")[1];
      widget.scheduledOrder().load(scheduledOrderId.trim());
     }
   },

   /**
    * Redirect to the Schedule Order List page.
    *
    * @private
    */
   redirectToListingPage: function () {
     var widget = this;
     widget.closeModalById('#cc-cancel-scheduleOrder-ModalContainer');
     if(widget.isAgentApplication) {
      widget.redirectToScheduleOrderPage(this.links().agentScheduledOrder.route);
    } else {
      widget.user().validateAndRedirectPage(widget.links().profile.route);
    }
   },
   /**
    * Close the Modal based on Id.
    *
    * @param {String} modalId - The modal id.
    */
   closeModalById: function (modalId) {
     $(modalId).modal('hide');
     $('body').removeClass('modal-open');
     $('.modal-backdrop').remove();
   },

   populateOrderDetails : function() {
 	  var widget = this;
    var pResult = widget.orderDetailsWrapper.orderDetails();
	  if(this.user().id() && !pResult.profile.isAnonymous){
      widget.contextManager.getInstance().setShopperProfileId(this.user().id());
    } else {
      // TODO As this case will arise if the order is searched from order search and return search page
     if(pResult.profileId && !pResult.profile.isAnonymous) {
       widget.contextManager.getInstance().setShopperProfileId(pResult.profileId);
     }
    }
    if(pResult.hasOwnProperty('approvers') && pResult.approvers[0]){
      var approverName = pResult.approvers[0].firstName +" "+pResult.approvers[0].lastName;
      widget.orderApproverName(approverName);
    }

    if(pResult.approverMessages && pResult.approverMessages.length != 0) {
      var approverMsg = widget.orderApproverName() ? (widget.orderApproverName() + ": " + pResult.approverMessages) : pResult.approverMessages ;
      widget.approverComments(approverMsg);
    }

    if(pResult.originalOrderId) {
     widget.exchangePaymentInfo(pResult.returnRequestData);
     widget.originalOrderId(pResult.originalOrderId);
     widget.isExchangeOrder(true);
    }

    if(pResult.priceListGroup) {
      // Update the local storage
      widget.currencySymbol = pResult.priceListGroup.currency.symbol;
      CCRestClient.setStoredValue(CCConstants.LOCAL_STORAGE_PRICELISTGROUP_ID,
          ko.toJSON(pResult.priceListGroup.id));
    } else {
        // Added for backward compatibility
        // Can be removed once all the existing orders are migrated to contain pricelistgroups
        var defaultcurrency = {currency : currencyHelper.currencyObject()};
        self.currencySymbol = defaultcurrency.currency.symbol;
        pResult.priceListGroup = defaultcurrency;
    }
    widget.populatePromotionData();
    widget.orderSite(pResult.siteId);
    widget.populatePaymentData();

    for (var index1 in pResult.shippingGroups) {
        for (var index2 in pResult.shippingGroups[index1].items) {
          if (pResult.shippingGroups[index1].items[index2].isPriceOverridden) {
            pResult.shippingGroups[index1].items[index2].priceOverrideReasonText =
              widget.translate('priceOverrideReasonText');
            pResult.shippingGroups[index1].items[index2].priceOverridenByText =
              widget.translate('priceOverridenByText');
            pResult.shippingGroups[index1].items[index2].priceOverrideHeaderText =
              widget.translate('priceOverrideHeaderText');
          }
          //self.addSkuDetailsToCartItems(pData.shippingGroups[index1].items[index2],pData.priceListGroup, pData.shippingGroups[index1].shippingGroupId);
          CPQChildItemsUtils.allowChildItemsToBeExpanded(pResult.shippingGroups[index1].items[index2].childItems);
        }
      }
  },

  /**
   * This method is used to show the price override text.
   */
  displayPriceOverrideProperties: function(pItem) {
    var widget = this;
    if (pItem.isPriceOverridden) {
      pItem.priceOverrideReasonText =
        widget.translate('priceOverrideReasonText');
      pItem.priceOverridenByText =
        widget.translate('priceOverridenByText');
      pItem.priceOverrideHeaderText =
        widget.translate('priceOverrideHeaderText');
      return true;
    }
    return false;
  },

  loadOrderNotes : function() {
   var widget = this;
   var orderData = widget.orderDetailsWrapper.orderDetails();
   if(widget.elements.hasOwnProperty('agent-notes')) {
     var notesElement = widget.elements['agent-notes'];
     if(orderData.id) {
       notesElement.initialiseCommentsViewModel('order', orderData.id, orderData.orderComments);
     }
   }
   return true;
  },

  populatePromotionData : function() {
    var widget = this;
    var pResult = widget.orderDetailsWrapper.orderDetails();
    if(widget.couponMultiPromotions().length) {
     widget.couponMultiPromotions.removeAll();
    }

    if(widget.coupons().length) {
     widget.coupons.removeAll();
    }

    if(pResult.discountInfo) {
      var multiPromotionCouponMap = pResult.discountInfo.claimedCouponMultiPromotions;
      var orderCouponsMap = pResult.discountInfo.orderCouponsMap;
      //The idea is to fill both the coupon map based on the coupon ID
      var propertyCouponMap = [];
      if (multiPromotionCouponMap) {
         for ( var property in multiPromotionCouponMap) {
           if(multiPromotionCouponMap.hasOwnProperty(property)) {
             multiPromotionCouponMap[property].code = property;
             widget.couponMultiPromotions.push(multiPromotionCouponMap[property]);
           }
        }
      }
      if(orderCouponsMap) {
        for (var property1 in orderCouponsMap) {
          if (orderCouponsMap.hasOwnProperty(property) && (propertyCouponMap.indexOf(property) < 0)) {
            orderCouponsMap[property].code = property;
            widget.coupons.push(orderCouponsMap[property]);
          }
        }
      }
    }
   },

   populatePaymentData : function () {
    var widget = this;
    var pResult = widget.orderDetailsWrapper.orderDetails();
    //  payment due info when order is in pending payment state.
    var orderState = pResult.hasOwnProperty('stateString') ? pResult.stateString :
     pResult.state;
    if(orderState === CCConstants.ORDER_STATE_PENDING_PAYMENT) {
      var paymentDue = widget.orderDetailsWrapper.orderDetails().priceInfo.total - widget.orderDetailsWrapper.orderDetails().totalAmountAuthorized;
      widget.paymentDue(paymentDue);
    }
    //Payment related initialization starts here
    if(widget.authorizedCreditCards().length) {
      widget.authorizedCreditCards.removeAll();
    }
    if(widget.authorizedGiftCards().length) {
      widget.authorizedGiftCards.removeAll();
    }
    if(widget.authorizedInvoicePayments().length) {
      widget.authorizedInvoicePayments.removeAll();
    }
    if(widget.cashPaymentDetails().length) {
      widget.cashPaymentDetails.removeAll();
    }
    if(widget.authorizedVirtualPayments().length) {
      widget.authorizedVirtualPayments.removeAll();
    }

    if(widget.authorizedStoreCreditPayments().length) {
      widget.authorizedStoreCreditPayments.removeAll();
    }
    var paymentGroups = pResult.paymentGroups ? pResult.paymentGroups: pResult.payments;
    var paymentGroupsLength = paymentGroups.length;
    for (var i=0 ; i < paymentGroupsLength; i++) {
      if(!(paymentGroups[i].paymentState != CCConstants.PAYMENT_STATE_AUTHORIZED
        && paymentGroups[i].paymentState != CCConstants.PAYMENT_STATE_SETTLED
           && paymentGroups[i].paymentState != CCConstants.PAYMENT_STATE_PENDING_AUTHORIZATION
           )){
        if(paymentGroups[i].cardType === CCConstants.GIFT_CARD_PAYMENT_TYPE) {
          widget.authorizedGiftCards.push(paymentGroups[i]);
        } else if(paymentGroups[i].paymentType === CCConstants.LOYALTY_POINTS_PAYMENT_TYPE) {
          widget.authorizedVirtualPayments.push(paymentGroups[i]);
        }  else if(paymentGroups[i].type === CCConstants.INVOICE_PAYMENT_TYPE) {
          widget.authorizedInvoicePayments.push(paymentGroups[i]);
        } else if(paymentGroups[i].type === CCConstants.CASH_PAYMENT_TYPE) {
          widget.cashPaymentDetails.push(paymentGroups[i]);
        } else if(paymentGroups[i].type === CCConstants.STORE_CREDIT_PAYMENT_TYPE) {
          widget.authorizedStoreCreditPayments.push(paymentGroups[i]);
        }
        else {
          widget.authorizedCreditCards.push(paymentGroups[i]);
        }
      } else if(paymentGroups[i].paymentState === CCConstants.PAYMENT_STATE_PAYMENT_DEFERRED
                    && paymentGroups[i].type === CCConstants.INVOICE_PAYMENT_TYPE) {
            widget.authorizedInvoicePayments.push(paymentGroups[i]);
      } else if(paymentGroups[i].paymentState === CCConstants.PAYMENT_STATE_PAYMENT_REQUEST_ACCEPTED
                    && paymentGroups[i].type === CCConstants.CASH_PAYMENT_TYPE) {
        widget.cashPaymentDetails.push(paymentGroups[i]);
      } else if(paymentGroups[i].paymentState === CCConstants.PAYMENT_STATE_INITIAL && orderState !== CCConstants.REMOVED) {
          //For scheduled order and approval order, payment state will be in initial state but need to be show in payment details
        if(widget.verifyApprovalOrderStates(orderState) || pResult.scheduledOrderId) {
          if(paymentGroups[i].type === CCConstants.INVOICE_PAYMENT_TYPE) {
            widget.authorizedInvoicePayments.push(paymentGroups[i]);
          } else if(paymentGroups[i].type === CCConstants.CASH_PAYMENT_TYPE) {
            widget.cashPaymentDetails.push(paymentGroups[i]);
          }
        }
      }
    }
   },

   /**
    * Function to obtain secondary currency using secondary currency code
    *
    * @name getSecondaryCurrency
    * @param pSecondaryCurrencyCode
    * @returns Object
   */
   getSecondaryCurrency : function(pSecondaryCurrencyCode) {
     if(pSecondaryCurrencyCode) {
       var currencyViewModelInstance = CurrencyViewModel.getInstance();
       if(currencyViewModelInstance) {
         var secondaryCurrency = currencyViewModelInstance.currencyMap[pSecondaryCurrencyCode];
         return secondaryCurrency;
       }
     }
   },
   isSubmittedDate : function () {
     return (this.orderDetailsWrapper.orderDetails().hasOwnProperty("submittedDate") && this.orderDetailsWrapper.orderDetails().submittedDate);
   },

   showApprovalDetails: function(pResult) {
    var widget = this;
    if(pResult.approvers && pResult.approvers[0]) {
       widget.orderApproverName(pResult.approvers[0].firstName +" "+pResult.approvers[0].lastName);
     }

     if(pResult.approverMessages && pResult.approverMessages.length != 0) {
       var approverMsg = widget.orderApproverName() ? (widget.orderApproverName() + ": " + pResult.approverMessages) : pResult.approverMessages ;
       widget.approverComments(approverMsg);
     }

     return (widget.orderApproverName() && widget.approverComments() && pResult.stateString != CCConstants.PENDING_APPROVAL_TEMPLATE
     && CCConstants.PENDING_APPROVAL != pResult.stateString && this.orderDetailsWrapper.orderDetails());
   },



   totalItemsLength : function () {
     var self = this;
     var totalNoOfItems = 0;
     if(self.orderDetailsWrapper.orderDetails().id){
     var shippingGroups = self.orderDetailsWrapper.orderDetails().shippingGroups;
     var totalShippingGroups = shippingGroups.length;
     for(var i=0;i<totalShippingGroups;i++){
       var items = shippingGroups[i].items;
       var totalItemsPerGroup = items.length;
       totalNoOfItems += totalItemsPerGroup;
     }
     }
     return totalNoOfItems;
   },

   /**
   * This method formats the site for the given siteId
   * @name - formatSiteText
   * @param  - {string}
   *         pSiteId - The site id that needs to be formatted
   */
  formatSiteText : function(pSiteId) {
    var self = this;
    if(pSiteId){
       var sites = SiteListingViewModel.sites();
       var site = SiteListingViewModel.getSiteDetails(pSiteId, sites);
       var formattedText = SiteListingViewModel.formatSiteText(site);
       return formattedText;
    }
  },

  /**
   * Function to return the locale text for shipping and tax field.
   *
   * @name localeTextForShippingAndTaxTotal
   * @returns String
   */
  localeTextForShippingAndTaxTotal : function() {
    var self = this;
    var displayTextForShipping = self.translate('shippingCostText');
    var displayTextForTax = self.translate('salesTaxText');
    var displayTextForShippingAndTaxTotal = self.translate('shippingAndTaxText', {
        shippingText : displayTextForShipping,
        taxText : displayTextForTax
    });
      return displayTextForShippingAndTaxTotal;
  },

  showStrikeThroughForItemSub : function(pData) {
    return pData.onSale || (pData.discountInfo && pData.discountInfo.length > 0) || pData.isPriceOverridden;
  },

  /**
   * Checks if a state is one of the approval specific order states.
   * @param pStateString
   * @returns Boolean
   */
  verifyApprovalOrderStates : function (pStateString) {
    var self = this;
    var approvalSpecificOrderStates = [CCConstants.PENDING_APPROVAL,CCConstants.PENDING_APPROVAL_TEMPLATE, CCConstants.FAILED_APPROVAL];
    if(approvalSpecificOrderStates.indexOf(pStateString) > -1) {
      return true;
    }
    return false;
  },

  /**
   * Checks whether the payment section needs to be shown in order details page based on the order state and payment method.
   * @param pStateString
   * @returns Boolean
   */
  showPaymentDetails : function () {
    var widget = this;
    var orderState = widget.orderDetailsWrapper.orderDetails().hasOwnProperty('stateString') ?  widget.orderDetailsWrapper.orderDetails().stateString :
     widget.orderDetailsWrapper.orderDetails().state;
    var showPayment = true;
    //Do not show the payment section in approval related order states, for any of the payment methods other than invoice or cash payment
    if(widget.verifyApprovalOrderStates(orderState) && !(widget.authorizedInvoicePayments().length || widget.cashPaymentDetails().length)) {
      showPayment =  false;
    } else {
      widget.populatePaymentData();
    }
    return showPayment;
  },

  /**
   * Checks whether city, stateName and postalCode is present in address or not and
   * returns a concatenated string of these fields
   * @param address
   * @returns String
   */
  getCityStatePostal :function(address) {
    var message='';

    if(!address){
      return message;
    }

    if(address.hasOwnProperty("city") && address.city) {
      message += address.city + ", ";
    }
    if(address.hasOwnProperty("stateName") && address.stateName) {
      message += address.stateName + ", ";
    } else if(address.hasOwnProperty("state") && address.state) {
      message += address.state + ", ";
    }
    if(address.hasOwnProperty("postalCode") && address.postalCode) {
      message += address.postalCode;
    }
    return message;
  },

  /**
   * Checks whether the countryName is present in address or not.
   * Otherwise, returns countryCode
   * @param address
   * @returns String
   */
  getCountryName : function(address) {
    var message='';

    if(!address){
      return message;
    }

    if(address.hasOwnProperty("countryName") && address.countryName) {
      return address.countryName;
    } else if(address.hasOwnProperty("country") && address.country) {
      return address.country;
    }
    return message;
  },

  /**
   * Returns the selected product details to the purchase list element.
   */
  getSelectedProducts:function(){
    var widget = this;
    var productItemArray = [];
    var shippingGroups = widget.orderDetailsWrapper.orderDetails().shippingGroups;
    shippingGroups.forEach(function(shippingGroup){
    shippingGroup.items.forEach(function(lineItem) {
     var key = shippingGroup.shippingGroupId + ":" + (lineItem.commerceItemId ?
       lineItem.commerceItemId : (lineItem.commerceId ? lineItem.commerceId : '' ));
     if(shippingGroup.selectedProduct.indexOf(key) != -1) {
      var productItem = {
        "productId": lineItem.productId,
        "catRefId": lineItem.catRefId,
        "quantityDesired":lineItem.quantity,
        "displayName":lineItem.displayName
      };
      productItemArray.push(productItem);
     }
    });
   });

    return productItemArray;
  },

  isInDialog : function() {
    return $("#CC-prodDetails-addToCart").closest(".modal").length;
  },

  agentCopyOrder: function() {
   var widget = this;
   if (widget.orderDetailsWrapper.orderDetails().profile.isAnonymous) {
     this.destroySpinner(this.orderRefreshIndicator);
     notifier.clearError(widget.WIDGET_ID);
     notifier.clearSuccess(widget.WIDGET_ID);
     notifier.sendError(this.WIDGET_ID, this
       .translate('copyOrderAnonymousUser'), true);
   } else {
     this.createSpinner(this.orderRefreshIndicator, this
       .orderRefreshIndicatorOptions);
     if (widget.orderDetailsWrapper.hasIncompleteOrder()) {
       widget.orderDetailsWrapper.agentCopyOrder(widget.orderDetailsWrapper
         .orderDetails().id, widget.copyOrderSuccess.bind(widget),
         widget.copyOrderFailure.bind(widget));
     } else {
       widget.orderDetailsWrapper.checkForIncompleteOrder(widget
         .orderDetailsWrapper.orderDetails().id,
         widget.checkForIncompleteOrderSuccess.bind(widget),
         widget.checkForIncompleteOrderFailure.bind(widget));
     }
   }
 },

 /**
  * Function to navigate to the checkout page
  */
 copyOrderSuccess : function() {
    var widget = this;
    this.destroySpinner(this.orderRefreshIndicator);
    this.user().navigateToPage(
      this.links().agentCheckout.route);
    return false;
  },

  /**
   * Failure function for copy order call.
   *
   * @name copyOrderFailure
   * @param {Object}
   *          pResult The error response data
   */
  copyOrderFailure : function(pResult) {
  	var self = this;
  	this.destroySpinner(this.orderRefreshIndicator);
    notifier.clearError(self.WIDGET_ID);
    notifier.clearSuccess(self.WIDGET_ID);
    var errorMessage = this
    .translate('copyOrderFailedError');
    if(pResult && pResult.message) {
      errorMessage = errorMessage + ':' + pResult.message;
    }
  	notifier.sendError(this.WIDGET_ID, errorMessage , true);
  },
  
  /**
   * Function checkForIncompleteOrderSuccess
   */
  checkForIncompleteOrderSuccess : function() {
   var widget = this;
   if(widget.orderDetailsWrapper.hasIncompleteOrder()) {
     this.destroySpinner(this.orderRefreshIndicator);
     $('#cc-copyOrder-modal-agent').modal('show');
   } else {
     widget.orderDetailsWrapper.agentCopyOrder(widget.orderDetailsWrapper.orderDetails().id,widget.copyOrderSuccess.bind(widget), 
      widget.copyOrderFailure.bind(widget));
   }
   return false;
 },
 
 /**
  * Failure function for copy order call.
  *
  * @name checkForIncompleteOrderFailure
  * @param {Object}
  *          pResult The error response data
  */
 checkForIncompleteOrderFailure : function(pResult) {
   var self = this;
   this.destroySpinner(this.orderRefreshIndicator);
   notifier.clearError(self.WIDGET_ID);
   notifier.clearSuccess(self.WIDGET_ID);
   var errorMessage = this
   .translate('copyOrderFailedError');
   if(pResult && pResult.message) {
     errorMessage = errorMessage + ':' + pResult.message;
   }
   notifier.sendError(this.WIDGET_ID, errorMessage, true);
  },

  setSelectedOrder: function (data, event) {
    this.selectedOrder(data.order);
  },
  
  showPromotionDetails : function (){
   var self = this;
   var showPromotion = true;
   if(self.orderDetailsWrapper.orderDetails().id) {
    showPromotion = true;
    self.populatePromotionData();
   } else {
     showPromotion = false;
   }
   return showPromotion;
  },

  orderRefresh: function(){
    var self = this;
    this.createSpinner(this.orderRefreshIndicator, this.orderRefreshIndicatorOptions);
    var refreshOrderdata = {};
    refreshOrderdata.isCallFromRefresh = true;
    self.orderDetailsWrapper.isRenderComplete(false);
    self.orderDetailsWrapper.invalidateOrder(refreshOrderdata, self.invalidateOrderSuccess.bind(self), self.invalidateOrderFailure.bind(self) );
  },

  invalidateOrderSuccess : function(pData, pResult) {
    var widget = this;
    widget.reset();
    var scheduledOrderDetails = widget.orderDetailsWrapper.scheduledOrderDetails();
    if(scheduledOrderDetails) {
      var scheduledOrderId =  scheduledOrderDetails.id;
      widget.scheduledOrder().load(scheduledOrderId);	
    } else {
      widget.orderDetailsWrapper.populateOrderDetails({},widget.orderDetailsWrapper.orderDetails().id);
    }
    this.destroySpinner(this.orderRefreshIndicator);
    if(pData.hasOwnProperty('isCallFromRejectQuoteButton') && pData.isCallFromRejectQuoteButton){
      notifier.sendSuccess(widget.WIDGET_ID, widget.translate('rejectQuoteOrderSuccessMessage'));
    }else if(pData.hasOwnProperty('isCallFromReRequestButton') && pData.isCallFromReRequestButton){
      notifier.sendSuccess(widget.WIDGET_ID, widget.translate('reRequestQuoteOrderSuccessMessage'));
    }else{
      notifier.sendSuccess(widget.WIDGET_ID, widget.translate('invalidateOrderSuccessMessage'));
    }
  },

  invalidateOrderFailure: function(pResult){
   var self = this;
   self.destroySpinner(self.orderRefreshIndicator);
   notifier.clearError(self.WIDGET_ID);
   notifier.clearSuccess(self.WIDGET_ID);
   self.orderDetailsWrapper.isRenderComplete(true);
   var message = self.translate('invalidateOrderErrorHeader');
   if(pResult && pResult.message) {
      message = message +' : '+ pResult.message;
   }
   notifier.sendError(self.WIDGET_ID,message, true);
   $('#cc-orderDetails-sendEmailNotification-btn').focus();
  },

  reset : function(data){
    this.coupons([]);
    this.orderDetails(null);
    this.isExchangeOrder(false);
    this.exchangePaymentInfo(null);
    this.couponMultiPromotions([]);
    this.originalOrderId(null);
    this.orderApproverName(null);

    this.authorizedGiftCards([]);
    this.authorizedCreditCards([]);
    //with multi-payment, we can have multiple invoice and cash payments.
    this.authorizedInvoicePayments([]);
    this.cashPaymentDetails([]);
    this.authorizedVirtualPayments([]);
    this.authorizedStoreCreditPayments([]);
    this.paymentDue(null);
    this.orderDetailsWrapper.isPayShippingInSecondaryCurrency(false);
    this.orderDetailsWrapper.isPayTaxInSecondaryCurrency(false);

    this.orderDetailsWrapper.isMultiCurrencyOrder(false);
    this.orderSite(null);
    this.selectedCartItemsOfPurchaseList([]);

    this.cartItemsSelectedArray([]);
    AgentContextManager.getInstance().setProperty(CCConstants.AGENT_PARAM_IS_SCHEDULED_ORDER, false);
    this.orderDetailsWrapper.cacheHandler.addItemToCache(CCConstants.SHOW_SCHEDULED_ORDER,false);
    this.orderDetailsWrapper.hasIncompleteOrder(false);
    this.display(false);
  },


  sendPlacedOrderEmailNotification : function() {
    var self = this;
    var data = {};
    data[CCConstants.OP] = CCConstants.SEND_PLACED_ORDER_EMAIL_NOTIFICATION;
    CCRestClient.request(CCConstants.ENDPOINT_HANDLE_ORDER_ACTIONS, data,
                         // Success Handler.
                         function(pResult) {
                           notifier.sendSuccess(self.WIDGET_ID, self.translate('sentEmailNotificationSuccess'));
                         },
                         // Error Handler.
                         function(pResult) {
                          notifier.clearError(this.WIDGET_ID);
                          notifier.clearSuccess(this.WIDGET_ID);
                          notifier.sendError(this.WIDGET_ID, this.translate('sentEmailNotificationFailure'), true);
                         },self.orderDetailsWrapper.orderDetails().id);
  },

  /**
  * Function to toggle the expanded flag for a configurable child item.
  */
  toggleExpandedFlag : function( data) {
    if (data.expanded()) {
      data.expanded(false);
    } else {
      data.expanded(true);
    }
  },

 /**
        * Register date picker events.
        */
       registerDatepickerEvents: function(){
         var startDateElementId = '#CC-scheduledOrder-startDate';
         var endDateElementId = '#CC-scheduledOrder-endDate';
         var widget = this;
         //blur events of datepicker
//         $(startDateElementId).on('keyup', function(event) {
//           $(startDateElementId).off('blur').on('blur', function(event){
//             var startDate = widget.setDefaultDate(startDateElementId);
//             widget.scheduledOrder().startDate(startDate);
//             $(startDateElementId).off('blur');
//           });
//         });
        $(startDateElementId).on('keyup', function(event) {
                var keyCode = (event.which ? event.which : event.keyCode);
                  if(keyCode === CCConstants.KEY_CODE_ENTER) {
                    $(startDateElementId).datepicker('hide');
                  }
                $(startDateElementId).off('blur').on('blur', function(event){
                  var startDate = widget.setDefaultDate(startDateElementId);
                  widget.scheduledOrder().startDate(startDate);
                  // Regular expression to validate Date format to mm/dd/yyyy
                  var parsedDate = widget.date_regex.test(startDate);
                  if(!parsedDate) {
                    $("#CC-scheduledOrder-startDate-error.text-danger")[0].style="";
                    $("#CC-scheduledOrder-startDate-error.text-danger")[0].innerText = widget.translate('startDateRequired');
                    }
                  $(startDateElementId).off('blur');
                });
              });
//      $(endDateElementId).on('keyup', function(event) {
//           $(endDateElementId).off('blur').on('blur', function(event){
//             var endDate = widget.setDefaultDate(endDateElementId);
//             widget.scheduledOrder().endDate(endDate);
//             $(endDateElementId).off('blur');
//           });
//         });

          $(endDateElementId).on('keyup', function(event) {
                 var keyCode = (event.which ? event.which : event.keyCode);
                   if(keyCode === CCConstants.KEY_CODE_ENTER) {
                     $(startDateElementId).datepicker('hide');
                   }
                 $(endDateElementId).off('blur').on('blur', function(event){
                   var endDate = widget.setDefaultDate(endDateElementId);
                   widget.scheduledOrder().endDate(endDate);
                   // Regular expression to validate Date format to mm/dd/yyyy
                   var parsedDate = widget.date_regex.test(endDate);
                   // EndDate is optional so no error message will be shown if user does not enter anything.
                   if(!parsedDate && endDate) {
                      $("#CC-scheduledOrder-endDate-error.text-danger")[0].style="";
                      $("#CC-scheduledOrder-endDate-error.text-danger")[0].innerText = widget.translate('endDateRequired');
                    } else if(endDate <= widget.scheduledOrder().endDate()){
                      // Error will be shown if endDate contains wrong string or endDate <= startDate
                       $("#CC-scheduledOrder-endDate-error.text-danger")[0].style="";
                       $("#CC-scheduledOrder-endDate-error.text-danger")[0].innerText = widget.translate('endDateGreaterThanStartDateText');
                     }
                    else {
                      $("#CC-scheduledOrder-endDate-error.text-danger")[0].innerText = "";
                    }
                   $(endDateElementId).off('blur');
                 });
               });
       },
       
    onClickChildItems : function (data,popupId) {
    var self = this;

    var productItem = {
      productId : data.productId,
      externalPrice :data.externalPrice,
      quantity : data.quantity
    };
    var pData = {};
    pData[CCConstants.PRICE_LIST_GROUP_ID] = self.site().selectedPriceListGroup().id;
    self.getProductData(pData, productItem, popupId);

  },

       /**
        * Sets dafault date to current date to +1 if input is
        * currentDate/PreviousDates/Invalid.
        *
        * @private
        * @param {String} elementId - The form element id .
        * @return {String} - The date in String representation.
        */
       setDefaultDate: function(elementId){
         var widget = this;
         if(elementId){
           var inputValue = $(elementId).val();
           var inputDate = new Date(inputValue);
           var currentDate = new Date();
           var parsedDate = widget.date_regex.test(inputValue);
           if(!parsedDate) return inputValue;
           if(inputDate <= currentDate){
             currentDate.setDate(currentDate.getDate() + 1);
             inputDate = currentDate;
           }
           if(inputDate != 'Invalid Date') {
             inputDate = ccDate.dateTimeFormatter(inputDate,null,"short");
             $(elementId).datepicker('update', inputDate).datepicker('fill');
           }
           else {
             inputDate = "";
           }
           return inputDate;
         }
       },
       
       /**
        * Determine if the scheduled order is inactive.
        *
        * @private
        * @return {boolean} - true is the scheduled order state is inactive, false otherwise.
        */
       isSuspended: function () {
         return this.scheduledOrder().state() === CCConstants.SCHEDULED_ORDER_STATE_INACTIVE;
       },

       /**
        * Activate/deactivate the scheduled order.
        *
        * @private
        * @param {boolean} suspend - If true set the scheduled order state to inactive, otherwise set to active.
        */
       setSuspended: function (suspend) {
         if (suspend === true) {
           this.scheduledOrder().state(CCConstants.SCHEDULED_ORDER_STATE_INACTIVE);
         }
         else {
           this.scheduledOrder().state(CCConstants.SCHEDULED_ORDER_STATE_ACTIVE);
         }
       },

       /**
        * parse the start date to mm/dd/yyyy format.
        *
        * @function
        * @private
        * @returns {object} - The formatted moment date object.
        */
       getStartDate: function() {
         var startDate=this.scheduledOrder().startDate();
         if(startDate) {
           return ccDate.dateTimeFormatter(startDate,null,"short");
         } else {
           return "";
         }
       },

       /**
        * Set the start date to the model.
        *
        * @function
        * @private
        * @param {String} startDate - The new start date.
        */
       setStartDate: function(startDate) {
         this.scheduledOrder().startDate(startDate);
       },

       /**
        * parse the end date to mm/dd/yyyy format.
        *
        * @function
        * @private
        * @returns {object} - The formatted moment object, if end date is not null.
        */
       getEndDate: function() {
         var endDate = this.scheduledOrder().endDate();
         if (endDate) {
           return ccDate.dateTimeFormatter(endDate, null, "short");
         }
         else {
           return "";
         }
       },

       /**
        * Set the end date to the model.
        *
        * @function
        * @private
        * @param {String} endDate - The new end date.
        */
       setEndDate: function(endDate) {
         this.scheduledOrder().endDate(endDate);
       },

       /**
        * Determine if the daysOfWeek checkbox group should be enabled--daysOfWeek is only editable if the
        * scheduleMode is weekly.
        *
        * @private
        * @returns {boolean} - true if daysOfWeek should be enabled and false otherwise.
        */
       isDaysOfWeekEnabled: function () {
         var scheduleMode = this.scheduledOrder().scheduleMode();
         var isEnabled =
           scheduleMode === CCConstants.SCHEDULE_MODE_WEEKLY;
         return isEnabled;
       },

       // Determine if days of week is enabled
       daysOfWeekEnabled : function () {
         return ko.pureComputed(this.isDaysOfWeekEnabled, this);
       },

       /**
        * Determine if the weeksInMonth checkbox group should be enabled--weeksInMonth is only editable if the
        * scheduleMode is weekly.
        *
        * @private
        * @returns {boolean} - true if weeksInMonth should be enabled and false otherwise.
        */
       isWeeksInMonthEnabled: function () {
         var scheduleMode = this.scheduledOrder().scheduleMode();
         var isEnabled =
           scheduleMode === CCConstants.SCHEDULE_MODE_WEEKLY;
         return isEnabled;
       },

       // Determine if weeks in month is enabled
       weeksInMonthEnabled : function () {
         return ko.pureComputed(this.isWeeksInMonthEnabled, this);
       },

       /**
        * Determine if the weeksInMonth checkbox element should be set as readonly.
        *
        * @private
        * @param {HTMLInputElement} element - The checkbox element that will be tested in this computed property.
        * @returns {boolean} - true if the element should be readonly and false otherwise.
        */
       isWeeksInMonthReadonly: function (element) {
         var scheduledOrder = this.scheduledOrder()
         var scheduleMode = scheduledOrder.scheduleMode();
         var weeksInMonth = scheduledOrder.weeksInMonth();
         var daysOfWeek = scheduledOrder.daysOfWeek();
         var isReadonly =
           scheduleMode === CCConstants.SCHEDULE_MODE_WEEKLY &&
           weeksInMonth.length === 4 &&
           daysOfWeek.length === 7 &&
           !element.checked;

         return isReadonly;
       },

       /**
        * Create a computed property for the given weeksInMonth checkbox element, that will determine if the element
        * should be set as readonly.
        *
        * This is used to ensure that, when in weekly mode it is not possible to check/select all five weeks in month.
        * The reason being, that selecting all five weeks in month automatically changes the schedule mode to once a day,
        * and automatic mode change may be a disorienting user experience.
        *
        * @param {HTMLInputElement} element - The checkbox element that will be tested in this computed property.
        * @returns {ko.pureComputed<boolean>} - A computed property that is true if the element should be readonly and
        *    false otherwise.
        */
       weeksInMonthReadonly: function (element) {
         // Currently this feature is disabled. May useful in future.
         // To re-enable, uncomment below line and remove statement "return false;'
         // return ko.pureComputed(this.isWeeksInMonthReadonly.bind(this, element));

         return false;
       },

       /**
        * close the Scheduled Order if the page is not marked as dirty.
        */
       closeScheduledOrder: function () {
         var widget = this;
         if(this.scheduledOrder().dirtyFlag.isDirty()){
           // create new 'shown' event handler
           $('#cc-cancel-scheduleOrder-ModalContainer').one('show.bs.modal', function () {
             $('#cc-cancel-scheduleOrder-ModalPane').show();
           });

           // create new 'hidden' event handler
           $('#cc-cancel-scheduleOrder-ModalContainer').one('hide.bs.modal', function () {
             $('#cc-cancel-scheduleOrder-ModalPane').hide();
           });

           // open modal
           $('#cc-cancel-scheduleOrder-ModalContainer').modal('show');
         }
         else {
           widget.browserBack();
         }
       },
       /**
        * Go to the browser back
        */
       browserBack: function() {
         var widget = this;
         if(widget.isBackLinkAvailable()) {
           window.history.go(-1);
         } else {
           if(widget.isAgentApplication) {
             widget.user().navigateToPage(this.links().agentScheduledOrder.route); 
           } else {
             navigation.goTo(widget.links().profile.route);
           }
         }
       },
       
       /**
        * Redirect to Order Details page with selected Order ID
        */
       clickOrderDetails: function (pOrderId) {
           var widget = this;
           widget.user().navigateToPage(this.links().AgentOrderDetails.route+"/"+pOrderId);
           return false;
         },

         /**
          *  View the Return Request Details
          */
         showReturnRequest : function(pReturnRequestId, pOrderId) {
             var widget = this;
             widget.user().navigateToPage(this.links().agentViewReturnRequest.route+'?returnRequestId='+
               pReturnRequestId+'&orderId='+ pOrderId);
         },

         /**
     * Save the changes to the Scheduled Order.
     */
    saveScheduledOrder: function () {
      if (this.validationModel.isValid()) {
        this.createSpinner(this.scheduledOrderIndicator, this.scheduledOrderIndicatorOptions);
        this.scheduledOrder().save(this.saveScheduledOrderSuccess, this.saveScheduledOrderError);
      }
      else {
        this.validationModel.errors.showAllMessages();
        notifier.clearError(this.WIDGET_ID);
        notifier.clearSuccess(this.WIDGET_ID);
        notifier.sendError(this.WIDGET_ID, this.translate('validationModalErrorMessage'), true);
      }
    },

    /**
     * Called when saveScheduledOrder was successful:
     *    Display notification and redirect.
     *
     * @private
     * @param {Object} result - The new Scheduled Order state.
     */
    saveScheduledOrderSuccess: function () {
      this.destroySpinner(this.scheduledOrderIndicator);
      notifier.sendSuccess(this.WIDGET_ID,this.translate('saveScheduledOrderSuccessMessage'), true);
      if(this.isAgentApplication) {
        this.redirectToScheduleOrderPage(this.links().agentScheduledOrder.route);
      }
    },

    /**
     * Called when saveScheduledOrder failed:
     *    Display notification.
     *
     * @private
     * @param {Object} result - The error state.
     */
    saveScheduledOrderError: function (result) {
      notifier.sendError(this.WIDGET_ID, this.translate('saveScheduledOrderErrorMessage', {result: result}), true);
      this.destroySpinner(this.scheduledOrderIndicator);
    },

    /**
     * Delete the current Scheduled Order.
     *
     * @param {ScheduleOrderViewModel} scheduledOrder - The current Schedule Order view model instance.
     */
    deleteScheduledOrder: function (scheduledOrder) {
      this.closeModalById('#cc-scheduleOrder-Modal');
      this.createSpinner(this.scheduledOrderIndicator, this.scheduledOrderIndicatorOptions);
      this.scheduledOrder().remove(this.deleteScheduledOrderSuccess, this.deleteScheduledOrderError);
    },

    /**
     * Called when deleteScheduledOrder was successful:
     *    Display notification and redirect.
     *
     * @private
     */
    deleteScheduledOrderSuccess: function () {
      notifier.clearError(this.WIDGET_ID);
      notifier.clearSuccess(this.WIDGET_ID);
      notifier.sendSuccessToPage(
        this.WIDGET_ID,
        this.translate('deleteScheduledOrderSuccessMessage'),
        true,
        null,
        true
      );
      this.destroySpinner(this.scheduledOrderIndicator);
      this.redirectToScheduleOrderPage(this.links().agentScheduledOrder.route);
    },
    

    redirectToScheduleOrderPage : function(uri) {
      var params = {};
      this.user().navigateToPage(uri+"?customerId="+AgentContextManager.getInstance().getShopperProfileId());
    },

    /**
     * Called when deleteScheduledOrder failed:
     *    Display notification.
     *
     * @private
     * @param {Object} result - The error state.
     */
    deleteScheduledOrderError: function (result) {
      notifier.clearError(this.WIDGET_ID);
      notifier.clearSuccess(this.WIDGET_ID);
      notifier.sendError(this.WIDGET_ID, this.translate('deleteScheduledOrderErrorMessage', {result: result}), true);
      this.destroySpinner(this.scheduledOrderIndicator);
    },

    mergeToCart: function (data, event) {
     var widget = this;
     if(data.order){
       widget.selectedOrder(data.order);
     } else if(data.scheduledOrder().templateOrder().order){
        widget.selectedOrder(data.scheduledOrder().templateOrder().order);
     } else if(data.scheduledOrder().templateOrder().shoppingCart) {
        widget.selectedOrder(data.scheduledOrder().templateOrder().shoppingCart);
     } else if(widget.orderDetailsWrapper.scheduledOrderDetails()) {
        widget.selectedOrder(widget.orderDetailsWrapper.scheduledOrderDetails().templateOrder.shoppingCart);
     }
     widget.cart().mergeCart(true);
     var success = function(){
      if(widget.isAgentApplication) {
       widget.copyOrderSuccess();
      } else {
       
       widget.user().validateAndRedirectPage("/cart");
      }
     };
     var error = function(errorBlock){
       var errMessages = "";
       var displayName;
       for(var k=0;k<errorBlock.length;k++){
         errMessages = errMessages + "\r\n" + errorBlock[k].errorMessage;
       }
       notifier.sendError("CartViewModel", errMessages, true);
     };
     widget.cart().addItemsToCart(widget.selectedOrder().items, success, error);
   },
  getProductData : function(data,productItem, popupId){
    var self = this;
    data[CCConstants.SHOW_INACTIVE_SKU] = false;
    CCRestClient.request(CCConstants.ENDPOINT_PRODUCTS_GET_PRODUCT, data,
              // success callback
              function(pData) {
                if(!pData || !pData.childSKUs) {
                  notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.searchAndAddItemsToCart:resources.productDetailsErrorText'), true);
                  return;
                }
                pData.selectedPriceListGroupId = self.site().selectedPriceListGroup().id;
                self.showPopup(pData,productItem, popupId);
              },
              // error callback
              function(pData) {
                spinner.destroy();
                notifier.sendError(widget.WIDGET_ID, CCi18n.t('ns.searchAndAddItemsToCart:resources.productDetailsErrorText'), true);
              },
              productItem.productId);
  },


  showPopup: function(pData,productItem, popupId) {
    var widget = this;
    if(popupId) {
      var popup = $(popupId);
      var popUpRegionContext = ko.dataFor(popup[0]);
      var productDetailsWidget = popUpRegionContext.widgets()[0];
      widget.createProductDetailstWidget(productDetailsWidget,productItem,popupId,pData);
    }
  },

  getSKUDetailsFailure : function(data){
    console.log("get sku failure");
  },

  createProductDetailstWidget : function(productDetailsWidget,productItem, popupId, pProduct){
    var widget = this;
    var param = {
      externalPrice : productItem.externalPrice,
      quantity : productItem.quantity
    };
    var popup = $(popupId);
    ProductDetailsUtils.setProductDetailsWidgetData(productDetailsWidget, pProduct, null, param);
    productDetailsWidget.isExchangeRequest(true);
    popup.modal('show');
  },
  
  formatOrderOutcome : function(context) {
   if(context.orderId){
     return CCi18n.t('ns.common:resources.successText');
   }
   return CCi18n.t('ns.common:resources.failureText');
 },

  setShippingGroupForTracking: function(pShippingGroupIndex) {
   var widget = this;
   widget.selectedShippingGroupForTracking(pShippingGroupIndex);
 },
 
 /**
  * This method is used to populate the address pop up with the address
  * obtained in the return request response.
  *
  */
 showAddressDetails : function(pAddressData) {
  var widget = this;
  var address = new Address('return-from-address', null, countryRegionData.translateHelper,
      countryRegionData.shippingCountryData(), countryRegionData.defaultShippingCountry());
  address.countriesList(countryRegionData.shippingCountryData());
  address.copyFrom(pAddressData, countryRegionData.shippingCountryData());
  widget.modalObject(address);
  widget.opDynamicProperty("view");
  widget.populateDynamicPropertiesMetaData(address);
 },
 
 /**
  * This method populate the empty fields with N/A text
  */
 checkForEmptyString : function(pData) {
   var widget = this;
   if(pData()){
     return widget.translate('notApplicableText');
   }else
     return pData;
 },


 /**
  * This method is used to populate the dynamic properties of the shipping address of each item
  *
  */
 populateDynamicPropertiesMetaData : function(pAddress) {
     var widget = this;

     widget.orderDetailsWrapper.getAddressDynamicPropertiesMetaData(widget.getAddressDynamicPropertiesMetaDataSuccessCallback.bind(widget),
         widget.getAddressDynamicPropertiesMetaDataFailureCallback.bind(widget));
     $.when(widget.dynamicPropertiesLoaded).done(
             function() {
               if (widget.dynamicPropertyMetaInfo
                   && widget.dynamicPropertyMetaInfo.dynamicPropertyMetaCache
                   && widget.dynamicPropertyMetaInfo.dynamicPropertyMetaCache.contactInfo) {
                 widget
                     .initializeDynamicProperties(widget.dynamicPropertyMetaInfo.dynamicPropertyMetaCache.contactInfo, pAddress);
               }
             }
     );

   },

   initializeDynamicProperties : function(pData, pAddress) {
    var widget = this;
    var nonEmptyDynamicProps = [];
    for (var nonEmptyCounter = 0, counter = 0; counter < pData.length; counter++) {
       if(pData[counter].uiEditorType() === "checkbox"){
            nonEmptyDynamicProps[nonEmptyCounter] = pData[counter];
            nonEmptyDynamicProps[nonEmptyCounter].value(pAddress[pData[counter].id()]());
            nonEmptyCounter++;
       } else{
          if(pAddress[pData[counter].id()]()){
           if (pData[counter].uiEditorType() === CCConstants.DISPLAY_FORMAT_TYPE_DATE_OJET ||
             pData[counter].uiEditorType()  === CCConstants.DISPLAY_FORMAT_TYPE_DATE){
            nonEmptyDynamicProps[nonEmptyCounter] = pData[counter];
            nonEmptyDynamicProps[nonEmptyCounter].value(ccDate.formatDateAndTime(pAddress[pData[counter].id()](), ccDate.DEFAULT_DATE_FORMAT, CCConstants.OJET_INPUT_SHORT_DATE_FORMAT, null));
          } else {
            nonEmptyDynamicProps[nonEmptyCounter] = pData[counter];
            nonEmptyDynamicProps[nonEmptyCounter].value(pAddress[pData[counter].id()]());
          }
           nonEmptyCounter++;
          }
       }
   }

    widget.dynamicProperties(nonEmptyDynamicProps);
    $('#cc-showAddressDetailsModal').modal('show');
},

  getLocaleTextForOriginOfOrder : function(pOriginOfOrder) {
    var widget = this;
    switch (pOriginOfOrder) {
    case CCConstants.ORIGIN_PUNCHOUT:
      return widget.translate('punchoutText');
    case CCConstants.ORIGIN_PURCHASE_ORDER:
      return widget.translate('purchaseOrderText');
    }
    return "";
  },
  /**
   * Success callback on adding item to the purchase list.
   */
  handleAddProductToPurchaseListSuccess: function(pData){
    var widget = this;
    notifier.sendMessage(widget.WIDGET_ID, widget.translate('purchaseListAddSuccessMessage'), "success", true, true);  
  },

  /**
  * Function to return the primary and secondary currency payment together in case of pending payments(in muticurrency orders)
  *
  * @name convertToPaymentDueInMixCurrencyFormat
  * @param pData
  * @returns String
  */
 convertToPaymentDueInMixCurrencyFormat : function(pData) {
   var self = this;
   var paymentDueString = "";
   var pPrimaryCurrencySymbol=self.currencySymbol;
   if(pData.priceInfo.primaryCurrencyTotal >= 0 && pData.priceInfo.secondaryCurrencyTotal >= 0){
     var primaryCurrencyTotal=pData.priceInfo.primaryCurrencyTotal;
     var secondaryCurrencyTotal=pData.priceInfo.secondaryCurrencyTotal;
     if(pData.hasOwnProperty(CCConstants.TOTAL_AMOUNT_AUTHORIZED_MAP)) {
       var primaryCurrencyTotalAmountAuthorized =  pData.totalAmountAuthorizedMap[pData.priceInfo.currencyCode];
       var secondaryCurrencyTotalAmountAuthorized =  pData.totalAmountAuthorizedMap[pData.secondaryCurrencyCode];
       if(!primaryCurrencyTotalAmountAuthorized) {
         primaryCurrencyTotalAmountAuthorized = 0;
       }
       if(primaryCurrencyTotalAmountAuthorized >= 0 && primaryCurrencyTotal >= primaryCurrencyTotalAmountAuthorized) {
         var pPrimaryCurrencyAmount = primaryCurrencyTotal - primaryCurrencyTotalAmountAuthorized;
         pPrimaryCurrencyAmount=pPrimaryCurrencyAmount.toFixed(pData.priceListGroup.currency.fractionalDigits)
       }
       if(!secondaryCurrencyTotalAmountAuthorized) {
         secondaryCurrencyTotalAmountAuthorized = 0;
       }
       if(secondaryCurrencyTotalAmountAuthorized >= 0 && secondaryCurrencyTotal >= secondaryCurrencyTotalAmountAuthorized) {
         var pSecondaryCurrencyAmount = secondaryCurrencyTotal - secondaryCurrencyTotalAmountAuthorized;
       }
       if(pPrimaryCurrencyAmount > 0) {
         paymentDueString += CCi18n.t('ns.common:resources.symbolAndAmountText', {
             currencySymbol : pPrimaryCurrencySymbol + " ",
             amount : pPrimaryCurrencyAmount
         });
       }
       if(pPrimaryCurrencyAmount > 0 && pSecondaryCurrencyAmount > 0)
         paymentDueString += "+";
       if(pSecondaryCurrencyAmount > 0) {
         paymentDueString += CCi18n.t('ns.common:resources.symbolAndAmountText', {
             currencySymbol : self.getSecondaryCurrency(pData.secondaryCurrencyCode).symbol,
             amount : pSecondaryCurrencyAmount
         });
       }
       return paymentDueString;
     }
   }
 }
 }
});
