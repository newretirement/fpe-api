# MIRP (My Interactive Retirement Planner)

This page describes the logic for estimating post-retirement expenses within the Nationwide MIRP application.  The MIRP logic is relevant to the [POST /v5/forecast](../README.md#post-v5forecast) endpoint, and is conditionally activated when the `plan.nationwide.mirp` request object is present and correctly configured within the FPE [plan](../datatypes.md#plan), as shown below:

```
POST /v5/forecast
{
    "plan": {
        "nationwide": {
            "mirp": {
                "replacementRate": 0.85,
                "postRetireExpenseStream": "myRetirementExpenses"
            }
        },
        ...
    }
}
```

<br/>

## MIRP Request Object

The attributes for the MIRP calculation request attributes are defined in the table below:

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `replacementRate` | float | A rate in the range `[0.0, 1.0]` that represents the percentage of a household's annual employment income that is replaced by retirement income when they retire. |
| `postRetireExpenseStream` | string | The name of the [payentStream](../datatypes.md#paymentstream) to which FPE will assign the calculated post-retirement expense amount.  Minimally, this object must:<ul><li>be configured to represent an [expense stream](../terms.md#expense-stream) having [periodic payments](../terms.md#periodic-payment)<li>include a `startDate` (which the algorithm uses as the person's retirement date)</ul> |

Example JSON requests containing the `nationwide.mirp{}` data object can be found in the [./examples/mirp/](./examples/mirp/) subdirectory.

<br/>

## Algorithm Description

This section describes the steps for determining the plan's estimated post-retirement expenses.

Let P = a valid FPE [plan](../datatypes.md#plan).

Let D<sub>curr</sub> = the current date (specified by [plan.currentDate](../datatypes.md#plan)).

Let D<sub>ret</sub> = the desired retirement date, indicated by the `startDate` of the [postRetireExpenseStream](#mirp-request-object) defined in the request.


<br/>

### **STEP 1**: Calculate take-home pay

[Take-home pay](https://www.investopedia.com/terms/t/take-home-pay.asp) is the net amount of income received after the deduction of taxes, benefits, and voluntary contributions from a paycheck.  Within plan P, the take-home pay at <u>1 month prior</u> to D<sub>ret</sub> is determined as follows:

1. Let P′ = a copy of plan P.
1. Remove all user-defined [expenses](../terms.md#expense-stream) from P′.
1. Remove all income from P′ that does not qualify as [earned income](https://www.investopedia.com/terms/e/earnedincome.asp) (social security, pensions, passive income, etc.).
1. If D<sub>curr</sub> >= December of the year preceding D<sub>ret</sub>, then:
    - If D<sub>curr</sub> falls on a December:
        - D<sub>ret</sub> = January of 2 years following D<sub>curr</sub>
    - Otherwise:
        - D<sub>ret</sub> = January of the year immediately following D<sub>curr</sub>
    - <i>NOTE: The above logic is for dealing with the cases where a person either retired: 1) in the past, or 2) within a year of D<sub>curr</sub>.
1. Set [endDate](../datatypes.md#paymentstream) to D<sub>ret</sub> for all earned income streams in P′.
1. Set [plan.cashFlow.savingRate](../datatypes.md#cashflow) to 0% in P′.
1. Run the [forecast](../README.md#post-v5forecast) for P′, and then obtain the [@unsaved_surplus](../output_streams.md#paymentstream-projections) amount in the month prior to D<sub>ret</sub>. <b>This amount respresents the combined take-home pay for primary and spouse.</b>


### **STEP 2**: Apply the Replacement Ratio

1. Let `r` = the replacement ratio provided by [replacementRate](#mirp-request-object) within the request.
1. Let `i` = the combined take-home pay determined at the end of **STEP 1** above.
1. The post-retirement estimated expenses are then calculated as `r × i`.

### **STEP 3**: Assert the post-retirement expense

- Now that the post-retirement estimated expenses are known, assign this amount to the `paymentAmount` attribute of the [payentStream](../datatypes.md#paymentstream) referred to by `nationwide.mirp.postRetireExpenseStream` within the original plan P.
- Re-run the [POST /v5/forecast](../README.md#post-v5forecast) using P as the request object; the resulting forecast will then take into account the plan's post-retirement expenses.
