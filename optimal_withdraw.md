# Optimal Withdrawal Strategy

When modeling an [expense](terms.md#expense-stream), there are 2 methods for specifying how the expense is sourced:


### METHOD 1: Withdraw exclusively from a specific account

In this example, $10,000 will be withdrawn annually, and <u>_only_</u>, from the account named `"savings"`.

```json
{
    "name": "vacation",
    "paymentAmount": 10000,
    "source": "savings",
    "paymentsPerYear": 1
}
```

If there are insufficient funds in the `"vacation"` account to cover the expense, then the payment amount is set to the remaining balance, and an [insufficientFunds warning](README.md#what-is-a-warning) will be emitted in the response.

### METHOD 2: Optimal Withdrawal Strategy

This example demonstrates the _optimal withdrawal strategy_. The same $10,000 amount will be withdrawn annually.  However, since `"optimal"` has been designated as the funding source, FPE will (potentially) withdraw the $10K across muliple accounts if the first chosen account has insufficient funds.

```json
{
    "name": "medical_expenses",
    "paymentAmount": 10000,
    "source": "optimal",
    "paymentsPerYear": 1
}
```

FPE will evaluate all accounts in the plan, and then produce an optimal withdrawal order when satisfying the full expense amount.  The following 3-stage sort routine determines the account withdrawal order:

- **STAGE 1:** Define the following 6 account categories into which 1 or more accounts will be added based on the account's [type](datatypes.md#accounttype); then sort the accounts based on this category ordering:
    1. afterTax
    1. reverseMortgage
    1. ira, 401k
    1. roth, roth401k
    1. hsa
    1. revolvingCredit
- **STAGE 2:** Sort by [RoR](https://www.investopedia.com/terms/r/rateofreturn.asp)
    - Within each account category, sort by increasing RoR (specified by [account.rate](datatypes.md#account)).
- **STAGE 3:** Sort by unique account name
    - Within each (category, RoR) subcategory, sort alphabetically by [account.name](datatypes.md#account)

Once the account withdrawal order has been determined, FPE then attempts to withdraw the requested amount from each account.  If the first account in the withdrawal sequence has insufficient funds, the remaining balance is withdrawn, and FPE moves on to the next account in the sequence, and so on.

<br/>

## Relevant Terms

- [account](datatypes.md#account)
- [accountType](datatypes.md#accounttype)
- [expense stream](terms.md#expense-stream)
