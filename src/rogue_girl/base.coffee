class exports.RogueGirl
  @driver: null

  @build:  -> RogueGirl.Factory.build.apply(null, arguments)
  @create: -> RogueGirl.Factory.create.apply(null, arguments)

  @find: (name, params) -> RogueGirl.driver.find(name, params)

  @define: ->
    name     = arguments[0]
    options  = if typeof arguments[1] == 'object' then arguments[1] else {}
    callback = arguments[arguments.length - 1]

    RogueGirl.Definitions.add(name, new RogueGirl.Definition(name, options, callback))
