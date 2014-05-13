# RogueGirl &ndash; JavaScript Factory

RogueGirl is factory for you models, objects or anything in JavaScript following similar, full-features usage of [FactoryGirl](https://github.com/thoughtbot/factory_girl).

*Note: Library is currently in development state. API might change as we add new drivers or propose architecture changes.*

## Features

Let's define a model &ndash; *User*.

```coffeescript
RougeGirl.define 'user', (f) ->
 f.name = 'Peter'
 
# ...

# Let's create records
user = RogueGirl.create 'user'
user = RogueGirl.create 'user', name: 'Josh'
````

We want some fields to be unique and change with every instance. Make use of sequences.


```coffeescript
RougeGirl.define 'user', (f) ->
 f.name = 'Peter'
 
 @sequence 'number', (n) -> "Number ##{n}"
````

Do you want to have customized states of the records? Let's be dry and use traits.

```coffeescript
RougeGirl.define 'user', (f) ->
 f.name = 'Peter'
 
 @sequence 'number', (n) -> "Number ##{n}"
 
 @trait 'as admin', (f) ->
   f.name = 'Admin'
   
# ...

# Create a record with trait

user = RogueGirl.create 'user', 'as admin'
````

Do you have a relation model? Don't worry, we use associations.

```coffeescript
RogueGirl.define 'role', (f) ->
  f.name = 'Basic'
  
  @trait 'as admin', ->
    f.name = 'Admin'

# ....
    
RougeGirl.define 'user', (f) ->
 f.name = 'Peter'
 
 @association 'role'
 
 @trait 'as admin', (f) ->
   @association 'role', 'as admin'

# ....

# Build a record with association
user = RogueGirl.create 'user'

# Note: If you use Ember, you can do something like this
user.get('role.name') # => 'Basic'
user.get('role.users') # => [user]


# Build a record with a custom association, without creating a new one
role = RogueGirl.create 'role', name: 'Custom'
user = RogueGirl.create 'user', role: role

role.get('users') # => [user]
````

## Development

Node and Bower are required.

Install Node and Bower packages.

```
node install && bower install
```

Build and run tests

```
make all
```

Open `localhost:7357` and enjoy.

## On the menu

* Before and After callbacks
* More drivers

## Contributing

1. Fork it
2. Create your feature branch `git checkout -b new-feature`
3. Commit your changes `git commit -am 'Added some feature'`
4. Push to the branch `git push origin new-feature`
5. Create new Pull Request

## License

The MIT License (MIT)

Copyright (c) 2013 Samuel Molnár

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


