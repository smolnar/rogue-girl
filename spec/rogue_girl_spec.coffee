#= require spec_helper
#= require_tree ./rogue_girl

describe 'RogueGirl', ->
  describe '#define', ->
    it 'creates definition for factory', ->
      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'
        f.email = 'peter@peter.com'

      definition = RogueGirl.Definitions.of 'user'

      expect(definition.name).to.eql('user')
      expect(definition.type).to.eql('user')
      expect(definition.attributes.name.value()).to.eql('Peter')
      expect(definition.attributes.email.value()).to.eql('peter@peter.com')

    it 'creates definition with traits', ->
      RogueGirl.define 'user', (f) ->
        f.name = 'Peter'
        f.email = 'peter@peter.com'

        @trait 'with permissions', (f) ->
          f.permission = 'super'
          f.role       = 'admin'

      definition = RogueGirl.Definitions.of 'user'

      expect(definition.name).to.eql('user')
      expect(definition.type).to.eql('user')
      expect(definition.attributes.name.value()).to.eql('Peter')
      expect(definition.attributes.email.value()).to.eql('peter@peter.com')
      expect(definition.traits['with permissions'].permission.value()).to.eql('super')
      expect(definition.traits['with permissions'].role.value()).to.eql('admin')

  describe '#build', ->
    beforeEach ->
      @builder = mock('RogueGirl.Builder', build: ->)

    it 'builds an record', ->
      @builder
        .expects('build')
        .withExactArgs('user', 'trait 1', 'trait 2', name: 'Peter')
        .once()

      RogueGirl.build('user', 'trait 1', 'trait 2', name: 'Peter')

  describe '#create', ->
    beforeEach ->
      @builder = mock('RogueGirl.Builder', build: ->)
      @driver  = mock('RogueGirl.driver', save: ->)

    it 'creates an record', ->
      @record = { id: 1, name: 'Peter' }

      @builder
        .expects('build')
        .withExactArgs('user', 'trait 1', 'trait 2', name: 'Peter')
        .returns(@record)
        .once()

      @driver
        .expects('save')
        .withExactArgs(@record)
        .returns(@record)

      RogueGirl.create('user', 'trait 1', 'trait 2', name: 'Peter')
