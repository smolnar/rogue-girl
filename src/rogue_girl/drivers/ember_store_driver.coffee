class RogueGirl.EmberStoreDriver
  app:   null
  store: null

  constructor: (app) ->
    throw new Error('You have to provide a valid application') unless app

    @app   = app
    @store = @app.__container__.lookup('store:main')

    throw new Error('You have to provide a valid store') unless @store

  build: (type, attributes) ->
    # TODO (smolnar) figure out how to only initialize record with Ember
    Ember.run => @store.createRecord(type, attributes)

  find: (type, params) ->
    Ember.run => @store.find(type, params)

  save: (record) ->
    Ember.run => record.save()

    record

  translateAssociation: (relation) ->
    "#{relation}Id"

  createAssociation: (parent, child, target) ->
    Ember.run =>
      relation = Ember.Inflector.inflector.pluralize(target)

      unless parent.get(relation)
        throw new Error("Did you specify relation hasMany #{relation} in #{parent.constructor.toString()}?")

      parent.get(relation).pushObject(child)
