# Post-Retirement Expense Calc

This page describes the logic for estimating post-retirement expenses for a given financial plan.  The Post-Retirement Expense calculation is conditionally activated when the `plan.postRetireExpense{}` object is present in the request, as shown below:

```json
POST /fpe/v6/forecast
{
    "plan": {
        "postRetireExpense": {
            "replacementRate": 0.85,
            "estimatedExpenseStream": "myRetirementExpenses"
        }
        ...
    }
}
```

<br/>

## PostRetireExpense Request Object

The Post-Retirement Expense calculation request attributes are defined in the following table:

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `replacementRate` | float | A rate in the range `[0.0, 1.0]` that represents the percentage of a household's annual work income that is replaced by retirement income when they retire. |
| `estimatedExpenseStream` | string | The name of the `payentStream` to which FPE will assign the estimated post-retirement expense amount.  Minimally, this object must:<ul><li>be configured to represent an expense stream having periodic payments <li>include a `startDate` (which the algorithm uses as the person's retirement date)</ul> |

See [./post_retire_expense.json](./post_retire_expense.json) for a sample FPE request.

<br/>

## Algorithm Description

This section describes the steps for determining the plan's estimated post-retirement expenses.

Let P = a valid FPE plan.

Let D<sub>curr</sub> = the current date (specified by `plan.currentDate`).

Let D<sub>ret</sub> = the desired retirement date, indicated by the `startDate` of the `estimatedExpenseStream` defined in the request.


<br/>

### **STEP 1**: Calculate take-home pay

[Take-home pay](https://www.investopedia.com/terms/t/take-home-pay.asp) is the net amount of income received after the deduction of taxes, benefits, and voluntary contributions from a paycheck.  Within plan P, the take-home pay at <u>1 month prior</u> to D<sub>ret</sub> is determined as follows:

1. Let P′ = a copy of plan P.
1. Remove all user-defined [expenses](https://github.com/newretirement/fpe-api/blob/master/terms.md#expense-stream) from P′.
1. Remove all income from P′ that does <u>not</u> qualify as [earned income](https://www.investopedia.com/terms/e/earnedincome.asp) (social security, RMDs, pensions, passive income, etc.).
1. If D<sub>curr</sub> >= December of the year preceding D<sub>ret</sub>, then:
    - If D<sub>curr</sub> falls on a December:
        - D<sub>ret</sub> = January of 2 years following D<sub>curr</sub>
    - Otherwise:
        - D<sub>ret</sub> = January of the year immediately following D<sub>curr</sub>
    - <i>NOTE: The above logic is for dealing with the cases where a person either retired: 1) in the past, or 2) within a year of D<sub>curr</sub>.</i>
1. Set [endDate](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#paymentstream) to D<sub>ret</sub> for all earned income streams in P′.
1. Set [plan.cashFlow.savingRate](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#cashflow) to 0% in P′.
1. Run the [forecast](https://github.com/newretirement/fpe-api/blob/master/README.md#post-v6forecast) for P′, and then obtain the [@unsaved_surplus](https://github.com/newretirement/fpe-api/blob/master/output_streams.md#paymentstream-projections) amount in the month prior to D<sub>ret</sub>. <b>This amount respresents the combined take-home pay for primary and spouse.</b>


### **STEP 2**: Apply the Replacement Ratio

1. Let `r` = the replacement ratio provided by `plan.postRetireExpense.replacementRate` within the request.
1. Let `i` = the combined take-home pay determined at the end of **STEP 1** above.
1. The post-retirement estimated expenses are then calculated as `r × i`.

### **STEP 3**: Assert the post-retirement expense

- Now that the post-retirement estimated expense is known, assign it to the `paymentAmount` attribute of the [payentStream](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#paymentstream) referred to by `postRetireExpense.estimatedExpenseStream` within the original plan P.
- Re-run the [POST /v6/forecast](https://github.com/newretirement/fpe-api/blob/master/README.md#post-v6forecast) using P as the request object; the resulting forecast will then take into account the plan's post-retirement expenses.