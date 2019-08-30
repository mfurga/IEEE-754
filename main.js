var BINARY32_BIAS = 127;

var number = 0;
var isDenormalized = true;

function getSign()
{
  return (number >> 31) & 1;
}

function getExponent()
{
  return (number >> 23) & 0xff;
}

function getFraction()
{
  return number & 0x7fffff;
}

function fractionToDecimal(fraction)
{
  var arr = [];
  for (var i = -1; i >= -23; i--) {
    arr.push(Math.pow(2, i));
  }
  
  var res = 0.0;
  fraction = fraction.toString(2).padStart(23, '0');
  for (var i = 0; i < fraction.length; i++) {
    if (fraction[i] === '1') {
      res += arr[i];
    }
  }
  return res;
}

function setBit(position, state)
{
  var mask = Math.pow(2, position);
  if ((number >> position) & 1)
    number -= mask;
  number += state * mask;
  // number = (number & ~mask) + (state * mask);
}

function updateBitPatternStates()
{
  var fields = document.querySelectorAll('input[type="checkbox"]');
  [].slice.call(fields, 0).reverse().forEach((f, i) => {
    var state = (number >> i) & 1;
    f.checked = state;
  });
}

// Updates the information section.
function updateFieldsInformations()
{
  // Sign field
  var sign = getSign(number);
  var signRowValue = document.getElementById('sign-row-value');
  var signEncoded = document.getElementById('sign-encoded');

  signRowValue.innerHTML = getSign(number);
  signEncoded.innerHTML = (getSign(number) === 0) ? '+1' : '-1';
 
  // Exponent field
  var exponent = getExponent(number);
  var exponentRowValue = document.getElementById('exponent-row-value');
  var exponentEncoded = document.getElementById('exponent-encoded');
  
  exponentRowValue.innerHTML = exponent;
  if (exponent === 0) {
      exponentEncoded.innerHTML = '2<sup>-126</sup> (denormalized)';
      isDenormalized = true;
  } else {
    exponentEncoded.innerHTML = '2<sup>' + (exponent - BINARY32_BIAS).toString() + '</sup>';
    isDenormalized = false;
  }
  
  // Fraction field
  var fraction = getFraction(number);
  var fractionRowValue = document.getElementById('fraction-row-value');
  var fractionEncoded = document.getElementById('fraction-encoded');

  fractionRowValue.innerHTML = fraction;
  
  if (isDenormalized)
    fractionEncoded.innerHTML = '<b style="color: #f00;">0</b>' + fractionToDecimal(fraction).toString().substr(1) + ' (denormalized)';
  else
    fractionEncoded.innerHTML = (fractionToDecimal(fraction) + 1).toString();

  updateFieldsInputs();
}

function byte_swap_32(number)
{
  //return ((number & 0x000000ff) << 24) ||
  //       ((number & 0x0000ff00) << 8)  ||
  //       ((number & 0x00ff0000) >> 8)  ||
  //       ((number & 0xff000000) >> 24);
  var res = 0;
  res += ((number >> 0)  & 0xff) * Math.pow(2, 24);
  res += ((number >> 8)  & 0xff) * Math.pow(2, 16);
  res += ((number >> 16) & 0xff) * Math.pow(2, 8);
  res += ((number >> 24) & 0xff) * Math.pow(2, 0);
  return res;
}

function updateFieldsInputs()
{
  document.querySelector('input[name="binary"]').value = number.toString(2).padStart(32, '0');
  document.querySelector('input[name="hexadecimal-be"]').value = number.toString(16).padStart(8, '0');
  document.querySelector('input[name="hexadecimal-le"]').value = byte_swap_32(number).toString(16).padStart(8, '0');

  var decimal = Math.pow(-1, getSign(number)) *
                Math.pow(2, getExponent(number) - BINARY32_BIAS);

  if (isDenormalized)
    decimal *= fractionToDecimal(getFraction(number)) + 0;
  else
    decimal *= fractionToDecimal(getFraction(number)) + 1;
  
  document.querySelector('input[name="decimal"]').value = decimal;
}

window.addEventListener('load', () => {

  document.querySelectorAll('input[type=checkbox]').forEach((f) => {
    f.addEventListener('click', () => {
      if (f.checked)
        setBit(f.dataset.id, 1);
      else
        setBit(f.dataset.id, 0);
      updateFieldsInformations();
    });
  });

  var binary = document.querySelector('input[name="binary"]');
  binary.addEventListener('blur', () => {
    number = Number.parseInt(binary.value, 2);
    updateBitPatternStates();
    updateFieldsInputs();
  });

  var hexadecimalBE = document.querySelector('input[name="hexadecimal-be"]');
  hexadecimalBE.addEventListener('blur', () => {
    number = Number.parseInt(hexadecimalBE.value, 16);
    updateBitPatternStates();
    updateFieldsInformations();
  });

  var hexadecimalLE = document.querySelector('input[name="hexadecimal-le"]');
  hexadecimalLE.addEventListener('blur', () => {
    number = byte_swap_32(Number.parseInt(hexadecimalLE.value, 16));
    updateBitPatternStates();
    updateFieldsInformations();
  });

});
