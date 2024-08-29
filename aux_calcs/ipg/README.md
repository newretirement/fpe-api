# IPG - In-Plan Guarantee

In-Plan Guarantee (IPG) is a financial product offered by a company to its plan participants, which attempts to provide guaranteed lifetime income and principal protection.

<br/>


# Terminology

## High Water Mark

High Water Mark (HWM) is a monetary value that is needed for calculating the participant's IPG income (both guaranteed and non-guaranteed) at [Income Activation Date](#income-activation-date).  HWM takes into account the participant's total balance across their IPG accounts, but also imposes [this algorithm](./hwm_calc.js) for modifying HWM each month.

## Income Activation Date

Income Activation Date (IAD) determines the year/month that IPG income payments will commence.  This date is dependent on either the vintage year or the participant's age depending on the IPG product:

| Product Code  | Product Name | Income Activation Date
| ------------- | ------------ | --------------------- |
| `IA` | Income America | The month/year that the participant turns 65 | 
| `LIB` | Lifetime Income Builder | January of the vintage year | 

## Vintage

Describes the characteristics of an IPG financial model for a given cohort.  When FPE [forecasts a plan](../../README.md#post-v6forecast) with [IPG modeling enabled](#api-request-object), the specific vintage to use is selected from the list of vintages in the `inPlanGuarantee.vintages[]` list within the `POST /fpe/v6/globaldata` response.

Below is a sample vintage object with all attributes defined:

```json
{
    "product": "LIB",
    "year": 2031,
    "entryDateRange": {"start": "2022-01", "end": "2023-12"},
    "birthDateRange": {"start": "1965-01", "end": "1967-12"},
    "hwmRatio": 1.25,
    "nonGtdWithdrawRate": 0.015,
    "gtdWithdrawRate": 0.045,
    "lifetimeContribLimit": 1500000,
    "volatility": {
        "equityPreActivate": {
            "mean": 0.0643, "stdev": 0.18
        },
        "fixedIncomePreActivate": {
            "mean": 0.0553, "stdev": 0.046
        },
        "equityPostActivate": {
            "mean": 0.0543, "stdev": 0.115
        },
        "fixedIncomePostActivate": {
            "mean": 0.0553, "stdev": 0.036
        }
    },
    "glidePath": {
        "annualEquityAllocs": [0.4566, 0.4378, 0.4191, 0.4003, 0.3816]
    }
}
```

<br/>


# API Request Object

The IPG modeling algorithm is triggered by the inclusion of the `inPlanGuarantee{}` object within an existing FPE [Plan](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#plan) when calling the [GET /fpe/v6/forecast](https://github.com/newretirement/fpe-api/blob/master/README.md#post-v6forecast) endpoint:

```
{
    "plan": {
        "inPlanGuarantee": {
            <IPG specifics>
        },
        <the rest of the plan>
    }
}
```

See [this FPE request](./ipg_plan.json) for a complete example of an FPE plan with IPG modeling enabled.

### InPlanGuarantee

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `pretaxAccount` | string | The name of the FPE [account](../datatypes.md#account) that represents the IPG pre-tax asset (e.g. a 401k). |
| `rothAccount` | string | The name of the FPE [account](../datatypes.md#account) that represents the IPG Roth asset. |
| `highWaterMark` | int | The highest total balance across the IPG accounts reported by the recordkeeper; setting this attribute implies the participant (user) is already enrolled in IPG. |
| `vintage` | [Vintage](#vintage-1) | Contains attributes for specifying or inferring the IPG vintage data to use. |

#### Vintage

This object determines which [IPG vintage](#vintage) is incorporated into the IPG projection.  

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `product` | string | (Required) Identifies the IPG product, which determines the IPG algorithm variant to use.  Valid values are `LIB` (Lifetime Income Builder) and `IA` (Income America). |
| `year` | int | (Optional) Identifies the IPG vintage year. |

If both `product` and `year` are provided, the vintage is simply looked up from the list of [vintage](#vintage) objects from `GET /fpe/v6/globaldata: inPlanGuarantee.vintages[]` based on the vintage's unique (product, year) combo.

If only `product` is provided, the vintage is selected from the globaldata vintage list such that it satisfies all of the following criteria:

- `product` matches the vintage's product code
- The participant's `birthDate` is in the vintage's [birthdateRange](#vintage)
- [plan.currentDate](../../datatypes.md#plan) is in the vintage's [entryDateRage](#vintage)

