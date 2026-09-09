n8n-nodes-zefix
===============

Read the Swiss commercial register from n8n.

`Zefix <https://www.zefix.admin.ch>`_ is the federal index of the commercial
register: it holds the current entry for every company in Switzerland. This
package looks a company up by UID or EHRA ID and searches the register by name.

For the publications side of the register — every change to an entry, as the
official gazette prints it — install
`n8n-nodes-shab <https://github.com/prospex-ch/n8n-nodes-shab>`_. The two are
separate packages because they are separate APIs, and they join on ``uid``.

The package ships no runtime dependencies. Every request goes through n8n's own
HTTP helpers.

Built and maintained by `Prospex <https://prospex.ch>`_, a Swiss B2B sales
intelligence platform.

.. toctree::
   :maxdepth: 2

   install
   company
   examples
   access
   changelog
