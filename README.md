# dbmonster

This is a modified version of the original
[https://github.com/crcn/dbmonster](dbmonster) with the aim to be pluggable
and to provide a simple script time / frame metric.

A pure DOM implementation is provided, otherwise it can load adapters from
arbitrary urls.

## writing an adapter

Adapters should be self contained script files that call the global `register`
function with an object that satisfies the following signature:
```js
Adapter: {
  name: String,
  version: String,
  init: (data: Array<Object>, elem: Element) => void,
  cleanup: () => void,
  render: (data: Array<Object>) => void,
}
```

The runner will call the `init` function with a fresh set of `data` and an
`elem` that the adapter can use. The `cleanup` function should revert the
`elem` back to its original state and undo everything that the adapter might
have done to the document.

The `render` function is called (and profiled) with a fresh set of data every
frame.

Writing an adapter is really easy, just take a look at `adapters/dom.js`, which
implements dbmonster in pure DOM.

## helpers

To ease some of the boilerplate of writing an adapter, a global `Helpers`
object is provided with the following signature. Take a look at
`adapters/dom.js` for a usage example.
```js
Helpers: {
  countClassName: (count: Number) => String,
  sampleLength: (db: Object) => Number,
  elapsedClassName: (elapsed: Number) => String,
  formatElapsed: (elapsed: Number) => String,
}
```
