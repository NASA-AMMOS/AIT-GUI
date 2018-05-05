New Project Setup
=================

The following documentation will teach you how to get started using AIT GUI to build a MOS website for your project. The guide assumes that you've created a repository in which your project's GUI code will reside and that it is a Python based project. It also assumes that you've run through the `AIT Core New Project Setup <https://ait-core.readthedocs.io/en/latest/project_setup.html>`_ guide as well.

Note, we're using the following directory layout in this example. You can use it as a reference to understand why we have paths specified the way we do:

.. code-block:: bash

   myexamplegui/
   ├── html
   │   └── index.html
   └── setup.py

Add AIT GUI to Project Dependencies
-----------------------------------

You'll need to add AIT GUI to either your **requirements.txt** file or your **setup.py** file.

If you use a requirements file for specifying dependencies:

.. code-block:: bash

   ait-gui==1.0.0

If you use **setup.py** for specifying dependencies:

.. code-block:: bash

   install_requires = [
       ait-gui==1.0.0
   ],

Creating a Simple Index File
----------------------------

Now that we are depending on AIT GUI let's get a simple index page up and running. The following simple page will give us something to look at once we get the GUI started:

.. code-block:: html

   <!doctype html>
   <head>
     <link rel="stylesheet" href="ait/gui/static/build/ait.bundle.css">
     <script src="ait/gui/static/build/ait.bundle.js"></script>
   </head>
   <body>

   <div class="navbar navbar-inverse navbar-fixed-top">
     <div class="container">
       <div class="navbar-header">
         <a class="navbar-brand" href="#">My Example GUI</a><br>
       </div>
     </div>
   </div>

   <div class="container">
     <ait-tabset class="nav-tabs">
       <ait-tab title="Welcome">
         <h1>Welcome to AIT GUI</h1>
       </ait-tab>
       <ait-tab title="Clock">
         <h1>The current time</h1>
         <ait-clock class="navbar-text" doy="true"></ait-clock>
       </ait-tab>
     </ait-tabset>
   </body>

Setup GUI Config Values
-----------------------

You'll want to add a GUI section to your **config.yaml** file to set various things. For this example we'll set two attributes, the relative path to the index file above and some default telemetry stream information. The **gui.html.directory** attribute tells the GUI where to look for HTML files for your web application. The **telemetry** object gives the GUI a list of telemetry streams on which it should listen for data. We'll leave this set to the default telemetry port.

In your full application you'll want to set a number of other configuration values. You can read about the other configuration parameters in the documentation.

.. code-block:: yaml

   gui:
       html:
           directory: ./html
       telemetry:
          - stream:
                name: MyExampleTelemetryStream
                port: 3076

Run the GUI
-----------

You're all set to open your GUI for the first time. Startup the GUI process by running the following at a terminal:

.. code-block:: bash

   ait_gui.py

This should automatically open up a browser and point it to **localhost:8080**. If it doesn't, open up your browser of choice and point it at the URL. You should see something that looks like the following.

.. image:: _static/example_gui.png

Congratulations! You've successfully gotten your project setup and ready for development with AIT GUI.
