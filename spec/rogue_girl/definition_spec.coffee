#= require spec_helper

describe 'RogueGirl.Definition', ->
  it 'defines field value', ->
    definition = new RogueGirl.Definition 'user', {}, (f) ->
      f.name = 'Peter'

    attribute = definition.attributes.name

    expect(attribute.name).to.eql('name')
    expect(attribute.value()).to.eql('Peter')

  it 'defines field value as function', ->
    n = 0

    definition = new RogueGirl.Definition 'user', {}, (f) ->
      f.name = -> "Peter ##{n += 1}"

    attribute = definition.attributes.name

    expect(attribute.name).to.eql('name')
    expect(attribute.value()).to.eql('Peter #1')
    expect(attribute.value()).to.eql('Peter #2')

  it 'defines field with a sequence', ->
    definition = new RogueGirl.Definition 'user', {}, (f) ->
      @sequence 'email', (n) -> "peter_#{n}@parker.com"

    attribute = definition.attributes.email

    expect(attribute.name).to.eql('email')
    expect(attribute.value()).to.eql('peter_0@parker.com')
    expect(attribute.value()).to.eql('peter_1@parker.com')

  it 'defines field with a sequence within trait', ->
    definition = new RogueGirl.Definition 'user', {}, (f) ->
      @sequence 'email', (n) -> "peter_#{n}@parker.com"

      @trait 'admin', ->
        @sequence 'email', (n) -> "admin_#{n}@parker.com"

    attribute = definition.attributes.email

    expect(attribute.name).to.eql('email')
    expect(attribute.value()).to.eql('peter_0@parker.com')
    expect(attribute.value()).to.eql('peter_1@parker.com')

    attribute = definition.traits.admin.email

    expect(attribute.name).to.eql('email')
    expect(attribute.value()).to.eql("admin_2@parker.com")

  it 'defines an association', ->
    RogueGirl.define 'role', (f) ->
      f.name = 'default'

    definition = new RogueGirl.Definition 'user', {}, (f) ->
      @association 'role'

    attribute = definition.attributes.role

    expect(attribute.type).to.eql('role')
    expect(attribute.target).to.eql('user')
    expect(attribute.params[0]).to.eql('role')
    expect(attribute.params.length).to.eql(1)

  it 'defines an association within trait', ->
    definition = new RogueGirl.Definition 'user', {}, (f) ->
      @association 'role'

      @trait 'admin', ->
        @association 'role', name: 'admin'

    attribute = definition.attributes.role

    expect(attribute.type).to.eql('role')
    expect(attribute.target).to.eql('user')
    expect(attribute.params[0]).to.eql('role')
    expect(attribute.params.length).to.eql(1)

    attribute = definition.traits.admin.role

    expect(attribute.type).to.eql('role')
    expect(attribute.target).to.eql('user')
    expect(attribute.params[0]).to.eql('role')
    expect(attribute.params[1]).to.eql(name: 'admin')
    expect(attribute.params.length).to.eql(2)


  describe '#buildAttributes', ->
    beforeEach ->
      @driver  = mock('RogueGirl.driver', translateAssociation: (->))
      @factory = mock('RogueGirl.Factory', create: ->)

    it 'builds attributes', ->
      RogueGirl.define 'permission', (f) ->
        f.name = 'basic'

      definition = new RogueGirl.Definition 'user', {}, (f) ->
        f.name = 'Peter'

        @sequence    'email', (n) -> "peter_#{n}@parker.com"
        @association 'permission'

      @record = mock(get: ->)

      @factory
        .expects('create')
        .withExactArgs('permission')
        .returns(@record.object)
        .once()

      @driver
        .expects('translateAssociation')
        .withExactArgs('permission')
        .returns('permissionId')
        .once()

      @record.mock
        .expects('get')
        .withExactArgs('id')
        .returns(1)
        .once()

      attributes = {}
      callbacks  = definition.buildAttributes(attributes)

      expect(attributes).to.eql(id: 0, name: 'Peter', email: 'peter_0@parker.com', permissionId: 1)
      expect(callbacks.length).to.eql(1)

    it 'builds attributes with traits', ->
      definition = new RogueGirl.Definition 'user', {}, (f) ->
        f.name  = 'Peter'
        f.email = 'peter@parker.com'

        @trait 'as admin', (f) ->
          f.name = 'Admin'

      attributes = {}
      definition.buildAttributes(attributes, ['as admin'])

      expect(attributes).to.eql(id: 0, name: 'Admin', email: 'peter@parker.com')
