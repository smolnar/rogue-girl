class RogueGirl.EmberStoreDriver
  @store: null

  @build: (type, attributes) ->
    Ember.run => EmberStoreDriver.store.createRecord(type, attributes)

  @find: (type, params) ->
    Ember.run => EmberStoreDriver.store.all(type, params)

  @save: (record) ->
    Ember.run => record.save()

    record

  @translateAssociation: (relation) -> "#{relation}Id"

  @createAssociation: (parent, child, target) ->
    Ember.run =>
      relation = Ember.Inflector.inflector.pluralize(target)

      unless parent.get(relation)
        throw new Error("Did you specify relation hasMany #{relation} in #{parent.constructor.toString()}?")

      parent.get(relation).pushObject(child)
