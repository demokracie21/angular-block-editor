# angular-block-editor [![Bower version](https://badge.fury.io/bo/angular-block-editor.svg)](http://badge.fury.io/bo/angular-block-editor)

Extensible block editor component for AngularJS.

It is built using:

* [Angular](https://angular.io/) - browser js framework
* [Less](http://lesscss.org/) - CSS preprocessor
* [NodeJS](nodejs.org)/[npm](npmjs.com) - server side javascript / nodejs packaging system

## Usage

To see how it's used, have look at the files in the `examples`
directory.

To see the examples in your browser, run

```bash
npm install
gulp connect
```
and then visit [http://localhost:8080](http://localhost:8080).

### Browser

Include `angular-block-editor.min.js` and `angular-block-editor.css`.

### Bower

Run `bower install angular-block-editor`.

### NPM

Run `npm install angular-block-editor`.

### Webpack

Install using NPM as described above and then require in your code using:

`require('angular-block-editor')`

If you want to include basic styles too, use:

`require('angular-block-editor/dist/angular-block-editor.css')`

## Development

When developing locally, `npm link angular-block-editor` is sufficient.

When you need to push it to servers, don't forget to tag the release, push
it to the git repository and finally update the dependency in the target project.

## Versioning

We stick to [semver](http://semver.org). Create tag for each version.
