define(
// -------------------------------------------------------------------
// DEPENDENCIES
// -------------------------------------------------------------------
[ 'jquery', 'ccRestClient', 'knockout', 'CCi18n', 'ccConstants', 'notifier', 'pubsub', 'bstypeahead'],

// -------------------------------------------------------------------
// MODULE DEFINITION
// -------------------------------------------------------------------
function($, CCRestClient, ko, CCi18n, CCConstants, notifier, pubsub) {
  "use strict";

  return {
    elementName : 'ultrasource-product-search-v1',
    productSearchValue : ko.observable(),
    showAddByButton: ko.observable(false),
    showProductSearchInputBox: ko.observable(true),
    showRemoveTextboxButton: ko.observable(false),
    catalogId: "",
    typeAheadMinimumNumberOfCharacters : ko.observable("3"),
    MAX_RESULTS : 100,
    NO_MATCHES_FOUND: "No matches found",

    /**
     * Element on load.
     * @param {object} widget
     */
    onLoad : function(widget) {
      var self = this;
      self.resetValues();
      if(typeof widget.productSearchSuccessCallback === "function") {
        self.widgetSuccessCallback = widget.productSearchSuccessCallback.bind(widget);
      }
      if(typeof widget.productSearchFailureCallback === "function") {
        self.widgetFailureCallback = widget.productSearchFailureCallback.bind(widget);
      }
      if(widget.showAddByButton && widget.showAddByButton()) {
        self.showAddByButton(true);
        self.showProductSearchInputBox(false);
        self.showRemoveTextboxButton(true);  
        $.Topic(pubsub.topicNames.CART_ADD_SUCCESS).subscribe(self.handlePostAddItem.bind(self, widget));
      }
      if(widget.cart().currentOrderState() == 'PENDING_PAYMENT'
        || widget.cart().currentOrderState() == 'PENDING_PAYMENT_TEMPLATE') {
        self.hideAddByProductButton();
        }
      if(widget.typeAheadMinimumNumberOfCharacters && widget.typeAheadMinimumNumberOfCharacters()) {
        self.typeAheadMinimumNumberOfCharacters(widget.typeAheadMinimumNumberOfCharacters());
      }
      self.catalogId = widget.user().catalogId();
    },

    /**
     * Resets the search value
     */
    resetSearch : function() {
      var self = this;
      this.productSearchValue(null);
    },
    
    /**
     * Resets all the values to the default value.
     */
    resetValues: function() {
      var self = this;
      self.productSearchValue("");
      self.showAddByButton(false);
      self.showProductSearchInputBox(true);
      self.showRemoveTextboxButton(false);
      self.catalogId = "";
    },

    /**
     * Bind the search box with bootstrap typeahead
     * @param {String} id of the search box
     * @param {object} widget.
     * @param {string} popupId
     */
    initializer : function(selectorId, widget, popupId) {
      var element = this['elements']['ultrasource-product-search-v1'];
      // PopupId is required where this element is used in a widget
      // that renders a popup on product selection.
      if(popupId) {
        widget.popupId = popupId;
      }
      var selector = ".productSearchBox";
      $(selector).typeahead({
        source : element.typeaheadSource,
        minLength : element.typeAheadMinimumNumberOfCharacters(),
        autoSelect : true,
        items : element.MAX_RESULTS,
        matcher : element.typeaheadMatch,
        sorter : element.typeaheadSort,
        highlighter : element.typeaheadHighlight,
        data: {'element' : element, 'widget' : widget},
        render : element.typeaheadRender, // Non-standard option!
        select : element.typeaheadSelect, // Non-standard option!
        menu : "<ul class='typeahead dropdown-menu' aria-live='polite'></ul>",
        item : "<li class='typeaheadProduct'><a href='#'> \
              \
              <span class = 'typeaheadProductName' style='word-wrap:normal; width:100%;'> </span> \ </a></li>"
      });
    },

    /**
     * Typeahead source.
     * @param query.
     * @param process.
     */
    typeaheadSource: function(query, process) {
      this.render = this.options.render || this.render;
      this.$menu.css('margin-left', 0);
      this.$menu.css('width', '100%');
      var element = this.options.data.element;
      var widget = this.options.data.widget;
      var delayedSearch = function() {
        // save reference to 'process' callback as its 
        // needed in the result method
        element.callback = process;
        // Setup the delayed search request
        if (this.timer) {
          clearTimeout(this.timer);
        }
          
        var data = {
          name: this.query.replace(/\*/g, '%'),
          fields: "id,displayName",
          showInactiveProducts: false
        };
        data[CCConstants.CATALOG] = widget.user().catalogId();
        // Triggering the rest call from the element instead of search
        // view model as we are not saving the product data from the result to
        // be made available to other components.
        CCRestClient.request(CCConstants.ENDPOINT_PRODUCTS_LIST_PRODUCTS, data,
          // success call back
          function(pResult) {
            if(!pResult) {
              pResult = [];
              // component will not render the dropdown unless there is at least
              // one entry in the source array, so to display a 'no matches found'
              // message, a fake entry must be created.
              pResult.push({
                id: element.NO_MATCHES_FOUND,
                name: ''
              });
            }
           this.callback(pResult);
          }.bind(element),
            
          // failure callback
          function(pError) {
            if(pError && pError.message) {
              notifier.sendError(element.elementName, pError.message, true);
              if(typeof element.widgetFailureCallback === "function") {
                element.widgetFailureCallback(pError);
              }
            }
          }.bind(element)
        );
      }.bind(this);
      this.timer = setTimeout(delayedSearch, 300);
    },

    /**
     * Typeahead Renderer for rendering the menu.
     * @param {Array} result items.
     */
    typeaheadRender : function(items) {
      var self = this;
      var element = self.options.data.element;
      if ((items.length === 1) && (items[0].id === element.NO_MATCHES_FOUND)) {
        var noMatchesFound = CCi18n.t('ns.common:resources.noMatchesFound');
        this.$menu.html($("<li class='typeaheadTop' disabled>").text(noMatchesFound));
        return this;
      }

      items = $(items).map(function(i, item) {
        var option = $(self.options.item).attr('data-value', item.displayName);
        option.find('a').attr('title', item.displayName);
        option.find('a').attr('id', item.id);
        option.find('.typeaheadProductName').html(item.displayName);
        return option[0];
      });

      items.first().addClass('active');
      this.$menu.html(items);
      return this;
    },

    // typeaheadMatch
    typeaheadMatch : function(item) {
      // Matching handled server-side.
      return true;
    },

    /**
     * @override Overriding the function to prevent error because the search result we are expecting is not the same as bootstrap typeahead result
     */
    typeaheadSort : function(items) {
      // Sorting handled server-side.
      return items;
    },

    /**
     * @override Overriding the function to prevent error because the search result we are expecting is not the same as bootstrap typeahead result
     */
    typeaheadHighlight : function(item) {
      return item;
    },

    /**
     * On typeahead Selection.
     */
    typeaheadSelect : function() {
      var activeItem = this.$menu.find('.active');
      var title = activeItem.children('a').attr('title');
      var itemId = activeItem.children('a').attr('id');
      var element = this.options.data.element;
      element.productSearchValue(title);
      if(typeof element.widgetSuccessCallback === "function") {
        element.widgetSuccessCallback(itemId);
      }
      return this.hide();
    },

    /**
     * Show the product search input box.
     */
    enableProductSearchInputBox: function() {
      var self = this;
      self.showProductSearchInputBox(true);
      self.resetSearch();
      $("#product-search-box").focus();
    },

     /**
       * Handle post add item
       */
    handlePostAddItem : function (widget) {
      var self = this;
      // Update stock status validations.
      widget.cart().getCartAvailability();
      self.hideProductSearchInputBox();
    },
    /**
     * Hide the product search input box.
     */
    hideProductSearchInputBox: function() {
      var self = this;
      self.showProductSearchInputBox(false);
    },
    hideAddByProductButton: function(){
      var self = this;
      self.showProductSearchInputBox(false);
      self.showAddByButton(false);
    }

  };
});
