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

`pip install -e . --install-option="--with-ui-deps=True"`

Directory Layout
----------------

Developer FAQ
-------------
