#= require spec_helper

describe 'RogueGirl.Association', ->
  describe '#build', ->
    beforeEach ->
      @factory = mock('RogueGirl.Factory', create: ->)

    it 'builds an association with new record', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('role', 'role', 'user', ['role'])

      @factory
        .expects('create')
        .withExactArgs('role')
        .returns(@parent.object)
        .once()

      @parent.mock
        .expects('get')
        .withExactArgs('id')
        .returns(1)
        .once()

      attributes = {}
      callback   = association.build(attributes)
      attribute  = attributes.role.__association__

      expect(attribute).to.eql(parent: 'role', child: 'user', record: @parent.object)

    it 'builds an association by different name', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('awesome role', 'role', 'user', ['awesome role'])

      @factory
        .expects('create')
        .withExactArgs('awesome role')
        .returns(@parent.object)
        .once()

      @parent.mock
        .expects('get')
        .withExactArgs('id')
        .returns(1)
        .once()

      attributes = {}
      callback   = association.build(attributes)
      attribute  = attributes.role.__association__

      expect(attribute).to.eql(parent: 'role', child: 'user', record: @parent.object)

    it 'builds an association with custom attributes', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('role', 'role', 'user', ['role', 'as admin', name: 'Admin'])

      @factory
        .expects('create')
        .withExactArgs('role', 'as admin', name: 'Admin')
        .returns(@parent.object)
        .once()

      @parent.mock
        .expects('get')
        .withExactArgs('id')
        .returns(1)
        .once()

      attributes = {}
      callback   = association.build(attributes)
      attribute  = attributes.role.__association__

      expect(attribute).to.eql(parent: 'role', child: 'user', record: @parent.object)

    it 'builds an association with existing record', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('role', 'role', 'user', ['role', 'as admin', name: 'Admin'])

      @parent.mock
        .expects('get')
        .withExactArgs('id')
        .returns(2)
        .once()

      attributes = { role: @parent.object }
      callback   = association.build(attributes)
      attribute  = attributes.role.__association__

      expect(attribute).to.eql(parent: 'role', child: 'user', record: @parent.object)

    context 'when parent has no id property', ->
      it 'throws an error', ->
        association = new RogueGirl.Association('role', 'role', 'user', ['role', 'as admin', name: 'Admin'])

        attributes = {}

        @factory
          .expects('create')
          .withExactArgs('role', 'as admin', name: 'Admin')
          .returns({})
          .once()

        expect(-> association.build(attributes)).to.throw(Error, /Could not resolve 'parent_id'/)
