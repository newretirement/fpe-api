# Fixed-Dollar Withdrawal Strategy

The Fixed-Dollar withdrawal strategy is a [solver](https://en.wikipedia.org/wiki/Solver) that finds a fixed annual withdrawal amount that, when applied a given age, results in a given [liquid estate value](../terms.md#liquid-estate-value).

_NOTE 1: It will be helpful to keep in mind that the plan's [liquid estate value](../terms.md#liquid-estate-value) is effectively the final value of the [@projected_savings](../output_streams.md#account-projections) stream._

For example, suppose the forecast of a given [plan](../datatypes.md#plan) has the following characteristics:
- The person (single) dies at age 90
- Their [liquid estate value](../terms.md#liquid-estate-value) is **$500,000**

Now, suppose this person wishes to know how much _more_ they could withdraw annually starting at age 70, such that their liquid estate value would still have **$80,000** remaining.  This scenario can be modeled in FPE by including the following [drawdown](../datatypes.md#drawdown) configuration object within the [plan](../datatypes.md#plan):

```json
{
    "plan": {
        "drawdown": {
            "strategy": "FIXED-DOLLAR",
            "startAge": "70y",
            "desiredEstateValue": 80000
        }
    }
}
```

_NOTE 2: The `plan.drawdown.desiredEstateValue` in the above JSON snippet refers to [liquid estate value](../terms.md#liquid-estate-value) (vs. [estate value](../terms.md#estate-value), which also includes assets such as real estate).

[fixed_dollar_ex1.json](./fixed_dollar_ex1.json) is a complete example that models the above scenario.  When projecting this plan via the [POST /forecast](../README.md#post-forecast) endpoint, the corresponding [forecast](../datatypes.md#forecast) will contain additional attributes:

- `forecast.drawdown.excessWithdrawalAmount`: The fixed dollar amount that, when withdrawn each year starting at `plan.drawdown.startAge`, results in an **approximate** liquid estate value of `plan.drawdown.desiredEstateValue`.
- `@ExcessWithdrawal` output stream (i.e. `forecast.paymentStreams[*].name == '@ExcessWithdrawal'`); ths stream indicates the actual annual withdrawals that were modeled, which satisfy the drawdown criteria.  Note that the withdrawal amounts can potentially increase year-over-year, since the defined `plan.market.inflation.mean` is assumed for future payment growth on the withdrawal.