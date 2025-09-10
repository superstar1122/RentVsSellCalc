/* =========================================================================
 *  📂  app.js  –  Rent vs Sell Calculator (versión lista-para-pegar)
 * =========================================================================*/
"use strict";

/* ───────────────────────── 1.  DOM ELEMENTS ─────────────────────────── */
const $ = (id) => document.getElementById(id);          // mini-helper

//  Inputs base
const formInputs                   = $("formInputs");
const yearsSliderRange             = $("yearsSliderRange");
const years_graphic_results        = $("years_graphic_results");
const yearsSliderLabel             = $("yearsSliderLabel");
const yearsToHoldRange             = $("yearsToHoldRange");
const yearsToHoldLabel             = $("yearsToHoldLabel");

const homeValueInput               = $("homeValueInput");
const pricePaidInput               = $("pricePaidInput");
const originalMortgageInput        = $("originalMortgageInput");
const mortgageBalanceInput         = $("mortgageBalanceInput");
const interestRateInput            = $("interestRateInput");
const mortgagePaymentInput         = $("mortgagePaymentInput");

const propertyTaxesInput           = $("propertyTaxesInput");          // % (ej. 1.6)
const homeownersInsuranceInput     = $("homeownersInsuranceInput");    // $/mes
const monthlyRentInput             = $("monthlyRentInput");
const appreciationRateInput        = $("appreciationRateInput");
const primaryResidenceCheckbox     = $("primaryResidenceCheckbox");

//  Inputs avanzados
const MakeReadyCostsInput          = $("MakeReadyCostsInput");
const annualMaintenanceCostsInput  = $("annualMaintenanceCostsInput");
const annualMaintenanceCostsRange  = $("annualMaintenanceCostsRange");
const annualMaintenanceCostsLabel  = $("annualMaintenanceCostsLabel");

const propertyManagementFeeInput   = $("propertyManagementFeeInput");  // $/mes
const annualVacancyRateInput       = $("annualVacancyRateInput");
const annualVacancyRateRange       = $("annualVacancyRateRange");
const annualVacancyRateLabel       = $("annualVacancyRateLabel");
const annualRentChangeInput        = $("annualRentChangeInput");
const annualRentChangeRange        = $("annualRentChangeRange");
const annualRentChangeLabel        = $("annualRentChangeLabel");

const realtorCommissionInput       = $("realtorCommissionInput");
const realtorCommissionRange       = $("realtorCommissionRange");
const realtorCommissionlabel       = $("realtorCommissionlabel");
const closingCostsInputs           = $("closingCostsInputs");
const closingCostsRange            = $("closingCostsRange");
const closingCostsLabel            = $("closingCostsLabel");

const incomeTaxRateInput           = $("incomeTaxRateInput");
const incomeTaxRateRange           = $("incomeTaxRateRange");
const incomeTaxRateLabel           = $("incomeTaxRateLabel");
const capitalGainsTaxRateInput     = $("capitalGainsTaxRateInput");
const capitalGainsTaxRateRange     = $("capitalGainsTaxRateRange");
const capitalGainsTaxRateLabel     = $("capitalGainsTaxRateLabel");
const AfterTaxReinvestmentRateInput= $("AfterTaxReinvestmentRateInput");
const AfterTaxReinvestmentRateRange= $("AfterTaxReinvestmentRateRange");
const AfterTaxReinvestmentRateLabel= $("AfterTaxReinvestmentRateLabel");

//  Outputs resumen
const summary_rent_out             = $("summary_rent_out");
const summary_sell_out             = $("summary_sell_out");
const summary_dif_wealth           = $("summary_dif_wealth");

// Botones
const btnExportPDF                 = $("exportBtn");
const btn30years                   = $("btn30years");
const btn15years                   = $("btn15years");
const btnCustom                    = $("btnCustom");
const mortgageTermCustomInput      = $("mortgageTermCustomInput");

/* ───────────────────────── 2.  UTILIDADES ───────────────────────────── */
const pct   = (x)=> (x >= 1 ? x/100 : x);               // 6 → 0.06
const $fmt  = (n)=> "$" + Math.round(n).toLocaleString();

/* ───────────────────────── 3.  LISTENERS UI ─────────────────────────── */
formInputs.addEventListener("submit", e => {
  e.preventDefault();
  populateTable(getInputsFromForm());
});

// sliders → labels
[
  [yearsSliderRange, yearsSliderLabel, years_graphic_results],
  [yearsToHoldRange, yearsToHoldLabel],
  [annualMaintenanceCostsRange, annualMaintenanceCostsInput, annualMaintenanceCostsLabel],
  [annualVacancyRateRange, annualVacancyRateInput, annualVacancyRateLabel],
  [annualRentChangeRange, annualRentChangeInput, annualRentChangeLabel],
  [realtorCommissionRange, realtorCommissionInput, realtorCommissionlabel],
  [closingCostsRange, closingCostsInputs, closingCostsLabel],
  [incomeTaxRateRange, incomeTaxRateInput, incomeTaxRateLabel],
  [capitalGainsTaxRateRange, capitalGainsTaxRateInput, capitalGainsTaxRateLabel],
  [AfterTaxReinvestmentRateRange, AfterTaxReinvestmentRateInput, AfterTaxReinvestmentRateLabel],
].forEach(([range,input,label])=>{
  if(!range) return;
  range && range.addEventListener("input",()=>{
    const selectedYear = parseInt(yearsSliderRange.value);
    if (input)  input.textContent  = range.value;
    if (label)  label.textContent = range.value;
    updateSimulation(selectedYear);
  });
});

// PDF
btnExportPDF?.addEventListener("click", function () {
  try {
    this.textContent = "Preparing PDF…"; this.disabled = true;
    const oldTitle = document.title;
    document.title = "Rent vs Sell – " + new Date().toLocaleDateString();
    window.print();
    setTimeout(()=>{ document.title = oldTitle;
      this.textContent = "Export as PDF"; this.disabled = false; }, 800);
  } catch(err){ console.error(err); alert("Print error"); }
});

/* ───────────────────────── 4.  CÁLCULOS PRINCIPALES ─────────────────── */
/* 4-A  Ingresos de renta */
function annualRent(year, p){
  const gross = p.monthlyRent*12*(1+p.rentGrowth)**(year-1);
  return gross * (1 - p.vacancy);               // tras vacancia
}

/* 4-B  Amortización hipoteca (un año) */
function amortizeYear(balance, ratePct, monthlyPI){
  const r = ratePct/12;
  let interest = 0;
  for (let i=0;i<12 && balance>0;i++){
    const int  = balance*r;
    const prin = Math.min(monthlyPI-int, balance);
    interest += int;
    balance  -= prin;
  }
  return {balance, interest};
}

/* 4-C  Otros costes (tax, seguro, gestión, mantenimiento, make-ready) */
function otherCosts(year, ctx){
  const {
    houseVal, monthlyMgmtFee, propertyTaxRate,
    insurancePerMonth, maintPct, makeReadyCost
  } = ctx;
  const propTax  = houseVal * propertyTaxRate;
  const insure   = insurancePerMonth*12;
  const mgmt     = monthlyMgmtFee*12;
  const maint    = houseVal * maintPct;
  const makeRdy  = year===1 ? makeReadyCost : 0;
  return propTax+insure+mgmt+maint+makeRdy;
}

/* 4-D  Simulador */
function simulate(inp){
  /* normalizar porcentajes */
  inp.propertyTaxRate    = pct(inp.propertyTaxRate);
  inp.rentGrowth         = pct(inp.rentGrowth);
  inp.vacancy            = pct(inp.vacancy);
  inp.appreciation       = pct(inp.appreciation);
  inp.incomeTaxRate      = pct(inp.incomeTaxRate);
  inp.capGainTaxRate     = pct(inp.capGainTaxRate);
  inp.realtorFee         = pct(inp.realtorFee);
  inp.closingCostPct     = pct(inp.closingCostPct);
  inp.reinvestRate       = pct(inp.reinvestRate);

  const yrs  = inp.years;
  const PI   = inp.monthlyPI;

  let bal    = inp.mortgageBalance;
  let cashInv= -inp.makeReadyCost;                 // invertido (negativo al inicio)
  const rows = [];

  // valor inicial para Wealth Sell
  const netNow = inp.homeValue*(1-inp.realtorFee-inp.closingCostPct) - bal;
  let wealthSell = netNow;

  for (let y=1;y<=yrs;y++){
    const rent = annualRent(y, inp);

    // amortizar este año
    const {balance:newBal, interest} = amortizeYear(bal, inp.rate, PI);
    const mortPay = PI*12;
    bal = newBal;

    // valor casa apreciado
    const houseVal = inp.homeValue * (1+inp.appreciation)**(y-1);

    // otros costes
    const oCost = otherCosts(y,{
      houseVal,
      monthlyMgmtFee: inp.mgmtFee,
      propertyTaxRate: inp.propertyTaxRate,
      insurancePerMonth: inp.insurancePerMonth,
      maintPct: inp.maintPct,
      makeReadyCost: inp.makeReadyCost
    });

    // cash flow
    const preTaxCF = rent - mortPay - oCost;
    const taxable  = Math.max(rent - interest - oCost, 0);
    const tax      = taxable * inp.incomeTaxRate;
    const afterTax = preTaxCF - tax;

    // reinvertir cash flow
    cashInv = cashInv*(1+inp.reinvestRate) + afterTax;

    // equity
    const equity = houseVal - bal;

    // wealth rent (no vendemos aún)
    const wealthRent = equity + cashInv;

    // wealth sell (crece la cuenta inicial al 6%)
    if (y>1) wealthSell *= (1+inp.reinvestRate);

    rows.push({
      Year: y,
      rent, mortPay, oCost, afterTax,
      houseVal, equity, wealthRent, wealthSell,
      diff: wealthRent-wealthSell
    });
  }
  return rows;
}

/* ───────────────────────── 5.  TABLA HTML ───────────────────────────── */
function populateTable(inputs){
  const tbody = document.querySelector("table tbody");
  if (!tbody) return;

  const data = simulate(inputs);
  tbody.innerHTML = "";
  data.forEach(r=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.Year}</td>
      <td>${$fmt(r.rent)}</td>
      <td>-${$fmt(r.mortPay)}</td>
      <td>-${$fmt(r.oCost)}</td>
      <td>${r.afterTax<0? "-"+$fmt(-r.afterTax):$fmt(r.afterTax)}</td>
      <td>${$fmt(r.houseVal)}</td>
      <td>${$fmt(r.equity)}</td>
      <td>${$fmt(r.wealthRent)}</td>
      <td>${$fmt(r.wealthSell)}</td>
      <td>${r.diff>=0? $fmt(r.diff):"-"+$fmt(-r.diff)}</td>`;
    tbody.appendChild(tr);
  });

  const last = data[data.length-1];
  summary_rent_out.textContent   = $fmt(last.wealthRent);
  summary_sell_out.textContent   = $fmt(last.wealthSell);
  summary_dif_wealth.textContent = (last.diff>=0? "+" : "-") + $fmt(Math.abs(last.diff));
}

/* ───────────────────────── SUMMARY UPDATE by odysseus  ─────────────── */
/** ---------------start of inserted part ----------------- */
function updateSimulation(selectedYear) {
  const inputs = getInputsFromForm();
  const fullData = simulate(inputs);

  // update summary section
  const row = fullData.find(r => r.Year === selectedYear);
  if (row) {
    summary_rent_out.textContent   = $fmt(row.wealthRent);
    summary_sell_out.textContent   = $fmt(row.wealthSell);
    summary_dif_wealth.textContent = (row.diff >= 0 ? "+" : "-") + $fmt(Math.abs(row.diff));
  }

  // move vertical dotted line in chart
  if (window.chart) {
    window.chart.drawVerticalLine(selectedYear);
  }
}



/** --------------- end of inserted part ----------------- */


/* ───────────────────────── 6.  INPUTS → OBJETO ------------------------ */
function getInputsFromForm(){
  /* plazo hipoteca */
  const term = btn30years?.checked ? 360 :
               btn15years?.checked ? 180 :
               parseInt(mortgageTermCustomInput?.value||"30")*12;

  // cuota mensual (si no la escribe el usuario se calculará)
  const r     = pct(parseFloat(interestRateInput.value)||0.05);
  const P     = parseFloat(originalMortgageInput.value)||250000;
  const PI    = (parseFloat(mortgagePaymentInput.value) ||
                 ((P*r/12)/(1-(1+r/12)**(-term)))).toFixed(2);

  return {
    /* básicos */
    homeValue       : parseFloat(homeValueInput.value)||450000,
    pricePaid       : parseFloat(pricePaidInput.value)||300000,
    originalMort    : P,
    mortgageBalance : parseFloat(mortgageBalanceInput.value)||200000,
    rate            : r,
    monthlyPI       : parseFloat(PI),
    years           : parseInt(yearsToHoldRange.value)||10,

    /* renta */
    monthlyRent     : parseFloat(monthlyRentInput.value)||2500,
    rentGrowth      : pct(parseFloat(annualRentChangeInput.value)||3),
    vacancy         : pct(parseFloat(annualVacancyRateInput.value)||8),

    /* gastos operativos */
    propertyTaxRate : pct(parseFloat(propertyTaxesInput.value)||1.6),
    insurancePerMonth: parseFloat(homeownersInsuranceInput.value)||115,
    mgmtFee         : parseFloat(propertyManagementFeeInput.value)||137,
    maintPct        : pct(parseFloat(annualMaintenanceCostsInput.value)||1),
    makeReadyCost   : parseFloat(MakeReadyCostsInput.value)||3000,

    /* crecimiento + venta */
    appreciation    : pct(parseFloat(appreciationRateInput.value)||3.5),
    realtorFee      : pct(parseFloat(realtorCommissionInput.value)||6),
    closingCostPct  : pct(parseFloat(closingCostsInputs.value)||3),

    /* impuestos + reinversión */
    incomeTaxRate   : pct(parseFloat(incomeTaxRateInput.value)||10),
    capGainTaxRate  : pct(parseFloat(capitalGainsTaxRateInput.value)||15),
    reinvestRate    : pct(parseFloat(AfterTaxReinvestmentRateInput.value)||6)
  };
}

/* ───────────────────────── 7.  INICIALIZAR ---------------------------- */
populateTable(getInputsFromForm());

/* Re-calcular dinámicamente al cambiar cualquier input */
document.querySelectorAll("#formInputs input").forEach(el=>{
  el.addEventListener("input",()=> populateTable( getInputsFromForm() ));
});
