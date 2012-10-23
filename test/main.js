(function(){
  var server = !this.window;

  var assert =  server ? require('assert') : this.chai.assert
    , Handlebars = server ? require('handlebars') : this.Handlebars
    , NestedView = server ? require('../index') : this.NestedView
    , views = {}
    , templates = {}
    , userData = {name: 'Spike', email: 'spike@email.com'}
    , cidRe = / data-cid="\w+"/g;

  function stripCid(html){
    return html.replace(cidRe, '');
  }

  NestedView.registerHandlebars(Handlebars);

  templates['outer_view'] = Handlebars.compile(
    '<h1>Hello, {{user.name}}.</h1>' +
    '{{view "inner_view" arg1="string" arg2="true" context=user}}'
  );

  templates['inner_view'] = Handlebars.compile(
   'Name: {{name}}<br>' +
   'Email: {{email}}'
  );

  var BaseNestedView = NestedView.extend({
    getTemplate: function(){
      return templates[this.name];
    }
  });

  NestedView.getView = function(name) {
    return views[name];
  };

  views['outer_view'] = BaseNestedView.extend({
    name: 'outer_view',
    tagName: 'section',
    className: 'outer'
  });

  views['inner_view'] = BaseNestedView.extend({
    name: 'inner_view',
    className: 'inner'
  });

  describe('NestedView', function(){

    describe('viewHelper', function(){
      it('should register the Handlebars helper', function(){
        assert.equal(Handlebars.helpers.view, NestedView.viewHelper);
      });
    });

    describe('getTemplateData', function(){
      it('should return the options if no model or collection', function(){
        var innerView = new views['inner_view'](userData);

        assert.deepEqual(innerView.getTemplateData(), userData);
      });

      it('should return the model\'s toJSON() if a model is present', function(){
        var data = {model: new Backbone.Model(userData)}
          , innerView = new views['inner_view'](data);

          assert.deepEqual(innerView.getTemplateData(), userData);
      });

      it('should return the collection\'s toJSON() if a collection is present', function(){
        var data = {collection: new Backbone.Collection([userData, userData])}
          , innerView = new views['inner_view'](data);

          assert.deepEqual(innerView.getTemplateData(), {collection: [userData, userData]});
      });
    });

    describe('getHtml()', function(){
      it('should return the outerHtml of a single view', function(){
        var innerView = new views['inner_view'](userData)
          , html = innerView.getHtml();

        assert.equal(stripCid(html), '<div class="inner" data-view="inner_view">Name: Spike<br>Email: spike@email.com</div>');
      });

      it('should return the innerHtml of a single view', function(){
        var innerView = new views['inner_view'](userData)
          , html = innerView.getInnerHtml();

        assert.equal(stripCid(html), 'Name: Spike<br>Email: spike@email.com');
      });

      it('should return the html of a nested view', function(){
        var data = {user: userData}
          , outerView = new views['outer_view'](data)
          , html = outerView.getHtml();

        assert.equal(stripCid(html),
          '<section class="outer" data-view="outer_view"><h1>Hello, Spike.</h1>' +
          '<div class="inner" data-view="inner_view">Name: Spike<br>Email: spike@email.com</div></section>'
        );
      });
    });

    describe('childViews', function(){
      it('should provide access to child view instances', function(){
        var data = {user: userData}
          , outerView = new views['outer_view'](data)
          , innerView;

        outerView.getHtml();

        innerView = outerView.childViews['inner_view'];

        assert(innerView instanceof views['inner_view']);
        assert.deepEqual(innerView.options, data.user);
      });
    });

  });
})();
