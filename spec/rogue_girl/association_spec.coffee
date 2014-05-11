#= require spec_helper

describe 'RogueGirl.Association', ->
  describe '#build', ->
    beforeEach ->
      @driver  = mock('RogueGirl.driver', create: (->), associationFor: (->))
      @builder = mock('RogueGirl.Builder', create: ->)

    it 'builds an association with new record', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('role', 'user', ['role'])

      @builder
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
        .expects('associationFor')
        .withExactArgs(@parent.object, @child.object, 'user')
        .once(0)

      attributes = {}
      callback = association.build(attributes)

      expect(attributes).to.eql(role: 1)
      expect(typeof callback).to.eql('function')

      callback(@child.object)

    it 'builds an association with custom attributes', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('role', 'user', ['role', 'as admin', name: 'Admin'])

      @builder
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
        .expects('associationFor')
        .withExactArgs(@parent.object, @child.object, 'user')
        .once()

      attributes = {}
      callback = association.build(attributes)

      expect(attributes).to.eql(role: 1)
      expect(typeof callback).to.eql('function')

      callback(@child.object)

    it 'builds an association with existing record', ->
      @parent = mock(get: ->)
      @child  = mock(get: ->)

      association = new RogueGirl.Association('role', 'user', ['role', name: 'Admin'])

      @parent.mock
        .expects('get')
        .withExactArgs('id')
        .returns(1)
        .once()

      @driver
        .expects('associationFor')
        .withExactArgs(@parent.object, @child.object, 'user')
        .once()

      attributes = { role: @parent.object }
      callback = association.build(attributes)

      expect(attributes).to.eql(role: 1)
      expect(typeof callback).to.eql('function')

      callback(@child.object)


