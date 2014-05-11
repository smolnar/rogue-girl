class RogueGirl.Builder
  @build: (type, attributes, traits) ->
    definition = RogueGirl.Definitions.of(type)

    throw new Error("There is not definition for #{type}") unless definition

    definition.buildAttributes(attributes, traits)

  @create: ->
    params = RogueGirl.Parser.parse(arguments)

    type       = params.type
    traits     = params.traits
    attributes = params.attributes

    callbacks = RogueGirl.Builder.build(type, attributes, traits)

    record = RogueGirl.driver.create(type, attributes)

    callback(record) for callback in callbacks

    record
