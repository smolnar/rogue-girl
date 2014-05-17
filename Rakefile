require "sprockets"

namespace :compile do
  assets = Sprockets::Environment.new
  assets.append_path 'src'
  assets.append_path 'spec'
  assets.append_path 'vendor'

  desc 'Compiles files for distribution'
  task :dist do
    assets['rogue_girl'].write_to 'dist/rogue_girl.js'
  end

  desc 'Compiles files for tests'
  task :spec do
    assets['rogue_girl_spec'].write_to 'dist/rogue_girl_spec.js'
  end
end
