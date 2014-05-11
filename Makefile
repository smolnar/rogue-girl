all: clean build test

build:
	rake compile:dist

clean:
	rm dist/*.js

test:
	rake compile:spec && testem
	rm dist/*_spec.js
