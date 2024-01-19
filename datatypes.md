# Data Structures and Types

## Account

An `account` is a financial ledger of the transactions within a real-world account (e.g. a savings account, an IRA, or an asset).

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `balance` | int | The account balance at the start of the simulation. |
| `balanceLimit` | int |  Sets a balance limit on this account.  This attribute is only valid for accounts of type `loan` or `revolvingCredit`.|
| `costBasis` | int | [Cost basis](https://www.investopedia.com/articles/investing/060313/what-determines-your-cost-basis.asp) is the original value or purchase price of an asset or investment for tax purposes.  This attribute is only relevant for accounts on which capital gains taxes are calculated.  Default value is `balance * 0.75`. |
| `disableOptimalWithdraw` | boolean | If true, this account is excluded from the candidate accounts selected for the _Optimal Withdrawal Strategy_ (refer to [PaymentStream\.source](#paymentstream) description). Defaults to `false`. |
| `disableRMD` | boolean | If true, RMDs are guaranteed not to be taken from this account, regardless of context (e.g. the person's age or the account's type). Defaults to `false`. |
| `disableRothConversion` | boolean | If true, the _Roth Conversion Optimizer_ algorithm will ignore this account when finding candidate tax-advantaged accounts to be converted.  Defaults to `false`. |
| `inherited` | boolean | Required for modeling [inherited IRAs](https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-beneficiary).  If this account has a designated beneficiary, set this attribute to `true`.  Inherited retirement accounts are:<br/>&nbsp;&nbsp;1. not subject to RMDs<br/>&nbsp;&nbsp;2. not eligible for Roth conversion|
| `name` | string | The unique name of the account (e.g. `"wells_fargo_savings"`). Valid characters are: `[a-zA-Z0-9]`, `-`, `_`, `/`, and white space.|
| `owner` | enum | Determines the account owner (valid values are [`primary`, `spouse`]). If this attribute is empty AND the primary account holder has no spouse, then the value defaults to `primary`. |
| `rate` | [Rate](#rate) | Determines the account's growth, which is calculated and updated on a monthly basis.
| `realizedGainRate` | float | Determines the percentage of projected monthly investment returns that are realized immediately, and therefore taxed as capital gains.  A value of `1.0` means 100% of investment returns will be taxed immediately. A value of `0.0` means none of the returns are realized immediately, and so capital gains will only be processed upon a distribution event. This attribute is only relevant for accounts on which capital gains taxes are calculated.  Default value is `1.0`. |
| `taxDeductibleInterest` | boolean | Set to `true` if the interest accrued on this loan or mortgage is tax deductible. Default is `false`. |
| `taxTreatment` | enum |  Determines how growth on an Account is taxed. Valid values are `capitalGains` or `ordinaryIncome`. Default is `capitalGains`. |
| `type` | [AccountType](#accounttype) | Determines the type of account. Common account types are `aftertax`, `401k`, `asset`, and `loan`. |
| `ytdContribution` | int | Specifies the total contributions made to this account year-to-date. Only applies to tax-deferred accounts.  This value is needed in order to accurately model current-year annual contribution limits. |

#### AccountType

The `AccountType` enum represents the different types of accounts that can be modeled in FPE.

| Value | Description |
| ------------ | ----------- |
| `aftertax` | Any account funded with after-tax dollars (e.g. checking account). |
| `asset` | An [asset](https://www.investopedia.com/terms/a/asset.asp) is a resource with economic value that an individual owns or controls with the expectation that it will provide a future benefit. For example: real estate, vehicles, fine art, and jewelry. |
| `ira` | See [Traditional IRA](https://www.investopedia.com/terms/t/traditionalira.asp) |
| `401k` | See [Traditional 401(k)](https://www.investopedia.com/terms/1/401kplan.asp) |
| `529` | A [529 plan](https://www.investopedia.com/terms/1/529plan.asp) is a tax-advantaged savings plan designed to help pay for education. |
| `hsa` | A [Health Savings Account](https://www.investopedia.com/terms/h/hsa.asp) (HSA) is a tax-advantaged savings account that is created for people who get their insurance coverage through [high-deductible health plans](https://www.investopedia.com/terms/h/hdhp.asp).  Capital gains on HSA's <u>ARE</u> taxed in California (CA) and New Jersey (NJ), and are <u>NOT</u> taxed in all other U.S. states. |
| `roth` | See [Roth IRA](https://www.investopedia.com/terms/r/rothira.asp) |
| `roth401k` | See [Roth 401(k)](https://www.investopedia.com/terms/1/401kplan.asp) |
| `loan` |  A type of credit vehicle in which a sum of money is lent to another party in exchange for future repayment of the value or principal amount. In FPE, a loan refers specifically to the borrowing of a specific one-time amount (e.g. car loan, mortgage) vs. revolving credit loans (e.g. cred cards). |
| `mortgage` | A [mortgage](https://www.investopedia.com/terms/m/mortgage.asp) is a loan used to purchase or maintain a home, land, or other types of real estate. |
| `revolvingCredit` | [Revolving credit](https://www.investopedia.com/terms/r/revolvingcredit.asp) is an agreement that permits an account holder to borrow money repeatedly up to a set dollar limit while repaying a portion of the current balance due in regular payments. Two common examples are [credit cards and LOC (line of credit)](https://www.bankrate.com/finance/credit-cards/line-of-credit-vs-credit-card/). |
| `reverseMortgage` | See [What is a Reverse Mortgage?](https://www.investopedia.com/mortgage/reverse-mortgage/) |

<br/><hr/>


## Date

The `date` datatype stores only year and month (i.e. no day-level precision).  Dates are formatted as `YYYY-MM` (a reduced-precision [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) date format).  Examples:

- `1955-11` => November 1955
- `2021-01` => January 2021
- `2030-12` => December 2030

<br/><hr/>


## Duration

A duration specifies a specific length of time with month-accuracy.  The duration datatype is typically used for representing a person's age.  The format is `{Y}y[{M}m]`, where `{Y}` is the year portion of the duration, and `{M}` is the month portion.  If `{M}m` is omitted, then `0` months is assumed.  Examples:

- `35y7m` => 35 years and 7 months old
- `65y0m` => 65 years old
- `65y`   => 65 years old
- `3m`    => 3 months old

<br/><hr/>


## Events

The `Events` object represents various non-periodic life events such as relocating to a new [U.S. state](#usstate), buying a new home, or purchasing an annuity.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `relocations` | [Relocation[]](#relocation) | Models relocating to a new [U.S. state](#usstate). |
| `assetSales` | [AssetSale[]](#assetsale) | Models buying/selling of assets, especially real estate. |
| `reverseMortgages` | `ReverseMortgage[]` | Models 1 or more [reverse mortgages](https://www.investopedia.com/mortgage/reverse-mortgage/). |
| `annuityPurchases` | `AnnuityPurchase[]` | Models 1 or more future annuity purchases, which are then converted into periodic income starting at some point after the purchase date. |

#### AssetSale

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `date` | [Date](#date) | The date on which the asset sale transaction takes place. |
| `currentAssetName` | string | The name of the account representing the asset being sold (omit if no asset is being sold). |
| `currentLoanName` | string | The name of the account representing the loan associated with the current asset (omit if none). |
| `newAssetName` | string | The name of the account representing the new asset being purchased (omit if none). |
| `newAssetBalance` | int | The price of the new asset. |
| `newAssetStateCode` | [USState](#usstate) | If this transaction involves a relocation to a new state (e.g. buying a house as a primary residence in a new state), assign a valid state code to this attribute.  Doing so allows the tax module to compute future taxes using the new state's tax data. |
| `transactionAccountName` | string | The name of the account to use for all transactions involved in this asset sale.  This includes deposits (e.g. proceeds from asset sales) and withrawals (e.g. down payment on a new house). If this attribute is omitted, then proceeds will deposit into the default savings account, and the _Optimal Withdrawal Strategy_ will be used for withdrawals. |
| `newLoanName` | string | The name of the new loan associated with the new asset (omit if none). |
| `newLoanBalance` | int | The starting balance on the new loan (omit if none). |

#### Relocation

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `date` | [Date](#date) | The date of relocation. |
| `stateCode` | [USState](#usstate) | The U.S. state corresponding to the primary's current state of residence. |

A sample JSON request for relocation is [here](examples/forecast/housing/relocation-01.json).

<br/><hr/>


## Forecast

`Forecast` represents the calculated financial projection of the user's financial [Plan](#plan).

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `accounts` | [Projection[]](#projection) | The projected periodic account balances corresponding to the [accounts](#account) defined within the [Plan](#plan). Also contains FPE-calculated streams (see [PaymentStream projections](output_streams.md#account-projections)). |
| `annualReports` | [AnnualReports](#annualreports) | Contains various reports that are unconditionally annual in nature (e.g. income tax due). |
| `currentNetWorth` | int | The net worth of user's [Plan](#plan) at the beginning of the financial projection. |
| `dti` | float | The Debt-to-Income ratio of the user's [Plan](#plan), which was calculated as a result of adding [params.calcDTI: true](#forecastparams) to the request. |
| `duration` | [Duration](#duration) | The timespan of the financial projection. |
| `endDate` | [Date](#date) | The date of the final month in the financial projection. |
| `estateValue` | int | The net worth of user's [Plan](#plan) at the end of the financial projection. See [estate value](terms.md#estate-value). |
| `fire` | [FIRE](#fire) | Contains details as to the earliest retirement dates across the earned income streams that still yields a non-negative [liquid estate value](terms.md#liquid-estate-value).  |
| `lifetimeSSBenefit` | int | The sum of all social security payments received throughout the financial projection. |
| `lifetimeTaxes` | int | The net sum of all federal and state taxes paid throughout the financial projection. Includes all income taxes (plus FICA, self-employment, and other state-specific taxes) and all capital gains taxes paid minus any tax refunds received. |
| `monthlyRetirementIncome` | int | The estimated monthly income received in retirement. This attribute is only calculated if `params.calcMonthlyRetirementIncome` is set to true in the request. |
| `outOfSavingsDate` | [Date](#date) | The date that the user's [Plan](#plan) runs out of savings and starts accumulating debt. A value of `null` means the plan never ran out of savings. |
| `paymentStreams` | [Projection[]](#projection) | The projected periodic payments corresponding to the [paymentStreams](#paymentstream) defined within the [Plan](#plan).  Also contains FPE-calculated streams (see [PaymentStream projections](output_streams.md#paymentstream-projections)). |
| `period` | string | Determines how the values in this forecast's TimeSeries data points should be interpreted: `yearly` => values are annualized, `monthly` => monthly values |
| `postRetireIncomeExpenseRatio` | float | This value loosely serves as a "retirement readiness" score.  It is unbounded (e.g. if person has high income and very low expenses in retirement, this score will be well over `1.0`). |
| `spendingPower` | int | The maximum amount of income a user could have in retirement if they spent the exact same amount every year. |
| `startDate` | [Date](#date) | The date of the initial month in the financial projection. |

#### AnnualReports

Contains various reports that are unconditionally annual in nature (e.g. income tax due).

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `fedIncomeTaxDue` | int[] | The federal income tax due for each tax year in the simulation.  |
| `fedMarginalIncomeTaxRates` | float[] | The federal marginal income tax rate for each tax year in the simulation. |
| `fedTaxableIncome` | int[] | The portion of gross income that the IRS deems subject to federal taxes.  FICA and capital gains are not included in this amount.  See [Investopedia: Taxable Income](https://www.investopedia.com/terms/t/taxableincome.asp). |
| `incomeTaxTrueUp` | int[] | Reports the annual true-up applied for each year in the simulation.  A positive true-up amount indicates a refund, whereas a negative amount indicates the actual tax owed. |
| `fedTaxableIncomeByBracket` | [IncomeTaxDataRange[]](#incometaxdatarange) | Reports federal taxable income by tax bracket for each tax year in the simulation. |
| `stateTaxableIncome` | int[] | The portion of gross income that a given state's Department of Revenue deems subject to state taxes. |
| `stateIncomeTaxDue` | int[] | The state income tax due for each tax year in the simulation.  |
| `stateMarginalIncomeTaxRates` | float[] | The state marginal income tax rate for each tax year in the simulation. |
| `stateTaxableIncomeByBracket` | [IncomeTaxDataRange[]](#incometaxdatarange) | Reports state taxable income by tax bracket for each tax year in the simulation. |

#### FIRE

`FIRE` (a.k.a. "earliest retire date") is the result of the optional [calcFIRE](datatypes.md#forecastparams) calculation, which solves for the earliest `endDate` that can be used across all work income streams (i.e. [PaymentStreams](#paymentstream) whose `earnedIncome` flag is true), such that the forecast's [liquid estate value](terms.md#liquid-estate-value) `V` is in the range `-1000　≤　V　≤　1000`.

When searching for an optimal solution, the algorithm is constrained by the following rules:

- A work income stream's `startDate` can never be modified
- Multiple work income stream scenario:
    - The algorithm can move the endDate back in time (i.e. allow the person to quit their job sooner) for any/all work income streams.  However, only the most current job(s) are considered when moving the endDate further into the future.
    - Formally defined:
        - Let J = the set of all work income streams (jobs) in the [plan](datatypes.md#plan)
        - Let j<sub>k</sub> = the k<sup>th</sup> job in set J
        - Let d<sub>k</sub> = the original endDate for j<sub>k</sub> prior to any modifications by this algorithm
        - Let d'<sub>k</sub> = the algorithm's suggested endDate for j<sub>k</sub>
        - The endDate of job j<sub>k</sub> may be modified _iff_ any of the following statements are true:
            - d'<sub>k</sub> < d<sub>k</sub>
            - d'<sub>k</sub> = the latest endDate across all jobs in set J

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `origRetireDate` | string | The plan's inferred retirement date, which is based on the latest date across all `earnedIncome` [PaymentStreams](#paymentstream). |
| `liquidEstateValue` | int | See [liquid estate value](terms.md#liquid-estate-value) definition. |
| `earliestRetireDates` | map | A map of [PaymentStream](#paymentstream) names to [Date](#date) entries, where each entry indicates the earliest `endDate` for the named stream that satisfies the [liquid estate value](terms.md#liquid-estate-value) goal described in the summary above. |

Sample JSON requests can be found in [examples/forecast/calc_fire/](examples/forecast/calc_fire/).

#### IncomeTaxDataRange

Within a given tax jurisdiction (federal or state), `IncomeTaxDataRange` represents taxable income by tax bracket over a range of consecutive years.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `startYear` | int | The year in which the reported taxable income starts within this range (year is inclusive). |
| `endYear` | int | The year in which the reported taxable income ceases within this range (year is exclusive). |
| `filingStatus` | enum | The IRS filing status of the corresponding tax brackets.  Valid values are `single` and `married`. |
| `stateCode` | [USState](#usstate) | The U.S. state corresponding to the tax bracket data. If the tax jurisdiction is federal, then this attribute is omitted.  |
| `taxBrackets` | [TaxBracket[]](#taxbracket) | Chronological list of tax brackets for this IncomeTaxDataRange. |

#### Projection

A named [time series](https://en.wikipedia.org/wiki/Time_series) that represents a financial projection whose monetary values represent account balances, payments, or reports depending on the projection's `type` attribute.  In addition, the projection's values can represent either yearly or monthly amounts based on the `annualized` Boolean attribute (see below).

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `annualized` | boolean | If `true`, the values in this projection stream represent yearly values.  If `false`, the values are monthly. |
| `name` | string | The name of this time series. |
| `type` | string | The classification of this time series. If this series represents account balances, `type` is assigned the [AccountType](#accounttype) of the corresponding account. Otherwise, this time series represents payments or a report, in which case `type` is assigned one of [`income`, `expense`, `transfer`, `report`]. |
| `sourceAccount` | string | If this projection represents a payment projection, then `sourceAccount` is the name of the [Account](#account) from which the payments originated.  This attribute is only present for expenses and transfers (but not for income). |
| `targetAccount` | string | If this projection represents a payment projection, then `targetAccount` is the name of the [Account](#account) into which the payments were deposited.  This attribute is only present for income and transfers (but not for expenses). |
| `taxable` | boolean | If `true`, this projection represents a payment stream that is subject to taxation.  If `taxableFederal` is `false` or omitted, then the scope of `taxable` applies at both the federal and state level. |
| `taxableFederal` | boolean | If `true`, the values in this projection are specifically taxable at the federal level. |
| `values` | int[] | The periodic values within this time series. The first value in this series corresponds to [Plan.currentDate](#plan). |

#### TaxBracket

Represents annual income subject to income tax at the specified `rate`.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `rate` | float | The income tax rate for this tax bracket. |
| `income` | int[] | The annual taxable income over a range of years within this tax bracket.  Note that the income limits within the bracket could be [inflation-adjusted](#market) over time |

<br/><hr/>

## ForecastParams

This is the multifaceted configuration object that influences how the financial forecast is projected; it is part of the request object of multiple endpoints (most notably, `POST /forecast`).

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `calcDTI` | boolean | If `true`, the DTI (Debt-To-Income ratio) for the plan is calculated, and the result appears in the `dti` attribute of the [Forecast](#forecast) response. |
| `calcFIRE` | boolean | If `true`, the 'FIRE' solver is executed, and the result appears in the [Forecast.FIRE](#fire) response. |
| `calcPostRetireIncomeExpenseRatio` | boolean | If `true`, the _Income/Expense Ratio_ calculation is executed, and the result appears in [Forecast.postRetireIncomeExpenseRatio](#forecast) within the response. |
| `calcSpendingPower` | boolean | If `true`, the 'Spending Power' calculation executes, and the result appears as the `spendingPower` attribute within the [Forecast](#forecast) response object. Note that [plan.primary.retireDate](#person) must be set when running this calculation. See [Forecast.spendingPower](#forecast) for more details on this calculation. |
| `projectionPeriod` | enum | Determines if the forecasted projection vectors represent monthly or aggregated annual amounts. Valid values are [`monthly`, `yearly`]. If this attribute is empty, `yearly` is the default. |
| `rothConversionOptimizer` | [RCOParams](#rcoparams) | Configuration object for the Roth Conversion Optmizer algorithm. |

### RCOParams

These config parameters are used exclusively by the [Roth Conversion Optimizer](README.md#post-v6optimizeroth).

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `algoType` | enum | Determines the optimization algorithm to use.  Defaults to `heuristic`.  Valid values are: [`heuristic`, `rulebased`]. |
| `goalMetric` | enum | Specifies the intended goal of the optimization. Valid values are: [`estateValue`, `lifetimeTaxes`]. When `algoType="heuristic"`, this goal drives the [gradient descent](https://en.wikipedia.org/wiki/Gradient_descent) optimization logic. For all `algoType` variants, `goalMetric` determines whether or not the [algoImprovedNothing](README.md#warning-codes) is returned. |
| `maxDollarAmount` | int | Sets an upper bound on the amount of money that will be converted to Roth IRAs within a given year. |
| `maxEffectiveFedTaxRate` | float | Only applicable when `algoType="heuristic"`.  The RCO algorithm will limit the Roth conversion amount for a given year such that the specified effective federal tax rate is not exceeded for that year.  If not set, this value defaults to the max rate of the plan's existing federal effective tax rates throughout the forecast. |
| `maxIRMAABracket` | int | Only applicable when `algoType="rulebased"`.  Determines the inflation-adjusted [IRMAA income bracket](README.md#get-v6medicareirmaa) limit used as the target for suggesting the Roth conversion amount within a given year.  The algorithm will attempt to find a conversion amount that results in a [MAGI](https://www.investopedia.com/terms/m/magi.asp) that is as close to the selected IRMAA income limit without exceeding it. <br/><br/>Valid values:<ul><li>`0` = the lowest income bracket ($97K for single filers and $194K for married filers in 2023)</li> <li>`1` = the 2<sup>nd</sup> lowest income bracket</li> <li>`2` = the 3<sup>rd</sup> lowest income bracket</li> <li>`k` = the (k+1)<sup>th</sup> lowest income bracket.  If `k` is greater than the number of IRMAA income brackets, then this constraint is effectively disabled.</li></ul> Notes: <ol><li>This attribute is mutually exclusive of `maxTaxBracket`; if both attributes are set, an `HTTP 400` error will result.</li> <li>The algorithm will stop increasing the conversion amount when doing so would trigger an [insufficientFunds](README.md#warning-codes) warning on a _user-defined_ expense/transfer.</li> </ol> |
| `maxTaxBracket` | int | Only applicable when `algoType="rulebased"`.  Determines the highest inflation-adjusted federal tax bracket beyond which the algorithm will stop recommending Roth conversions within a given year. <br/><br/>Valid values:<ul><li>`0` = the special [zero tax bracket](https://www.realized1031.com/blog/what-does-it-mean-to-be-in-a-zero-tax-bracket)</li> <li>`1` = the 1<sup>st</sup> lowest tax bracket (10% for single filers in 2023)</li> <li>`2` = the 2<sup>nd</sup> lowest tax bracket (12%)</li> <li>`k` = the k<sup>th</sup> lowest tax bracket.  If `k` is greater than the number of federal tax brackets, then this constraint is effectively disabled.</li></ul>  Notes: <ol><li>This attribute is mutually exclusive of `maxIRMAABracket`; if both attributes are set, an `HTTP 400` error will result.</li> <li>The algorithm will stop increasing the conversion amount when doing so would trigger an [insufficientFunds](README.md#warning-codes) warning.</li> </ol> |
| `minAfterTaxFundsToKeep` | int | If set to a nonnegative value, the RCO algorithm will limit the Roth conversion amount based on aftertax funds available to pay for the estimated tax due for the conversion (a 20% tax rate is assumed).  For example, if set to `1000`, then the maximum annual conversion for a given year will be:<br/> &nbsp;&nbsp;&nbsp;&nbsp;`max(0, x-1000) / 0.20`<br/> where `x` is the total available aftertax funds for that year. <br/><br/>If unset or `null`, the algorithm is allowed to pay for taxes on Roth conversions via any available funds (e.g. tax-deferred dollars from an IRA). |

<br/><hr/>

## PaymentStream

A `paymentStream` represents one-time or recurring payments into, out of, or between accounts.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `aboveTheLine` | boolean | If true, the tax-deductible portion of the expense is subtracted from gross income prior calculating AGI.  Otherwise, it is treated as an itemized deduction (below-the-line). __NOTE:__ This attribute is relevant only when `taxDeductionRate > 0.0`. |
| `contributions` | [ContributionFromIncome[]](#contributionfromincome) | (Optional) Specifies 1 or more [income-linked contributions](income_linked_contribs.md#income-linked-contributions) taken directly from an income payment. Use this for modeling things like 401(k) employee contributions with employer matching rules. |
| `date` | [Date](#date) | Specify a single payment on a specific date. __Note:__ this is just a shorthand method of configuring a one-time payment; the same thing can be accomplished via `startDate` and `endDate`.  E.g. `{date: "2040-06"}` is the same as `{startDate: "2040-06", endDate: "2040-07"}`. |
| `dti` | boolean| If true, this PaymentStream will be treated as debt when calculating debt-to-income. See [params.calcDTI](#forecastparams). |
| `earnedIncome` | boolean | If true, indicates this is an income stream that satisfies the IRS's definition of [earned income](https://www.investopedia.com/terms/e/earnedincome.asp). |
| `endDate` | [Date](#date) | The date that future payments have ceased. |
| `name` | string | The unique name of this paymentStream (e.g. `"auto_insurance"`). Valid characters are: `[a-zA-Z0-9]`, `-`, `_`, `/`, and white space. |
| `owner` | enum | Determines who the payments are associated with. Valid values are [`primary`, `spouse`].  If an owner is assigned, payments will cease upon the owner's death.  Otherwise, payments will continue through the end of the simulation. |
| `paymentAmount` | int | The dollar amount of the payment. |
| `paymentsPerYear` | int | Determines the payment frequency within a given year. Valid values are: [`1`, `2`, `4`, `12`].  Regardless of frequency, the first payment occurs on `startDate` (or `date`). |
| `propertyTax` | boolean | Set to `true` if this is a property tax payment on real estate. |
| `qcd` | boolean| If true, this PaymentStream will be treated as a [QCD](https://www.investopedia.com/qualified-charitable-distribution-qcd-5409491), assuming it meets the necessary criteria of one. |
| `rate` | [Rate](#rate) | Determines the annual growth rate of the payment over time.  The growth is applied annually starting 12 months into the simulation. |
| `source` | string | The name of the [account](#account) from which the payment will be withdrawn. <br/>**Special case**: If "optimal" is specified, the algorithm will implicitly withdraw the requested amount from 1 or more existing accounts, taking into consideration account type, projected growth rate, and possibly other attributes in an attempt to minimize negative impact on the plan's interest growth. For details, see [optimal withdrawal strategy](optimal_withdraw.md). |
| `startDate` | [Date](#date) | The date that future payments commence.  |
| `startGrowthOnFirstPayment` | boolean | If true, annual growth (determined by `rate`) is deferred until the first payment occurs (determined by `startDate`). By default, growth starts immediately. |
| `survivorBenefit` | float | A rate in the range `[0..1]` that determines the ratio of each payment amount that is retained when the paymentStream's owner dies. This attribute is typically needed for modeling annuities and pensions. |
| `target` | string | The name of the [account](#account) into which the payment will be deposited. |
| `taxable` | boolean | [Income streams](terms.md#income-stream) flagged as taxable are considered when calculating AGI for tax purposes.  For example, an annuity income stream may or may not be taxed depending on the individual's chosen configuration. Defaults to `true`. |
| `taxDeductionRate` | float | A value in the range [0..1] that indicates what percentage of the expense is tax-deductible.  If unset, the default value is `0.0`. __NOTE:__ This attribute only applies to [expense streams](terms.md#expense-stream). |
| `itemizedDeductionCategory` | string | All itemized expenses for a given category will be aggregated into a single report stream whose name is `@{govLevel}_itemized_deduction_by_category:{category}`, where `{govLevel}` is either `state` or `federal`, and `category` is the value of this attribute. __NOTE:__ This attribute only applies to [expense streams](terms.md#expense-stream). |


#### ContributionFromIncome

`ContributionFromIncome` determines how contributions (employee and employer) from earned income are calculated, and to what account(s) the contributions will be deposited.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `employeeContribAmount` | int | Specifies a fixed dollar amount (per income payment period) that the employee contributes to their retirement plan. This amount is bound by the employee's total income for the given period. |
| `employeeContribAmountCap` | int | Imposes an upper bound on `employeeContribAmount` (which can potentially increase annually based on `employeeContribAmountInc`). |
| `employeeContribAmountInc` | int | Automatically increments `employeeContribAmount` on an annual basis by the specified amount. This annual contribution amount increase commences in the same month that the [PaymentStream's](#paymentstream) annual growth rate would normally start (i.e. 12 months past the simulation's start date). |
| `employeeContribRate` | float | Determines how much the employee contributes to their retirement plan, expressed as a percentage of their annual income.  Valid range is `[0.0, 1.0]`. |
| `employeeContribRateInc` | float | Automatically increments `employeeContribRate` on an annual basis by the specified rate. This annual contribution rate increase commences in the same month that the [PaymentStream's](#paymentstream) annual growth rate would normally start (i.e. 12 months past the simulation's start date). Valid range is `[0.0, 1.0]`. |
| `employeeContribRateCap` | float | Imposes an upper bound on `employeeContribRate` (which can potentially increase annually based on `employeeContribRateInc`).  Valid range is `[0.0, 1.0]`. |
| `employeeContribTarget` | string | The name of the account into which employee contributions are deposited. |
| `employerContribAmount` | int | Specifies a fixed dollar amount (per income payment period) that the employer contributes to the `employerContribTarget` account. |
| `employerContribRate` | float | Determines how much the employer contributes to the employee's retirement plan, expressed as a percentage of their annual income.  E.g. a value of `0.05` means the employer will contribute 5%.  Valid range is `[0.0, 10000.0]`. |
| `employerContribRateCurve` | [EmployerContribRatePt[]](#employercontribratept) | Represents an employer contribution rate that changes over time.  Each object in the array represents a contribution rate and the date on which that rate becomes active. For sample usage, [see this](./examples/forecast/contrib_from_income/case-08.json). |
| `employerContribTarget` | string | The name of the account into which employer contributions are deposited.  If no account is specified, employer contributions will by default be deposited into `employeeContribTarget`. |
| `employerMatches` | [EmployerMatch[]](#employermatch) | Defines single- and multi-tier employer matching rules. |
| `employerMatchAnnualCap` | int | Imposes an annual limit on the amount of money the employer contributes to the plan as a match. |
| `endDate` | [Date](#date) | All income-linked contributions will cease as of this date. |


#### EmployerContribRatePt

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `rate` | float | The percentage of the employee's income that will be contributed by their employer. E.g. a value of `0.05` means the employer will contribute 5%. Valid range is `[0.0, 10000.0]`. |
| `age` | float | The start age of the account owner at which `rate` becomes the active employer contribution rate.  Note that the new rate is activated in January of the year that the account owner turns the specified age. |


#### EmployerMatch

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `rate` | float | Determines how much of the employee's contribution that the employer will match.  E.g. `1.0` => dollar-for-dollar matching, `0.5` => 50¢-on-the-dollar match. Valid range is `[0.0, 1.0]`.|
| `upTo` | float | Determines the maximum amount of money the employer will match, expressed as a percentage of the employee's annual salary. |

<br/><hr/>


## Person

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `birthDate` | [Date](#date) | The person's date of birth. |
| `retireDate` | [Date](#date) | The date on which this person plans to retire. |
| `gender` | [Gender](#gender) | The person's gender. |
| `goalAge` | [Duration](#duration) | How long the person expects to live.  See [longevity age](terms.md#longevity-age). |
| `socialSecurity` | [SocialSecurity](#socialsecurity) | Social security configuration. |
| `medical` | [Medical](#medical) | Attributes relating to the person's heath and health-related services (e.g. Medicare). |

#### Gender

The `Gender` enum represents a person's gender.  Valid values are `male` and `female`.

#### SocialSecurity

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `startAge` | [Duration](#duration) | The age at which social security benefits will commence. |
| `monthlyBenefit` | int | The dollar amount of the benefit the person will receive. This attribute is mutually exclusive of `primaryInsuranceAmount`. |
| `primaryInsuranceAmount` | int | A.k.a. [PIA](https://www.investopedia.com/terms/p/primary-insurance-amount.asp), the benefit a person would receive if they elect to begin receiving retirement benefits at [FRA](https://www.investopedia.com/terms/n/normal-retirement-age-nra.asp). This attribute is mutually exclusive of `monthlyBenefit`. |

#### Medical

The `Medical` object contains the attributes relating to a person's health and healthcare-related info.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `needsLTC` | boolean | True only if the person requires long-term care. |
| `hasLTCI` | boolean | True only if the person has long-term care insurance (LTCI).  This flag is ignored if `needsLTC` is false. |
| `health` | enum | Indicates a person's physical health.  It is needed for providing more accurate medical cost estimates.  Valid values are `excellent`, `good`, and `poor`.  Default is `excellent`. |
| `medicareStartAge` | [Duration](#duration) | The age at which Medicare-related expenses will commence.  Default age is `65y`.  To exclude Medicare-related costs from the financial projection, set this age equal to or greater than the [person's goalAge](#person). |
| `medigapPremium` | [PremiumLevel](#premiumlevel) | The levels of cost for Medigap premiums. |
| `drugPremium` | [PremiumLevel](#premiumlevel) | The levels of cost for prescription drug premiums. |
| `medicareAdvantage` | [PremiumLevel](#premiumlevel) | The levels of cost for Medicare Advantage premiums. |

#### PremiumLevel

`PremiumLevel` is an enum that represents general cost levels for various Medicare-related services.  Valid values are `low`, `medium`, and `high`.

<br/><hr/>


## Plan

A `plan` is the top-level financial object; it represents the user's complete present-day financial plan.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `accounts` | [Account[]](#account) | Array of accounts within the financial plan. |
| `cashFlow` | [CashFlow](#cashflow) | Determines how excess income is spent/saved. |
| `currentDate` | [Date](#date) | Today's date. |
| `events` | [Events](#events) | Describes various non-periodic life events such as buying a new home or purchasing an annuity. |
| `limitRetireAccountContribs` | boolean | If `true`, income-linked contributions to `401k` and `ira` accounts will be capped based on IRS-defined rules; default value is `false`. |
| `market` | [Market](#market) | Market data (inflation rate, etc.). |
| `paymentStreams` | [PaymentStream[]](#paymentstream) | Array of payment streams within the financial plan. |
| `primary` | [Person](#person) | The primary account holder within the simulation. |
| `spouse` | [Person](#person) | The primary's spouse (optional). |
| `stateCode` | [USState](#usstate) | The primary's current state of residence. |
| `tcjaSunset` | boolean | If true, FPE will model the [sunsetting](https://www.investopedia.com/terms/s/sunsetprovision.asp) of the [Tax Cuts and Jobs Act](https://www.investopedia.com/taxes/how-gop-tax-bill-affects-you/) due to end starting in 2026. Default is `false`. |

#### CashFlow

`CashFlow` determines how money being transferred into the plan is dealt with.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `checkingAccount` | string | The name of the "default checking" account into which all income that needs to be tracked (in terms of surplus/gap) will be deposited. |
| `savingsAccount` | string | the name of the "default savings" account to which excess income will be saved. |
| `savingRate` | float | The percentage of excess income for the month that will be saved into `savingsAccount`.  Valid range is `[0.0, 1.0]`. Default value is `0.0` (i.e. spend any money leftover at the end of the month). |
| `depositTaxRefundToSavings` | boolean | If `true`, tax refunds are deposited into default savings; otherwise refunds go into default checking.  Default value is `false`. |

#### Market

The `Market` object contains financial market data and other economic values that vary on a global basis.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `inflation` | [Rate](#rate) | The estimated U.S. annual inflation rate. |
| `medicalInflation` | [Rate](#rate) | The estimated annual medical cost inflation rate. |
| `socialSecurityInflation` | [Rate](#rate) | The estimated social security inflation rate. |

<br/><hr/>


## Rate

The `Rate` object describes the growth rate and variability of various financial objects, such as [Accounts](datatypes.md#account) and [PaymentStreams](datatypes.md#paymentstream).  This object is, in a sense, polymorphic, in that its behavior varies based on how it's configured, what parent object it's attached to, and the type of simulation in which it is participating.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `mean` | float | The mean (average) annualized rate of growth. Valid range is `[-0.4, 0.4]`. |
| `stdev` | float | The standard deviation of the random growth rate (only applicable when running a Monte Carlo simulation). |
| `curve` | [RatePt[]](#ratept) | Defines 1 or more growth rates that will occur at specified future dates within the projection.  If this array is defined, all other attributes of this `Rate` object are ignored. The `RatePt` objects within this curve do not necessarily need to be in chronological order. __NOTE:__ Rate curves are only allowed on [Account](datatypes.md#account) objects. |

#### RatePt

`RatePt` represents a growth rate associated with a single point in time (year granularity).

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `rate` | [Rate](#rate) | Describes the growth rate characteristics for the time segment implied by this `RatePt` object and the following one within the parent `Rate.curve[]`. |
| `date` | [Date](#date) | The future date within the financial projection on which the new rate will apply. |

<br/><hr/>


## USState

`USState` is an enum that represents the 50+ U.S. states/territories.  For example: `CA` (California), `NY` (New York), `TX` (Texas).  Each enum value is a 2-character code based on the [ISO 3166 Standard](https://www.iso.org/obp/ui/#iso:code:3166:US) (Codes for the representation of names of countries and their subdivisions).
<br/><br/>
<b>NOTE:</b> The ISO 3166 standard supports [user-assigned code elements](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#User-assigned_code_elements) for application-specific functionality/meaning.  In addition to the 50 U.S. states, FPE defines the special "state" whose code is `ZZ`, which is used as a "mock U.S. state" with a generic set of tax data (e.g. 3% flat tax, $5K/$10K standard deduction for single/married filing status).
