class RogueGirl.Definition
  constructor: (name, options, callback) ->
    @name       = name
    @type       = options.type or name
    @callback   = callback
    @attributes = {}
    @traits     = {}
    @sequences  = {}

    @proxy = new RogueGirl.Definition.Proxy(@, @attributes)

    @proxy.define ->
      @sequence 'id', (n) -> n

    @proxy.define(@callback)

  buildAttributes: (result, traits) ->
    callbacks  = []
    traits    ?= []
    attributes = {}

    for name, attribute of @attributes
      attributes[name] = attribute

    for trait in traits
      for name, attribute of @traits[trait]
        attributes[name] = attribute

    for _, attribute of attributes
      callback = attribute.build(result)

      callbacks = callbacks.concat(callback) if callback

    callbacks

class RogueGirl.Definition.Proxy
  constructor: (base, attributes) ->
    @base       = base
    @attributes = attributes

  define: (callback) ->
    definitions = {}

    callback.call(@, definitions)

    for name, value of definitions
      @attributes[name] = new RogueGirl.Attribute(name, value)

    @attributes

  trait: (name, callback) ->
    @proxy = new RogueGirl.Definition.Proxy(@base, {})

    @proxy.define(callback)

    @base.traits[name] = @proxy.attributes

  sequence: (name, callback) ->
    @define (f) ->
      f[name] = =>
        result = callback(@base.sequences[name] ?= 0)

        @base.sequences[name] += 1

        result

  association: (name) ->
    @attributes[name] = new RogueGirl.Association(name, @base.type, arguments)
