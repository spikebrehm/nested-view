# NestedView

Declarative nested Backbone/Handlebars views.  More render nested view hierarchies in both the browser and in Node.js.

## Usage

In your Handlebars templates, use the `{{view}}` helper to declare nested child views.

### `index_view.hbs`

    <h1>Hello, {{user.name}}.</h1>
    {{view "user_detail_view" context=user}}

### `user_detail_view.hbs`

     <li>Name: {{name}}</li>
     <li>Email: {{email}}</li>

### `index_view.js`

    var IndexView = NestedView.extend({
      name: 'index_view'
    });

### `user_detail_view.js`

    var UserDetailView = NestedView.extend({
      name: 'user_detail_view',
      tagName: 'ul'
    });

### `application.js`

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