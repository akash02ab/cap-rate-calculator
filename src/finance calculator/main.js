import {
  FV,
  PV,
  PMT,
  NPER,
  amountConfig,
  numberWithCommas,
  RATE,
} from '../utils/utils.js';

const calculate = document.getElementById('calculate');
const numberOfCompoundingYears = document.getElementById('N');
const interestPeriod = document.getElementById('IY');
const periodicPayment = new AutoNumeric('#PMT', amountConfig);
const futureValue = new AutoNumeric('#FV', amountConfig);
const presentValue = new AutoNumeric('#PV', amountConfig);
const intermediateResultName = document.getElementById('intermediate-result-left');
const intermediateResultValue = document.getElementById('intermediate-result-right');
const resultContainer = document.querySelector('.card-result-inner-container');
let hidden = 'PV';

const getLabel = {
  PV: 'Present Value (PV)',
  FV: 'Future Value (FV)',
  PMT: 'Periodic Payment (PMT)',
  N: 'Number of Compounding Years (N)',
  IY: 'Interest Period (I/Y)'
};

const updateInputContainer = (e) => { 
  let selected = e.target.value;

  if (hidden === selected) return;

  let hiddenInput = document.getElementById(hidden);
  let hiddenWrapper = hiddenInput.parentElement;
  let hiddenContainer = hiddenWrapper.parentElement;
  let selectedInput = document.getElementById(selected);
  let selectedWrapper = selectedInput.parentElement;
  let selectedContainer = selectedWrapper.parentElement;

  hiddenContainer.classList.remove('hide');
  selectedContainer.classList.add('hide');
  hidden = selectedInput.id;
  intermediateResultName.innerText = getLabel[hidden];

  switch (hidden) { 
    case 'PV': calculatePresentValue(); break;
    case 'FV': calculateFutureValue(); break;
    case 'PMT': calculatePeriodicPayment(); break;
    case 'N': calculateNumberOfCompoundingYears(); intermediateResultValue.innerText = '0 year'; break;
    case 'IY': calculateInterestPeriod(); intermediateResultValue.innerText = '0.0%';  break;
  }
}

const updateResultContainerBackwards = (n, fv, pmt, ir) => { 
  resultContainer.innerHTML = '';
  
  for (let i = n; i >= 1; i--) {
    let pv = Math.round((-fv - pmt) / (1 + (ir / 100)));
    let irv = Math.round(pv * ir / 100);
    let row = document.createElement('div');
    row.classList.add('row');
    row.innerHTML = `
      <h4>${i}</h4>
      <h4>$${pv}</h4>
      <h4>$${pmt}</h4>
      <h4>$${irv}</h4>
      <h4>$${fv}</h4>
    `;
    resultContainer.insertBefore(row, resultContainer.firstChild);
    fv = -pv;
  }
} 

const updateResultContainerForwards = (n, pv, pmt, ir) => { 
  resultContainer.innerHTML = '';
  
  for (let i = 1; i <= n; i++) {
    let irv = Math.round(pv * ir / 100);
    let fv = -(pv + pmt + irv);
    let row = document.createElement('div');
    row.classList.add('row');
    row.innerHTML = `
      <h4>${i}</h4>
      <h4>$${pv}</h4>
      <h4>$${pmt}</h4>
      <h4>$${irv}</h4>
      <h4>$${fv}</h4>
    `;
    resultContainer.appendChild(row);
    pv = -fv;
  }
} 

const calculatePresentValue = () => {
  const rate = parseFloat(interestPeriod.value);
  const nper = parseInt(numberOfCompoundingYears.value);
  const pmt = parseInt(periodicPayment.rawValue);
  const fv = parseInt(futureValue.rawValue);
  let pv = Math.round(PV(rate / 100, nper, pmt, fv));
  
  if (pv) {
    intermediateResultValue.innerText = '$' + numberWithCommas(pv);
    updateResultContainerBackwards(nper, fv, pmt, rate);
  }
}

const calculateFutureValue = () => {
  const rate = parseFloat(interestPeriod.value);
  const nper = parseInt(numberOfCompoundingYears.value);
  const pmt = parseInt(periodicPayment.rawValue);
  const pv = parseInt(presentValue.rawValue);
  const fv = Math.round(FV(rate / 100, nper, pmt, pv));

  if (fv) {
    intermediateResultValue.innerText = '$' + numberWithCommas(fv);
    updateResultContainerForwards(nper, pv, pmt, rate);
  }
}

const calculatePeriodicPayment = () => {
  const rate = parseFloat(interestPeriod.value);
  const nper = parseInt(numberOfCompoundingYears.value);
  const pv = parseInt(presentValue.rawValue);
  const fv = parseInt(futureValue.rawValue);
  const pmt = Math.round(PMT(rate / 100, nper, pv, fv));
  
  if (pmt) {
    intermediateResultValue.innerText = '$' + numberWithCommas(pmt);
    updateResultContainerForwards(nper, pv, pmt, rate);
  }
 }

const calculateNumberOfCompoundingYears = () => {
  const rate = parseFloat(interestPeriod.value);
  const pv = parseInt(presentValue.rawValue);
  const fv = parseInt(futureValue.rawValue);
  const pmt = parseInt(periodicPayment.rawValue);
  const nper = Math.round(NPER(rate / 100, pmt, pv, fv));

  if (nper) {
    intermediateResultValue.innerText = nper + 'years';
    updateResultContainerForwards(nper, pv, pmt, rate);
  }
}

const calculateInterestPeriod = () => { 
  const nper = parseInt(numberOfCompoundingYears.value);
  const pv = parseInt(presentValue.rawValue);
  const fv = parseInt(futureValue.rawValue);
  const pmt = parseInt(periodicPayment.rawValue);
  const rate = (RATE(nper, pmt, pv, fv) * 100).toFixed(2);
  
  if (rate !== 'NaN') {
    intermediateResultValue.innerText = rate + '%';
    updateResultContainerForwards(nper, pv, pmt, rate);
  }
}

calculate.addEventListener('change', updateInputContainer);
[interestPeriod, numberOfCompoundingYears, periodicPayment.domElement, futureValue.domElement, presentValue.domElement].forEach(input => input.addEventListener('input', () => { 
  switch (hidden) { 
    case 'PV': calculatePresentValue(); break;
    case 'FV': calculateFutureValue(); break;
    case 'PMT': calculatePeriodicPayment(); break;
    case 'N': calculateNumberOfCompoundingYears(); break;
    case 'IY': calculateInterestPeriod(); break;
  }
}));