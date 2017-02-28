BLISS GUI
=========

Installation
------------
If you would like to install the UI for an end user you can skip all of the frontend dependency installation and install only the pre-bundled application. After cloning the repository, run the following from the project root:

```
pip install . --extra-index-url https://bliss.jpl.nasa.gov/pypi/simple/
```

If you plan to do development work on the GUI you should install the repository in `develop` mode and install all of the dependencies necessary for a frontend build. 

```
pip install -e . --extra-index-url https://bliss.jpl.nasa.gov/pypi/simple && pip install -e . --no-deps --force-reinstall --upgrade --install-option="--with-ui-deps=True"
```

The above will install `bliss-core` for you. If you wish you can install `bliss-core` manually first and then install just the GUI with the below command. This allows you to have an editable checkout of `bliss-core` available for development.

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
