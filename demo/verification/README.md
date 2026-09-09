# Verification demo

The screen recording submitted with the n8n verification request: install the
package from npm, add the Zefix credential, and run both operations.

Recorded with [ndemo](https://github.com/prospex-ch) against a local n8n at
`http://localhost:5678`.

## Recording it

The playbook is committed as a template, because the credential segment types a
real Zefix username and password. `build.sh` reads them out of the Prospex
`.env` and writes `verification.yaml`, which is gitignored.

```bash
./demo/verification/scripts/build.sh     # template -> verification.yaml
ndemo open   demo/verification/verification.yaml
ndemo play   demo/verification/verification.yaml
ndemo render demo/verification/verification.yaml
```

Point `ZEFIX_ENV_FILE` at a different `.env` if yours is not at
`../prospex/.env`. Every run starts by calling `scripts/reset.sh`, which
uninstalls the package and deletes saved workflows and credentials, so the
recording always begins from an untouched instance. Set `NDEMO_KEEP_PACKAGE=1`
to leave the package installed while iterating on later segments.

## Before re-recording

The version is pinned in two places in the narration and in the install step,
so bump `n8n-nodes-zefix@0.1.0` when the submitted version changes.
