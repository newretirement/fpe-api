# IPG - In-Plan Guarantee

TODO: Fill in this section with a high-level overview of this algorithm's intent.

<br/>

# Terminology

### Income Activation Date

The date on which the IPG income payments will commence.

### High Water Mark

High Water Mark (or HWM) is a semi-calculated IPG account balance on which the IPG guaranteed and non-guaranteed income is based.

<br/>

# API Request Object

The IPG modeling algorithm is triggered by the inclusion of the `inPlanGuarantee{}` object within an existing FPE [Plan](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#plan) when calling the [POST&nbsp;/v6/forecast](https://github.com/newretirement/fpe-api/blob/master/README.md#post-v6forecast) endpoint:

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
| `highWaterMark` | int | The highest total balance across the IPG accounts reported by the recordkeeper; setting this attribute implies the participant (user) is already enrolled in IPG. |
| `vintage` | [Vintage](#vintage) | Contains attributes for specifying or inferring the IPG vintage data to use. |

#### Vintage

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `product` | string | (Required) Identifies the IPG product, which determines the IPG algorithm variant to use.  Valid values are `LIB` (Lifetime Income Builder) and `IA` (Income America). |
| `year` | int | (Optional) Identifies the IPG vintage year. |


<br/>

# Algorithm

## HWM (High Water Mark)