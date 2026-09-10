Changelog
=========

0.1.1
-----

- Docs: dropped the opening cross-reference to ``n8n-nodes-shab`` from the
  README and the docs index. The gazette package is still linked from the
  sections that need it.

0.1.0
-----

First release, split out of ``n8n-nodes-zefix-shab`` so that one package
addresses one API.

- Company → Lookup by UID or EHRA ID, against the Zefix PublicREST API.
- Company → Search by name, with canton, legal form and active-only filters.

The gazette side of the old package now lives in
`n8n-nodes-shab <https://github.com/prospex-ch/n8n-nodes-shab>`_.
