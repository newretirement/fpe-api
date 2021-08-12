# Income-Linked Contributions

## Overview

Income-linked contributions are essentially one or more contributions taken directly from a payment on an [income stream](./payment_streams.md#income-streams) and deposited into one or more target [accounts](./datatypes.md#account).  The remainder of the income payment (i.e. the amount left after processing the contributions) is then deposited into the stream's designated `target` account.

### Example 1: Employer Matching

> Scenario: John works at the ACME company, where he is paid $10K/month (annual salary of $120K).  He wishes to contribute 8% of his pay to the company's 401(k) plan.  ACME matches 100% of employee contributions up to the first 4% of their salary.  Beyond that, the employer matches 50% of employee contributions up to 6% of salary.

In order to model the above example, there are 3 crucial entities that must be specified in the [plan](./datatypes.md#plan):

1. The [account](./datatypes.md#account) into which the employee (and possibly employer) contributions will be deposited:

```json
  {
      "name": "acme_401k",
      "type": "401k"
  }
```

2. An `aftertax` [account](./datatypes.md#account) into which the remaining portion of the earned income will be deposited:

```json
  {
      "name": "checking",
      "type": "aftertax"
  },
```

3. A [paymentStream](./datatypes.md#PaymentStream) object representing the person's earned income. Pay particular attention to the [contributions](./datatypes.md#ContributionFromIncome) array:

```json
  {
      "name": "acme_income",
      "paymentAmount": 10000,
      "paymentsPerYear": 12,
      "target": "checking",
      "earnedIncome": true,
      "contributions": [
        {
          "employeeContribRate": 0.08,
          "employerMatches": [
            {"rate": 1.0, "upTo": 0.04},
            {"rate": 0.5, "upTo": 0.06}
          ],
          "employeeContribTarget": "acme_401k"
        }
      ]
  }
```

> NOTE: Since this paymentStream represents work income that is potentially taxable by the IRS, the `earnedIncome` flag must be set to `true`.

The complete JSON request for this example can be found [here](examples/forecast/contrib_from_income/case-01.json).

### Example 2: Employer Matching with annual cap

Optionally, an annual cap can be imposed on how much money the employer will contribute to a given plan as a match.  This annual limit is specified in the `employerMatchAnnualCap` attribute.  Consider the sample PaymentStream below, where the annual employer match is constrained to $10,000:

```json
{
    "name": "acme_income",
    "paymentAmount": 15000,
    "paymentsPerYear": 12,
    "rate": {"mean": 0.06},
    "contributions": [
      {
        "employeeContribRate": 0.1,
        "employerMatches": [
            {"rate": 1.0, "upTo": 0.05}
        ],
        "employerMatchAnnualCap": 9000,
        "employeeContribTarget": "acme_401k"
      }
    ],
    "target": "checking",
    "earnedIncome": true
}
```

In the above example, the employer matches 100% of the employee's contributions up to 5% of their salary (currently $180,000/yr), which works out to maximum annual match of $9,000 (`(15000 * 12) * 1.0 * 0.05`).  That said, the employee's wage growth is set to 6% (`"rate": {"mean": 0.06}`), and so their annual salary will steadily increase each year.  As a result, the employer's annual match limit would correspondingly increase, if not for the $9,000 cap imposed via the `employerMatchAnnualCap": 9000` constraint.

The complete JSON request for this example can be found [here](examples/forecast/contrib_from_income/case-02.json).

### Example 3: Fixed-Dollar Employer Contribution

> Scenario: Zoe works at the ACME company, where she is paid $10K/month (annual salary of $120K).  She wishes to contribute 10% of her paycheck to the company's Traditional 401(k) plan, and another 5% to the company's Roth 401(k) plan.  In addition, ACME contributes $400 __per paycheck__ to the 401(k) plan, and $300 __per paycheck__ to the Roth 401(k) plan.

The plan for this example is very similar the previous one. The differences are:

1. The `contributions[]` array contains 2 contribution objects instead of 1
1. Instead of specifying an employer match rate and max, a fixed-dollar `employerContribAmount` is provided

```json
  {
      "name": "acme_income",
      "paymentAmount": 10000,
      "paymentsPerYear": 12,
      "contributions": [
          {
              "employeeContribRate": 0.1,
              "employerContribAmount": 400,
              "employeeContribTarget": "acme_401k"
          },
          {
              "employeeContribRate": 0.05,
              "employerContribAmount": 300,
              "employeeContribTarget": "acme_roth"
          }
      ],
      "target": "checking",
      "earnedIncome": true,
  }
```

The complete JSON request for this example can be found [here](examples/forecast/contrib_from_income/case-03.json).

### Example 4: Fixed-Dollar Employee Contribution

In this example, the employee contributes a fixed dollar amount ($1,000) each paycheck.  And the employer will match 50% of this $1K contribution up to 5% of annual salary.

```json
{
    "name": "acme_income",
    "paymentAmount": 10000,
    "paymentsPerYear": 12,
    "target": "checking",
    "earnedIncome": true,
    "contributions": [
        {
            "employeeContribAmount": 1000,
            "employeeContribTarget": "acme_401k",
            "employerMatches": [
                {"rate": 0.5, "upTo": 0.05}
            ]
        }
    ]
}
```

The complete JSON request for this example can be found [here](examples/forecast/contrib_from_income/case-04.json).

### Example 5: Separate Employee and Employer Contribution Accounts

This example demonstrates how the employee and employer contributions can be transferred into separate target accounts:

```json
{
    "name": "acme_income",
    "paymentAmount": 10000,
    "paymentsPerYear": 12,
    "target": "checking",
    "earnedIncome": true,
    "contributions": [
        {
            "employeeContribRate": 0.08,
            "employeeContribTarget": "acme_401k",
            "employerMatches": [
                {"rate": 0.5, "upTo": 0.05}
            ],
            "employerContribTarget": "acme_roth"
        }
    ]
}
```

The complete JSON request for this example can be found [here](examples/forecast/contrib_from_income/case-05.json).

### Output Streams

Each [income stream](./payment_streams.md#income-streams) having income-linked contributions will produce a set of system-generated output streams, which detail the payments for each contribution:

- `@employeeContrib:{paymentStream.name}:{k}`: This report stream will contain the employee contributions for the _{k}th_ contribution declaration in the `contributions[]` array.
- `@employerContrib:{paymentStream.name}:{k}`: This report stream will contain the employer contributions for the _{k}th_ contribution declaration in the `contributions[]` array.
