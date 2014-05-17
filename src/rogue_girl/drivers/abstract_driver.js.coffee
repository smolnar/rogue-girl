class RogueGirl.AbstractDriver
  build: -> throw new Error()
  save:  -> throw new Error()

  extractAssociations: (attributes) ->
    associations = []

    for name, value of attributes
      if value? && value.__association__?
        associations.push(value.__association__)

        delete attributes[name]

    associations
