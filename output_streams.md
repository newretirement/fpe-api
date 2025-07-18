# Output Streams

When a [plan](datatypes.md#plan) is submitted to the [POST /forecast](README.md#post-forecast) endpoint, a financial [Forecast](datatypes.md#forecast) object is returned.  This forecast contains (among other things) a set of account projections (see [Forecast.accounts](datatypes.md#forecast)), and a set of payment projections (see [Forecast.paymentStreams](datatypes.md#forecast)).  Each of these sets contain future projections of the [accounts](datatypes.md#account) and [payment streams](datatypes.md#paymentstream) defined in the [plan](datatypes.md#plan).  Also included are FPE-calculated projections, which can be identified by the `'@'` prefix character in their names (e.g. `@income_tax`, `@total_savings`).

## Account Projections

| Stream name | Type | Description |
| ----------- | ---- | ----------- |
| `@dividend:<account>` | report | The dividend payout on the account whose name is `<account>`. |
| `@interest:<account>` | report | The interest accrued on the account whose name is `<account>`. |
| `@projected_savings` | report | The sum of account balances for all [liquid asset](terms.md#liquid-asset) accounts PLUS any accounts whose type is [revolvingCredit](datatypes.md#accounttype). |
| `@total_debt` | report | The sum of all accounts with a negative balance. |
| `@total_savings` | report | The sum of account balances for all [liquid asset](terms.md#liquid-asset) accounts. |

## PaymentStream Projections

| Stream name | Type | Description |
| ----------- | ---- | ----------- |
| `@capital_gains` | report | The [capital gains](https://www.investopedia.com/articles/personal-finance/101515/comparing-longterm-vs-shortterm-capital-gain-tax-rates.asp) for the given tax year. |
| `@capital_gains_tax` | report | The [tax due on all capital gains](https://www.investopedia.com/terms/c/capital_gains_tax.asp) for the given tax year. |
| `@capital_gains_tax_payment` | expense | Represents a [capital gains tax](https://www.investopedia.com/terms/c/capital_gains_tax.asp) payment. |
| `@combined_irmaa` | report | `@irmaa + @irmaa_spouse`. |
| `@employeeContrib:${work_stream}:${index}` | report | The employee contribution amount for a given earned income stream. |
| `@employerMatch:${work_stream}:${index}` | report | Reports the employer match amount. |
| `@employerNEC:${work_stream}:${index}` | report | Reports the non-elective employer contributions (NEC's). |
| `@federal_agi` | report | The [AGI](https://www.investopedia.com/terms/a/agi.asp) used for calculating federal income taxes. |
| `@federal_income_tax` | report | The federal income tax due for the given tax year.  DEPRECATED: this stream is now in `annualReports.fedIncomeTaxDue`. |
| `@federal_itemized_deduction_by_category:SALT` | report | Reports the [SALT](https://www.investopedia.com/salt-5180146) tax deduction amount. Note: This value will be 0 if the standard deduction is higher than the calculated itemized deduction. |
| `@federal_taxable_income` | report | DEPRECATED. This stream is now in [annualReports.fedTaxableIncome](datatypes.md#annualreports). |
| `@fica` | report | The [FICA](https://www.investopedia.com/terms/f/fica.asp) amount due for the given tax year. |
| `@gap` | report | `@total_income - @total_expenses - {acctInterest} - {employeeILCs}`,<br/><br/>where `{acctInterest}` is the cumulative interest across all ordinaryIncome accounts, and `{employeeILCs}` is the cumulative employee income-linked contributions |
| `@income_tax` | expense | The actual income tax payments made to the federal and state tax authorities.  Income tax includes federal, state, FICA, and other taxes. |
| `@income_tax_true_up` | report | Reports the annual true-up for each tax year in the simulation.  A positive true-up amount indicates a refund, whereas a negative amount indicates tax owed.  DEPRECATED: this stream is now in `annualReports.incomeTaxTrueUp`. |
| `@irmaa` | report | The [IRMAA](https://www.medicareresources.org/medicare-eligibility-and-enrollment/what-is-the-income-related-monthly-adjusted-amount-irmaa/) portion of the total `@medicare_oopc` expense. |
| `@irmaa_spouse` | report | Same as the `@irmaa` payment stream, but applies exclusively to the spouse (if one is defined for this plan). |
| `@medicare_oopc` | expense | The Medicare Out-Of-Pocket-Cost within a given period. |
| `@repay:${x}` | report | Reports [lifetime debt](terms.md#lifetimedebt) repayment within a given period. `${x}` is the name of the first account in the plan whose type is [revolvingCredit](datatypes.md#accounttype). |
| `@rmd_unsatisfied` | report | Each December, FPE determines the total amount of money that has been withdrawn across RMD-eligible accounts (<u>except</u> for [inherited IRAs](inherited_ira.md)).  If this amount is less than the total [RMD liability](terms.md#rmd-liability) for a given year, FPE will explicitly withdraw the unsatisfied portion of the RMD from the plan's [designated checkingAccount](datatypes.md#cashflow).  This stream reports this <i>unsatisfied portion</i>. |
| `@saved_surplus` | report | The portion of [excess income](terms.md#excessincome) that is saved each month.  The saved portion is determined by [plan.cashFlow.savingRate](datatypes.md#cashflow). For example, if in a given month the plan has $1,000 of excess income, and savingRate = 0.75, then $250 will be transferred plan's [checkingAccount](datatypes.md#cashflow) into the plan's [savingsAccount](datatypes.md#cashflow). |
| `@ss_income` | income | Social security income stream for the primary member of the plan. |
| `@ss_income_spouse` | income | Social security income stream for the spouse (if one is defined for the plan). |
| `@state_income_tax` | report | The calculated state income tax due for the given tax year. |
| `@state_taxable_income` | report | The portion of the plan's income that is subject to state income tax for the given tax year. DEPRECATED: this stream is now in `annualReports.stateTaxableIncome`. |
| `@tax_liability` | report | The total tax liability for the given tax year.  Includes federal+state income tax, FICA, capital gains tax, and possibly other state-specific taxes. |
| `@total_expenses` | report | The sum of all PaymentStream projections of type `expense`. |
| `@total_income` | report | The sum of all PaymentStream projections of type `income`. |
| `@unfunded_gap` | report | The difference between the lifetime debt in the current period and the previous period.  More specifically, given the lifetime debt stream named `lifetimeDebt`, `@unfunded_gap[k] = min(0, lifetimeDebt[k] - lifetimeDebt[k-1])`. |
| `@unsaved_surplus` | expense | The portion of [excess income](terms.md#excessincome) that is "spent" each month.  The unsaved portion is determined by [plan.cashFlow.savingRate](datatypes.md#cashflow). For example, if in a given month the plan has $1,000 of excess income, and savingRate = 0.75, then $750 will be withdrawn from the plan's [checkingAccount](datatypes.md#cashflow). |
| `@withdrawal:${account}:10yr_rule` | income | Indicates the amount of money withdrawn from `${account}` that was used for satisfying the [Inherited IRA 10 Year Rule](inherited_ira.md). |
| `@withdrawal:${account}:rmd` | income | Indicates the amount of money withdrawn from `${account}` that was used for the purpose of satisfying RMDs for the year in which the payment occurred.  <br/><b>NOTE:</b> The sum of the values across all `@withdrawal:.*:rmd` streams within a given calendar year is equivalent to the total [RMD liability](terms.md#rmd-liability) for that year. |
| `@withdrawal:${account}:shortfall` | report | Indicates the [shortfall withdrawal](https://github.com/newretirement/fpe-api/blob/master/terms.md#shortfall-withdrawal) amount for the specified account. |