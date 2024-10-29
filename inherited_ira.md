# Inherited IRAs

An inherited IRA is a retirement account (either `ira` or `rothIRA`) opened by the [Primary or Spouse](datatypes.md#plan) when they are the beneficiary of a deceased person’s (a.k.a. _[decedent](https://www.investopedia.com/terms/d/decedent.asp)_) retirement plan.

In FPE, an inherited IRA is represented as an account that includes the optional [decedent](datatypes.md#decedent) object.  For example:

```json
{
  "accounts": [
    {
      "name": "my inherited IRA", 
      "type": "ira",
      "balance": 100000,
      "decedent": {
        "birthDate": "1951-06",
        "deathDate": "2019-11"
      }
    }
  ],
  "paymentStreams": []
}
```

Support for inherited IRAs is currently limited:

1. Future inherited IRAs not supported (i.e. `plan.account[*].decedent.deathDate` cannot be after `plan.currentDate`); otherwise, FPE returns `HTTP 400`.
1. Unlike standard (i.e. non-inherited) RMDs, FPE does not attempt to implicitly satisfy the annual RMD obligation via [optimal withdrawal](optimal_withdraw.md) expenses throughout the year.


## RMD Calculation

### Preamble

RMDs on an inherited IRA:

1. start in the year following the decedent’s death.  For example, if `decedent.deathDate = 2021-03`, then the first RMD would be due in `2022-12`.
1. must be withdrawn no later than December.
1. are calculated <u>**per account**</u> (vs. across all RMD-eligible accounts for a given account owner).

The [SECURE Act](https://www.investopedia.com/secure-act-4688468) was a 2019/2020 law designed to help more Americans save for retirement.  For the purpose of this RMD calculation:

- 'Pre-SECURE-Act' means `decedent.deathDate < 2020-01`
- 'Post-SECURE-Act' means `decedent.deathDate ≥ 2020-01`

### Distribution Period

The procedure for determining the RMD [Distribution Period](#terms) differs slightly between `ira` and `rothIRA` [account types](datatypes.md#accounttype):

#### Traditional IRA

Use this procedure when `account.type = "ira"`:

1. Pre-SECURE-Act
    1. `decedent.deathDate` < [RBD](#terms)
        1. Let `age` = beneficiary’s age in December of the RMD start year
        1. Let `lifeExp` = the [life expectancy](#life-expectancy-table) for `age`
    1. `decedent.deathDate` ≥ [RBD](#terms)
        1. Let `beneficiaryAge` = beneficiary’s age in December of the RMD start year
        1. Let `beneficiaryLifeExp` = the [life expectancy](#life-expectancy-table) for `beneficiaryAge`
        1. Let `decedentAge` = decedent’s age in December of the year they died
        1. Let `decedentLifeExp` = {[life expectancy](#life-expectancy-table) for `decedentAge`} - 1.0
        1. Let `lifeExp` = `max(beneficiaryLifeExp, decedentLifeExp)`
    1. Distribution Period = `max(1.0, lifeExp - (currentYear - rmdStartYear))`
1. Post-SECURE-Act
    1. `decedent.deathDate` < [RBD](#terms)
        1. No RMDs necessary
    1. `decedent.deathDate` ≥ [RBD](#terms)
        1. Calculate Distribution Period per requirements `1.2` and `1.3` above.

#### Roth IRA

Use this procedure when `account.type = "rothIRA"`:

1. Pre-SECURE-Act
    1. Let `age` = beneficiary’s age in December of the RMD start year
    1. Let `lifeExp` = the [life expectancy](#life-expectancy-table) for `age`
    1. Distribution Period = `max(1.0, lifeExp - (currentYear - rmdStartYear))`
1. Post-SECURE-Act
    1. No RMDs necessary

### Calculate RMD

The RMD for an account in year `y` is then calculated as follows:

1. Let `bal` = the ending balance of the account in year `y-1`.
    - If `y-1` precedes January of `plan.currentYear`, then `bal` = account balance on current date
1. Let `p` = the Distribution Period determined in the [previous section](#distribution-period)
1. `rmd = bal / p`

### Life Expectancy Table

RMDs for inherited IRAs are calculated using a [distribution period](#terms) based on the IRS [Life Expectancy Table 1](https://www.irs.gov/publications/p590b#en_US_2023_publink100089977).  For example, someone who is 35 years old is expected to live 50.5 more years according to this table.


## 10-Year Rule

1. The 10-Year Rule requires the beneficiary to withdraw the entire balance of the inherited account by December of the year containing the 10th anniversary of the owner’s death.  For example, if the decedent died in 2023, the beneficiary must fully distribute the IRA by `2033-12`.
1. The beneficiary has discretion over when to take the dollars out over this time window, and there is no penalty if completed BEFORE the end of the 10th year.
1. The 10-Year Rule applies ONLY IF they died post-SECURE-Act (i.e. `decedent.deathDate ≥ 2020-01`).
1. The one-time withdrawal from an inherited IRA resulting from the 10-Year Rule is reported in a discrete output stream named `@withdrawal:<accountName>:10yr_rule`.


## Distributions

Inherited IRA distributions resulting from either [RMDs](#rmd-calculation) or the [10-Year Rule](#10-year-rule) are deposited into the plan's designated [checkingAccount](datatypes.md#cashflow).


## Terms

| term         | definition |
| ------------ | ---------- |
| [beneficiary](https://www.investopedia.com/terms/b/beneficiary.asp) | The person receiving the inherited IRA. Corresponds to the [account.owner](datatypes.md#account) attribute in the FPE request. |
| [decedent](https://www.investopedia.com/terms/d/decedent.asp) | The original account owner who has died, and is leaving their account to a designated beneficiary. Corresponds to [account.decedent](datatypes.md#decedent) in the request. |
| distribution period | The divisor used for calculating RMDs (i.e. `RMD = {previous year balance} / {distribution period}`).  For inherited IRAs, this divisor is based on [this IRS life expectancy table](#life-expectancy-table) in conjunction with the age of either the beneficiary or decedent (based on RMD calculation rules in previous sections). |
| [RBD](https://www.investopedia.com/terms/r/requiredbeginningdate.asp) | Required Beginning Date, calculated as April of the year _after_ the year the decedent reached their [RMD age](rmd.md#rmd-age).  For example, if the decedent was born on `1953-11`, their RBD is `2027-04`. |
| [RMD](https://www.investopedia.com/terms/r/requiredminimumdistribution.asp) | Required Minimum Distribution.  See [FPE: RMD page](rmd.md) for more info regarding how FPE calculates RMDs. |
