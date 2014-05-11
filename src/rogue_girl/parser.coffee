class RogueGirl.Parser
  @parse: (params) ->
    type       = params[0]
    traits     = []
    attributes = {}

    for param in Array.prototype.slice.call(params, [1, params.length - 1])
      if typeof(param) == 'string'
        traits.push(param)
      else
        attributes[key] = value for key, value of param

    type: type, traits: traits, attributes: attributes
