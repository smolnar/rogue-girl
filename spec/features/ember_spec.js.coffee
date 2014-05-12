#= require spec_helper

window.App = Ember.Application.create()

App.injectTestHelpers()
App.setupForTesting()

App.ApplicationAdapter = DS.LSAdapter.extend()

App.Role = DS.Model.extend(
  users: DS.hasMany('user')
)

App.User = DS.Model.extend(
  name:   DS.attr('string')
  number: DS.attr('string')
  role:   DS.belongsTo('role')
)

describe 'Ember', ->
  context 'with RogueGirl', ->
    beforeEach ->
      @driver = new RogueGirl.EmberStoreDriver(App)

      RogueGirl.driver = @driver

    afterEach ->
      Ember.run => App.reset()

    it 'builds a record', ->
      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'

        @sequence 'number', (n) -> "Number ##{n}"

        @trait 'as admin', (f) ->
          f.name = 'Admin'

      users = [RogueGirl.build('user'), RogueGirl.build('user', 'as admin')]

      expect(users[0].get('name')).to.eql('Peter')
      expect(users[0].get('number')).to.eql('Number #0')

      expect(users[1].get('name')).to.eql('Admin')
      expect(users[1].get('number')).to.eql('Number #1')

      users = @driver.store.all('user').toArray()

      expect(users.length).to.eql(2)

    it 'creates a record', ->
      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'

        @sequence 'number', (n) -> "Number ##{n}"

      RogueGirl.create('user')

      users = @driver.store.all('user').toArray()
      user  = users[0]

      expect(user.get('name')).to.eql('Peter')
      expect(user.get('number')).to.eql('Number #0')

      expect(users.length).to.eql(1)

    it 'creates a record with associations', ->
      RogueGirl.define 'role', (f) ->
        f.name = 'Basic'

      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'

        @sequence 'number', (n) -> "Number ##{n}"

        @association 'role'

        @trait 'as admin', ->
          @association 'role', 'as admin'

      RogueGirl.create('user')

      users = @driver.store.all('user').toArray()
      roles = @driver.store.all('role').toArray()

      user = users[0]
      role = roles[0]

      expect(user.get('name')).to.eql('Peter')
      expect(user.get('number')).to.eql('Number #0')
      expect(user.get('role')).to.eql(role)
      expect(user.get('role.name')).to.eql('Basic')
      expect(role.get('users').toArray()).to.eql([user])

      expect(users.length).to.eql(1)
      expect(roles.length).to.eql(1)

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

      RogueGirl.create('user', 'as admin', name: 'Josh')

      users = @driver.store.all('user').toArray()
      roles = @driver.store.all('role').toArray()

      user = users[0]
      role = roles[0]

      expect(user.get('name')).to.eql('Josh')
      expect(user.get('number')).to.eql('Number #0')
      expect(user.get('role')).to.eql(role)
      expect(user.get('role.name')).to.eql('Admin')
      expect(role.get('users').toArray()).to.eql([user])

      expect(users.length).to.eql(1)
      expect(roles.length).to.eql(1)

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

      RogueGirl.create('role', name: 'Other')

      role  = RogueGirl.create('role', name: 'Custom')

      RogueGirl.create('user', name: 'Josh', role: role)

      users = @driver.store.all('user').toArray()
      roles = @driver.store.all('role').toArray().sortBy('name')

      user = users[0]
      role = roles[0]

      expect(user.get('name')).to.eql('Josh')
      expect(user.get('number')).to.eql('Number #0')
      expect(user.get('role')).to.eql(role)
      expect(user.get('role.name')).to.eql('Custom')
      expect(role.get('users').toArray()).to.eql([user])

      Ember.run =>
        expect(roles[1].get('name')).to.eql('Other')
        expect(roles[1].get('users').toArray()).to.eql([])

      expect(roles.length).to.eql(2)
