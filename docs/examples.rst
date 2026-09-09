Example workflows
=================

One workflow ships in `examples/
<https://github.com/prospex-ch/n8n-nodes-zefix/tree/main/examples>`_,
importable as it is through **Workflows → Import from File**.

Enrich HubSpot from a UID
-------------------------

``hubspot-enrich-from-uid.json``. Reads 25 companies out of HubSpot, looks each
``uid`` property up in Zefix, drops the rows that came back empty with a Filter
node, and writes the legal name, city, ZIP and purpose back onto the record.

The Filter step catches a UID the register has no record of: the lookup returns
an empty item, so the row stops there.

The workflow needs the HubSpot credential of the node it ends in. Delete that
last step and the Zefix node still runs on its own.

Alerting on changes
-------------------

Zefix holds the current entry, not its history, so it cannot say what changed.
For that, install
`n8n-nodes-shab <https://github.com/prospex-ch/n8n-nodes-shab>`_ and use its
trigger: it watches a UID list and starts a workflow when the register
publishes something about one of them.
