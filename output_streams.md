# Output Streams Defined

When a [plan](datatypes.md#plan) is submitted to the [POST /forecast](README.md#post-v5forecast) endpoint, a financial [Forecast](datatypes.md#forecast) object is returned.  This forecast contains (among other things) a set of account projections ([Forecast.accounts](datatypes.md#forecast)), and a set of payment projections ([Forecast.paymentStreams](datatypes.md#forecast)).  Both of these sets contain future projections of the accounts and payment streams defined in the [plan](datatypes.md#plan).  These projection sets also contain FPE-calculated projections, which can be identified by the fact that their names all begin with the `'@'` character (e.g. `@income_tax`, `@total_savings`).

## Account Projections

| Stream name | Type | Description |
| ----------- | ---- | ----------- |
| `@total_savings` | report | The sum of account balances for all [liquid asset](terms.md#liquid-asset) accounts. |
| `@projected_savings` | report | The sum of account balances for all [liquid asset](terms.md#liquid-asset) accounts PLUS any accounts whose type is [revolvingCredit](datatypes.md#accounttype). |
| `@total_debt` | report | The sum of all accounts with a negative balance. |
| `@interest:<account>` | report | The interest accrued on the account whose name is `<account>`. |

## PaymentStream Projections

| Stream name | Type | Description |
| ----------- | ---- | ----------- |
| `@capital_gains` | report | The [capital gains](https://www.investopedia.com/articles/personal-finance/101515/comparing-longterm-vs-shortterm-capital-gain-tax-rates.asp) for the given tax year. |
| `@capital_gains_tax` | report | The [tax due on all capital gains](https://www.investopedia.com/terms/c/capital_gains_tax.asp) for the given tax year. |
| `@capital_gains_tax_payment` | expense | Represents a [capital gains tax](https://www.investopedia.com/terms/c/capital_gains_tax.asp) payment. |
| `@combined_irmaa` | report | `@irmaa + @irmaa_spouse`. |
| `@federal_income_tax` | report | The federal income tax due for the given tax year.  DEPRECATED: this stream is now in `annualReports.fedIncomeTaxDue`. |
| `@federal_taxable_income` | report | The portion of the plan's income that is subject to federal income tax for the given tax year. DEPRECATED: this stream is now in `annualReports.fedTaxableIncome`. |
| `@fica` | report | The [FICA](https://www.investopedia.com/terms/f/fica.asp) amount due for the given tax year. |
| `@gap` | report | `@total_income - @total_expenses` |
| `@income_tax` | expense | The actual income tax payments made to the IRS.  Income tax includes federal, state, FICA, and other taxes. |
| `@income_tax_refunds` | report | The total tax refund (if any) for each tax year in the simulation.  DEPRECATED: this stream is now in `annualReports.incomeTaxRefunds`. |
| `@irmaa` | report | The [IRMAA](https://www.medicareresources.org/medicare-eligibility-and-enrollment/what-is-the-income-related-monthly-adjusted-amount-irmaa/) portion of the total `@medicare_oopc` expense. |
| `@irmaa_spouse` | report | Same as the `@irmaa` payment stream, but applies exclusively to the spouse (if one is defined for this plan). |
| `@medicare_oopc` | expense | The Medicare Out-Of-Pocket-Cost within a given period. |
| `@repay:lifetimeDebt` | report | Reports [lifetime debt](terms.md#lifetimedebt) repayment within a given period. |
| `@saved_surplus` | report | The portion of [excess income](terms.md#excessincome) that is saved each month.  The saved portion is determined by [plan.cashFlow.savingRate](datatypes.md#cashflow). For example, if in a given month the plan has $1,000 of excess income, and savingRate = 0.75, then $250 will be transferred plan's [checkingAccount](datatypes.md#cashflow) into the plan's [savingsAccount](datatypes.md#cashflow). |
| `@ss_income` | income | Social security income stream for the primary member of the plan. |
| `@ss_income_spouse` | income | Social security income stream for the spouse (if one is defined for the plan). |
| `@state_income_tax` | report | The calculated state income tax due for the given tax year. |
| `@state_taxable_income` | report | The portion of the plan's income that is subject to state income tax for the given tax year. |
| `@tax_liability` | report | The total tax liability for the given tax year.  Includes federal+state income tax, FICA, capital gains tax, and possibly other state-specific taxes. |
| `@total_expenses` | report | The sum of all PaymentStream projections of type `expense`. |
| `@total_income` | report | The sum of all PaymentStream projections of type `income`. |
| `@unsaved_surplus` | expense | The portion of [excess income](terms.md#excessincome) that is "spent" each month.  The unsaved portion is determined by [plan.cashFlow.savingRate](datatypes.md#cashflow). For example, if in a given month the plan has $1,000 of excess income, and savingRate = 0.75, then $750 will be withdrawn from the plan's [checkingAccount](datatypes.md#cashflow). |
| `@unfunded_gap` | report | The difference between the lifetime debt in the current period and the previous period.  More specifically, given the lifetime debt stream named `lifetimeDebt`, `@unfunded_gap[k] = min(0, lifetimeDebt[k] - lifetimeDebt[k-1])`. |
