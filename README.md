BLISS GUI
=========

Installation
------------

`bliss-gui` depends upon `bliss-core` for key functionality. Ensure that you have followed the `bliss-core` installation procedure before progressing to the `bliss-gui` installation. You need to install `bliss-gui` into the same `virtualenv` environment into which you installed `bliss-core`. Be sure to have it activated while following these instructions.

If you would like to install the UI for an end user you can skip all of the frontend dependency installation and install only the pre-bundled application. After cloning the repository, run the following from the project root:

```
pip install .
```

If you plan to do development work on the GUI you should install the repository in `develop` mode and install all of the dependencies necessary for a frontend build.

```
pip install -e . --install-option="--with-ui-deps=True"
```

### Virtualenv Configuration Example

The example virtualenv configuration example assumes an environment name of `bliss-gui`. Setting the PATH variable ensures that you can run `webpack` and `mocha` as listed below in the `Developer FAQ`.

```
if [ $VIRTUAL_ENV == "$HOME/.virtualenvs/bliss-gui" ] 
then
    export BLISS_CONFIG=<Path to repos>/bliss-core/config/config.yaml
    export BLISS_ROOT=<Path to repos/bliss-core
    export PATH="<Path to repos>bliss-gui/bliss/gui/static/node_modules/.bin:$PATH"
fi
```

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
