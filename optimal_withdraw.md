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

This example demonstrates the _optimal withdrawal strategy_. As in the previous example, $10,000 will be withdrawn annually.  However, since the funding source is set to `"optimal"`, FPE can potentially withdraw the requested $10K from muliple accounts if the first chosen account can't cover the full amount.

```json
{
    "name": "medical_expenses",
    "paymentAmount": 10000,
    "source": "optimal",
    "paymentsPerYear": 1
}
```

FPE evaluates all accounts in the plan, and then derives an optimal withdrawal order when satisfying the full expense amount.  The following 2-stage sort routine determines the account withdrawal order:

- **STAGE 1:** Define 6 account categories (below) into which 1 or more accounts will be added based on the account's [type](datatypes.md#accounttype); then sort the accounts based on this category ordering:
    - category 1: `afterTax`
    - category 2: `reverseMortgage`
    - category 3: `ira`, `401k`
    - category 4: `roth`, `roth401k`
    - category 5: `hsa`
    - category 6: `revolvingCredit`
- **STAGE 2:** Sort by [RoR](https://www.investopedia.com/terms/r/rateofreturn.asp)
    - Within each account category, sort by increasing RoR (specified by [account.rate](datatypes.md#account))

Within each (category, RoR) subgroup, the original account order is intentionally preserved to allow the API client to control the withdrawal order.

Once the account withdrawal order has been determined, FPE then attempts to withdraw the requested amount from each account until the full expense has been funded.  If the first account in the withdrawal sequence has insufficient funds, the remaining balance is withdrawn, and FPE moves on to the next account in the sequence, and so on.

<br/>

## Relevant Terms

- [account](datatypes.md#account)
- [accountType](datatypes.md#accounttype)
- [expense stream](terms.md#expense-stream)
