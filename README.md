# FPE - Financial Projection Engine

# Overview

FPE implements a mathematical model for forecasting a person's future financial state throughout their lifetime given their current financial state, various future financial assumptions, and real world market/tax data as model inputs.

Starting at the present month, FPE projects future financial state by calculating a set of "month-over-month" [time series](https://en.wikipedia.org/wiki/Time_series) vectors, where each vector represents a discrete account balance or payment stream over the course of the financial plan.

<br/><hr/><br/>


# API Keys

All FPE endpoints require a valid API key, which must be provided in the request header.  For example:

```
POST /fpe/v5/forecast HTTP/1.1
X-Api-Key: abcdefg1234567
```

Failure to provide a valid API key will trigger an [HTTP 403 Forbidden](#http-response-status-codes) error response.

<br/><hr/><br/>


# API Versioning

FPE uses [semantic versioning](https://semver.org/) as its software versioning policy.  The version of a running FPE service can be obtained in 2 ways:

1. __HTTP response header__: All endpoints add a `Fpe-Version` header attribute to their response.
2. __[GET /fpe/v5/info](#get-info)__: This endpoint returns the version, along with other build/deploy related info.

<br/><hr/><br/>


# Error Handling

## Errors vs. Warnings

### What is an Error

An error occurs if the API client submits a request for which FPE cannot return a meaningful response (for any reason). In the event of an error, FPE returns:
  - An HTTP status code appropriate for the type of error (see [HTTP Response Status Codes](#http-response-status-codes) further down)
  - A `text/plain` detail message

For example, if the client calls `POST /fpe/v5/forecast` and provides an invalid birthDate of `1200-01`, FPE responses with:

```
HTTP/1.1 400 Bad Request
Content-Length: 67
Error parsing JSON request: Valid year range is [1900..2200]: 1200
```

### What is a Warning

Suppose the API client submits a well-formed JSON request, but one or more attributes don't quite make sense (e.g. an account annual growth rate of 3000%).  If FPE is able to infer the intended value (or otherwise modify the value to make it acceptable), it will modify the request accordingly, execute it, and return a result.

In addition, the response will include a `warnings[]` list at the top level of the JSON response, like this:

```
{
  ... the rest of the response ...
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
      "code": "valueOutOfRange",
      "context": "accounts.fidelity_ira.apy",
      "message": "fidelity_ira account.rate.mean is out of range: 0.99. Valid range is [-0.4, 0.4]."
      "details": {
          "min": -0.4
          "max": 0.4,
          "desired": 0.99,
          "actual": 0.4,
      }
    }
  ]
}
```

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

The requested resource or method doesn't exist (e.g. `GET /fpe/v5/fake/path/123`).

<br/>

__`405 Method Not Allowed`__

The request method is valid (e.g. `GET`, `POST`), but is not supported by the requested resource.  For example, `GET /fpe/v5/forecast` will return `HTTP 405`, since endpoint only supports the `POST` HTTP method.

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
| __`algoConfigUpdated`__ | Due to algorithm-specific implementation constraints, certain aspects of the input model were modified in order for the algorithm to run.  <br/> An example of of this is a plan with `FIXED-DOLLAR` drawdown strategy sent into the Roth Conversion Optimizer.  The drawdown strategy will be changed to `SPENDING` prior to running the algorithm. |
| __`algoImprovedNothing`__ | Given an input model to be solved/optimized, the algorithm was unable to produce a solution that was any better than the one implied by the original input model. |
| __`algoGaveUp`__ | Even though a better solution might be possible given more computation time/resources, the algorithm is halting and returning its best solution. |
| __`insufficientFunds`__ | A desired withdrawal could not be fully satisfied due to lack of funds in the account. |
| __`valueOutOfRange`__ | An input value is outside of the acceptable range for a given FPE query. |
| __`noFundsToConvert`__ | The plan provided to the Roth Conversion Optimizer did not contain any funds that were eligible for Roth conversion. |
| __`ssConfig`__ | Within the `socialSecurity` input object, both `monthlyBenefit` and `primaryInsuranceAmount` (PIA) were provided, when only 1 is needed. In this case, PIA will take precedence. |

<br/><hr/><br/>


# API Endpoints

Across all FPE endpoints, request and responses are represented as JSON objects.  These data objects are cataloged and described on [this page](datatypes.md).

Below are the descriptions of each endpoint.

<br/>

## `POST /v5/annuitize`

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

## `POST /v5/forecast`

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

> Scenario: The current date is January 2021.  John is a 60-year-old single male in excellent health.  He expects to live until the age of 90.  John will start claiming social security at age 67 (full retirement age), and knows his PIA will be $2,325. His retirement savings consists of a single IRA with a current balance of $500,000 and an expected AGR of 6% (and a future AGR of 4% starting in 2027).  John works for a company where he earns $7,500/month.  Furthermore, he is participating in an employer-sponsored retirement plan, where he contributes 10% of his salary, and the company matches 50% of his contribution up to 8% of salary.  He plans on retiring at age 67.  John expects to spend $7,000/month in retirement.

The JSON request for this scenario is [here](examples/forecast/basic/single-01.json), and the corresponding JSON response is [here](examples/forecast/basic/single-01.response.json).

<br/>

## `GET /v5/info`

Returns information about the deployed web service.

### Response attributes

| Attribute | Description |
| ----------| ----------- |
| version | The software version of this running web service. |
| buildDate | When this release tarball was built. |
| uptime | How long this web service has been running. __NOTE__: Depending on the deploy environment, this attribute may not exist (e.g. the AWS Lambda environment is inherently stateless, and so there is no meaningful notion of "uptime"). |

### Sample response

```json
{
    "version": "3.6.2",
    "buildDate": "2021-01-04T22:35:47Z",
    "uptime": "9h27m59s"
}
```

<br/>

## `GET /v5/medicare/irmaa`

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

## `POST /v5/montecarlo`

Runs a Monte Carlo simulation for given a [plan](datatypes.md#plan), returning the probability of not running out of money before goal age.

### MonteCarloRequest

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `plan` | [Plan](datatypes.md#plan) | The financial plan. |financial plan. |
| `params` | [MonteCarloParams](#montecarloparams) | The input parameters to the simulation. |

#### MonteCarloParams

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `deterministic` | enum | (optional) Determines how the random variable are generated within the simulation.  Valid values are: <br/>- `always`: The same random seed (and therefore, the same set of random inputs) is used for all requests <br/>- `monthly`: The random seed changes at 12am UTC at the beginning of each month.  This setting is intended for production environments, where the probability score is expected to be stable. <br/>- `<null>`: A different random seed is chosen on each request (effectively nondeterministic) |
| `desiredEstateValue` | int | (optional) Determines if a given path (outcome) within the simulation is considered a success. E.g. if `desiredEstateValue` is `100000`, then the plan's forecasted estate value must be >= 100000.  Default value is 0. |
| `varyInvestmentReturns` | boolean | (optional) Choose random growth rates from a normal distribution for any [account](datatypes.md#account) within the plan based on the `mean` and `stdev` of that account's [rate](datatypes.md#rate). |
| `varyGeneralInflation` | boolean | (optional) Choose random growth rates from a normal distribution for market inflation based on the `mean` and `stdev` of the [Market.inflation](datatypes.md#market) object. |
| `varyMedicalInflation` | boolean | (optional) Choose random growth rates from a normal distribution for medical inflation based on the `mean` and `stdev` of the [Market.medicalInflation](datatypes.md#market) object. |
| `varyWageGrowth` | boolean | (optional) For [PaymentStreams](datatypes.md#paymentstream) that represent earned income (i.e. `earnedIncome` is true), choose random growth rates from a normal distribution based on the `mean` and `stdev` of the [PaymentStream.Rate](datatypes.md#paymentstream) object.|
| `analysisPercentiles` | int[] | (optional) A list of percentiles that, if provided, triggers the calculation of `analysis.projectedSavings[]` and `analysis.estateValue[]` values for for specified percentiles (see response below). |

### MonteCarloResponse

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `analysis` | [MonteCarloAnalysis](#montecarloanalysis) | The analysis of the Monte Carlo simulation, which contains the success probability and related time series for the requested percentiles. |
| `warnings` | [Warning[]](#what-is-a-warning) | List of non-critical warnings. |

#### MonteCarloAnalysis

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `successProbability` |float | The probability that the user's plan will not run out of money before Goal Age. |
| `pathCount` |float | The number of random paths that were run within the Monte Carlo simulation. |
| `estateValue` | object[] | TODO: document this |
| `projectedSavings` | object[] | TODO: document this |

Sample JSON requests can be found in [examples/montecarlo/](examples/montecarlo/).

<br/>

## `POST /v5/optimize/roth`

Given a financial [Plan](datatypes.md#plan), attempt to find an optimal set of Roth conversions that satisfy a given set of goals and/or constraints.  For a complete description of the available goals and constraints, see the [RCOParam](datatypes.md#rcoparams) object.

If the algorithm is unable to improve the specified `goalMetric`, the forecast will contain a a warning message with the code [algoImprovedNothing](README.md#warning-codes).

### RCORequest

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `plan` | [Plan](datatypes.md#plan) | The financial plan. |
| `params` | [ForecastParams](datatypes.md#forecastparams) | The input parameters that influence this algorithm. |

### Response object

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `plan` | [Plan](datatypes.md#plan) | The optimized plan containing potentially different Roth optimization transactions |
| `forecast` | [Forecast](datatypes.md#forecast) | The financial forecast that results from the optimized plan |
| `oldRothConversions` | [RothConversion\[\]](#rothconversion) | The list of 0 or more Roth conversions from the original plan submitted in the request |
| `newRothConversions` | [RothConversion\[\]](#rothconversion) | The list of 0 or more Roth conversions recommended by this optimizer |

#### RothConversion

The `RothConversion` object represents a one-time transfer from a tax-deferred account into a Roth IRA.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `source` | string | The tax-deferred source account |
| `target` | string | The Roth IRA target account  |
| `date`   | [Date](./datatypes.md#date) | The date on which the Roth conversion takes place |
| `amount` | int | The monetary amount of the Roth conversion |

<br/>

## `POST /fpe/v5/savingsneed`

Given a [Plan](datatypes.md#plan), solves for the total amount of money needed in order to "break even" at goal age at multiple future time points.

To "break even", in this context, means that the household's [net worth](https://en.wikipedia.org/wiki/Net_worth) (`@total_savings - @total_debt`) is in the range [$0..$1000].

The response contains a list of data points, where each one contains a `value` and `date`, indicating the _total_ amount of savings needed at a specific date in order to achieve break-even.

The 1st data point corresponds to the first month of the simulation, and the last datapoint corresponds to the last month of the simulation.  The data points in between represent 5-year intervals starting from the first data point.

### Sample response

```json
{
    "savingsNeed": [
        {
            "date": "2019-01",
            "value": "190700.00"
        },
        {
            "date": "2024-01",
            "value": "275200.00"
        },
        {
            "date": "2029-01",
            "value": "180400.00"
        },
        {
            "date": "2034-01",
            "value": "150900.00"
        }
    ]
}
```

<br/>

## `POST /fpe/v5/optimize/socialsecurity`

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