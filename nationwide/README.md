# Nationwide - Lifetime Income Builder

## Overview

Lifetime Income Builder ("LIB" for short) is a [Nationwide](https://www.nationwide.com) offering that consists of a group [fixed indexed annuity](https://www.investopedia.com/terms/i/indexedannuity.asp) (FIA) with a [guaranteed lifetime withdrawal benefit](https://www.investopedia.com/terms/g/glwb.asp) (GLWB).

<br/>

The LIB-related financial modeling is triggered by including a valid [NWLIB](#nwlib) data object within an existing FPE [Plan](../datatypes.md#plan) when calling the [POST&nbsp;/v5/forecast](../README.md#post-v5forecast) endpoint.  Example JSON requests containing the `nationwide.lifetimeIncomeBuilder{}` data object can be found in the [./examples](./examples/) subdirectory.

_WIP..._


<br/><br/>

## Mapping LIB Attributes to the FPE Data Model

Much of the LIB algorithm and associated concepts map directly to existing FPE data structures and concepts (e.g. traditional and Roth IRA accounts, taxable and non-taxable annuity streams, variable account growth rates, ...).  That being said, certain aspects of the LIB algorithm are specific enough to Nationwide that they require their own dedicated calculation module and associated data objects (see [Data Objects](#data-objects) section).

_WIP..._


<br/><br/>

## Data Objects

This section defines the Nationwide-specific data objects and attributes.

### Nationwide

This is merely a container for the Nationwide-specific data objects.  It can optionally be added to an existing [Plan](../datatypes.md#plan).

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `lifetimeIncomeBuilder` | [NWLIB](#nwlib) | The data object that embodies all and only the attributes pertaining to the Nationwide LIB product. |

### NWLIB

The NWLIB object defines all of the financial inputs needed for the LIB (Lifetime Income Builder) algorithm.

| Attribute  | Type | Description |
| ---------- | ---- | ----------- |
| `incomeActivationDate` | [Date](../datatypes.md#date) | The future date at which point the participant's LIB income payments commence. |
| `highWaterMark` | int | The highest total balance across the LIB assets to date. |
| `gtdWithdrawRate` | float | At income activation date, the annual guaranteed annuity payment is determined by the formula:<br/>`highWaterMark × gtdWithdrawRate`. |
| `nonGtdWithdrawRate` | float | At income activation date, the annual non-guaranteed annuity payment is determined by the formula:<br/>`highWaterMark × nonGtdWithdrawRate`. |
| `equityIRA` | string | The name of the FPE [account](../datatypes.md#account) that represents the LIB equity IRA asset. |
| `equityRoth` | string | The name of the FPE [account](../datatypes.md#account) that represents the LIB equity Roth asset. |
| `gtdAnnuityIRA` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the guaranteed IRA annuity stream. |
| `gtdAnnuityRoth` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the guaranteed Roth annuity stream. |
| `nonGtdAnnuityIRA` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the non-guaranteed IRA annuity stream. |
| `nonGtdAnnuityRoth` | string | The name of the FPE [payentStream](../datatypes.md#paymentstream) that represents the non-guaranteed Roth annuity stream. |
