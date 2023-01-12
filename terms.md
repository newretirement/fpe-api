# Terminology

## estate value

An [estate](https://www.investopedia.com/terms/e/estate.asp) is everything comprising the net worth of the [plan](datatypes.md#plan), including all land and real estate, possessions, financial securities, cash, and other assets.

In FPE, the estate value is simply the sum the ending balances of _**all**_ [accounts](datatypes.md#account) regardless of [account type](datatypes.md#accounttype).

<hr/><br/>

## excess income

After processing all expenses, transfers, tax payments, and contributions to retirement plans within a given month, _excess income_ is the remainder of the gross income received that month.

<hr/><br/>

## expense stream

An expense stream represents a withdrawal from an [account](datatypes.md#account) within the [plan](datatypes.md#plan) that is applied to some external entity (e.g. a car payment to a financial institution).  In FPE, an expense stream is represented as a [paymentStream](datatypes.md#paymentstream) whose `target` attribute is empty, and whose `source` account is set to an existing account within the plan.

<hr/><br/>

## income stream

An income stream represents money from an external source that is deposited into an [account](datatypes.md#account) within the [plan](datatypes.md#plan).  In FPE, an income stream is represented as a [paymentStream](datatypes.md#paymentstream) whose `source` attribute is empty, and whose `target` account is set to an existing account within the plan.

<hr/><br/>

## lifetime debt

Whenever the plan has insufficient funds to cover a withdrawal, the amount is paid for out of the "lifetime debt" account (i.e. an account whose type is [revolvingCredit](datatypes.md#accounttype)).

<hr/><br/>

## longevity age

Longevity age refers to a person's life expectancy.  In FPE, this value is set via the [Plan.Person.goalAge](datatypes.md#person) attribute.

<hr/><br/>

## liquid asset

A [liquid asset](https://www.investopedia.com/terms/l/liquidasset.asp) is an asset that can easily be converted into cash in a short amount of time.  Within FPE, an [account](datatypes.md#account) is classified as a liquid asset based on its [type](datatypes.md#accounttype) combined with the following rules:
- NOT a liquid asset if account type is `asset`, `mortgage`, `reverseMortage`, `loan`, or `revolvingCredit`
- IS a liquid asset for any other [account type](datatypes.md#accounttype)

<hr/><br/>

## liquid estate value

Liquid estate value is very similar to [estate value](#estate-value), except that certain [account types](datatypes.md#accounttype) are excluded from the total value. The excluded account types are `asset`, `mortgage`, and `reverseMortage`.

<hr/><br/>

## RMD liability

The IRS-mandated amount of money that must be withdrawn annually from the [plan's](datatypes.md#plan) tax-deferred accounts in order to satisfy the [RMD rule](https://www.investopedia.com/terms/r/requiredminimumdistribution.asp).

<hr/><br/>

## transfer

A transfer is a transaction whereby money is withdrawn from one [account](datatypes.md#account) and deposited into another. In FPE, a tranfer is accomplished by setting both the `source` and `target` attributes of the [paymentStream](datatypes.md#paymentstream) object.
