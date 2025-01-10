# Terminology

## estate value

An [estate](https://www.investopedia.com/terms/e/estate.asp) is everything comprising the net worth of the [plan](datatypes.md#plan) at death (i.e. the final month of the simulation), including all land and real estate, possessions, financial securities, cash, and other assets.

In FPE, the estate value is simply the sum the ending balances of _**all**_ [accounts](datatypes.md#account) regardless of [account type](datatypes.md#accounttype).

<hr/><br/>

## excess income

After processing all expenses, transfers, tax payments, and contributions to retirement plans within a given month, _excess income_ is the remainder of the gross income received that month.

<hr/><br/>

## expense stream

An expense stream represents a withdrawal from 1 or more [accounts](datatypes.md#account) within the [plan](datatypes.md#plan).  In FPE, an expense stream is represented as a [paymentStream](datatypes.md#paymentstream) whose `target` is empty, and whose `source` is assigned the name of an existing account or `"optimal"`, which then funds the expense using the [Optimal Withdrawal Strategy](optimal_withdraw.md).

<hr/><br/>

## goal age

Goal age refers to a person's life expectancy.  In FPE, this value is set via the [Plan.Person.goalAge](datatypes.md#person) attribute.

<hr/><br/>

## income-linked contribution (ILC)

An ILC refers to a contribution to a tax-advantaged account, whereby the the money is taken directly from the person's earned income stream (e.g. a 401k contribution as a pre-tax deduction from their paycheck).  See [Income-Linked Contributions](income_linked_contribs.md) page for details.

<hr/><br/>

## income stream

An income stream represents money from an external source that is deposited into an [account](datatypes.md#account) within the [plan](datatypes.md#plan).  In FPE, an income stream is represented as a [paymentStream](datatypes.md#paymentstream) whose `source` attribute is empty, and whose `target` account is set to an existing account within the plan.

<hr/><br/>

## lifetime debt

Whenever the plan has insufficient funds to cover a withdrawal, the amount is paid for out of the "lifetime debt" account (i.e. an account whose type is [revolvingCredit](datatypes.md#accounttype)).

<hr/><br/>

## liquid asset

A [liquid asset](https://www.investopedia.com/terms/l/liquidasset.asp) is an asset that can easily be converted into cash in a short amount of time.  An [account](datatypes.md#account) is considered a liquid asset if and only if its [account type](datatypes.md#accounttype) is anything other than: `asset`, `mortgage`, `reverseMortage`, `loan`, or `revolvingCredit`.

<hr/><br/>

## liquid estate value

Liquid estate value is very similar to [estate value](#estate-value), except that certain [account types](datatypes.md#accounttype) are excluded from the total value. The excluded account types are `asset`, `mortgage`, and `reverseMortage`.

<hr/><br/>

## periodic payment

A payment that occurs at regular intervals (vs. a one-time payment).  The frequency of a periodic payment is determined by the value of [PaymentStream.paymentsPerYear](datatypes.md#paymentstream).

<hr/><br/>

## RMD liability

The IRS-mandated amount of money that must be withdrawn annually from the [plan's](datatypes.md#plan) tax-deferred accounts in order to satisfy the [RMD rule](https://www.investopedia.com/terms/r/requiredminimumdistribution.asp).

<hr/><br/>

## shortfall withdrawal

A shortfall withdrawal is an implicit withdrawal from 1 or more accounts, which is automatically triggered when FPE attempts to satisfy an expense that exceeds the balance of a given account. The order from which the auxiliary accounts are drawn is determined by the [Optimal Withdrawal Strategy](optimal_withdraw.md).

<hr/><br/>

## transfer

A transfer is a transaction whereby money is withdrawn from one [account](datatypes.md#account) and deposited into another. In FPE, a transfer is accomplished by setting both the `source` and `target` attributes of the [paymentStream](datatypes.md#paymentstream) object.
