# RMDs

## Overview

_NOTE: this page is currently a [WIP](https://www.dictionary.com/browse/wip)_

A required minimum distribution (RMD) is the amount of money that must be withdrawn annually from certain types of tax-deferred accounts.  In FPE, the specific subset of account types to which RMDs apply are: [ira, 401k, 401a, 403b, 457b](datatypes.md#accounttype).

## RMD Age

The age at which RMDs start is based on the account owner's [birthDate](datatypes.md#person):

| birthDate | RMD age |
| ------------- | ------- |
| `1960-01` to present | `75y`   |
| `1951-01` to `1959-12`  | `73y`   |
| `1949-07` to `1950-12`  | `72y`   |
| all other dates | `70y6m` |
