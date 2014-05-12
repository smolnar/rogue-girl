class RogueGirl.Definitions
  @definitions: {}

  @add: (name, definition) ->
    RogueGirl.Definitions.definitions[name] = definition

  @of: (name) ->
    RogueGirl.Definitions.definitions[name]

  @clear: ->
    RogueGirl.Definitions.definitions = {}
