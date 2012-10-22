(function(){
  var assert = chai.assert
    , views = {}
    , templates = {}
    , userData = {first_name: 'Spike', last_name: 'Brehm'}
    , listingData = {name: 'Cozy downtown', user: userData};

  NestedView.registerHandlebars(Handlebars);

  var BaseNestedView = NestedView.extend({
    getTemplate: function(){
      return templates[this.name];
    }
  });

  NestedView.getView = function(name) {
    return views[name];
  };

  templates['listing_view'] = Handlebars.compile(
    '<h1>Listing: {{name}}</h1>' +
    '{{view "user_view" context=user}}'
  );

  templates['user_view'] = Handlebars.compile(
    '<h2>User: {{first_name}} {{last_name}}</h2>'
  );

  views['listing_view'] = BaseNestedView.extend({
    name: 'listing_view',
    tagName: 'section',
    id: 'listing',
    className: 'listing',
    postRender: function(){
      var _this = this;
      this.childViews['user_view'].on('clicked', function(e){
        _this.trigger('child_clicked', e);
      });
    }
  });

  views['user_view'] = BaseNestedView.extend({
    name: 'user_view',
    className: 'user',
    events: {'click':'click'},
    click: function(e){
      this.trigger('clicked', e);
    }
  });

  describe('Browser', function(){
    describe('rendering', function(){
      it('should render the same html that getHtml() returns', function(){
        var listingView = new views['listing_view'](listingData)
          , renderedInnerHtml = listingView.render().$el.html()
          , renderedOuterHtml = listingView.el.outerHTML
          , innerHtml = listingView.getHtml({outerHtml: false})
          , outerHtml = listingView.getHtml();

        assert.equal(renderedInnerHtml, innerHtml);
        assert.equal(renderedOuterHtml, outerHtml);
      });
    });

    describe('childViews', function(){
      it('should be able to listen to events emitted by the child', function(done){
        var listingView = new views['listing_view'](listingData);

        listingView.on('child_clicked', function(e){
          assert(true);
          assert.equal(e.currentTarget, listingView.childViews['user_view'].el);
          done();
          $('#container').html('');
        });

        $('#container').html(listingView.render().el);

        $('.user').click();
      });
    });
  });

})();
