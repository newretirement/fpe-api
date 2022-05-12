# Output Streams Defined

When a [plan](datatypes.md#plan) is submitted to the [POST /forecast](README.md#post-v5forecast) endpoint, a financial [Forecast](datatypes.md#forecast) object is returned.  This forecast contains (among other things) a set of account projections ([Forecast.accounts](datatypes.md#forecast)), and a set of payment projections ([Forecast.paymentStreams](datatypes.md#forecast)).  Both of these sets contain future projections of the accounts and payment streams defined in the [plan](datatypes.md#plan).  These projection sets also contain FPE-calculated projections, which can be identified by the fact that their names all begin with the `'@'` character (e.g. `@income_tax`, `@total_savings`).

## Account Projections

| Stream name  | Type | Description |
| ---------- | ---- | ----------- |
| `@total_savings` | report | The sum of account balances for all [liquid asset](#liquid-asset) accounts. |
| `@projected_savings` | report | The sum of account balances for all [liquid asset](#liquid-asset) accounts PLUS any accounts whose type is [revolvingCredit](datatypes.md#accounttype). |
| `@total_debt` | report | The sum of all accounts with a negative balance. |
| `@interest:<account>` | report | The interest accrued on the account whose name is `<account>`. |

## PaymentStream Projections

| Stream name  | Type | Description |
| ---------- | ---- | ----------- |
| `@total_income` | report | The sum of all PaymentStream projections of type `income`. |
| `@total_expenses` | report | The sum of all PaymentStream projections of type `expense`. |
| `@saved_surplus` | report | The portion of [excess income](#terminology) that is saved each month.  The saved portion is determined by [plan.cashFlow.savingRate](datatypes.md#cashflow). For example, if in a given month the plan has $1,000 of excess income, and savingRate = 0.75, then $250 will be transferred plan's [checkingAccount](datatypes.md#cashflow) into the plan's [savingsAccount](datatypes.md#cashflow). |
| `@unsaved_surplus` | expense | The portion of [excess income](#terminology) that is "spent" each month.  The unsaved portion is determined by [plan.cashFlow.savingRate](datatypes.md#cashflow). For example, if in a given month the plan has $1,000 of excess income, and savingRate = 0.75, then $750 will be withdrawn from the plan's [checkingAccount](datatypes.md#cashflow). |
| `@income_tax` | expense | The actual income tax payments made to the IRS.  Income tax includes federal, state, FICA, and other taxes. |

## Terminology

| Term  | Definition |
| ------| ---------- |
| liquid&nbsp;asset | A [liquid asset](https://www.investopedia.com/terms/l/liquidasset.asp) is an asset that can easily be converted into cash in a short amount of time.  Within FPE, an [account](datatypes.md#account) is classified as a liquid asset based on its [type](datatypes.md#accounttype) combined with the following rules:<br/>  - NOT a liquid asset if account type is `asset`, `loan`, `revolvingCredit` or `reverseMortage` <br/>  - IS a liquid asset for any other account type |
| excess&nbsp;income | After processing all expenses, transfers, tax payments, and contributions to retirement plans within a given month, _excess income_ is the remainder of the gross income received that month. |
