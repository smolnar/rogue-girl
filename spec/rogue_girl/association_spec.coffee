#= require spec_helper

describe 'RogueGirl.Association', ->
  describe '#build', ->
    beforeEach ->
      @factory = mock('RogueGirl.Factory', create: ->)
      @driver  = mock('RogueGirl.driver', translateAssociation: (->), createAssociation: (->))

    it 'builds an association with new record', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('role', 'user', ['role'])

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

      @driver
        .expects('translateAssociation')
        .withExactArgs('role')
        .returns('roleId')
        .once()

      @driver
        .expects('createAssociation')
        .withExactArgs(@parent.object, @child.object, 'user')
        .once(0)

      attributes = {}
      callback   = association.build(attributes)

      expect(attributes).to.eql(roleId: 1)
      expect(typeof callback).to.eql('function')

      callback(@child.object)

    it 'builds an association with custom attributes', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('role', 'user', ['role', 'as admin', name: 'Admin'])

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

      @driver
        .expects('translateAssociation')
        .withExactArgs('role')
        .returns('roleId')

      @driver
        .expects('createAssociation')
        .withExactArgs(@parent.object, @child.object, 'user')
        .once()

      attributes = {}
      callback   = association.build(attributes)

      expect(attributes).to.eql(roleId: 1)
      expect(typeof callback).to.eql('function')

      callback(@child.object)

    it 'builds an association with existing record', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('role', 'user', ['role', 'as admin', name: 'Admin'])

      @parent.mock
        .expects('get')
        .withExactArgs('id')
        .returns(2)
        .once()

      @driver
        .expects('translateAssociation')
        .withExactArgs('role')
        .returns('roleId')

      @driver
        .expects('createAssociation')
        .withExactArgs(@parent.object, @child.object, 'user')
        .once()

      attributes = { role: @parent.object }
      callback = association.build(attributes)

      expect(attributes).to.eql(roleId: 2)
      expect(typeof callback).to.eql('function')

      callback(@child.object)

    context 'when parent has no id property', ->
      it 'throws an error', ->
        association = new RogueGirl.Association('role', 'user', ['role', 'as admin', name: 'Admin'])

        attributes = {}

        @factory
          .expects('create')
          .withExactArgs('role', 'as admin', name: 'Admin')
          .returns({})
          .once()

        expect(-> association.build(attributes)).to.throw(Error, /Could not resolve 'parent_id'/)
