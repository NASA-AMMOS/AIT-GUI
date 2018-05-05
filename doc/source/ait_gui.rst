AIT GUI
=======

The AIT GUI provides an easily customizable and extendible interface for monitoring and displaying telemetry data, controlling EGSE simulators, as well as commanding and sequencing controls. You can view the AIT GUI by running the **ait-gui** bin script and pointing your browser to **http://localhost:8080**.

.. code-block:: bash

   $ ait-gui

GUI Customization
-----------------

AIT makes monitoring telemetry values in the MOS UI easy to customize and extend. Linking your telemetry definitions to the UI requires only a small amount of HTML and no frontend/backend code changes.

Consider the two following telemetry fields defined as being part of the **ait_example_packet**.

.. code-block:: yaml

    - !Field
      name: CmdHist0Time
      desc: |
        The start of execution of the most recent command, real-time or
        sequenced.
      type: TIME64

    - !Field
      name: CmdHist0Opcode
      desc: |
        The opcode of the most recent command, real-time or sequenced.
      type: CMD16

We could make a widget in our UI for tracking this in tabular form with the following:

.. code-block:: html

   <table class="telem col2">
       <tr>
           <td>Time: </td> <td><ait-field packet="ait_example_packet name="CmdHist0Time" data-format="%H:%M:%S.%L"></td>
           <td>Cmd:  </td> <td><ait-field packet="ait_example_packet name="CmdHist0Opcode"></td>
   </table>

This would give us something similar to the following in the UI:

.. image:: _static/cmd_history_in_ui.png

Testing the GUI
---------------

You can send example telemetry data to the GUI for testing using **ait_tlm_send.py**.

.. code-block:: bash

   $ ait-tlm-send /path/to/sometestdata.pcap

You will need to ensure that the **tlm.yaml** used when generating the example PCAP data matches the **tlm.yaml** you're using when running **ait_tlm_send**, otherwise you will end up with data that looks odd in the UI.

