# n8n-nodes-zefix

Read the Swiss commercial register from n8n.

[Zefix](https://www.zefix.admin.ch) is the federal index of the commercial
register: it holds the current entry for every company in Switzerland. This node
looks a company up by UID or EHRA ID, and searches the register by name.

Built and maintained by [Prospex](https://prospex.ch), a Swiss B2B sales
intelligence platform.

Full documentation:
[n8n-nodes-zefix.readthedocs.io](https://n8n-nodes-zefix.readthedocs.io).

## Installation

In n8n: **Settings → Community nodes → Install**, then `n8n-nodes-zefix`.

Self-hosted, from the command line:

```bash
npm install n8n-nodes-zefix
```

## Operations

| Node | Operation | Reads |
|---|---|---|
| Zefix | Company → Lookup | one register entry, by UID or EHRA ID |
| Zefix | Company → Search | the register, by name |

Both operations need credentials: every Zefix PublicREST endpoint refuses an
unauthenticated call.

## Credentials

Accounts are issued by the Federal Office of Justice: write to
zefix@bj.admin.ch and say what you plan to use the API for. There is no
self-service signup and no key in a dashboard.

Once you have the username and password, add them in n8n under **Credentials →
Zefix API**. The credential test calls `GET /legalForm`, so a wrong password
fails in the dialog itself.

[The Zefix REST API guide](https://prospex.ch/guides/zefix-rest-api/) documents
all ten endpoints and the two UID formats they disagree about.

## Compatibility

Requires Node.js 20.15 or newer and an n8n instance with community nodes
enabled. The package targets community node API version 1.

Every request goes through n8n's own HTTP helpers, so the package ships no
runtime dependencies.

## Usage

### Company → Lookup

Give it a UID or an EHRA ID. All three UID forms are accepted:

```
CHE-123.456.789
CHE123456789
123456789
```

The node emits the dotted form for display and sends the compact form to the
API, which is the only one `/company/uid/{uid}` matches. A UID that is not in
the register returns an empty item, so a workflow can branch on it, and the node
attaches a hint saying so. Zefix covers the commercial register alone, while
[uid.admin.ch](https://www.uid.admin.ch) covers every UID unit, so a UID issued
for VAT alone, an association or a public body is valid there and empty here.
`CHE-116.320.238`, the VAT group of Banque Cantonale Vaudoise, is one: the bank
itself is `CHE-105.934.376`. A malformed UID is rejected before any request goes
out. [Checking a Swiss
company](https://prospex.ch/guides/check-swiss-company/) covers where each
format shows up and what the check digit does.

Output:

| Field | Notes |
|---|---|
| `name`, `uid`, `uidCompact`, `ehraid`, `chid` | identifiers. `uid` is the dotted form, the same form `n8n-nodes-shab` emits. |
| `canton`, `legalSeat`, `legalSeatId` | registered office |
| `legalFormId`, `legalFormUid`, `legalForm` | the internal ID, the four-character eCH-0097 code, and the localised names |
| `status` | `ACTIVE`, `CANCELLED` or `BEING_CANCELLED` |
| `purpose` | the statutory purpose, in the language of the cantonal register it is entered in |
| `capitalNominal`, `capitalCurrency` | nominal capital as a string, and its currency |
| `deletionDate`, `sogcDate` | dates |
| `address` | street, house number, PO box, ZIP, town |
| `oldNames`, `translation` | former names, and registered translations |
| `headOffices`, `furtherHeadOffices`, `branchOffices` | company relations |
| `hasTakenOver`, `wasTakenOverBy`, `auditCompanies` | company relations |
| `cantonalExcerptWeb` | link to the cantonal extract |
| `zefixDetailWeb` | Zefix detail pages, one per language |

`cantonalExcerptWeb` comes from the API. The hosts are per-canton
(`zg.chregister.ch`, `rc.zh.ch`, `prestations.vd.ch`), so use the returned link
and do not build one.

### Company → Search

A name of at least 3 characters, with `*` as a wildcard. Optional: canton, legal
form (a dropdown fed by `/legalForm`), and a switch to drop struck companies.
Each row is the Zefix search record, with `uid` in the dotted form and
`uidCompact` alongside it, in the same form Lookup emits.

Canton, Legal Seat ID and Registry of Commerce ID are mutually exclusive in the
API. Setting two raises an error naming both, before the request is sent. The
search endpoint returns everything it has in one response, so the limit is
applied by the node.

### Example workflow

[`examples/hubspot-enrich-from-uid.json`](examples/hubspot-enrich-from-uid.json),
importable as it is: read companies out of HubSpot, look each UID up in Zefix,
write the name, address and purpose back.

### Access and terms

Zefix PublicREST needs the Basic credentials described above. The node paces it
at one request every 0.5 seconds and retries a 429 or a 5xx three times. A run
of failed retries throws, so an empty result always means the company is absent
from the register. Its `User-Agent` carries this repository's URL.

The register data is also published as linked data through LINDAS, under terms
the Federal Office of Justice states on
[the Zefix site](https://www.zefix.admin.ch/en/search/entity/welcome). Read
those before redistributing bulk extracts.

## Watching the whole register

Zefix holds the current entry, not its history, so it cannot say what changed.
[`n8n-nodes-shab`](https://github.com/prospex-ch/n8n-nodes-shab) reads the
gazette and triggers on a UID list.
[Prospex](https://prospex.ch) watches the whole register and joins it to hiring,
funding and web signals, then says which of those changes is worth a call.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Zefix](https://www.zefix.admin.ch) and [the Zefix REST API guide](https://prospex.ch/guides/zefix-rest-api/)
- [`n8n-nodes-shab`](https://github.com/prospex-ch/n8n-nodes-shab), the gazette side

The register is also reachable outside n8n:

| Package | Does |
|---|---|
| [`zefix-parser`](https://pypi.org/project/zefix-parser/) | the register entry: LINDAS SPARQL, PublicREST, UID validation |
| [`shab-parser`](https://pypi.org/project/shab-parser/) | the gazette: discovery, fetch, parse, eleven-type event classification |
| [`swissco`](https://github.com/prospex-ch/swissco-cli) | the same register from a command line, plus simap, FINMA, GLEIF and ARAMIS |

## Development

```bash
npm install
npm run dev     # starts n8n with the node linked
npm run lint
npm run build
npm test
```

## License

MIT
