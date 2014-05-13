class RogueGirl.Association
  constructor: (type, target, params) ->
    @type   = type
    @target = target
    @params = params

  build: (attributes) ->
    parent = null

    if attributes[@type]
      parent = attributes[@type]

      delete attributes[@type]
    else
      parent = RogueGirl.Factory.create.apply(null, @params)

    parent_id = if parent.id? then parent.id else parent.get?('id')

    throw new Error("Could not resolve 'parent_id' for ##{parent}") unless parent_id?

    attributes[RogueGirl.driver.translateAssociation(@type)] = parent_id

    (child) => RogueGirl.driver.createAssociation(parent, child, @target)
