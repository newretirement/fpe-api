# IPG - In-Plan Guarantee

## Overview

TODO: Fill in this section with a high-level overview of this algorithm's intent.

<br/>

## IPG Request Object

The `IPG` request object defines all of the financial inputs needed for the IPG (Lifetime Income Builder) algorithm.  This algorithm is triggered by the inclusion of this object within an existing FPE [Plan](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#plan) when calling the [POST&nbsp;/v6/forecast](https://github.com/newretirement/fpe-api/blob/master/README.md#post-v6forecast) endpoint.


| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `equityAllocation` | float | At `incomeActivationDate`, the percentage of equity funds to be retained within the `equityRoth` and `equityIRA` accounts is dictated by this rate (where the non-retained portion is assumed to have been used to purchase the non-guarateed annuities). |
| `incomeActivationDate` | [Date](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#date) | The future date at which point the participant's IPG income payments commence. |
| `highWaterMark` | int | The highest total balance across the IPG assets to date. |
| `gtdWithdrawRate` | float | At income activation date, the annual guaranteed income payment is determined by the formula:<br/>`highWaterMark × gtdWithdrawRate`. |
| `nonGtdWithdrawRate` | float | At income activation date, the annual non-guaranteed income payment is determined by the formula:<br/>`highWaterMark × nonGtdWithdrawRate`. |
| `equityIRA` | string | The name of the FPE [account](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#account) that represents the IPG equity IRA asset. |
| `equityRoth` | string | The name of the FPE [account](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#account) that represents the IPG equity Roth asset. |
| `gtdIncomeIRA` | string | The name of the FPE [payentStream](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#paymentstream) that represents the guaranteed IRA income stream. |
| `gtdIncomeRoth` | string | The name of the FPE [payentStream](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#paymentstream) that represents the guaranteed Roth income stream. |
| `nonGtdIncomeIRA` | string | The name of the FPE [payentStream](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#paymentstream) that represents the non-guaranteed IRA income stream. |
| `nonGtdIncomeRoth` | string | The name of the FPE [payentStream](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#paymentstream) that represents the non-guaranteed Roth income stream. |

These attributes are situated within the [POST /v6/forecast](https://github.com/newretirement/fpe-api/blob/master/README.md#post-v6forecast) request, as shown here:

```
{
    "plan": {
        "inPlanGuarantee": {
            ...
        },
        ...
    }
}
```

Example JSON requests containing the `plan.inPlanGuarantee{}` data object can be found in the [./examples/inPlanGuarantee/](./examples/inPlanGuarantee/) subdirectory.