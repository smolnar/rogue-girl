class exports.RogueGirl
  @driver: null

  @find: (name, params) ->
    RogueGirl.driver.find(name, params)

  @build: ->
    RogueGirl.Builder.create.apply(null, arguments)

  @create: ->
    record = RogueGirl.build.apply(null, arguments)

    RogueGirl.driver.save(record)

    record

  @define: ->
    name     = arguments[0]
    options  = if typeof arguments[1] == 'object' then arguments[1] else {}
    callback = arguments[arguments.length - 1]

    RogueGirl.Definitions.add(name, new RogueGirl.Definition(name, options, callback))
