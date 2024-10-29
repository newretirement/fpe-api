# Inherited IRAs

An inherited IRA is a retirement account that was opened when either the [Primary or Spouse](datatypes.md#plan) inherited an [IRA](datatypes.md#accounttype) from someone after they died.

In FPE, an inherited IRA is represented as an account in which the [account.decedent](datatypes.md#decedent) object has been specified.  For example:

```js
{
  ”name”: “my inherited IRA”, 
  "type": "ira", 
  “decedent”: {
    ”birthDate”: “1951-06”,
    “deathDate”: “2019-11”
  }
  ... 
}
```

Support for inherited IRAs is currently limited:

- Only supports traditional IRAs (i.e. `account.type = "ira"`)
- Future inherited IRAs not supported (i.e. `plan.account[*].decedent.deathDate` cannot be after `plan.currentDate`)
- Unlike standard (i.e. non-inherited) RMDs, FPE does not attempt to satisfied [optimally-withdrawn](optimal_withdraw.md) expenses throughout the year. 


## RMD Calculation

_NOTE: RMDs on inherited IRAs must be calculated **per account** (vs. across all RMD-eligible accounts for a given account owner)._

The following procedure calculates the annual RMD that must be satisfied by December for a given account in a given year.


1. RMDs on an inherited IRA start in the year following the decedent’s death.  For example, if the decedent died in `2021-04`, then the first RMD would be due in `2022-12`.
1. Pre-SECURE-Act (decedent’s death < `2020-01`)
    1. Decedent’s death < [RBD](#terms)
        1. Let `age` = beneficiary’s age in December of the RMD start year
        1. Let `lifeExp` = life expectancy for age based on Single life expectancy table 1
    1. Decedent’s death ≥ [RBD](#terms)
        1. Let `beneficiaryAge` = beneficiary’s age in December of the RMD start year
        1. Let `beneficiaryLifeExp` = life expectancy for beneficiaryAge based on Single_life_expectancy_tbl_1
        1. Let `decedentAge` = decedent’s age in December of the year they died
        1. Let `decedentLifeExp` = {life expectancy for decedentAge based on Single_life_expectancy_tbl_1} - 1.0
        1. Let `lifeExp` = `max(beneficiaryLifeExp, decedentLifeExp)`
    1. Distribution Period = `max(1.0, lifeExp - (currentYear - rmdStartYear))`
1. Post-SECURE-Act (decedent’s death ≥ `2020-01`)
    1. Decedent’s death < [RBD](#terms)
        1. No RMDs necessary
    1. Decedent’s death ≥ [RBD](#terms)
        1. Calculate Distribution Period per requirements 2.b and 2.c above.
1. The RMD for account a in year y is then calculated as follows:
    1. Let ` bal` = the ending balance of account a in year `y-1`
        1. If `y-1` precedes January of `plan.currentYear`, then `bal` = account balance on current date
    1. Let `p` = the Distribution Period determined in the previous steps
    1. `rmd = bal / p`

## 10-Year Rule

1. The 10-Year Rule requires the beneficiary to withdraw the entire balance of the inherited account by December of the year containing the 10th anniversary of the owner’s death.  For example, if the decedent died in 2023, the beneficiary must fully distribute the IRA by `2033-12`.
1. The beneficiary has discretion over when to take the dollars out over this time window, and there is no penalty if completed BEFORE the end of the 10th year.
1. The 10-Year Rule applies ONLY IF decedent’s death ≥ `2020-01` (i.e. they died post-SECURE-Act).
1. The one-time withdrawal from an inherited IRA resulting from the 10-Year Rule is reported in a discrete output stream named `@withdrawal:<accountName>:10yr_rule`.


## Terms

| term         | definition |
| ------------ | ---------- |
| beneficiary | The person receiving the inherited IRA. Corresponds to the [account.owner](datatypes.md#account) attribute in the FPE request. |
| decedent | The original account owner who has died, and is leaving their account to a designated beneficiary. Corresponds to [account.decedent](datatypes.md#decedent) in the request. |
| distribution period | The divisor used for calculating RMDs (ie. `RMD = {previous year balance} / {distribution period}`).  For inherited IRAs, this divisor is based on [this IRS life expectancy table](https://www.irs.gov/publications/p590b#en_US_2023_publink100089977) in conjunction with the age of either the beneficiary or decedent (based on RMD calculation rules in previous sections). |
| RBD | Required Beginning Date, calculated as April of the year _after_ the year the decedent reached their [RMD age](rmd.md#rmd-age).  For example, if the decedent was born on `1953-11`, their RBD is `2027-04`. |
|RMD | Required Minimum Distribution.  See [RMD page](rmd.md) |
