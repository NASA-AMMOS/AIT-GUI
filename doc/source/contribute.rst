Contributor Guides
==================

These guides provide information on BLISS GUI specific development practices. You should also review the `BLISS Contributor Guides <https://github.jpl.nasa.gov/pages/bliss/bliss-core/contribute.html>`_ for additional information.

Installation
------------

You should follow the developer installation instructions for BLISS Core in the `BLISS Contributor Guides <https://github.jpl.nasa.gov/pages/bliss/bliss-core/contribute.html>`_ before installing BLISS GUI.

To install BLISS GUI as a develop-mode package and install all relevant UI packages run:

.. code-block:: bash

   > pip install -e . --install-option="--with-ui-deps=True"

We recommend that you add the following line to your **postactivate** script for your BLISS virtual environment so that GUI-related developer binaries are easily accessible.

.. code-block:: bash

   > export PATH="/path/to/bliss-gui/bliss/gui/static/node_modules/.bin:$PATH"

Code Location
-------------

The Python backend code is located in **bliss/gui/__init__.py**.

The JavaScript frontend code is located in **bliss/gui/static**.

Frontend Build
--------------
The frontend uses Webpack to build/bundle code. The **build** script runs a minified and optimized build for releases. For development you will likely want to stick with the quicker **dev-build** .You can invoke a build with:

.. code-block:: bash

   > npm dev-build

Running webpack in "watch" mode can be helpful while you're coding on the UI. You can pass the **--watch** flag with:

.. code-block:: bash

   > npm dev-build -- --watch

Frontend Tests
--------------
You can run the project's unit tests with:

.. code-block:: bash

   > npm test

You can keep the tests on "watch" mode so they run each time you make a change to the code with:

.. code-block:: bash

   > npm test -- --watch
