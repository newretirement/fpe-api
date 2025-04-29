# FPE - Financial Projection Engine

# Overview

FPE implements a mathematical model for forecasting a person's future financial state throughout their lifetime given their current financial state, various future financial assumptions, and real world market/tax data as model inputs.

Starting at the present month, FPE projects future financial state by calculating a set of "month-over-month" [time series](https://en.wikipedia.org/wiki/Time_series) vectors, where each vector represents a discrete account balance or payment stream over the course of the financial plan.

<br/><hr/><br/>


# API Keys

All FPE endpoints require a valid API key, which must be provided in the request header.  For example:

```
POST /forecast HTTP/1.1
X-Api-Key: abcdefg1234567
```

Failure to provide a valid API key will trigger an [HTTP 403 Forbidden](#http-response-status-codes) error response.

<br/><hr/><br/>


# API Versioning

FPE uses [semantic versioning](https://semver.org/) as its software versioning policy.  The version of a running FPE service can be obtained in 2 ways:

1. __HTTP response header__: All endpoints add a `Fpe-Version` header attribute to their response.
2. __[GET /info](#get-info)__: This endpoint returns the version, along with other build/deploy related info.

<br/><hr/><br/>


# Error Handling

## Errors vs. Warnings

### What is an Error

An error occurs if the API client submits a request for which FPE cannot return a meaningful response (for any reason). In the event of an error, FPE returns:
  - An HTTP status code appropriate for the type of error (see [HTTP Response Status Codes](#http-response-status-codes) further down)
  - A JSON object containing the `httpStatusCode` and detailed `message`.

For example, if the client calls `POST /forecast` and provides an invalid birthDate of `1200-01`, FPE responses with:

```
HTTP/1.1 400 Bad Request
Content-Type: application/json
{
  "httpStatusCode": 400,
  "message": "Error parsing JSON request: Valid year range is [1900..2200]: 1200"
}
```

### What is a Warning

There are certain unexpected situations that can occur during the financial simulation, which cannot be foreseen by the API client.  Examples are:

- The source account did not have the funds to cover a future [transfer](terms.md#transfer)
- An algorithm was running for too long, and therefore, gave up

For situations like this, FPE will complete the simulation and return an `HTTP 2xx` status, but will als return a list of warnings in the response. For example:

```json
{
  "warnings": [
    {
      "code": "insufficientFunds",
      "context": "expenseHandler.account",
      "message": "Insufficient funds. desired=50000.00, actual=49310.00",
      "account": "savings",
      "paymentStream": "buy_future_annuity",
      "details": {
        "actual": 49310,
        "date": "2022-01",
        "desired": 50000
      }
    },
    {
      "code": "algoImprovedNothing",
      "context": "rothOptimizer",
      "message": "Optimizer could not produce a plan that resulted in a better estateValue metric."
    },
  ]
}
```

The full list of warning codes is [here](#warning-codes).

## HTTP Response Status Codes

The FPE service uses standard [HTTP response status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) to indicate the success or failure of an API request.  In the event of an error, the HTTP response body will contain a short
description of the problem (Content-Type: text/plain).

Below is a list of possible status codes.  API Clients should be prepared to handle any of these.

__`2xx OK`__

Status codes in the `2xx` range indicate the request was understood and successfully handled.

<br/>

__`400 Bad Request`__

Something was wrong with the client request such that FPE was unable understand it well enough to return any sort of useful result.  Typical causes for this error are:

   1. Malformed JSON request
   2. Critical information was missing from the request (e.g. `birthDate` omitted)

<br/>

__`403 Forbidden`__

The server understood the client request, but refuses to authorize it.  This typically happens when an endpoint requires a valid API key, but did not receive one.  The key should be sent as a `X-Api-Key` header parameter.

<br/>

__`404 Not Found`__

The requested resource or method doesn't exist (e.g. `GET /fake/path/123`).

<br/>

__`405 Method Not Allowed`__

The request method is valid (e.g. `GET`, `POST`), but is not supported by the requested resource.  For example, `GET /forecast` will return `HTTP 405`, since endpoint only supports the `POST` HTTP method.

<br/>

__`429 Too Many Requests`__

The client has sent too many requests in a given amount of time ("rate limiting").

<br/>

__`500 Internal Server Error`__

Indicates something went wrong within the FPE service (these are rare).

<br/>

__`502 Bad Gateway`__

Indicates the FPE service encountered some sort of problem communicating with
a dependent web service, and was therefore unable to return a meaningful result.

<br/>

__`503 Service Unavailable`__

Indicates the FPE service is currently unable to handle the request in a timely manner.

<br/>

## Warning Codes

Below are all possible warning codes and their descriptions.

| Code | Description |
| ----------| ----------- |
| __`algoConfigUpdated`__ | Due to certain algorithm-specific constraints, aspects of the [plan](datatypes.md#plan) had to be modified in order for the algorithm to run.  <br/> One example of of this is a plan with `FIXED-DOLLAR` drawdown strategy sent to the [Roth Conversion Optimizer](#post-optimizeroth).  The drawdown strategy will be changed to `SPENDING` prior to running the algorithm. |
| __`algoGaveUp`__ | Even though a better solution might be possible given more computation time/resources, the algorithm is halting and returning its best solution. |
| __`algoImprovedNothing`__ | Given an input model to be solved/optimized, the algorithm was unable to produce a solution that was any better than the one implied by the original input model. |
| __`ipgAnnualContribLimit`__ | A contribution was made to an account within an IPG plan that exceeded the annual limit. |
| __`ipgContribWindowClosed`__ | A contribution was made to an account within an IPG plan after the contribution window had closed. |
| __`ipgLifetimeContribLimit`__ | A contribution was made to an account within an IPG plan that exceeded the lifetime limit. |
| __`insufficientFunds`__ | A desired withdrawal could not be fully satisfied due to lack of funds in the source account. |
| __`noFundsToConvert`__ | The plan provided to the Roth Conversion Optimizer did not contain any funds that were eligible for Roth conversion. |
| __`valueOutOfRange`__ | An input value is outside of the acceptable range for a given FPE query. |

<br/><hr/><br/>


# API Endpoints

Across all FPE endpoints, request and responses are represented as JSON objects.  These data objects are cataloged and described on [this page](datatypes.md).

Below are the descriptions of each endpoint.

<br/>

## `POST /annuitize`

Estimates the monthly [annuity](https://www.investopedia.com/terms/a/annuity.asp) income stream based on a given annuity premium, as well as other information that potentially affects the future income payments.

For a given [annuitant](https://www.investopedia.com/terms/a/annuitant.asp) and (optional) surviving spouse, multiple [scenarios](#annuityscenario) may be submitted in batch for the sake of convenience and efficiency.  

### AnnuitizeRequest

This is the top-level request object that is posted to this endpoint.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `currentDate` | [Date](datatypes.md#date) | Today's date. |
| `annuitant` | [Person](#person) | The [annuitant](https://www.investopedia.com/terms/a/annuitant.asp) is the recepient of the annuity payments. |
| `survivingSpouse` | [Person](#person) | (optional) If the annuitant has a spouse |
| `scenarios` | [AnnuityScenario[]](#annuityscenario) | List of 0 or more annuity calculation scenarios. |

#### Person

Represents either the annuitant or their surviving spouse.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `birthDate` | [Date](datatypes.md#date) | The person's date of birth. |
| `gender` | [Gender](datatypes.md#gender) | The person's gender (required for mortality calculations). |

#### AnnuityScenario

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `premium` | int | The lump sum cost of the annuity. |
| `purchaseDate` | [Date](datatypes.md#date)  | The date on which the annuity was purchased. |
| `startDate` | [Date](datatypes.md#date)  | The date on which annuity payments shall commence. |
| `survivorBenefit` | float | Survivor benefit ratio.  This is only relevant when the annuitant has declared a `survivingSpouse`.  Valid range is `[0.0..1.0]`.  Default value is `0.0` if omitted. |
| `cola` | float | Cost of Living Adjustment.  Valid range is `[0.0..1.0]`.  Default value is `0.0` if omitted. |
| `yearsCertain` | int | A [Years Certain annuity](https://www.investopedia.com/terms/y/years-certain-annuity.asp) pays the holder a continuous monthly income for the specified number of years, regardless of how long the annuitant lives.  Default value is `0` if omitted. |
| `cashRefund` | boolean | A [Cash Refund annuity](https://www.investopedia.com/terms/c/cash-refund-annuity.asp) returns to a beneficiary any sum left over should the annuitant die before breaking even on what they paid in premiums.  Default value is `false` if omitted. |

### AnnuitizeResponse

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `monthlyBenefitAmounts` | int[] | Array of monthly benefit amounts, which correspond to the array of [scenarios](#annuityscenario) defined in the [AnnuitizeRequest](#annuitizerequest) object. |
| `warnings` | [Warning[]](#what-is-a-warning) | List of non-critical warnings. |

### Examples

Example request and response JSONs can be found in [examples/annuitize/](examples/annuitize/).

<br/>

## `POST /forecast`

Given a financial [plan](datatypes.md#plan), this endpoint runs a simulation that generates a forecast of that plan, consisting of some summary information about the future projection, and a set of time series representing the future periodic values of each account and payment stream involved in the simulation.

### ForecastRequest

This is the top-level request object that is posted to this endpoint.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `params` | [ForecastParams](datatypes.md#forecastparams) | (optional) Configuration for things like optional calculations, time series density, etc. |
| `plan` | [Plan](datatypes.md#plan) | The financial plan to forecast. |

### ForecastResponse

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `forecast` | [Forecast](datatypes.md#forecast) | The projected forecast of the submitted plan. |
| `warnings` | [Warning[]](#what-is-a-warning) | List of non-critical warnings. |

### Sample Scenario

Consider this basic scenario, which is followed by the corresponding JSON request/response:

> Scenario: The current date is January 2025.  John is a 57-year-old single male in excellent health.  He expects to live until the age of 90.  John will start claiming social security at age 67 (full retirement age), and knows his PIA will be $2,325. His retirement savings consists of a single IRA with a current balance of $500,000 and an expected AGR of 8% (and a future AGR of 4% starting in 2030).  John works for a company where he earns $8,000/month, and expects a 2.5% raise each year.  Furthermore, John is participating in an employer-sponsored retirement plan, where he contributes 10% of his salary, and the company matches 50% of his contribution up to 8% of salary.  He plans on retiring in 2033.  John expects to spend $7,000/month in retirement.

The JSON request for this scenario is [here](examples/forecast/basic/single.json), and the corresponding JSON response is [here](examples/forecast/basic/single.response.json).

<br/>

## `GET /info`

Returns information about the deployed web service.

### Response attributes

| Attribute | Description |
| ----------| ----------- |
| version | The software version of this running web service. |
| buildDate | When this release tarball was built. |

### Sample response

```json
{
    "version": "3.6.2",
    "buildDate": "2021-01-04T22:35:47Z"
}
```

<br/>

## `GET /globaldata/medicare/irmaa`

Returns information about the [Medicare IRMAA](https://www.nerdwallet.com/article/insurance/medicare/what-is-the-medicare-irmaa) surcharge amounts, and the income brackets to which they apply.

### Response attributes

| Attribute | Description |
| ----------| ----------- |
| year | the year to which the IRMAA data applies. |
| incomeBrackets | List of income bracket objects (sorted by income limit) that determine the income threshold for a given set of PartB/PartD surcharges.  The income limit values are inclusive (vs. exclusive).  For example (refer to the sample response below), if a single person's income is $153,000, then their PartB/PartD surcharges would be $164/$31. |

### Sample response

```json
{
  "year": 2023,
  "incomeBrackets": [
    {
      "incomeLimitSingle": 97000,
      "incomeLimitMarried": 194000,
      "additionalPartB": 0,
      "additionalPartD": 0
    },
    {
      "incomeLimitSingle": 123000,
      "incomeLimitMarried": 246000,
      "additionalPartB": 65,
      "additionalPartD": 12
    },
    {
      "incomeLimitSingle": 153000,
      "incomeLimitMarried": 306000,
      "additionalPartB": 164,
      "additionalPartD": 31
    },
    {
      "incomeLimitSingle": 183000,
      "incomeLimitMarried": 366000,
      "additionalPartB": 263,
      "additionalPartD": 50
    },
    {
      "incomeLimitSingle": 500000,
      "incomeLimitMarried": 750000,
      "additionalPartB": 362,
      "additionalPartD": 70
    },
    {
      "additionalPartB": 395,
      "additionalPartD": 76
    }
  ]
}
```

<br/>

## `POST /inheritedira`

Provides [inheriteed IRA](inherited_ira.md) specifics given the the account's [type](datatypes.md#accounttype) and the [decedent's](datatypes.md#decedent) birth and death dates.

### Sample Request

```json
{
    "accountType": "ira",
    "decedent": {
        "birthDate": "1949-09",
        "deathDate": "2023-05"
    }
}
```

### Sample Response

```json
{
    "rmdStartYear": 2024,
    "rbd": "2022-04",
    "preSECUREAct": false,
    "tenYearRuleDeadline": "2033-12"
}
```
#### Notes

- "rbd" = [Required Beginning Date](inherited_ira.md#terms)
- If `rmdStartYear` is null or omitted, then RMDs are not required
- If `tenYearRuleDeadline` is null or omitted, then [10-Year Rule](inherited_ira.md#10-year-rule) does not apply


<br/>

## `POST /montecarlo`

Runs a Monte Carlo simulation for given a [plan](datatypes.md#plan), returning the probability of not running out of money at [goal age](terms.md#goal-age) (i.e. [@projected_savings](output_streams.md#account-projections) in final month of simulation is nonnegative).

### MonteCarloRequest

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `plan` | [Plan](datatypes.md#plan) | The financial plan |
| `params` | [ForecastParams](datatypes.md#forecastparams) | The input parameters to the Monte Carlo simulation (in particular, the `montecarlo{}` section) |


### MonteCarloResponse

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `analysis` | [MonteCarloAnalysis](#montecarloanalysis) | The analysis of the Monte Carlo simulation, which contains the success probability and related time series for the requested percentiles. |
| `warnings` | [Warning[]](#what-is-a-warning) | List of non-critical warnings. |

#### MonteCarloAnalysis

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `successProbability` |float | The probability that the user's plan will not run out of money at [Goal Age](terms.md#goal-age). For each Monte Carlo path, if [projected_savings](output_streams.md#account-projections) in the final year is ≥ 0, that path is marked as a success. |
| `pathCount` |float | The number of paths that were run within the Monte Carlo simulation. |
| `estateValue` | object[] | A list of (percentile, estateValue) pairs, where each pair represents the [estate value](terms.md#estate-value) at the specified percentile. |
| `projectedSavings` | object[] | A list of (percentile, savingsProjections[]) pairs, where each pair represents the simulated annual [projected savings](output_streams.md#account-projections) for all years for the Monte Carlo path at the specified percentile. |

Sample JSON requests can be found in [examples/montecarlo/](examples/montecarlo/).

<br/>

## `POST /optimize/roth`

Given a financial [Plan](datatypes.md#plan), attempt to find an optimal set of Roth conversions that satisfy a given set of goals and/or constraints.  For a complete description of the available goals and constraints, see the [RCOParam](datatypes.md#rcoparams) object.

If the algorithm is unable to improve the specified `goalMetric`, the forecast will contain a a warning message with the code [algoImprovedNothing](README.md#warning-codes).

### RCORequest

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `plan` | [Plan](datatypes.md#plan) | The financial plan. |
| `params` | [ForecastParams](datatypes.md#forecastparams) | The input parameters that influence this algorithm. |

### RCOResponse

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `plan` | [Plan](datatypes.md#plan) | The optimized plan containing potentially different Roth optimization transactions |
| `forecast` | [Forecast](datatypes.md#forecast) | The financial forecast that results from the optimized plan |

<br/>

## `POST /savingsneed`

Given a [Plan](datatypes.md#plan), solves for the [@total_savings](output_streams.md#account-projections) needed in order to "break even" at [goal age](terms.md#goal-age) at 1 or more future time points.  The future time points are set via the `params.savingsneed.dates` attribute within the [ForecastParams](datatypes.md#forecastparams) object.

"break even" means the household's [net worth](https://en.wikipedia.org/wiki/Net_worth) (i.e. [@total_savings - @total_debt](output_streams.md#account-projections)) in the final month of the simulation is within the range [$0..$1000].

This endpoint returns a time series, where each data point contains a `value` and `date` indicating the [@total_savings](output_streams.md#account-projections) amount needed at a specific date in order to break even (see **Sample response** below).

### Sample response

```json
{
    "savingsNeed": [
        {
            "date": "2024-12",
            "value": "190700"
        },
        {
            "date": "2029-12",
            "value": "275200"
        },
        {
            "date": "2034-12",
            "value": "180400"
        },
        {
            "date": "2035-03",
            "value": "150900"
        }
    ]
}
```

### Implementation Note

To find the correct `@total_savings` amount at date `d`, FPE injects an ephemeral `paymentStream` having a one-time payment date `d` into the original [Plan](datatypes.md#plan), and then runs a binary search to find the non-taxable withdrawal or deposit amount needed.  More specifically, either a withdrawal or deposit `paymentStream` object is added to the plan, and then the simulation is repeatedly run with varying values of `x` until break-even is achieved:

_**Case 1:** Net worth at goal age is negative, so deposit more money_
```
{
    "name": "@solver-savingsNeedCalc",
    "paymentAmount": x,
    "date": d,
    "taxable": false,
    "target": "defaultSavings"
}
```

_**Case 2:** Net worth at goal age is above the $1,000 threshold, so withdraw more money_
```
{
    "name": "@solver-savingsNeedCalc",
    "paymentAmount": x,
    "date": d,
    "taxable": false,
    "source": "optimal"
}
```

<br/>

## `POST /optimize/socialsecurity`

Given a financial plan, the social security optimizer solves for the optimal age to claim social security for the primary account holder (and their spouse if they have one).

The response contains the following high-level objects:

- A modified plan containing the optimized primary and spouse social security ages
- The forecast of the modified plan
- An optional list of warnings

Response Format:

```
{
	"plan": <plan>,
	"forecast": <forecast>,
	"warnings": [<warning>, ...]
}
```
