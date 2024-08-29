/**
 * HWM (High Water Mark) Calculation.
 * This is an "executable specification" for how to calculate HWM and HWM Ratio.
 * E.g. you can copy/paste this page into your browser's developer debug window and run it.
 */

// The user's plan
plan = {
    inPlanGuarantee: {
        highWaterMark: 200000,
        vintage: {
            product: 'LIB',
            hwmRatio: 1.25
        }        
    }
}

vintage = plan.inPlanGuarantee.vintage;
ipgAcctBal = 100000; // Total account balance across IPG accounts
annualAcctGrowth = 0.05; // Determines the account's annual growth
monthlyContrib = 1000; // monthly contribution to IPG account

isUserInvestedInIPG = plan.inPlanGuarantee.highWaterMark != 0;
hwm = isUserInvestedInIPG ? plan.inPlanGuarantee.highWaterMark : (ipgAcctBal * vintage.hwmRatio);
hwmRatio = vintage.hwmRatio;

console.log(`Initial values: hwm=${hwm}, hwmRatio=${hwmRatio}`);

// hwm and hwmRatio are updated each month throughout the FPE simulation
// (the loop below simulates the first 12 months).
for (i = 0; i < 12; i++) {
    ipgAcctBal *= (1.0 + annualAcctGrowth)**(1/12);
    ipgAcctBal += monthlyContrib;

    hwm += monthlyContrib * hwmRatio;
    hwm = Math.max(hwm, ipgAcctBal);

    if (vintage.product != 'IA') {
        hwmRatio = hwm / ipgAcctBal;
    }

    console.log(`month ${i}: ipgAcctBal=${ipgAcctBal}, hwm=${hwm}, hwmRatio=${hwmRatio}`);
}