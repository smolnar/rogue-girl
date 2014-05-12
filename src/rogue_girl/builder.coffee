class RogueGirl.Builder
  @build: ->
    params = RogueGirl.Parser.parse(arguments)

    name       = params.name
    type       = params.type
    traits     = params.traits
    attributes = params.attributes
    callbacks  = RogueGirl.Builder.populate(name, attributes, traits)
    record     = RogueGirl.driver.build(type, attributes)

    callback(record) for callback in callbacks

    record

  @populate: (name, attributes, traits) ->
    definition = RogueGirl.Definitions.of(name)

    throw new Error("There is no definition for '#{name}'") unless definition

    definition.buildAttributes(attributes, traits)
