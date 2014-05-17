#= require spec_helper

describe 'RogueGirl.Builder', ->
  describe '#populate', ->
    afterEach ->
      RogueGirl.Definitions.clear()

    it 'populates definition', ->
      definition = new RogueGirl.Definition 'user', {}, (f) ->
        f.name  = 'Peter'
        f.email = 'peter@parker.com'

      RogueGirl.Definitions.add('user', definition)

      attributes = {}

      callbacks = RogueGirl.Builder.populate('user', attributes)

      expect(attributes).to.eql(id: 1, name: 'Peter', email: 'peter@parker.com')
      expect(callbacks.length).to.eql(0)

    it 'populates definition with custom params', ->
      definition = new RogueGirl.Definition 'user', {}, (f) ->
        f.name  = 'Peter'
        f.email = 'peter@parker.com'

      RogueGirl.Definitions.add('user', definition)

      attributes = { name: 'John' }

      callbacks = RogueGirl.Builder.populate('user', attributes)

      expect(attributes).to.eql(id: 1, name: 'John', email: 'peter@parker.com')
      expect(callbacks.length).to.eql(0)

    context 'when no definition found', ->
      it 'throws an error', ->
        expect(-> RogueGirl.Builder.populate('user', name: 'Peter')).to.throw(Error, /There is no definition for 'user'/)

  describe '#build', ->
    beforeEach ->
      @factory = mock('RogueGirl.Factory', create: (->))
      @driver  = mock('RogueGirl.driver', build: (->))

    it 'builds record', ->
      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'
        f.email = 'peter@peter.com'

        @trait 'with permissions', (f) ->
          f.permission = 'super'
          f.role       = 'admin'

      @driver
        .expects('build')
        .withExactArgs('user', id: 1, name: 'Peter', email: 'peter@peter.com')
        .once()

      user = RogueGirl.Builder.build('user')

    it 'creates record with traits', ->
      RogueGirl.define 'user', (f) ->
        f.name  = 'Peter'
        f.email = 'peter@peter.com'

        @trait 'with permissions', (f) ->
          f.permission = 'super'

        @trait 'with role', (f) ->
          f.role = 'admin'

      @driver
        .expects('build')
        .withExactArgs('user', id: 1, name: 'Peter', email: 'peter@peter.com', permission: 'super', role: 'admin')
        .once()

      user = RogueGirl.Builder.build 'user', 'with permissions', 'with role'

    it 'creates record with custom parameters', ->
      RogueGirl.define 'user', (f) ->
        f.name  = 'Peter'
        f.email = 'peter@peter.com'

        @trait 'with permissions', (f) ->
          f.permission = 'super'

      @driver
        .expects('build')
        .withExactArgs('user', id: 1, name: 'John', email: 'peter@peter.com', permission: 'basic')

      RogueGirl.Builder.build 'user', 'with permission', name: 'John', permission: 'basic'

    it 'creates records with sequences', ->
      RogueGirl.define 'user', (f) ->
        @sequence 'name',  (n) -> "Peter #{n}"
        @sequence 'email', (n) -> "peter_#{n}@peter.com"

        @trait 'with permissions', (f) ->
          f.permission = 'super'
          @sequence 'role', (n) -> "admin #{n}"

      @driver
        .expects('build')
        .withExactArgs('user', id: 1, name: 'Peter 0', email: 'peter_0@peter.com', permission: 'super', role: 'admin 0')
        .once()

      user = RogueGirl.Builder.build 'user', 'with permissions'

      @driver
        .expects('build')
        .withExactArgs('user', id: 2, name: 'Peter 1', email: 'peter_1@peter.com', permission: 'super', role: 'admin 1')
        .once()

      user = RogueGirl.Builder.build 'user', 'with permissions'

    it 'builds record with association', ->
      RogueGirl.define 'role', (f) ->
        f.name = 'default'

      RogueGirl.define 'user', (f) ->
        @sequence 'name',  (n) -> "Peter #{n}"
        @sequence 'email', (n) -> "peter_#{n}@peter.com"

        @association 'role', name: 'basic'

      @role = mock(get: ->)
      @user = { id: 1, name: 'Peter 0', email: 'peter_0@peter.com', role: @role.object }

      @driver
        .expects('build')
        .withExactArgs('user',
          id: 1
          name: 'Peter 0'
          email: 'peter_0@peter.com'
          role:
            __association__:
              parent: 'role'
              child:  'user'
              record: @role.object
        )
        .returns(@user)
        .once()

      @role.mock
        .expects('get')
        .withExactArgs('id')
        .returns(0)
        .once()

      @factory
        .expects('create')
        .withExactArgs('role', name: 'basic')
        .returns(@role.object)
        .once()

      RogueGirl.Builder.build 'user'

    it 'creates associations with custom object', ->
      RogueGirl.define 'role', (f) ->
        f.name = 'default'

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

      @user = { id: 1, name: 'Peter 0', email: 'peter_0@peter.com', role: @role.object }

      @driver
        .expects('build')
        .withExactArgs('user',
          id: 1
          name: 'Peter 0'
          email: 'peter_0@peter.com'
          role:
            __association__:
              parent: 'role'
              child: 'user'
              record: @role.object
        )
        .returns(@user)
        .once()

      RogueGirl.Builder.build 'user', role: @role.object
