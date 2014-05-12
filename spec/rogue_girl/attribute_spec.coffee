#= require spec_helper

describe 'RogueGirl.Attribute', ->
  describe '#build', ->
    it 'builds an attribute with value', ->
      attribute = new RogueGirl.Attribute('user', 'Peter')

      expect(attribute.name).to.eql('user')
      expect(attribute.value()).to.eql('Peter')

      attributes = {}

      attribute.build(attributes)
      expect(attributes).to.eql(user: 'Peter')

    it 'builds an attribute with function', ->
      n = 0

      attribute = new RogueGirl.Attribute('user', -> "Peter ##{n += 1}")

      expect(attribute.name).to.eql('user')

      attributes = {}

      attribute.build(attributes)
      expect(attributes).to.eql(user: 'Peter #1')

      attributes = {}

      attribute.build(attributes)
      expect(attributes).to.eql(user: 'Peter #2')
