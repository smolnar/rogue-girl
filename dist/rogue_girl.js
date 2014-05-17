/*
Copyright (c) 2010 Ryan Schuft (ryan.schuft@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
  This code is based in part on the work done in Ruby to support
  infection as part of Ruby on Rails in the ActiveSupport's Inflector
  and Inflections classes.  It was initally ported to Javascript by
  Ryan Schuft (ryan.schuft@gmail.com) in 2007.

  The code is available at http://code.google.com/p/inflection-js/

  The basic usage is:
    1. Include this script on your web page.
    2. Call functions on any String object in Javascript

  Currently implemented functions:

    String.pluralize(plural) == String
      renders a singular English language noun into its plural form
      normal results can be overridden by passing in an alternative

    String.singularize(singular) == String
      renders a plural English language noun into its singular form
      normal results can be overridden by passing in an alterative

    String.camelize(lowFirstLetter) == String
      renders a lower case underscored word into camel case
      the first letter of the result will be upper case unless you pass true
      also translates "/" into "::" (underscore does the opposite)

    String.underscore() == String
      renders a camel cased word into words seperated by underscores
      also translates "::" back into "/" (camelize does the opposite)

    String.humanize(lowFirstLetter) == String
      renders a lower case and underscored word into human readable form
      defaults to making the first letter capitalized unless you pass true

    String.capitalize() == String
      renders all characters to lower case and then makes the first upper

    String.dasherize() == String
      renders all underbars and spaces as dashes

    String.titleize() == String
      renders words into title casing (as for book titles)

    String.demodulize() == String
      renders class names that are prepended by modules into just the class

    String.tableize() == String
      renders camel cased singular words into their underscored plural form

    String.classify() == String
      renders an underscored plural word into its camel cased singular form

    String.foreign_key(dropIdUbar) == String
      renders a class name (camel cased singular noun) into a foreign key
      defaults to seperating the class from the id with an underbar unless
      you pass true

    String.ordinalize() == String
      renders all numbers found in the string into their sequence like "22nd"
*/

/*
  This sets up a container for some constants in its own namespace
  We use the window (if available) to enable dynamic loading of this script
  Window won't necessarily exist for non-browsers.
*/

if (window && !window.InflectionJS)
{
    window.InflectionJS = null;
}

/*
  This sets up some constants for later use
  This should use the window namespace variable if available
*/
InflectionJS =
{
    /*
      This is a list of nouns that use the same form for both singular and plural.
      This list should remain entirely in lower case to correctly match Strings.
    */
    uncountable_words: [
        'equipment', 'information', 'rice', 'money', 'species', 'series',
        'fish', 'sheep', 'moose', 'deer', 'news'
    ],

    /*
      These rules translate from the singular form of a noun to its plural form.
    */
    plural_rules: [
        [new RegExp('(m)an$', 'gi'),                 '$1en'],
        [new RegExp('(pe)rson$', 'gi'),              '$1ople'],
        [new RegExp('(child)$', 'gi'),               '$1ren'],
        [new RegExp('^(ox)$', 'gi'),                 '$1en'],
        [new RegExp('(ax|test)is$', 'gi'),           '$1es'],
        [new RegExp('(octop|vir)us$', 'gi'),         '$1i'],
        [new RegExp('(alias|status)$', 'gi'),        '$1es'],
        [new RegExp('(bu)s$', 'gi'),                 '$1ses'],
        [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
        [new RegExp('([ti])um$', 'gi'),              '$1a'],
        [new RegExp('sis$', 'gi'),                   'ses'],
        [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'),  '$1$2ves'],
        [new RegExp('(hive)$', 'gi'),                '$1s'],
        [new RegExp('([^aeiouy]|qu)y$', 'gi'),       '$1ies'],
        [new RegExp('(x|ch|ss|sh)$', 'gi'),          '$1es'],
        [new RegExp('(matr|vert|ind)ix|ex$', 'gi'),  '$1ices'],
        [new RegExp('([m|l])ouse$', 'gi'),           '$1ice'],
        [new RegExp('(quiz)$', 'gi'),                '$1zes'],
        [new RegExp('s$', 'gi'),                     's'],
        [new RegExp('$', 'gi'),                      's']
    ],

    /*
      These rules translate from the plural form of a noun to its singular form.
    */
    singular_rules: [
        [new RegExp('(m)en$', 'gi'),                                                       '$1an'],
        [new RegExp('(pe)ople$', 'gi'),                                                    '$1rson'],
        [new RegExp('(child)ren$', 'gi'),                                                  '$1'],
        [new RegExp('([ti])a$', 'gi'),                                                     '$1um'],
        [new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$','gi'), '$1$2sis'],
        [new RegExp('(hive)s$', 'gi'),                                                     '$1'],
        [new RegExp('(tive)s$', 'gi'),                                                     '$1'],
        [new RegExp('(curve)s$', 'gi'),                                                    '$1'],
        [new RegExp('([lr])ves$', 'gi'),                                                   '$1f'],
        [new RegExp('([^fo])ves$', 'gi'),                                                  '$1fe'],
        [new RegExp('([^aeiouy]|qu)ies$', 'gi'),                                           '$1y'],
        [new RegExp('(s)eries$', 'gi'),                                                    '$1eries'],
        [new RegExp('(m)ovies$', 'gi'),                                                    '$1ovie'],
        [new RegExp('(x|ch|ss|sh)es$', 'gi'),                                              '$1'],
        [new RegExp('([m|l])ice$', 'gi'),                                                  '$1ouse'],
        [new RegExp('(bus)es$', 'gi'),                                                     '$1'],
        [new RegExp('(o)es$', 'gi'),                                                       '$1'],
        [new RegExp('(shoe)s$', 'gi'),                                                     '$1'],
        [new RegExp('(cris|ax|test)es$', 'gi'),                                            '$1is'],
        [new RegExp('(octop|vir)i$', 'gi'),                                                '$1us'],
        [new RegExp('(alias|status)es$', 'gi'),                                            '$1'],
        [new RegExp('^(ox)en', 'gi'),                                                      '$1'],
        [new RegExp('(vert|ind)ices$', 'gi'),                                              '$1ex'],
        [new RegExp('(matr)ices$', 'gi'),                                                  '$1ix'],
        [new RegExp('(quiz)zes$', 'gi'),                                                   '$1'],
        [new RegExp('s$', 'gi'),                                                           '']
    ],

    /*
      This is a list of words that should not be capitalized for title case
    */
    non_titlecased_words: [
        'and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of', 'at',
        'by', 'from', 'into', 'on', 'onto', 'off', 'out', 'in', 'over',
        'with', 'for'
    ],

    /*
      These are regular expressions used for converting between String formats
    */
    id_suffix: new RegExp('(_ids|_id)$', 'g'),
    underbar: new RegExp('_', 'g'),
    space_or_underbar: new RegExp('[\ _]', 'g'),
    uppercase: new RegExp('([A-Z])', 'g'),
    underbar_prefix: new RegExp('^_'),
    
    /*
      This is a helper method that applies rules based replacement to a String
      Signature:
        InflectionJS.apply_rules(str, rules, skip, override) == String
      Arguments:
        str - String - String to modify and return based on the passed rules
        rules - Array: [RegExp, String] - Regexp to match paired with String to use for replacement
        skip - Array: [String] - Strings to skip if they match
        override - String (optional) - String to return as though this method succeeded (used to conform to APIs)
      Returns:
        String - passed String modified by passed rules
      Examples:
        InflectionJS.apply_rules("cows", InflectionJs.singular_rules) === 'cow'
    */
    apply_rules: function(str, rules, skip, override)
    {
        if (override)
        {
            str = override;
        }
        else
        {
            var ignore = (skip.indexOf(str.toLowerCase()) > -1);
            if (!ignore)
            {
                for (var x = 0; x < rules.length; x++)
                {
                    if (str.match(rules[x][0]))
                    {
                        str = str.replace(rules[x][0], rules[x][1]);
                        break;
                    }
                }
            }
        }
        return str;
    }
};

/*
  This lets us detect if an Array contains a given element
  Signature:
    Array.indexOf(item, fromIndex, compareFunc) == Integer
  Arguments:
    item - Object - object to locate in the Array
    fromIndex - Integer (optional) - starts checking from this position in the Array
    compareFunc - Function (optional) - function used to compare Array item vs passed item
  Returns:
    Integer - index position in the Array of the passed item
  Examples:
    ['hi','there'].indexOf("guys") === -1
    ['hi','there'].indexOf("hi") === 0
*/
if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function(item, fromIndex, compareFunc)
    {
        if (!fromIndex)
        {
            fromIndex = -1;
        }
        var index = -1;
        for (var i = fromIndex; i < this.length; i++)
        {
            if (this[i] === item || compareFunc && compareFunc(this[i], item))
            {
                index = i;
                break;
            }
        }
        return index;
    };
}

/*
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if (!String.prototype._uncountable_words)
{
    String.prototype._uncountable_words = InflectionJS.uncountable_words;
}

/*
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if (!String.prototype._plural_rules)
{
    String.prototype._plural_rules = InflectionJS.plural_rules;
}

/*
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if (!String.prototype._singular_rules)
{
    String.prototype._singular_rules = InflectionJS.singular_rules;
}

/*
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if (!String.prototype._non_titlecased_words)
{
    String.prototype._non_titlecased_words = InflectionJS.non_titlecased_words;
}

/*
  This function adds plurilization support to every String object
    Signature:
      String.pluralize(plural) == String
    Arguments:
      plural - String (optional) - overrides normal output with said String
    Returns:
      String - singular English language nouns are returned in plural form
    Examples:
      "person".pluralize() == "people"
      "octopus".pluralize() == "octopi"
      "Hat".pluralize() == "Hats"
      "person".pluralize("guys") == "guys"
*/
if (!String.prototype.pluralize)
{
    String.prototype.pluralize = function(plural)
    {
        return InflectionJS.apply_rules(
            this,
            this._plural_rules,
            this._uncountable_words,
            plural
        );
    };
}

/*
  This function adds singularization support to every String object
    Signature:
      String.singularize(singular) == String
    Arguments:
      singular - String (optional) - overrides normal output with said String
    Returns:
      String - plural English language nouns are returned in singular form
    Examples:
      "people".singularize() == "person"
      "octopi".singularize() == "octopus"
      "Hats".singularize() == "Hat"
      "guys".singularize("person") == "person"
*/
if (!String.prototype.singularize)
{
    String.prototype.singularize = function(singular)
    {
        return InflectionJS.apply_rules(
            this,
            this._singular_rules,
            this._uncountable_words,
            singular
        );
    };
}

/*
  This function adds camelization support to every String object
    Signature:
      String.camelize(lowFirstLetter) == String
    Arguments:
      lowFirstLetter - boolean (optional) - default is to capitalize the first
        letter of the results... passing true will lowercase it
    Returns:
      String - lower case underscored words will be returned in camel case
        additionally '/' is translated to '::'
    Examples:
      "message_properties".camelize() == "MessageProperties"
      "message_properties".camelize(true) == "messageProperties"
*/
if (!String.prototype.camelize)
{
     String.prototype.camelize = function(lowFirstLetter)
     {
        var str = this.toLowerCase();
        var str_path = str.split('/');
        for (var i = 0; i < str_path.length; i++)
        {
            var str_arr = str_path[i].split('_');
            var initX = ((lowFirstLetter && i + 1 === str_path.length) ? (1) : (0));
            for (var x = initX; x < str_arr.length; x++)
            {
                str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1);
            }
            str_path[i] = str_arr.join('');
        }
        str = str_path.join('::');
        return str;
    };
}

/*
  This function adds underscore support to every String object
    Signature:
      String.underscore() == String
    Arguments:
      N/A
    Returns:
      String - camel cased words are returned as lower cased and underscored
        additionally '::' is translated to '/'
    Examples:
      "MessageProperties".camelize() == "message_properties"
      "messageProperties".underscore() == "message_properties"
*/
if (!String.prototype.underscore)
{
     String.prototype.underscore = function()
     {
        var str = this;
        var str_path = str.split('::');
        for (var i = 0; i < str_path.length; i++)
        {
            str_path[i] = str_path[i].replace(InflectionJS.uppercase, '_$1');
            str_path[i] = str_path[i].replace(InflectionJS.underbar_prefix, '');
        }
        str = str_path.join('/').toLowerCase();
        return str;
    };
}

/*
  This function adds humanize support to every String object
    Signature:
      String.humanize(lowFirstLetter) == String
    Arguments:
      lowFirstLetter - boolean (optional) - default is to capitalize the first
        letter of the results... passing true will lowercase it
    Returns:
      String - lower case underscored words will be returned in humanized form
    Examples:
      "message_properties".humanize() == "Message properties"
      "message_properties".humanize(true) == "message properties"
*/
if (!String.prototype.humanize)
{
    String.prototype.humanize = function(lowFirstLetter)
    {
        var str = this.toLowerCase();
        str = str.replace(InflectionJS.id_suffix, '');
        str = str.replace(InflectionJS.underbar, ' ');
        if (!lowFirstLetter)
        {
            str = str.capitalize();
        }
        return str;
    };
}

/*
  This function adds capitalization support to every String object
    Signature:
      String.capitalize() == String
    Arguments:
      N/A
    Returns:
      String - all characters will be lower case and the first will be upper
    Examples:
      "message_properties".capitalize() == "Message_properties"
      "message properties".capitalize() == "Message properties"
*/
if (!String.prototype.capitalize)
{
    String.prototype.capitalize = function()
    {
        var str = this.toLowerCase();
        str = str.substring(0, 1).toUpperCase() + str.substring(1);
        return str;
    };
}

/*
  This function adds dasherization support to every String object
    Signature:
      String.dasherize() == String
    Arguments:
      N/A
    Returns:
      String - replaces all spaces or underbars with dashes
    Examples:
      "message_properties".capitalize() == "message-properties"
      "Message Properties".capitalize() == "Message-Properties"
*/
if (!String.prototype.dasherize)
{
    String.prototype.dasherize = function()
    {
        var str = this;
        str = str.replace(InflectionJS.space_or_underbar, '-');
        return str;
    };
}

/*
  This function adds titleize support to every String object
    Signature:
      String.titleize() == String
    Arguments:
      N/A
    Returns:
      String - capitalizes words as you would for a book title
    Examples:
      "message_properties".titleize() == "Message Properties"
      "message properties to keep".titleize() == "Message Properties to Keep"
*/
if (!String.prototype.titleize)
{
    String.prototype.titleize = function()
    {
        var str = this.toLowerCase();
        str = str.replace(InflectionJS.underbar, ' ');
        var str_arr = str.split(' ');
        for (var x = 0; x < str_arr.length; x++)
        {
            var d = str_arr[x].split('-');
            for (var i = 0; i < d.length; i++)
            {
                if (this._non_titlecased_words.indexOf(d[i].toLowerCase()) < 0)
                {
                    d[i] = d[i].capitalize();
                }
            }
            str_arr[x] = d.join('-');
        }
        str = str_arr.join(' ');
        str = str.substring(0, 1).toUpperCase() + str.substring(1);
        return str;
    };
}

/*
  This function adds demodulize support to every String object
    Signature:
      String.demodulize() == String
    Arguments:
      N/A
    Returns:
      String - removes module names leaving only class names (Ruby style)
    Examples:
      "Message::Bus::Properties".demodulize() == "Properties"
*/
if (!String.prototype.demodulize)
{
    String.prototype.demodulize = function()
    {
        var str = this;
        var str_arr = str.split('::');
        str = str_arr[str_arr.length - 1];
        return str;
    };
}

/*
  This function adds tableize support to every String object
    Signature:
      String.tableize() == String
    Arguments:
      N/A
    Returns:
      String - renders camel cased words into their underscored plural form
    Examples:
      "MessageBusProperty".tableize() == "message_bus_properties"
*/
if (!String.prototype.tableize)
{
    String.prototype.tableize = function()
    {
        var str = this;
        str = str.underscore().pluralize();
        return str;
    };
}

/*
  This function adds classification support to every String object
    Signature:
      String.classify() == String
    Arguments:
      N/A
    Returns:
      String - underscored plural nouns become the camel cased singular form
    Examples:
      "message_bus_properties".classify() == "MessageBusProperty"
*/
if (!String.prototype.classify)
{
    String.prototype.classify = function()
    {
        var str = this;
        str = str.camelize().singularize();
        return str;
    };
}

/*
  This function adds foreign key support to every String object
    Signature:
      String.foreign_key(dropIdUbar) == String
    Arguments:
      dropIdUbar - boolean (optional) - default is to seperate id with an
        underbar at the end of the class name, you can pass true to skip it
    Returns:
      String - camel cased singular class names become underscored with id
    Examples:
      "MessageBusProperty".foreign_key() == "message_bus_property_id"
      "MessageBusProperty".foreign_key(true) == "message_bus_propertyid"
*/
if (!String.prototype.foreign_key)
{
    String.prototype.foreign_key = function(dropIdUbar)
    {
        var str = this;
        str = str.demodulize().underscore() + ((dropIdUbar) ? ('') : ('_')) + 'id';
        return str;
    };
}

/*
  This function adds ordinalize support to every String object
    Signature:
      String.ordinalize() == String
    Arguments:
      N/A
    Returns:
      String - renders all found numbers their sequence like "22nd"
    Examples:
      "the 1 pitch".ordinalize() == "the 1st pitch"
*/
if (!String.prototype.ordinalize)
{
    String.prototype.ordinalize = function()
    {
        var str = this;
        var str_arr = str.split(' ');
        for (var x = 0; x < str_arr.length; x++)
        {
            var i = parseInt(str_arr[x]);
            if (i === NaN)
            {
                var ltd = str_arr[x].substring(str_arr[x].length - 2);
                var ld = str_arr[x].substring(str_arr[x].length - 1);
                var suf = "th";
                if (ltd != "11" && ltd != "12" && ltd != "13")
                {
                    if (ld === "1")
                    {
                        suf = "st";
                    }
                    else if (ld === "2")
                    {
                        suf = "nd";
                    }
                    else if (ld === "3")
                    {
                        suf = "rd";
                    }
                }
                str_arr[x] += suf;
            }
        }
        str = str_arr.join(' ');
        return str;
    };
}
;
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

    VERSION.MINOR = 2;

    VERSION.PATCH = 1;

    VERSION.STRING = function() {
      return "" + RogueGirl.VERSION.MAJOR + "." + RogueGirl.VERSION.MINOR + "." + RogueGirl.VERSION.PATCH;
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

    return Factory;

  })();

}).call(this);
(function() {
  RogueGirl.Builder = (function() {
    function Builder() {}

    Builder.build = function() {
      var attributes, name, params, traits, type;
      params = RogueGirl.Parser.parse(arguments);
      name = params.name;
      type = params.type;
      traits = params.traits;
      attributes = params.attributes;
      RogueGirl.Builder.populate(name, attributes, traits);
      return RogueGirl.driver.build(type, attributes);
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
      this.sequences = {
        id: 1
      };
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
      return this.attributes[name] = new RogueGirl.Association(definition.name, definition.type, this.base.type, arguments);
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
    function Association(name, parent, child, params) {
      this.name = name;
      this.parent = parent;
      this.child = child;
      this.params = params;
    }

    Association.prototype.build = function(attributes) {
      var parent_id, record;
      record = null;
      if (attributes[this.name]) {
        record = attributes[this.name];
        delete attributes[this.name];
      } else {
        record = RogueGirl.Factory.create.apply(null, this.params);
      }
      parent_id = record.id != null ? record.id : typeof record.get === "function" ? record.get('id') : void 0;
      if (parent_id == null) {
        throw new Error("Could not resolve 'parent_id' for #" + record);
      }
      return attributes[this.parent] = {
        __association__: {
          parent: this.parent,
          child: this.child,
          record: record
        }
      };
    };

    return Association;

  })();

}).call(this);
(function() {
  RogueGirl.AbstractDriver = (function() {
    function AbstractDriver() {}

    AbstractDriver.prototype.build = function() {
      throw new Error();
    };

    AbstractDriver.prototype.save = function() {
      throw new Error();
    };

    AbstractDriver.prototype.extractAssociations = function(attributes) {
      var associations, name, value;
      associations = [];
      for (name in attributes) {
        value = attributes[name];
        if ((value != null) && (value.__association__ != null)) {
          associations.push(value.__association__);
          delete attributes[name];
        }
      }
      return associations;
    };

    return AbstractDriver;

  })();

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RogueGirl.DefaultDriver = (function(_super) {
    __extends(DefaultDriver, _super);

    function DefaultDriver() {
      return DefaultDriver.__super__.constructor.apply(this, arguments);
    }

    DefaultDriver.prototype.build = function(type, attributes) {
      var association, associations, record, relation, _base, _i, _len;
      associations = this.extractAssociations(attributes);
      record = attributes;
      for (_i = 0, _len = associations.length; _i < _len; _i++) {
        association = associations[_i];
        record[association.parent] = association.record;
        relation = association.child.pluralize();
        if ((_base = association.record)[relation] == null) {
          _base[relation] = [];
        }
        association.record[relation].push(record);
      }
      return record;
    };

    DefaultDriver.prototype.save = function(record) {
      return record;
    };

    return DefaultDriver;

  })(RogueGirl.AbstractDriver);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RogueGirl.EmberStoreDriver = (function(_super) {
    __extends(EmberStoreDriver, _super);

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
      var associations;
      associations = this.extractAssociations(attributes);
      return Ember.run((function(_this) {
        return function() {
          var association, record, relation, _i, _len;
          record = _this.store.createRecord(type, attributes);
          for (_i = 0, _len = associations.length; _i < _len; _i++) {
            association = associations[_i];
            record.set(association.parent, association.record);
            relation = association.child.pluralize();
            association.record.get(relation).pushObject(record);
          }
          return record;
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

    return EmberStoreDriver;

  })(RogueGirl.AbstractDriver);

}).call(this);
(function() {


}).call(this);
