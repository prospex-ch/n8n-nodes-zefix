### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### 0.1.0

First release. Split out of
[`n8n-nodes-zefix-shab`](https://github.com/prospex-ch/n8n-nodes-zefix-shab) so
that one package addresses one API.

- Company → Lookup by UID or EHRA ID, against the Zefix PublicREST API.
- Company → Search by name, with canton, legal form and active-only filters.

The gazette side of the old package now lives in
[`n8n-nodes-shab`](https://github.com/prospex-ch/n8n-nodes-shab).
