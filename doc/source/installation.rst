AIT GUI Installation
====================

This guide will show you how to install AIT GUI. It assumes that you have followed the `AIT Core Installation and Configuration Guide <https://github.jpl.nasa.gov/pages/bliss/bliss-core/installation.html>`_ and ended up with a working AIT Core install. You can install AIT GUI from a checkout of the code or from the BLISS PyPi server. Having a checkout of the code can be handy if you want to view the source or make changes. Installing from PyPi keeps your system clutter free since you don't have a copy of the code base around. Either choice will work fine!

From Code Checkout
------------------

Clone the repository from JPL Github

.. code-block:: bash

   > git clone https://github.jpl.nasa.gov/bliss/bliss-gui.git
   > cd bliss-gui

Find the latest tagged version of the code and check it out

.. code-block:: bash

   > git tag
   > git checkout <Most recent version number output by the previous command>

Run the following to install AIT GUI:

.. code-block:: bash

   > pip install . --process-dependency-links

From BLISS PyPi
---------------

If you have access to the JPL network you can install AIT GUI directly from the BLISS PyPi server.

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

Upgrading an Installation
-------------------------

When a new version of AIT GUI is released you'll most likely want to upgrade your environment. You'll need to upgrade differently depending on how you installed the system.

Installed from Code Checkout
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Navigate back to the directory where you checked out the code and run the following commands to pull the latest code, checkout the latest tag, and upgrade your install.

.. code-block:: bash

   > git checkout master
   > git pull
   > git tag
   > git checkout <Most recent version number output by the previous command>
   > pip install . --process-dependency-links --upgrade

Installed from PyPi
^^^^^^^^^^^^^^^^^^^

Run the following to upgrade to the latest AIT GUI (and AIT Core) versions.

.. code-block:: bash

   > pip install bliss-gui --extra-index-url https://bliss.jpl.nasa.gov/pypi/simple/ --process-dependency-links --upgrade
