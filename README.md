# NestedView

Declarative nested Backbone/Handlebars views.  Render nested view hierarchies in both the browser and in Node.js.

## Usage

In your Handlebars templates, use the `{{view}}` helper to declare nested child views.

### Example

#### `index_view.hbs`

    <h1>Hello, {{user.name}}.</h1>
    {{view "user_detail_view" context=user}}

#### `user_detail_view.hbs`

     <li>Name: {{name}}</li>
     <li>Email: {{email}}</li>

#### `index_view.js`

    var IndexView = NestedView.extend({
      name: 'index_view'
    });

#### `user_detail_view.js`

    var UserDetailView = NestedView.extend({
      name: 'user_detail_view',
      tagName: 'ul'
    });

#### `application.js`

	var data = {user: {name: 'Spike', email: 'spike@example.info'}};
    var indexView = new IndexView(data);
    
    // On the server, grab the view hierarchy's HTML using NestedView::getHtml().
    console.log(indexView.getHtml());
    
    // In the client, just call render.
    console.log(indexView.render().el);
    
Output:
    
    <div data-view="index_view" data-cid="view1">
	  <h1>Hello, Spike.</h1>
	  <ul data-view="user_detail_view" data-cid="view2">
	    <li>Name: Spike</li>
	    <li>Email: spike@example.info</li>
	  </ul>
    </div>
    
### Accessing child views

`NestedView` helps you construct modular, DRY view components. An important element in this design is to not allow child views to know anything about the world around them, including their parent. Instead, parent views have a reference to each child view, and child views communicate with the world around them by emitting and listening to events.

Here's an example of how to bind to an event on a child view.

#### `user_detail_view.js`

    var UserDetailView = NestedView.extend({
      name: 'user_detail_view',
      tagName: 'ul',
      events: {
        'click li': 'selectRow'
      },
      selectRow: function(e) {
        this.trigger('row_selected', e.currentTarget);
      }
    });

#### `index_view.js`

    var IndexView = NestedView.extend({
      name: 'index_view',
      postRender: function(e) {
        this.childViews['user_detail_view'].on('row_selected', function(domEl){
          // do something
          console.log(domEl);
        });
      }
    });

##  Methods

### `view.render()`

Render is called only in the browser environment. The render method is implemented for you out of the box -- you should never override it. It renders the DOM based on the HTML returned by `view.getHtml({outerHtml: false})` and then initializes any child views that are present in that HTML. It calls `view.postRender()` when it's done, so you can do anything that needs access to the DOM or to child views.

### `view.postRender()`

Called after the view and its child views are rendered to the DOM, and child view instances have been bound to child view DOM elements. This method is wehre you put any initialization code that needs access to the DOM, such as setting up slideshows, or anything that needs access to child views, such as binding to their events.

### `view.getHtml()`

Returns the outer HTML of that view, including the outer-most DOM element, and all of its subviews. This is what to call, for example, on the server to get the entire view hierarchy's HTML in one big chunk.

### `view.getInnerHtml()`

It combines the template function returned by `view.getTemplate()` and the template data returned by `view.getTemplateData()` to produce the view's HTML. This is used by `view.render()` in the client-side, because the outer DOM element already exists or is provided by `Backbone.View`. Override `view.getInnerHtml()` if you want to customize how the view's HTML is constructed, such as to build a composite view that combines subviews in a special way, such as a collection view or a set of tabs.

### `view.getTemplate()`

This method returns the compiled Handlebars template that is used to render this view. The default implementation is almost surely not compatible with your particular application setup. Rather than overriding this for every view, it is useful to subclass `NestedView` for your own needs, and customize the `getTemplate()` method once.

### `view.getTemplateData()`

Here is where you customize what data gets passed to the Handlebars template for producing HTML. This method can function as a presenter or view-model. The default implementation returns `this.model.toJSON()` if a model is present, `{collection: this.collection.toJSON()}` if a collection is present, and otherwise just returns `_.clone(this.options)`. 
    