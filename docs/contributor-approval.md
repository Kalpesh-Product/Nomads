# Contributor approval

Submitting the contributor form creates a lead without granting account roles. New
Nomad accounts have all four contributor flags set to `false`. Existing active
roles are preserved when an account submits another request.

The combined Blog & News choice requests `isBlogger` and `isNewsWriter`; Content
Creator requests `isPlaceWriter` and `isEventWriter`. Master Panel approves or
revokes each flag separately. Account flags are the source of truth, so duplicate
leads for the same account reflect the same approval status.

New contributor leads store the authenticated account in `nomadUser`, regardless
of the contact email entered on the form. Legacy leads use their registered email
to locate an account. Approval fails clearly if no account exists.

Master Panel calls its authenticated `/api/contributor-leads` proxy. The proxy
uses `NOMADS_ADMIN_API_KEY` to access Nomads' `/api/become-contributor` endpoints:

- `GET /` returns leads with their account's four current role flags.
- `PATCH /:id/status` accepts `{ role, isActive }` and changes only that role.

Nomads' `/api/user/contributor-roles` is read-only. The former self-activation
PATCH endpoint has been removed. Contributor `/my` content endpoints check the
current role in MongoDB, including when an older JWT still claims active access.

The sidebar refreshes role flags every 30 seconds while the tab is active and
when the user returns to the tab. It shows Contributions if any role is active;
the contribution pages expose only the activated categories.

Run focused checks with `node --test tests/contributorApproval.test.js` from
`backend/`.
