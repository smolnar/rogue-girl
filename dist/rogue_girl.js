// TODO (smolnar) examine other global exports
exports = typeof(global) !== 'undefined' ? global : this
;
(function() {
  exports.RogueGirl = (function() {
    function RogueGirl() {}

    RogueGirl.driver = null;

    RogueGirl.build = function() {
      return RogueGirl.Factory.build.apply(null, arguments);
    };

    RogueGirl.create = function() {
      return RogueGirl.Factory.create.apply(null, arguments);
    };

    RogueGirl.find = function(name, params) {
      return RogueGirl.driver.find(name, params);
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
  RogueGirl.VERSION = (function() {
    function VERSION() {}

    VERSION.MAJOR = 0;

    VERSION.MINOR = 0;

    VERSION.PATCH = 1;

    VERSION.PRE = 'beta';

    VERSION.STRING = function() {
      return "" + RogueGirl.VERSION.MAJOR + "." + RogueGirl.VERSION.MINOR + "." + RogueGirl.VERSION.PATCH + "." + RogueGirl.VERSION.PRE;
    };

    return VERSION;

  })();

}).call(this);
(function() {
  RogueGirl.Factory = (function() {
    function Factory() {}

    Factory.build = function() {
      return RogueGirl.Builder.build.apply(null, arguments);
    };

    Factory.create = function() {
      var record;
      record = RogueGirl.build.apply(null, arguments);
      RogueGirl.driver.save(record);
      return record;
    };

    Factory.createAssociation = function() {
      return RogueGirl.driver.associationFor.apply(null, arguments);
    };

    return Factory;

  })();

}).call(this);
(function() {
  RogueGirl.Builder = (function() {
    function Builder() {}

    Builder.build = function() {
      var attributes, callback, callbacks, name, params, record, traits, type, _i, _len;
      params = RogueGirl.Parser.parse(arguments);
      name = params.name;
      type = params.type;
      traits = params.traits;
      attributes = params.attributes;
      callbacks = RogueGirl.Builder.populate(name, attributes, traits);
      record = RogueGirl.driver.build(type, attributes);
      for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
        callback = callbacks[_i];
        callback(record);
      }
      return record;
    };

    Builder.populate = function(name, attributes, traits) {
      var definition;
      definition = RogueGirl.Definitions.of(name);
      if (!definition) {
        throw new Error("There is no definition for '" + name + "'");
      }
      return definition.buildAttributes(attributes, traits);
    };

    return Builder;

  })();

}).call(this);
(function() {
  RogueGirl.Parser = (function() {
    function Parser() {}

    Parser.parse = function(params) {
      var attributes, index, key, name, options, param, traits, type, value, _i, _len, _ref;
      name = params[0];
      if (typeof params[1] === 'object' && (params[1].type != null)) {
        options = params[1];
      }
      type = (options != null ? options.type : void 0) || name;
      traits = [];
      attributes = {};
      index = options != null ? 2 : 1;
      _ref = Array.prototype.slice.apply(params, [index, params.length]);
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
        name: name,
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
      var definition;
      definition = RogueGirl.Definitions.of(name);
      if (!definition) {
        throw new Error("There is no definition for '" + name + "'");
      }
      return this.attributes[name] = new RogueGirl.Association(definition.type, this.base.type, arguments);
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

    Definitions.clear = function() {
      return RogueGirl.Definitions.definitions = {};
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
    function Association(type, target, params) {
      this.type = type;
      this.target = target;
      this.params = params;
    }

    Association.prototype.build = function(attributes) {
      var parent, parent_id;
      parent = null;
      if (attributes[this.type]) {
        parent = attributes[this.type];
        delete attributes[this.type];
      } else {
        parent = RogueGirl.Factory.create.apply(null, this.params);
      }
      parent_id = parent.id != null ? parent.id : typeof parent.get === "function" ? parent.get('id') : void 0;
      if (parent_id == null) {
        throw new Error("Could not resolve 'parent_id' for #" + parent);
      }
      attributes[RogueGirl.driver.translateAssociation(this.type)] = parent_id;
      return (function(_this) {
        return function(child) {
          return RogueGirl.driver.createAssociation(parent, child, _this.target);
        };
      })(this);
    };

    return Association;

  })();

}).call(this);
(function() {
  RogueGirl.EmberStoreDriver = (function() {
    EmberStoreDriver.prototype.app = null;

    EmberStoreDriver.prototype.store = null;

    function EmberStoreDriver(app) {
      if (!app) {
        throw new Error('You have to provide a valid application');
      }
      this.app = app;
      this.store = this.app.__container__.lookup('store:main');
      if (!this.store) {
        throw new Error('You have to provide a valid store');
      }
    }

    EmberStoreDriver.prototype.build = function(type, attributes) {
      return Ember.run((function(_this) {
        return function() {
          return _this.store.createRecord(type, attributes);
        };
      })(this));
    };

    EmberStoreDriver.prototype.find = function(type, params) {
      return Ember.run((function(_this) {
        return function() {
          return _this.store.find(type, params);
        };
      })(this));
    };

    EmberStoreDriver.prototype.save = function(record) {
      Ember.run((function(_this) {
        return function() {
          return record.save();
        };
      })(this));
      return record;
    };

    EmberStoreDriver.prototype.translateAssociation = function(relation) {
      return "" + relation + "Id";
    };

    EmberStoreDriver.prototype.createAssociation = function(parent, child, target) {
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
