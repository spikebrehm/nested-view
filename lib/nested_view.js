_ = this._ != null ? this._ : require('underscore');
Backbone = this.Backbone != null ? this.Backbone : require('backbone');
Handlebars = this.Handlebars != null ? this.Handlebars : require('handlebars');

(function(global, _, Backbone){

  var server = global.window == null,
      noop = function(){};


  var NestedView = Backbone.View.extend({
    // Key for the template
    name: null,

    childViews: {},

    // Get data for template.  This also acts as a view-model.
    // Try to return proper data if model or collection is available.
    getTemplateData: function(){
      var data;
      if (this.model) {
        data = this.model.toJSON();
      } else if (this.collection) {
        data = {collection: this.collection.toJSON()};
      } else {
        data = _.clone(this.options);
      }
      return data;
    },

    decorateTemplateData: function(data) {
      data = _.clone(data);
      data._view = this;
      if (this.model) data._model = this.model;
      if (this.collection) data._collection = this.collection;
      return data;
    },

    // Get template function.
    // Override this in a base class and/or per-view.
    getTemplate: function(){
      JST[this.name];
    },

    // Get HTML attributes to add to el.
    getAttributes: function(){
      var attributes = {},
          key, value;

      if (this.id) attributes.id = this.id;
      if (this.className) attributes['class'] = this.className;

      // Add `data-view` attribute with view key.
      // For now, view key is same as template.
      attributes['data-view'] = this.name;

      return attributes;
    },

    // Turn template into HTML
    getHtml: function(options){
      var data, template, html, attributes, attrString;

      options = options || {};
      _.defaults(options, {
        outerHtml: true
      });

      data = this.getTemplateData();
      data = this.decorateTemplateData(data);
      template = this.getTemplate();
      if (template == null) {
        throw new Error('Template for "' + this.name + '" not found.');
      }

      html = template(data);

      if (options.outerHtml) {
        attributes = this.getAttributes();
        attrString = _.reduce(attributes, function(memo, value, key){
          return memo + [' ', key, '="', value, '"'].join('');
        }, '');
        html = ['<', this.tagName, attrString, '>', html, '</', this.tagName, '>'].join('');
      }

      return html;
    },

    render: function(){
      var html = this.getHtml({outerHtml: false});
      this.$el.html(html);
      this.$el.attr('data-view', this.name);
      this.attachChildViews();
      this.postRender()
      return this;
    },

    // Anything to do after rendering on the client.
    // Noop, to be overridden by subclasses.
    postRender: noop,

    // Gets called after rendering. We have an object containing
    // child views, but they're not attached to the DOM elements yet.
    //
    // TODO this breaks down if more than one of the same child view type
    // exists. Assign unique IDs.
    attachChildViews: function(){
      var _this = this, el;
      _.each(this.childViews, function(childView, viewName){
        el = _this.$('[data-view="'+viewName+'"]')[0];
        childView.setElement(el);
      });
    },

    registerChildView: function(childView){
      this.childViews[childView.name] = childView;
    }
  });

  // Create noops for methods that touch DOM if running on server.
  if (server) {
    NestedView.prototype._ensureElement = noop;
    NestedView.prototype.delegateEvents = noop;
  }

  // Class methods.
  // ==============

  // Get the a view class based on its name.
  // You may want to override this based on your setup:
  // CommonJS vs require vs globals.
  NestedView.getView = function(name){
    return require('./' + name);
  };

  // Handlebars helper
  // =================

  NestedView.viewHelper = function(context, options) {
    var viewName = context,
        viewOptions = options.hash || {},
        View, view, parentView, html;

    // Allow passing in context with special 'context' key.
    if (viewOptions.context) {
      viewOptions = viewOptions.context;
    }

    View = NestedView.getView(viewName);
    view = new View(viewOptions);

    parentView = this._view;
    if (parentView) {
      parentView.registerChildView(view);
    }

    html = view.getHtml();
    return new Handlebars.SafeString(html);
  };

  NestedView.registerHandlebars = function(Handlebars) {
    Handlebars.registerHelper('view', NestedView.viewHelper);
  }


  // Export for browser or CommonJS.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NestedView;
  } else {
    global.NestedView = NestedView;
  }

})(this, _, Backbone);
