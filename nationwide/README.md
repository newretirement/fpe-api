# Nationwide

## Overview

This section of the documentation covers 2 algorithms that are being developed initially for Nationwide's use:

- [MIRP](./mirp.md) (My Interactive Retirement Planner)
    - Estimates post-retirement expenses based on a person's pre-retirement income.
- [LIB](./nwlib.md) (Lifetime Income Builder)
    - Models of a group [fixed indexed annuity](https://www.investopedia.com/terms/i/indexedannuity.asp) (FIA) with a [guaranteed lifetime withdrawal benefit](https://www.investopedia.com/terms/g/glwb.asp) (GLWB).

All algorithms are optional, and are triggered by including the algorithm's corresponding configuration object within the request.

<br/>

## Mapping Algorithms to the FPE Core Data Model

Much of the LIB and MIRP algorithms and associated concepts map directly to existing FPE data structures and concepts (e.g. traditional and Roth IRA accounts, taxable and non-taxable income streams, variable account growth rates).  That being said, certain aspects of these algorithms are specific enough to Nationwide's business logic that they require their own dedicated calculation code and associated request objects.
