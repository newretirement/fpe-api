# MIRP (My Interactive Retirement Planner)

This page describes the logic for estimating post-retirement expenses within the Nationwide MIRP application.  The MIRP logic is relevant to the [POST /v5/forecast](../README.md#post-v5forecast) endpoint, and is conditionally activated when the `nationwide.mirp` request object is present and correctly configured within the FPE [plan](../datatypes.md#plan).

<br/>

## MIRP Request Object

The attributes for the MIRP calculation request attributes are defined in the table below:

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `replacementRate` | float | A rate in the range `[0.0, 1.0]` that represents the percentage of the participant's pre-retirement income will be needed to maintain their lifestyle in retirement. |
| `postRetireExpenseStream` | string | The name of the [payentStream](../datatypes.md#paymentstream) to which FPE will assign the calculated post-retirement expense amount.  Minimally, this object must:<ul><li>be configured to represent an [expense stream](../terms.md#expense-stream) having [periodic payments](../terms.md#periodic-payment)<li>include a `startDate` (which the algorithm uses as the person's retirement date)</ul> |

These attributes are situated within the [POST /v5/forecast](h../README.md#post-v5forecast) request, as shown here:

```
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

Example JSON requests containing the `nationwide.mirp{}` data object can be found in the [./examples/mirp/](./examples/mirp/) subdirectory.

<br/>

## Algorithm Description

Let `P` = valid FPE [plan](../datatypes.md#plan).  This section describes the steps for determining the plan's estimated post-retirement expenses.

### **STEP 1**: Calculate net take-home pay

Within plan `P`, the _net take-home pay_ at 1 month prior to the retirement date is determined as follows:

1. Let `P′` = a copy of plan `P`.
1. Remove all user-defined [expenses](../terms.md#expense-stream) from `P′`.
1. Remove all non-work income from `P′` (social security, pensions, passive income, etc.)
1. Set [plan.cashFlow.savingRate](../datatypes.md#cashflow) to 0% in `P′`.
1. Run the [forecast](h../README.md#post-v5forecast) for `P′`, and then obtain the [@unsaved_surplus](../output_streams.md#paymentstream-projections) amount in the month prior to retirement.  This amount represents the plan's net take-home pay 1 month prior to retirement.


### **STEP 2**: Apply the Replacement Ratio

1. Let `r` = the replacement ratio provided by `plan.nationwide.mirp.replacementRate` within the request.
1. Let `i` = the pre-retirement available monthly income determined at the end of **STEP 1** above.
1. The post-retirement estimated expenses are then calculated as `r × i`.

### **STEP 3**: Assert the post-retirement expense

- Now that the post-retirement estimated expenses is known, assign this amount to the `paymentAmount` attribute of the [payentStream](../datatypes.md#paymentstream) referred to by `nationwide.mirp.postRetireExpenseStream` within the original plan `P`.
- Re-run the [POST /v5/forecast](../README.md#post-v5forecast) using `P` as the request object; the resulting forecast will then take into account the plan's post-retirement expenses.

### Corner Cases

There are 2 situations that require a modification to the algorithm steps described above:

1. The specified retirement date occurred in the past
2. The specified retirement date is in the future, but within a year or so of the current date, which means the FPE estimated tax calculations are not as stable.

In order to deal with these two situations, the following additional steps are taken:

1. Let `CD` = the current date (specified by `plan.currentDate`)
1. Let `RD` = the retirement date
1. If `CD` >= December of the year preceding `RD`, then:
    - If CD falls on a December:
        - RD = January of 2 years following CD
   - Otherwise:
        - RD = January of the year immediately following CD
1. Modify `P′` within the [STEP 1] of the original [algorithm](#algorithm-description).

By performing this conditional logic, the retirement date is guaranteed to be in the future.
