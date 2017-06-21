BLISS GUI Installation
======================

This guide will show you how to install BLISS GUI. It assumes that you have followed the `BLISS Core Installation and Configuration Guide <https://github.jpl.nasa.gov/pages/bliss/bliss-core/installation.html>`_ and ended up with a working BLISS Core install.

From Code
---------

Clone the repository from JPL Github

.. code-block:: bash

   > git clone https://github.jpl.nasa.gov/bliss/bliss-gui.git
   > cd bliss-gui

Run the following to install BLISS GUI:

.. code-block:: bash

   > pip install . --process-dependency-links

From BLISS PyPi
---------------

If you have access to the JPL network you can install BLISS GUI directly from the BLISS PyPi server.

.. code-block:: bash

   > pip install bliss-gui --extra-index-url https://bliss.jpl.nasa.gov/pypi/simple/ --process-dependency-links

Check Installation
------------------

Now that your installation has finished let's check that everything works as expected.

.. code-block:: bash

   # Test that you can properly import the bliss.core package.
   > python -c "import bliss.gui"

If the last command **doesn't** generate any errors your installation is all set! If you see an error as shown below make sure to activate your virtual environment first.

.. code-block:: bash

   > python -c "import bliss.gui"
   Traceback (most recent call last):
     File "<string>", line 1, in <module>
   ImportError: No module named bliss.gui
