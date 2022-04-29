# FPE - Financial Projection Engine

# Overview

FPE implements a mathematical model for forecasting a person's future financial state throughout their lifetime given their current financial state, various future financial assumptions, and real world market/tax data as model inputs.

Starting at the present month, FPE projects future financial state by calculating a set of "month-over-month" [time series](https://en.wikipedia.org/wiki/Time_series) vectors, where each vector represents a discrete account balance or payment stream over the course of the financial plan.

<br/><hr/><br/>


# API Keys

All FPE endpoints require a valid API key, which must be provided in the request header.  For example:

```
POST /fpe/v4/forecast HTTP/1.1
X-Api-Key: abcdefg1234567
```

Failure to provide a valid API key will trigger an [HTTP 403 Forbidden](#http-response-status-codes) error response.

<br/><hr/><br/>


# API Versioning

FPE uses [semantic versioning](https://semver.org/) as its software versioning policy.  The version of a running FPE service can be obtained in 2 ways:

1. __HTTP response header__: All endpoints add a `Fpe-Version` header attribute to their response.
2. __[GET /info](#get-info)__: This endpoint returns the version, along with other build/deploy related info.

The MAJOR version is embedded in the URL path of all FPE endpoints (e.g. `POST {host}/fpe/v4/forecast`).

<br/><hr/><br/>


# Error Handling

## Errors vs. Warnings

### What is an Error

An error occurs if the API client submits a request for which FPE cannot return a meaningful response (for any reason). In the event of an error, FPE returns:
  - An HTTP status code appropriate for the type of error (see [HTTP Response Status Codes](#http-response-status-codes) further down)
  - A `text/plain` detail message

For example, if the client calls `POST /forecast` and provides an invalid birthDate of `1200-01`, FPE responses with:

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

The requested resource or method doesn't exist (e.g. `GET /fpe/v4/fake/path/123`).

<br/>

__`405 Method Not Allowed`__

The request method is valid (e.g. `GET`, `POST`), but is not supported by the requested resource.  For example, `GET /fpe/v4/forecast` will return `HTTP 405`, since endpoint only supports the `POST` HTTP method.

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

Across all FPE endpoints, request and responses are represented as JSON objects.  These data objects are cataloged and described on [this page](./datatypes.md).

Below are the descriptions of each endpoint.


## `GET /info`

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

## `POST /annuitize`

Estimates the monthly [annuity](https://www.investopedia.com/terms/a/annuity.asp) income stream based on a given annuity premium, as well as other information that potentially affects the future income payments.

#### AnnuitizeRequest

This is the top-level request object that is posted to this endpoint.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `currentDate` | [Date](./datatypes.md#date) | Today's date. |
| `annuitant` | [Person](#person) | The person receiving the annuity. |
| `annuitantSpouse` | [Person](#person) | (optional) The annuitant's spouse. |
| `scenarios` | [Scenario[]](#scenario) | List of 0 or more annuity calculation scenarios. |

#### Person

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `birthDate` | [Date](./datatypes.md#date) | The person's date of birth. |
| `gender` | [Gender](datatypes.md#gender) | The person's gender (required for mortality calculations). |

#### Scenario

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `premium` | int | The lump sum cost of the annuity. |
| `purchaseDate` | [Date](./datatypes.md#date)  | The date on which the annuity was purchased. |
| `startDate` | [Date](./datatypes.md#date)  | The date on which annuity payments shall commence. |
| `survivorBenefit` | float | Survivor benefit ratio, which is only relevant if the annuitant has a spouse.  Valid range is `[0.0..1.0]`.  Default value is `0.0` if omitted. |
| `cola` | float | Cost of Living Adjustment.  Valid range is `[0.0..1.0]`.  Default value is `0.0` if omitted. |
| `yearsCertain` | int | A [Years Certain annuity](https://www.investopedia.com/terms/y/years-certain-annuity.asp) pays the holder a continuous monthly income for the specified number of years, regardless of how long the annuitant lives.  Default value is `0` if omitted. |
| `cashRefund` | boolean | A [Cash Refund annuity](ttps://www.investopedia.com/terms/c/cash-refund-annuity.asp) returns to a beneficiary any sum left over should the annuitant die before breaking even on what they paid in premiums.  Default value is `false` if omitted. |

#### Sample request

```json
{
    "currentDate": "2022-04",
    "annuitant": {
        "birthDate": "1962-01",
        "gender": "female"
    },
    "annuitantSpouse": {
        "birthDate": "1965-01",
        "gender": "male"
    },
    "scenarios": [
        {
            "premium": 30000,
            "purchaseDate": "2025-12",
            "startDate": "2035-01",
            "cola": 0.03,
            "survivorBenefit": 0.5
        },
        {
            "premium": 40000,
            "purchaseDate": "2025-12",
            "startDate": "2035-01",
            "cola": 0.05,
            "survivorBenefit": 0.75
        },
        {
            "premium": 50000,
            "purchaseDate": "2030-01",
            "startDate": "2035-01",
            "cola": 0.06,
            "survivorBenefit": 1.0
        }
    ]
}
```

#### Sample response

The response contains the list of estimated monthly benefit amounts that correspond to the list of scenarios defined in the request object.

```json
{
    "monthlyBenefitAmounts": [
        215,
        222,
        191
    ]
}
```

<br/>

## `POST /forecast`

Given a financial [plan](./datatypes.md#plan), this endpoint runs a simulation that generates a forecast of that plan, consisting of some summary information about the future projection, and a set of time series representing the future periodic values of each account and payment stream involved in the simulation.

#### ForecastRequest

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `params` | [ForecastParams](#forecastparams) | (optional) Configuration for things like optional calculations, time series density, etc. |
| `plan` | [Plan](datatypes.md#plan) | The financial plan to forecast. |

#### ForecastParams

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `projectionPeriod` | enum | Determines if the forecasted projection vectors represent monthly or aggregated annual amounts. Valid values are [`monthly`, `yearly`]. If this attribute is empty, `yearly` is the default. |
| `calcFIRE` | boolean | If `true`, the 'FIRE' solver is executed, and the result appears in the [Forecast.FIRE](datatypes.md#forecast) response. |
| `calcPostRetireIncomeExpenseRatio` | boolean | If `true`, the _Income/Expense Ratio_ calculation is executed, and the result appears in [Forecast.postRetireIncomeExpenseRatio](datatypes.md#forecast) within the response. |
| `calcSpendingPower` | boolean | If `true`, the 'Spending Power' calculation executes, and the result appears as the `spendingPower` attribute within the [Forecast](datatypes.md#Forecast) response object. Note that [plan.primary.retireDate](datatypes.md#Person) must be set when running this calculation. See [Forecast.spendingPower](datatypes.md#Forecast) for more details on this calculation. |

A sample request JSON for this endpoint can be found [here](examples/forecast/basic/single-01.json).

#### ForecastResponse

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `forecast` | [Forecast](datatypes.md#forecast) |  |
| `warnings` | [Warning[]](#what-is-a-warning) |  |

### Sample Scenario

Consider this basic scenario, which is followed by the corresponding JSON request/response:

> Scenario: The current date is January 2021.  John is a 60 year old single male in excellent health.  He expects to live until the age of 90.  John will start claiming social security at age 67 (full retirement age), and knows his PIA will be $2,325. His retirement savings consists of a single IRA with a current balance of $500,000 and an expected AGR of 6% (and a future AGR of 4% starting in 2027).  John works for a company where he earns $7,500/month.  Furthermore, he is participating in an employer-sponsored retirement plan, where he contributes 10% of his salary, and the company matches 50% of his contribution up to 8% of salary.  He plans on retiring at age 67.  John expects to spend $7,000/month in retirement.

The JSON request for this scenario is [here](examples/forecast/basic/single-01.json), and the corresponding JSON response is [here](examples/forecast/basic/single-01.response.json).
