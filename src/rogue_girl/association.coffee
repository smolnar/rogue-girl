class RogueGirl.Association
  constructor: (name, parent, child, params) ->
    @name   = name
    @parent = parent
    @child  = child
    @params = params

  build: (attributes) ->
    record = null

    if attributes[@name]
      record = attributes[@name]

      delete attributes[@name]
    else
      record = RogueGirl.Factory.create.apply(null, @params)

    parent_id = if record.id? then record.id else record.get?('id')

    throw new Error("Could not resolve 'parent_id' for ##{record}") unless parent_id?

    attributes[@parent] =
      __association__:
        parent: @parent
        child:  @child
        record: record
