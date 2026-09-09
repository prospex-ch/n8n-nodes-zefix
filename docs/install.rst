Install and credentials
=======================

Install
-------

In n8n: **Settings → Community nodes → Install**, then type ``n8n-nodes-zefix``.

Self-hosted, from the command line:

.. code-block:: bash

   npm install n8n-nodes-zefix

Restart n8n, and the node appears in the node panel under **Zefix**.

Zefix credentials
-----------------

Both operations need an account. Every Zefix PublicREST endpoint refuses an
unauthenticated call, the company lookup and the legal-form list included.
Accounts are issued by the Federal Office of Justice: write to
``zefix@bj.admin.ch`` and say what you plan to use the API for. There is no
self-service signup and no key in a dashboard.

Once you have the username and password, add them in n8n under **Credentials →
Zefix API**. The credential test calls ``GET /legalForm``, so a wrong password
fails inside the dialog, while you are still setting it up.

`The Zefix REST API guide <https://prospex.ch/guides/zefix-rest-api/>`_
documents all ten endpoints and the two UID formats they disagree about.

The gazette side
----------------

The register's publications — every change to an entry, dated and searchable —
come from SHAB, a separate and open API. They live in
`n8n-nodes-shab <https://github.com/prospex-ch/n8n-nodes-shab>`_, which needs no
account at all. Both packages emit ``uid`` in the dotted form, so a Zefix
lookup and a SHAB publication join on it directly.
