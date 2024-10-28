# Inherited IRAs (WIP...)

## RMD Calculation

1. RMDs on an inherited IRA start in the year following the decedent’s death.  For example, if the decedent died in Apr-2021, then the first RMD would be due in Dec-2022.
1. Pre-SECURE-Act (decedent’s death < Jan-2020)
    1. Decedent’s death < RBD
        1. Let age = beneficiary’s age in December of the RMD start year
        1. Let lifeExp = life expectancy for age based on Single life expectancy table 1
    1. Decedent’s death ≥ RBD
        1. Let beneficiaryAge = beneficiary’s age in December of the RMD start year
        1. Let beneficiaryLifeExp = life expectancy for beneficiaryAge based on Single_life_expectancy_tbl_1
        1. Let decedentAge = decedent’s age in December of the year they died
        1. Let decedentLifeExp = {life expectancy for decedentAge based on Single_life_expectancy_tbl_1} - 1.0
        1. Let lifeExp = max(beneficiaryLifeExp, decedentLifeExp)
    1. Distribution Period = max(1.0, lifeExp - (currentYear - rmdStartYear))
1. Post-SECURE-Act (decedent’s death ≥ Jan-2020)
    1. Decedent’s death < RBD
        1. No RMDs necessary
    1. Decedent’s death ≥ RBD
        1. Calculate Distribution Period per requirements 2.b and 2.c above.
1. The RMD for account a in year y is then calculated as follows:
    1. Let ` bal` = the ending balance of account a in year `y-1`
        1. If `y-1` precedes January of `plan.currentYear`, then `bal` = account balance on current date
    1. Let `p` = the Distribution Period determined in the previous steps
    1. `rmd = bal / p`

## 10-Year Rule

1. The 10-Year Rule requires the beneficiary to withdraw the entire balance of the IRA by December 31 of the year containing the 10th anniversary of the owner’s death.  For example, if the decedent died in 2023, the beneficiary must fully distribute the IRA by Dec-2033.
1. The beneficiary has discretion over when to take the dollars out over this time window, and there is no penalty if completed BEFORE the end of the 10th year.
1. The 10-Year Rule applies ONLY IF decedent’s death ≥ Jan-2020 (i.e. they died post-SECURE-Act).