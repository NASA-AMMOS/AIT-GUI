BLISS GUI
=========

Getting Started
---------------

You can read through the [Installation Page](https://github.jpl.nasa.gov/pages/bliss/bliss-gui/installation.html) for instruction on how to install BLISS GUI.

Developer FAQ
-------------

Python GUI code is present in `bliss/gui/__init__.py`. Frontend code for the GUI is present in `bliss/gui/static`.

### Webpack
The frontend uses Webpack to build/bundle code. The `build` script is set to run webpack with some useful flags. You can invoke a build with:

```
npm run build
```

Running webpack in "watch" mode can be helpful while you're coding on the UI. You can pass the `--watch` flag to the underlying NPM script with:

```
npm run build -- --watch
```

### Unit Tests
You can run the project's unit tests with:

```
npm test
```

You can keep the tests on "watch" mode so they run each time you make a change to the code with:

```
npm test -- --watch
```

Additional developer documentation is available in the [Contribution Guide](https://github.jpl.nasa.gov/pages/bliss/bliss-gui/contribute.html) file in the Sphinx docs.
