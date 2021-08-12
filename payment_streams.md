# Income, Expenses, and Transfers

Depending on how the [PaymentStream](./datatypes.md#paymentStream) object is  configured, it can represent an income stream, an expense stream, or a transfer stream.

## Income Streams

A paymentStream that specifies a `target` account, but not a `source` account represents an income stream (i.e money is being deposited into the target account from an unknown external source).

## Expense Streams

A paymentStream that specifies a `source` account, but not a `target` account represents an income stream (i.e money is being withdrawn from the source account and then no longer tracked within the financial model).

## Transfers

A transfer is a transaction whereby money is withdrawn from one account and deposited into another account. This is accomplished by setting both the `source` and `target` attributes of the paymentStream object.
