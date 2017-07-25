Developer Documentation
=======================

Release Process
---------------

Prepare Repo for Release
^^^^^^^^^^^^^^^^^^^^^^^^

First you need to determine the version number for the release. **bliss-gui** uses standard semantic versioning (Major.Minor.Patch). Major bumps are for large, non-backwards compatible changes; Minor bumps are for backwards compatible changes; Patch bumps are for incremental bug fixes, small releases, and end-of-sprint releases.

Update the project documentation to use the correct version names. The `conf.py <https://github.jpl.nasa.gov/bliss/bliss-gui/blob/master/doc/source/conf.py>`_ file contains a **version** and **release** option. Both of these should be updated to point to the version number for this release. The appropriate version number must also be set in the project's **setup.py** file and the `package.json <https://github.jpl.nasa.gov/bliss/bliss-gui/blob/master/bliss/gui/static/package.json>`_ file. Commit and push these changes to master.

You will need to generate the latest bundled static files for release. From the **bliss/gui/static** folder you can run a build with **npm run build**. Be sure to commit and push these changes as well.

Generate Release Notes
^^^^^^^^^^^^^^^^^^^^^^

You will need a list of included tickets to put the in tag annotation when tagging the release. There is a helper script in /build that will generate this for you. Note that you can include a start and end time to help narrow down the notes to include since the last release made.

.. code-block:: bash

   cd build
   ./generate_changelog.py --start-time YYYY-MM-DDTHH:MM:SSZ

Tag the Release
^^^^^^^^^^^^^^^

Via the Github Releases page, draft a new release. Place the above version number as the tag version. The release title should be **BLISS GUI v<version number>**. Copy the change log into the release description box. If the release is not production ready be sure to check the pre-release box to note that. When finished, publish the release.

Push Latest Docs to Github Pages
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You will need to push the latest documentation to Github pages for the release. There is a script that helps you with the majority of this.

.. code-block:: bash

   cd build
   ./update_docs_release.sh
   git status # Check that everything looks correct
   git commit -m "Update docs for <version>"
   git push origin gh-pages
   git checkout master

Notify Relevant Parties of Release
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

If deemed appropriate, prepare an email to all projects / parties known to be using the tool and notify them of a new release. An example template for this is below:

.. code-block:: none
   
   Subject:
   [RELEASE] BLISS GUI v<version> has been released

   Body:
   Hello!

   BLISS GUI v<version> has been released and is ready for use.

   You can view the change logs and download the release at
   https://github.jpl.nasa.gov/bliss/bliss-gui/releases/tag/<version>

   View the BLISS Installation page for information on updating
   to the latest version.
   https://github.jpl.nasa.gov/pages/bliss/bliss-gui/installation.html#upgrading-an-installation

   Thank you!
   BLISS Development Team

Push Release Artifacts to OCO3-TB PyPi
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

SSH into OCO3-TB and navigate to **/usr/local/vhosts/oco3-tb/htdocs/pypi**. Open **make-pypi.sh** and update with the new version number and comment out the previous number. Run **make-pypi.sh** and check https://bliss.jpl.nasa.gov/pypi/simple/ to ensure that the release has been added.

NOTE: Currently requires pip 9.0.1 in order to utilize `pip download`.
