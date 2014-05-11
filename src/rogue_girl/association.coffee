class RogueGirl.Association
  constructor: (name, target, params) ->
    @name   = name
    @target = target
    @params = params

  build: (attributes) ->
    parent = null

    if attributes[@name]
      parent = attributes[@name]
    else
      parent = RogueGirl.Builder.create.apply(null, @params)

    # TODO (smolnar) consider using _id notation as well
    attributes[@name] = parent.get('id')

    (child) => RogueGirl.driver.associationFor(parent, child, @target)
