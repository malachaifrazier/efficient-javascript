var PageView = Backbone.View.extend({
    template: _.template(
        '<div id="container"></div>' +
        '<div id="controls"></div>'
    ),
    events: {
        'click #add'   : 'addTodo',
        'click #clean' : 'removeAllTodos'
    },
    addTodo: function() {
        toDoCollectionView.trigger('add:random');
    },
    removeAllTodos: function() {
        toDoCollectionView.trigger('remove:all');
    },
    render: function() {
        this.$el.html(this.template());

        return Backbone.View.prototype.render.apply(this, arguments);
    }
});

var ToDoView = Backbone.View.extend({
    className: 'todo-container',

    template: _.template(
        '<span class="todo-item" title="<%= description %>">' +
        '  <span class="todo-title"><%= title %></span>'      +
        '  <span class="btn-remove fr" data-action="delete"'  +
        '  ><i></i>delete</span>'                             +
        '</span>'
    ),

    initialize: function(options) {
        this.model.on('change',  this.render, this);

        options.parent.on('remove:all', this.handleDelete, this);

        Backbone.View.prototype.initialize.apply(this, arguments);
    },
    events: {
        'click span[data-action=delete]' : 'handleDelete'
    },
    handleDelete: function() {
        this.remove();
    },
    render: function() {
        this.$el.html(
            this.template(
                this.model.toJSON()
            ) + Math.floor(Math.random()*100%100)
        );

        return Backbone.View.prototype.render.apply(this, arguments);
    }
});

var ToDoCollectionView = Backbone.View.extend({
    render: function() {
        document.getElementById('container').innerHTML = '';

        var self = this;

        pageView.$el.find('#container').append(
            '<h1>Crazy <strong>To Do</strong> List</h1>'
        );

        this.collection.each(function(todo) {
            pageView.$el.find('#container').append(
                (new ToDoView({model: todo,parent:self})).render().el
            );
        });

        pageView.$el.find('#controls').html(
            '<a href="#" id="clean" class="btn-removeall">' +
            '<i></i>remove all "to do"s</a>'                +
            '<a href="#" id="add" class="btn-add">'         +
            '<i></i>add a random "to do"</a>'
        );

        return Backbone.View.prototype.render.apply(this, arguments);
    },
    initialize: function() {
        var self = this;

        this.collection.bind('add', function() {
            new ToDoView({
                model:self.collection.at(self.collection.length-1),
                parent:self
            }).render();
        });

        this.on('add:random', function() {
            var rnd = Math.floor(Math.random()*100 %100);

            self.collection.add([{
                'id'          : 'todo-' + (new Date()).getTime() + '-' + rnd,
                'startDate'   : '2013-03-30',
                'title'       : 'random todo ' + rnd,
                'description' : 'todo-' + rnd
            }]);

            self.render();

            setTimeout(function() {
                document.body.scrollTop = document.documentElement.scrollHeight
            },0);
        });

        return Backbone.View.prototype.initialize.apply(this, arguments);
    }
});

/******************************************************************************/

var ToDo = Backbone.Model.extend({url: '/tasks'});

var ToDoCollection = Backbone.Collection.extend({
    model: ToDo,
    url: '/tasks'
});

todos = new ToDoCollection();

todos.add(Cache);

var pageView = new PageView();

$('body').append(pageView.render().$el);

toDoCollectionView = new ToDoCollectionView({collection: todos});

toDoCollectionView.render();
