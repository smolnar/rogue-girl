class RogueGirl.Attribute
  constructor: (name, object) ->
    @name   = name
    @object = object

  value: ->
    if typeof(@object) == 'function' then @object() else @object

  build: (attributes) ->
    attributes[@name] = @value() unless typeof(attributes[@name]) != 'undefined'

    null
