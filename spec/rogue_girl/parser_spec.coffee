#= require spec_helper

describe 'RogueGirl.Parser', ->
  describe '.parse', ->
    it 'parses params for definition', ->
      params = ['user', 'with code', name: 'Peter']

      params = RogueGirl.Parser.parse(params)

      expect(params.name).to.eql('user')
      expect(params.type).to.eql('user')
      expect(params.traits).to.eql(['with code'])
      expect(params.attributes).to.eql(name: 'Peter')

    it 'parses params with options', ->
      params = ['admin', type: 'User', 'with code', 'active', name: 'Peter']

      params = RogueGirl.Parser.parse(params)

      expect(params.name).to.eql('admin')
      expect(params.type).to.eql('User')
      expect(params.traits).to.eql(['with code', 'active'])
      expect(params.attributes).to.eql(name: 'Peter')
