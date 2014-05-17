class RogueGirl.DefaultDriver extends RogueGirl.AbstractDriver
  build: (type, attributes) ->
    associations = @extractAssociations(attributes)
    record       = attributes

    for association in associations
      record[association.parent] = association.record

      relation = association.child.pluralize()

      association.record[relation] ?= []
      association.record[relation].push(record)

    record

  save: (record) -> record
