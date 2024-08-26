# IPG - In-Plan Guarantee

## Overview

TODO: Fill in this section with a high-level overview of this algorithm's intent.

<br/>

## IPG Request Object

The IPG modeling algorithm is triggered by the inclusion of the `inPlanGuarantee{}` object within an existing FPE [Plan](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#plan) when calling the [POST&nbsp;/v6/forecast](https://github.com/newretirement/fpe-api/blob/master/README.md#post-v6forecast) endpoint, i.e.:

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

See [./in_plan_guarantee.json](./in_plan_guarantee.json) for a complete example of an FPE plan with IPG modeling enabled.

### InPlanGuarantee

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `pretaxAccount` | string | The name of the FPE [account](../datatypes.md#account) that represents the IPG pre-tax asset (e.g. a 401k). |
| `rothAccount` | string | The name of the FPE [account](../datatypes.md#account) that represents the IPG Roth asset. |
| `highWaterMark` | int | The highest total balance across the IPG assets to date. |
| `vintage` | [Vintage](#vintage) | Contains attributes for specifying or inferring the IPG vintage data to use. |

#### Vintage

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `product` | string | Identifies the IPG product, which determines the IPG algorithm variant to use.  Valid values are `LIB` (Lifetime Income Builder) and `IA` (Income America). |
| `year` | int | Identifies the IPG vintage year. |

These attributes are situated within the [POST /v6/forecast](../README.md#post-v6forecast) request, as shown here:


<br/>

## Algorithm

### HWM (High Watermark)