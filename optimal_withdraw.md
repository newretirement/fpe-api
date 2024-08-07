# Optimal Withdrawal Strategy

When modeling an [expense](terms.md#expense-stream) in FPE, there are 2 methods for specifying how that expense is sourced:


### METHOD 1: Withdraw exclusively from a specific account

In this example, $10,000 will be withdrawn annually, and <u>_only_</u>, from the source account named `"savings"`.

```json
{
    "name": "vacation",
    "paymentAmount": 10000,
    "source": "savings",
    "paymentsPerYear": 1
}
```

If there are insufficient funds in the `"vacation"` account to cover the expense, then the actual payment will end up being the account's remaining balance, and an [insufficientFunds warning](README.md#what-is-a-warning) will be emitted in the FPE response.

### METHOD 2: Optimal Withdrawal Strategy

This example demonstrates the _optimal withdrawal strategy_. As in the previous example, $10,000 will be withdrawn annually.  However, since the funding source is set to `"optimal"`, FPE can potentially withdraw the requested $10K from multiple "shortfall" accounts if the first chosen account can't cover the full amount.

```json
{
    "name": "medical_expenses",
    "paymentAmount": 10000,
    "source": "optimal",
    "paymentsPerYear": 1
}
```

FPE evaluates all accounts in the plan, and then derives an optimal withdrawal order when satisfying the full expense amount.  The following 3-stage procedure determines the account withdrawal order:

#### STAGE 1

Withdraw from the user-specified default checking account (i.e. [plan.cashFlow.checkingAccount](datatypes.md#cashflow)).
    
#### STAGE 2

Based on their [account type](datatypes.md#accounttype), assign the remaining accounts to the ordered categories below; then sort the accounts based on this category ordering:

- category 0: RMD-eligible accounts <b>having unsatisfied RMD withdrawals</b>
- category 1: `afterTax`
- category 2: `reverseMortgage`
- category 3: `ira`, `401k`, `403b`, `457b`
- category 4: `aftertax401k`, `aftertax403b`
- category 5: `rothIRA`, `roth401k`, `roth403b`, `roth457b`
- category 6: `hsa`
- category 7: `revolvingCredit`

Note that:
- RMD-eligible accounts include `ira`, `401k`, `403b`, and `457b`
- Any account type not explicitly defined within the above categories will NOT be withdrawn from.
    
#### STAGE 3

1. Within each account category, sort accounts by increasing [RoR](https://www.investopedia.com/terms/r/rateofreturn.asp) (specified by [account.rate](datatypes.md#account))
1. Within each _(category, RoR)_ equivalence class, the original account order is intentionally preserved to give the API client control over the withdrawal order.
1. An account will **not** be withdrawn from if:
    - Its [disableOptimalWithdraw](datatypes.md#account) flag is set to true
    - Its [account type](datatypes.md#accounttype) is not listed in one of the above categories (e.g. a `loan`)

Once the account withdrawal order has been determined for a given month, FPE then attempts to withdraw the requested amount from each account until the full expense has been funded.  If the first account in the withdrawal sequence has insufficient funds, the remaining balance is withdrawn, and FPE moves on to the next account in the sequence, and so on.

<br/>

## Relevant Terms

- [account](datatypes.md#account)
- [accountType](datatypes.md#accounttype)
- [expense stream](terms.md#expense-stream)
