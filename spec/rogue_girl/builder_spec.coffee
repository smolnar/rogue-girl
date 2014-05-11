#= require spec_helper

describe 'RogueGirl.Builder', ->
  describe '#build', ->
    beforeEach ->
      @definitions = mock('RogueGirl.Definitions', of: ->)

    it 'builds definition', ->
      definition = new RogueGirl.Definition 'user', {}, (f) ->
        f.name  = 'Peter'
        f.email = 'peter@parker.com'

      @definitions
        .expects('of')
        .withExactArgs('user')
        .returns(definition)
        .once()

      attributes = {}

      callbacks = RogueGirl.Builder.build('user', attributes)

      expect(attributes).to.eql(id: 0, name: 'Peter', email: 'peter@parker.com')
      expect(callbacks.length).to.eql(0)

    it 'builds definition with custom params', ->
      definition = new RogueGirl.Definition 'user', {}, (f) ->
        f.name  = 'Peter'
        f.email = 'peter@parker.com'

      @definitions
        .expects('of')
        .withExactArgs('user')
        .returns(definition)
        .once()

      attributes = { name: 'John' }

      callbacks = RogueGirl.Builder.build('user', attributes)

      expect(attributes).to.eql(id: 0, name: 'John', email: 'peter@parker.com')
      expect(callbacks.length).to.eql(0)

  describe '#create', ->
    beforeEach ->
      @driver = mock('RogueGirl.driver', create: (->), associationFor: (->))

    it 'creates record', ->
      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'
        f.email = 'peter@peter.com'

        @trait 'with permissions', (f) ->
          f.permission = 'super'
          f.role       = 'admin'

      @driver
        .expects('create')
        .withExactArgs('user', id: 0, name: 'Peter', email: 'peter@peter.com')
        .once()

      user = RogueGirl.Builder.create 'user'

    it 'creates record with traits', ->
      RogueGirl.define 'user', (f) ->
        f.name  = 'Peter'
        f.email = 'peter@peter.com'

        @trait 'with permissions', (f) ->
          f.permission = 'super'

        @trait 'with role', (f) ->
          f.role = 'admin'

      @driver
        .expects('create')
        .withExactArgs('user', id: 0, name: 'Peter', email: 'peter@peter.com', permission: 'super', role: 'admin')
        .once()

      user = RogueGirl.Builder.create 'user', 'with permissions', 'with role'

    it 'creates record with custom parameters', ->
      RogueGirl.define 'user', (f) ->
        f.name  = 'Peter'
        f.email = 'peter@peter.com'

        @trait 'with permissions', (f) ->
          f.permission = 'super'

      @driver
        .expects('create')
        .withExactArgs('user', id: 0, name: 'John', email: 'peter@peter.com', permission: 'basic')

      RogueGirl.Builder.create 'user', 'with permission', name: 'John', permission: 'basic'

    it 'creates records with sequences', ->
      RogueGirl.define 'user', (f) ->
        @sequence 'name',  (n) -> "Peter #{n}"
        @sequence 'email', (n) -> "peter_#{n}@peter.com"

        @trait 'with permissions', (f) ->
          f.permission = 'super'
          @sequence 'role', (n) -> "admin #{n}"

      @driver
        .expects('create')
        .withExactArgs('user', id: 0, name: 'Peter 0', email: 'peter_0@peter.com', permission: 'super', role: 'admin 0')
        .once()

      user = RogueGirl.Builder.create 'user', 'with permissions'

      @driver.expects('create')
        .withExactArgs('user', id: 1, name: 'Peter 1', email: 'peter_1@peter.com', permission: 'super', role: 'admin 1')
        .once()

      user = RogueGirl.Builder.create 'user', 'with permissions'

    it 'creates record with association', ->
      RogueGirl.define 'user', (f) ->
        @sequence 'name',  (n) -> "Peter #{n}"
        @sequence 'email', (n) -> "peter_#{n}@peter.com"

        @association 'role', name: 'basic'

      RogueGirl.define 'role', (f) ->
        f.name = 'super'

      @user = { id: 0, name: 'Peter 0', email: 'peter_0@peter.com', role: 0 }

      @driver.expects('create')
        .withExactArgs('user', id: 0, name: 'Peter 0', email: 'peter_0@peter.com', role: 0)
        .returns(@user)
        .once()

      @role = mock(get: ->)

      @role.mock
        .expects('get')
        .withExactArgs('id')
        .returns(0)
        .once()

      @driver
        .expects('create')
        .withExactArgs('role', id: 0, name: 'basic')
        .returns(@role.object)
        .once()

      @driver
        .expects('associationFor')
        .withExactArgs(@role.object, @user, 'user')
        .once()

      RogueGirl.Builder.create 'user'

    it 'creates associations with custom object', ->
      RogueGirl.define 'user', (f) ->
        @sequence 'name',  (n) -> "Peter #{n}"
        @sequence 'email', (n) -> "peter_#{n}@peter.com"

        @association 'role', name: 'basic'

      RogueGirl.define 'role', (f) ->
        f.name = 'super'

      @role = mock(get: ->)

      @role.mock
        .expects('get')
        .withExactArgs('id')
        .returns(20)
        .once()

      @user = { id: 0, name: 'Peter 0', email: 'peter_0@peter.com', role: 20 }

      @driver
        .expects('create')
        .withExactArgs('user', id: 0, name: 'Peter 0', email: 'peter_0@peter.com', role: 20)
        .returns(@user)
        .once()

      @driver
        .expects('associationFor')
        .withExactArgs(@role.object, @user, 'user')
        .once()

      RogueGirl.Builder.create 'user', role: @role.object


