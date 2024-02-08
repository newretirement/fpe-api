# FPE V6 Migration Guide

This page calls out the changes made in `v6` that are not backward-compatible with`v5`.  

_**NOTE:** While in v6 beta (indicated by release tags ending in `-beta{k}`), you can expect this list to grow._

## [v6.0.0-beta3](https://github.com/newretirement/fpe-api/releases/tag/v6.0.0-beta3)

- ND-7326: Removed the `plan.estimateActualsYTD` flag. FPE now unconditionally estimates YTD actuals (i.e. it's as if this flag were permanently `true`).
- ND-7305: Employer NEC rate curves now use `age` instead of `date`.


## [v6.0.0-beta7](https://github.com/newretirement/fpe-api/releases/tag/v6.0.0-beta7)

- FPE-3: Monte Carlo simulation no longer infers estimated standard deviation (via a simple table-based lookup) from an account's rate; `*.rate.stdev` now defaults to 0.


## [v6.0.0-beta9](https://github.com/newretirement/fpe-api/releases/tag/v6.0.0-beta9)

- FPE-36 Removed `accounts[*].meta.taxDeductibleInterest`, `paymentStreams[*].meta.dti`, and `paymentStreams[*].meta.propertyTax`.  These metadata attributes should now be assigned directly to the account or paymentStream object:
    - `accounts[*].taxDeductibleInterest = <bool>`
    - `paymentStreams[*].dti = <bool>`
    - `paymentStreams[*].propertyTax = <bool>`


## [v6.0.0-beta13](https://github.com/newretirement/fpe-api/releases/tag/v6.0.0-beta13)

- FPE-50: Removes the deprecated `@employerContrib:*` output stream.  This aggregated stream has been replaced by `@employerNEC:*` and `@employerMatch:*`.