class RogueGirl.EmberStoreDriver extends RogueGirl.AbstractDriver
  app:   null
  store: null

  constructor: (app) ->
    throw new Error('You have to provide a valid application') unless app

    @app   = app
    @store = @app.__container__.lookup('store:main')

    throw new Error('You have to provide a valid store') unless @store

  build: (type, attributes) ->
    associations = @extractAssociations(attributes)

    Ember.run =>
      record = @store.createRecord(type, attributes)

      for association in associations
        record.set(association.parent, association.record)

        relation = association.child.pluralize()

        association.record.get(relation).pushObject(record)

      return record

  save: (record) ->
    Ember.run => record.save()

    record
