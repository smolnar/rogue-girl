exports = typeof(global) !== 'undefined' ? global : this
;
(function() {
  exports.RogueGirl = (function() {
    function RogueGirl() {}

    RogueGirl.driver = null;

    RogueGirl.find = function(name, params) {
      return RogueGirl.driver.find(name, params);
    };

    RogueGirl.build = function() {
      return RogueGirl.Builder.create.apply(null, arguments);
    };

    RogueGirl.create = function() {
      var record;
      record = RogueGirl.build.apply(null, arguments);
      RogueGirl.driver.save(record);
      return record;
    };

    RogueGirl.define = function() {
      var callback, name, options;
      name = arguments[0];
      options = typeof arguments[1] === 'object' ? arguments[1] : {};
      callback = arguments[arguments.length - 1];
      return RogueGirl.Definitions.add(name, new RogueGirl.Definition(name, options, callback));
    };

    return RogueGirl;

  })();

}).call(this);
(function() {
  RogueGirl.Builder = (function() {
    function Builder() {}

    Builder.build = function(type, attributes, traits) {
      var definition;
      definition = RogueGirl.Definitions.of(type);
      if (!definition) {
        throw new Error("There is not definition for " + type);
      }
      return definition.buildAttributes(attributes, traits);
    };

    Builder.create = function() {
      var attributes, callback, callbacks, params, record, traits, type, _i, _len;
      params = RogueGirl.Parser.parse(arguments);
      type = params.type;
      traits = params.traits;
      attributes = params.attributes;
      callbacks = RogueGirl.Builder.build(type, attributes, traits);
      record = RogueGirl.driver.create(type, attributes);
      for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
        callback = callbacks[_i];
        callback(record);
      }
      return record;
    };

    return Builder;

  })();

}).call(this);
(function() {
  RogueGirl.Parser = (function() {
    function Parser() {}

    Parser.parse = function(params) {
      var attributes, key, param, traits, type, value, _i, _len, _ref;
      type = params[0];
      traits = [];
      attributes = {};
      _ref = Array.prototype.slice.call(params, [1, params.length - 1]);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        if (typeof param === 'string') {
          traits.push(param);
        } else {
          for (key in param) {
            value = param[key];
            attributes[key] = value;
          }
        }
      }
      return {
        type: type,
        traits: traits,
        attributes: attributes
      };
    };

    return Parser;

  })();

}).call(this);
(function() {
  RogueGirl.Definition = (function() {
    function Definition(name, options, callback) {
      this.name = name;
      this.type = options.type || name;
      this.callback = callback;
      this.attributes = {};
      this.traits = {};
      this.sequences = {};
      this.proxy = new RogueGirl.Definition.Proxy(this, this.attributes);
      this.proxy.define(function() {
        return this.sequence('id', function(n) {
          return n;
        });
      });
      this.proxy.define(this.callback);
    }

    Definition.prototype.buildAttributes = function(result, traits) {
      var attribute, attributes, callback, callbacks, name, trait, _, _i, _len, _ref, _ref1;
      callbacks = [];
      if (traits == null) {
        traits = [];
      }
      attributes = {};
      _ref = this.attributes;
      for (name in _ref) {
        attribute = _ref[name];
        attributes[name] = attribute;
      }
      for (_i = 0, _len = traits.length; _i < _len; _i++) {
        trait = traits[_i];
        _ref1 = this.traits[trait];
        for (name in _ref1) {
          attribute = _ref1[name];
          attributes[name] = attribute;
        }
      }
      for (_ in attributes) {
        attribute = attributes[_];
        callback = attribute.build(result);
        if (callback) {
          callbacks = callbacks.concat(callback);
        }
      }
      return callbacks;
    };

    return Definition;

  })();

  RogueGirl.Definition.Proxy = (function() {
    function Proxy(base, attributes) {
      this.base = base;
      this.attributes = attributes;
    }

    Proxy.prototype.define = function(callback) {
      var definitions, name, value;
      definitions = {};
      callback.call(this, definitions);
      for (name in definitions) {
        value = definitions[name];
        this.attributes[name] = new RogueGirl.Attribute(name, value);
      }
      return this.attributes;
    };

    Proxy.prototype.trait = function(name, callback) {
      this.proxy = new RogueGirl.Definition.Proxy(this.base, {});
      this.proxy.define(callback);
      return this.base.traits[name] = this.proxy.attributes;
    };

    Proxy.prototype.sequence = function(name, callback) {
      return this.define(function(f) {
        return f[name] = (function(_this) {
          return function() {
            var result, _base;
            result = callback((_base = _this.base.sequences)[name] != null ? _base[name] : _base[name] = 0);
            _this.base.sequences[name] += 1;
            return result;
          };
        })(this);
      });
    };

    Proxy.prototype.association = function(name) {
      return this.attributes[name] = new RogueGirl.Association(name, this.base.type, arguments);
    };

    return Proxy;

  })();

}).call(this);
(function() {
  RogueGirl.Definitions = (function() {
    function Definitions() {}

    Definitions.definitions = {};

    Definitions.add = function(name, definition) {
      return RogueGirl.Definitions.definitions[name] = definition;
    };

    Definitions.of = function(name) {
      return RogueGirl.Definitions.definitions[name];
    };

    return Definitions;

  })();

}).call(this);
(function() {
  RogueGirl.Attribute = (function() {
    function Attribute(name, object) {
      this.name = name;
      this.object = object;
    }

    Attribute.prototype.value = function() {
      if (typeof this.object === 'function') {
        return this.object();
      } else {
        return this.object;
      }
    };

    Attribute.prototype.build = function(attributes) {
      if (typeof attributes[this.name] === 'undefined') {
        attributes[this.name] = this.value();
      }
      return null;
    };

    return Attribute;

  })();

}).call(this);
(function() {
  RogueGirl.Association = (function() {
    function Association(name, target, params) {
      this.name = name;
      this.target = target;
      this.params = params;
    }

    Association.prototype.build = function(attributes) {
      var parent;
      parent = null;
      if (attributes[this.name]) {
        parent = attributes[this.name];
      } else {
        parent = RogueGirl.Builder.create.apply(null, this.params);
      }
      attributes[this.name] = parent.get('id');
      return (function(_this) {
        return function(child) {
          return RogueGirl.driver.associationFor(parent, child, _this.target);
        };
      })(this);
    };

    return Association;

  })();

}).call(this);
(function() {
  RogueGirl.EmberStoreDriver = (function() {
    function EmberStoreDriver() {}

    EmberStoreDriver.store = null;

    EmberStoreDriver.create = function(type, attributes) {
      return Ember.run((function(_this) {
        return function() {
          return EmberStoreDriver.store.push(type, attributes);
        };
      })(this));
    };

    EmberStoreDriver.find = function(type, params) {
      return Ember.run((function(_this) {
        return function() {
          return EmberStoreDriver.store.all(type, params);
        };
      })(this));
    };

    EmberStoreDriver.save = function(record) {
      return Ember.run((function(_this) {
        return function() {
          record.save();
          return record;
        };
      })(this));
    };

    EmberStoreDriver.associationFor = function(parent, child, target) {
      return Ember.run((function(_this) {
        return function() {
          var relation;
          relation = Ember.Inflector.inflector.pluralize(target);
          if (!parent.get(relation)) {
            throw new Error("Did you specify relation hasMany " + relation + " in " + (parent.constructor.toString()) + "?");
          }
          return parent.get(relation).pushObject(child);
        };
      })(this));
    };

    return EmberStoreDriver;

  })();

}).call(this);
(function() {


}).call(this);
