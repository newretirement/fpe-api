# Optimal Withdrawal Strategy

## Overview

'Optimal Withdrawal Strategy' refers to the account withdrawal order determined by FPE when attempting to satisfy an [expense](terms.md#expense-stream).  The withdawal order can have a dramatic effect on the plan's future health (e.g. net worth, tax liability).

Example:

    Given a plan with the following accounts:

    - Account 'A' with $5000 balance
    - Account 'B' with $200 balance
    - Account 'C' with $1000 balance
    
    Suppose the optimal withdrawal order is calculated as: [B, C, A].
    Then, to satisfy a $2000 expense, FPE would implicitly perform the
    following withdrawals:

    1. Withdraw $200 from 'B' (depleting the account)
    2. Withdraw $1000 from 'C' (depleting the account)
    3. Withdraw $800 from 'A' (leaving the account with $4200)

The implicit withdrawals above are called [shortfall withdrawals](terms.md#shortfall-withdrawal).

In FPE, an "optimal withdrawal" expense is signified by setting the expense stream's `source` to the special value `"optimal"`:

```json
{
    "name": "my_expense",
    "source": "optimal",
    "paymentAmount": 2000,
    "date": "2024-06"
}
```

Any [shortfall withdrawals](terms.md#shortfall-withdrawal) resulting from the expense are output in the forecast's [PaymentStream Projections](https://github.com/newretirement/fpe-api/blob/master/terms.md#shortfall-withdrawal) with the following stream name: `@withdrawal:{accountName}:shortfall`.


## Withdrawal Strategy Types

FPE supports 2 withdrawal strategies:

| type | description |
| ---- | ----------- |
| traditional |  FPE uses a traditional rule-based approach to order the accounts (e.g. withdraw from lowest to highest growth rate).|
| userDefinedOrder | The account withdrawal order is determined the order of the accounts as specified in `plan.accounts[]`. _**Note:** RMD withdrawals will take priority over the user-specified order_. |

The withdrawal strategy type is specified by the [plan.withdrawal.strategy](https://github.com/newretirement/fpe-api/blob/master/datatypes.md#withdrawal) attribute in the request.

### `traditional` Withdrawal Strategy

The following 3-stage procedure describes the 'traditional' account withdrawal order:

#### STAGE 1

Withdraw from the user-specified default checking account (i.e. [plan.cashFlow.checkingAccount](datatypes.md#cashflow)).
    
#### STAGE 2

Based on their [account type](datatypes.md#accounttype), assign the remaining accounts to the ordered categories below; then sort the accounts based on this category ordering:

- category 0: RMD-eligible accounts having unsatisfied [RMD](terms.md#rmd-liability) withdrawals (excludes inherited IRAs)
- category 1: [Inherited IRAs](inherited_ira.md) having unsatisfied RMD withdrawals
- category 2: `afterTax`
- category 3: `reverseMortgage`
- category 4: `ira`, `401k`, `403b`, `457b`
- category 5: `aftertax401k`, `aftertax403b`
- category 6: `rothIRA`, `roth401k`, `roth403b`, `roth457b`
- category 7: `hsa`
- category 8: `revolvingCredit`

Note that:
- RMD-eligible accounts include `ira`, `401k`, `403b`, and `457b`
- Any account type not explicitly defined within the above categories will NOT be withdrawn from.
    
#### STAGE 3

1. Within each account category, sort accounts by increasing [RoR](https://www.investopedia.com/terms/r/rateofreturn.asp) (calculated as `account.rate + account.dividendRate`)
1. _Note:_ Within each _(category, RoR)_ equivalence class, the original account order is preserved to give the API client control over the withdrawal order.
1. An account will **not** be withdrawn from if:
    - Its [disableOptimalWithdraw](datatypes.md#account) flag is set to true
    - Its [account type](datatypes.md#accounttype) is not listed in one of the above categories (e.g. a `loan`)

Once the account withdrawal order has been determined for a given month, FPE then attempts to withdraw the requested amount from each account until the full expense has been funded.  If the first account in the withdrawal sequence has insufficient funds, the remaining balance is withdrawn, and FPE moves on to the next account in the sequence, and so on.


### `userDefinedOrder` Withdrawal Strategy

UNDER CONSTRUCTION...