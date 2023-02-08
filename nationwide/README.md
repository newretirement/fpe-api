# Nationwide

## Overview

This page describes 2 algorithms that are being developed initially for Nationwide's use:

- LIB (Lifetime Income Builder)
    - Models of a group [fixed indexed annuity](https://www.investopedia.com/terms/i/indexedannuity.asp) (FIA) with a [guaranteed lifetime withdrawal benefit](https://www.investopedia.com/terms/g/glwb.asp) (GLWB).
- MIRP (My Interactive Retirement Planner)
    - Estimates post-retirement expenses based on a person's pre-retirement income.

All algorithms are optional, and are triggered by including the algorithm's corresponding configuration object within the request.

<br/>

## Mapping Algorithms to the FPE Data Model

Much of the LIB and MIRP algorithms and associated concepts map directly to existing FPE data structures and concepts (e.g. traditional and Roth IRA accounts, taxable and non-taxable income streams, variable account growth rates).  That being said, certain aspects of these algorithms are specific enough to Nationwide's business logic that they require their own dedicated calculation module and associated data objects (see [Data Objects](#data-objects) section).

_WIP..._

<br/>

## Data Objects

This section defines the data objects and attributes for each of the algorithms.

<br/>

### Nationwide

This object is merely a container for each of the algorithms and associated data objects.  It can optionally be added to an existing [Plan](../datatypes.md#plan).

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `lifetimeIncomeBuilder` | [NWLIB](#nwlib) | The data object that embodies all and only the attributes pertaining to the Nationwide LIB product. |
| `mirp` | [MIRP](#mirp) | MIRP = My Interactive Retirement Planner. |

<br/>

### NWLIB

The `NWLIB` object defines all of the financial inputs needed for the LIB (Lifetime Income Builder) algorithm.  This algorithm is triggered by the inclusion of this data object within an existing FPE [Plan](../datatypes.md#plan) when calling the [POST&nbsp;/v5/forecast](../README.md#post-v5forecast) endpoint.  Example JSON requests containing the `nationwide.lifetimeIncomeBuilder{}` data object can be found in the [./examples/nwlib/](./examples/nwlib/) subdirectory.


| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `equityAllocation` | float | At `incomeActivationDate`, the percentage of equity funds to be retained within the `equityRoth` and `equityIRA` accounts is dictated by this rate (where the non-retained portion is assumed to have been used to purchase the non-guarateed annuities). |
| `incomeActivationDate` | [Date](../datatypes.md#date) | The future date at which point the participant's LIB income payments commence. |
| `highWaterMark` | int | The highest total balance across the LIB assets to date. |
| `gtdWithdrawRate` | float | At income activation date, the annual guaranteed income payment is determined by the formula:<br/>`highWaterMark × gtdWithdrawRate`. |
| `nonGtdWithdrawRate` | float | At income activation date, the annual non-guaranteed income payment is determined by the formula:<br/>`highWaterMark × nonGtdWithdrawRate`. |
| `equityIRA` | string | The name of the FPE [account](../datatypes.md#account) that represents the LIB equity IRA asset. |
| `equityRoth` | string | The name of the FPE [account](../datatypes.md#account) that represents the LIB equity Roth asset. |
| `gtdIncomeIRA` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the guaranteed IRA income stream. |
| `gtdIncomeRoth` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the guaranteed Roth income stream. |
| `nonGtdIncomeIRA` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the non-guaranteed IRA income stream. |
| `nonGtdIncomeRoth` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the non-guaranteed Roth income stream. |

<br/>

### MIRP

The `MIRP` object defines all of the financial inputs needed for the 'My Interactive Retirement Planner' financial logic.  Example JSON requests containing the `nationwide.mirp{}` data object can be found in the [./examples/mirp/](./examples/mirp/) subdirectory.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `replacementRate` | float | A rate in the range `[0.0, 1.0]` that represents the percentage of the participant's pre-retirement income will be needed to maintain their lifestyle in retirement. |
| `postRetireExpenseStream` | string | The name of the [payentStream](../datatypes.md#paymentstream) to which FPE will assign the calculated post-retirement expense amount. |
