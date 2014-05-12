class RogueGirl.Factory
  @build: ->
    RogueGirl.Builder.build.apply(null, arguments)

  @create: ->
    record = RogueGirl.build.apply(null, arguments)

    RogueGirl.driver.save(record)

    record

  @createAssociation: ->
    RogueGirl.driver.associationFor.apply(null, arguments)
