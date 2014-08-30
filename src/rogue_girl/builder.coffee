class RogueGirl.Builder
  @build: ->
    params     = RogueGirl.Parser.parse(arguments)
    name       = params.name
    definition = RogueGirl.Definitions.of(name)
    type       = definition.type
    traits     = params.traits
    attributes = params.attributes

    RogueGirl.Builder.populate(name, attributes, traits)
    RogueGirl.driver.build(type, attributes)

  @populate: (name, attributes, traits) ->
    definition = RogueGirl.Definitions.of(name)

    throw new Error("There is no definition for '#{name}'") unless definition

    definition.buildAttributes(attributes, traits)
