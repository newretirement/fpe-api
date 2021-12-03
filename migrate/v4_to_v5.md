# API Migration: V4 ☞ V5

## Dropping support for PaymentStream ages

The [PaymentStream](https://github.com/newret/fpe-api/blob/master/datatypes.md#PaymentStream) attributes `startAge`, `endAge`, and `onAge` are being removed in V5 in favor of `startDate`, `endDate`, and `date` respectively.

Refer to the [v4.6.0 release notes](https://github.com/newretirement/fpe-api/releases/tag/v4.6.0) for details on `startDate`, `endDate`, and `date`.  The advantage to using dates instead of ages is that a date "stands on its own", whereas in order to know the point in time implied by an age requires knowing the the birthdate of the PaymentStream's owner.

__V4 PaymentStream:__<br/>

```json
{
  "currentDate": "2021-01",
  "primary": {
    "birthDate": "1971-01"
  },
  "paymentStreams": [
    {
      "name": "rent",
      "owner": "primary",
      "source": "savings",
      "startAge": "55y2m",
      "endAge": "60y0m"
    }
  ]
}
```

__V5 PaymentStream:__<br/>


```json
{
  "currentDate": "2021-01",
  "primary": {
    "birthDate": "1971-01"
  },
  "paymentStreams": [
    {
      "name": "rent",
      "owner": "primary",
      "source": "savings",
      "paymentsPerYear": 12,
      "startDate": "2026-03",
      "endDate": "2031-01"
    }
  ]
}
```

Also, the `PaymentStream.onAge` (the convenience attribute for referring to a one-time payment) has similarly been changed to `PaymentStream.date`.


## Dropping support for `RatePt.year`

Starting in [v4.5.0](https://github.com/newretirement/fpe-api/releases/tag/v4.5.0), the [RatePt](https://github.com/newretirement/fpe-api/blob/v4.5.0/datatypes.md#ratept) objects within a [PaymentStream.rate.curve\[\]](https://github.com/newretirement/fpe-api/blob/v4.5.0/datatypes.md#PaymentStream) array could be set by either `year` or [date](https://github.com/newretirement/fpe-api/blob/v4.5.0/datatypes.md#Date)

In V5, the `rate.curve[*].year` attribute will no longer be supported (use `rate.curve[*].date` instead).  The advantage to using the [date](https://github.com/newretirement/fpe-api/blob/v5.0.0/datatypes.md#date) object is that the rate change can be specified at month granularity.  JSON examples below:

__V4 Rate:__<br/>

```json
{
  "rate": {
    "curve": [
      {"year": 2021, "rate": {"mean": 0.08}},
      {"year": 2040, "rate": {"mean": 0.03}}
    ]
  }
}
```

__V5 Rate:__<br/>

```json
{
  "rate": {
    "curve": [
      {"date": "2021-01", "rate": {"mean": 0.08}},
      {"date": "2040-01", "rate": {"mean": 0.03}}
    ]
  }
}
```


## [Asset sales](https://github.com/newretirement/fpe-api/blob/v5.0.0/datatypes.md#assetsale) now specified by [date](https://github.com/newretirement/fpe-api/blob/v5.0.0/datatypes.md#date) (vs. by Primary's age)

__V4 AssetSale:__<br/>

```json
"events": {
  "assetSales": [
    {
      "onAge": "50y4m"
    }
  ]
}
```

__V5 AssetSale:__<br/>

```json
"events": {
  "assetSales": [
    {
      "date": "2035-06"
    }
  ]
}
```


## Dropping support for 'monthly' queryparam on `POST /forecast` endpoint

The [POST /v4/forecast](https://github.com/newretirement/fpe-api#post-forecast) endpoint calculates and returns a forecast that contains a set of time series projections.  The values within each time series are either yearly (default) or monthly depending on how the request is configured.

Prior to [v4.2.0](https://github.com/newretirement/fpe-api/releases/tag/v4.2.0), the period of the projection values was specified exclusively via a query param:

```
POST /v4/forecast?period=${P}
{
  ...
}
```
where `${P}` is either `yearly` or `monthly`.

Starting in [v4.2.0](https://github.com/newretirement/fpe-api/releases/tag/v4.2.0), the projection period can additionally be set within the [Params](https://github.com/newretirement/fpe-api#params-request-object) request object:

```
POST /v5/forecast
{
  "params": {
    "projectionPeriod": "${P}"
  },
  "plan": {
    ...
  }
}
```
where `${P}` is either `yearly` or `monthly`.

Starting in V5, projection period can only be set via `params.projectionPeriod`.


## Income/Expense score is now an optional calc

The [Forecast](https://github.com/newretirement/fpe-api/blob/v5.0.0/datatypes.md#forecast) response object currently contains an attribute called `postRetireIncomeExpenseRatio`, which is the result of an income/expense ratio calculation.  In V4, this calc runs unconditionally.

Starting in V5, this calc is optional, and will only be executed if the client sets `calcPostRetireIncomeExpenseRatio` to `true` in the [params section](https://github.com/newretirement/fpe-api#params-request-object) of the `POST /v5/forecast` request object.
