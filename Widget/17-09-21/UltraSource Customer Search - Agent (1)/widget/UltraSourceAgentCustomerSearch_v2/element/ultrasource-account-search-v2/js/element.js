define(
// -------------------------------------------------------------------
// DEPENDENCIES
// -------------------------------------------------------------------
[ 'storeKoExtensions', 'ccRestClient', 'notifications', 'knockout', 'CCi18n', 'ojs/ojcore', 'pubsub', 'agentViewModels/agentUtils/agent-utils', 'ojs/ojknockout', 'ojs/ojselectcombobox', 'bstypeahead' ],

// -------------------------------------------------------------------
// MODULE DEFINITION
// -------------------------------------------------------------------
function(storeKoExtensions, ccRestClient, notifications, ko, CCi18n, oj, pubsub, agentUtils) {
  "use strict";
  var self = undefined;
  var accountSearchValueSubscription;
  return {
    elementName : 'ultrasource-account-search-v2',
    accountSearchValue : ko.observable(),
    MIN_CHARACTERS : 3,
    MAX_RESULTS : 100,

    onLoad : function(widget) {
      $.Topic(pubsub.topicNames.SEARCH_RESET).subscribe(this.resetSearch.bind(this));
      
      var self = this;
      self.widget = widget;

      //dispose the subscription for accountSearchValue
      if (accountSearchValueSubscription != undefined) {
        accountSearchValueSubscription.dispose();
      }
      accountSearchValueSubscription = self.accountSearchValue.subscribe(function() {
        self.handleAccountSearchValueUpdate();
      });
      self.accountSearchValue('');
      self.handleAccountSearchValueUpdate(true);
    },

    /**
     * Triggered when account search value is changed.
     */
    handleAccountSearchValueUpdate : function(pInitialLoad) {
      if (typeof this.widget.handleAccountSearchValueUpdate === "function"){
        this.widget.handleAccountSearchValueUpdate(this.accountSearchValue(), pInitialLoad);
      }
    },

    resetSearch : function(data) {
      var self = this;
      this.accountSearchValue(null);
    },

    /**
     * Bind the search box with bootstrap typeahead
     * @param {selectorId} id of the search box
     */
    initializer : function(selectorId, popUpId) {
      var element = this['elements']['ultrasource-account-search-v2'];
      self = element;
      var selector = "#" + selectorId;
      $(selector).typeahead({
        source : element.typeaheadSource,
        minLength : element.MIN_CHARACTERS,
        autoSelect : true,
        items : element.MAX_RESULTS,
        matcher : element.typeaheadMatch,
        sorter : element.typeaheadSort,
        highlighter : element.typeaheadHighlight,
        render : element.typeaheadRender, // Non-standard option!
        select : element.typeaheadSelect, // Non-standard option!
        menu : "<ul class='typeahead dropdown-menu' aria-live='polite'></ul>",
        item : "<li><a href='#'> \
              \
              <span class = 'typeaheadAccountName'> </span> \ <span class = 'typeaheadProductPrice'> </span> \ </a></li>"
      });
    },

    typeaheadSource : function(text, process, element) {
      this.render = this.options.render || this.render;
      this.$menu.css('margin-left', 0);
      this.$menu.css('width', '100%');
      var delayedSearch = function() {
        // save reference to 'process' callback as its
        // needed in the result method
        self.callback = process;
        // Setup the delayed search request
        if (this.timer) {
          clearTimeout(this.timer);
          // log.info("Typeahead Timer Reset");
        }

        text = text.replace(/\\/g, "\\\\");
        text = text.replace(/"/g, "\\\"");
        var organizationData = {
          limit : 10,
          offset : 0,
          q : '( name co \"' + text + '\" )'
        };

        return new Promise(function(fulfill, reject) {
          ccRestClient.request("listOrganizations", organizationData, self.listOrganizationSuccess.bind(self), self.listOrganizationFailure.bind(self));
        });

      }.bind(this);

      this.timer = setTimeout(delayedSearch, 300);
    },
    // typeaheadRender
    typeaheadRender : function(items) {
      var self = this;
      if ((items.length === 1) && (items[0].id === "NO MATCHES FOUND")) {
        // var noMatchesFound = CCi18n.t('ns.common:resources.' + 'noMatchesFound');
        var noMatchesFound = "No matches found";
        this.$menu.html($("<li class='typeaheadTop' disabled>").text(noMatchesFound));
        return this;
      }

      items = $(items).map(function(i, item) {
        i = $(self.options.item).attr('data-value', item.name);
        i.find('a').attr('title', item.name);
        i.find('a').attr('id', item.id);
        i.find('.typeaheadAccountName').html(item.name);
        return i[0];
      });

      items.first().addClass('firstResult');
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

    typeaheadSelect : function(pData) {
      var activeItem = this.$menu.find('.active');
      var orgName = activeItem.children('a').attr('title');
      self.accountSearchValue(orgName);
      return this.hide();
    },

    /**
     * listOrganizationSuccess function gets invoked when the list Organizations Endpoint call is successful.
     */

    listOrganizationSuccess : function(pResult) {
      if (!pResult.items.length) {
        //pResult = [];

        // component will not render the dropdown unless there is at least
        // one entry in the source array, so to display a 'no matches found'
        // message, a fake entry must be created.
        pResult.items.push({
          id : "NO MATCHES FOUND",
          name : '',
          price : '',
          thumb : '',
          link : ''
        });
      }
      self.callback(pResult.items);
    },

    // failure callback
    /**
     * listOrganizationFailure function gets invoked when the list Organizations Endpoint call is fails.
     */
    listOrganizationFailure : function(error) {
      var self = this;
      var headerText = CCi18n.t('ns.common:resources.accountSearchFailureText');
      var message = error.errorCode === "100070" ? CCi18n.t('ns.common:resources.accountSearchErrorMessage') : error.message
      var errorCode = error.errorCode;
      agentUtils.notifyErrorMessage(headerText, message, errorCode);
    }

  };
});
