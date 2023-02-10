# LIB (lifetime Income Builder)

## Overview

TODO: Fill in this section with a high-level overview of this algorithm's intent.


<br/>

## NWLIB Request Object

The `NWLIB` request object defines all of the financial inputs needed for the LIB (Lifetime Income Builder) algorithm.  This algorithm is triggered by the inclusion of this data object within an existing FPE [Plan](../datatypes.md#plan) when calling the [POST&nbsp;/v5/forecast](../README.md#post-v5forecast) endpoint.


| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `equityAllocation` | float | At `incomeActivationDate`, the percentage of equity funds to be retained within the `equityRoth` and `equityIRA` accounts is dictated by this rate (where the non-retained portion is assumed to have been used to purchase the non-guarateed annuities). |
| `incomeActivationDate` | [Date](../datatypes.md#date) | The future date at which point the participant's LIB income payments commence. |
| `highWaterMark` | int | The highest total balance across the LIB assets to date. |
| `gtdWithdrawRate` | float | At income activation date, the annual guaranteed income payment is determined by the formula:<br/>`highWaterMark × gtdWithdrawRate`. |
| `nonGtdWithdrawRate` | float | At income activation date, the annual non-guaranteed income payment is determined by the formula:<br/>`highWaterMark × nonGtdWithdrawRate`. |
| `equityIRA` | string | The name of the FPE [account](../datatypes.md#account) that represents the LIB equity IRA asset. |
| `equityRoth` | string | The name of the FPE [account](../datatypes.md#account) that represents the LIB equity Roth asset. |
| `gtdIncomeIRA` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the guaranteed IRA income stream. |
| `gtdIncomeRoth` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the guaranteed Roth income stream. |
| `nonGtdIncomeIRA` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the non-guaranteed IRA income stream. |
| `nonGtdIncomeRoth` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the non-guaranteed Roth income stream. |

These attributes are situated within the [POST /v5/forecast](h../README.md#post-v5forecast) request, as shown here:

```
{
    "plan": {
        "nationwide": {
            "lifetimeIncomeBuilder": {
                ...
            }
        },
        ...
    }
}
```

Example JSON requests containing the `nationwide.lifetimeIncomeBuilder{}` data object can be found in the [./examples/nwlib/](./examples/nwlib/) subdirectory.
