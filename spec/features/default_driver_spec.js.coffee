#= require spec_helper

describe 'Default Driver', ->
  context 'with RogueGirl', ->
    beforeEach ->
      RogueGirl.driver = new RogueGirl.DefaultDriver()

    it 'builds a record', ->
      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'

        @sequence 'number', (n) -> "Number ##{n}"

        @trait 'as admin', (f) ->
          f.name = 'Admin'

      users = [RogueGirl.build('user'), RogueGirl.build('user', 'as admin')]

      expect(users[0].name).to.eql('Peter')
      expect(users[0].number).to.eql('Number #0')

      expect(users[1].name).to.eql('Admin')
      expect(users[1].number).to.eql('Number #1')

    it 'creates a record', ->
      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'

        @sequence 'number', (n) -> "Number ##{n}"

      user = RogueGirl.create('user')

      expect(user.name).to.eql('Peter')
      expect(user.number).to.eql('Number #0')

    it 'creates a record with associations', ->
      RogueGirl.define 'role', (f) ->
        f.name = 'Basic'

      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'

        @sequence 'number', (n) -> "Number ##{n}"

        @association 'role'

        @trait 'as admin', ->
          @association 'role', 'as admin'

      user = RogueGirl.create('user')
      role = user.role

      expect(user.name).to.eql('Peter')
      expect(user.number).to.eql('Number #0')
      expect(user.role).to.eql(role)
      expect(user.role.name).to.eql('Basic')
      expect(role.users).to.eql([user])

    it 'creates a record with associations by traits', ->
      RogueGirl.define 'role', (f) ->
        f.name = 'Basic'

        @trait 'as admin', (f) ->
          f.name = 'Admin'

      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'

        @sequence 'number', (n) -> "Number ##{n}"

        @association 'role'

        @trait 'as admin', ->
          @association 'role', 'as admin'


      user = RogueGirl.create('user', 'as admin', name: 'Josh')
      role = user.role

      expect(user.name).to.eql('Josh')
      expect(user.number).to.eql('Number #0')
      expect(user.role).to.eql(role)
      expect(user.role.name).to.eql('Admin')
      expect(role.users).to.eql([user])

    it 'creates a record with associations with custom object', ->
      RogueGirl.define 'role', (f) ->
        f.name = 'Basic'

        @trait 'as admin', (f) ->
          f.name = 'Admin'

      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'

        @sequence 'number', (n) -> "Number ##{n}"

        @association 'role'

        @trait 'as admin', ->
          @association 'role', 'as admin'

      role       = RogueGirl.create('role', name: 'Custom')
      other_role = RogueGirl.create('role', name: 'Other')
      user       = RogueGirl.create('user', name: 'Josh', role: role)
      roles      = [role, other_role]

      expect(user.name).to.eql('Josh')
      expect(user.number).to.eql('Number #0')
      expect(user.role).to.eql(role)
      expect(user.role.name).to.eql('Custom')
      expect(role.users).to.eql([user])

      expect(roles[1].name).to.eql('Other')
      expect(roles[1].users).to.be.an('undefined')
