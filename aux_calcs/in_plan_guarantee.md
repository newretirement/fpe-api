# IPG - In-Plan Guarantee

## Overview

TODO: Fill in this section with a high-level overview of this algorithm's intent.

<br/>

## InPlanGuarantee Request Object

The `inPlanGuarantee` request object defines the financial inputs needed for the IPG algorithm.  This algorithm is triggered by the inclusion of the `` within an existing FPE [Plan](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#plan) when calling the [POST&nbsp;/v6/forecast](https://github.com/newretirement/fpe-api/blob/master/README.md#post-v6forecast) endpoint.


| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `product` | string | Identifies the IPG product, which determines the IPG algorithm variant to use. |
| `pretaxAccount` | string | The name of the FPE [account](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#account) that represents the IPG pre-tax asset (e.g. a 401k). |
| `rothAccount` | string | The name of the FPE [account](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#account) that represents the IPG Roth asset. |
| `highWaterMark` | int | The highest total balance across the IPG assets to date. |

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

See [./in_plan_guarantee.json](./in_plan_guarantee.json) for a sample FPE request.