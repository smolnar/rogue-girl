class RogueGirl.Parser
  @parse: (params) ->
    name       = params[0]
    options    = params[1] if typeof(params[1]) == 'object' && params[1].type?
    type       = options?.type or name
    traits     = []
    attributes = {}
    index      = if options? then 2 else 1

    for param in Array.prototype.slice.apply(params, [index, params.length])
      if typeof(param) == 'string'
        traits.push(param)
      else
        attributes[key] = value for key, value of param

    name: name, type: type, traits: traits, attributes: attributes
