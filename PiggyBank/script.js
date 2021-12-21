'use strict';


const account1 = {
  owner: 'Praveen Pandi',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2021-06-01T10:17:24.185Z',
    '2021-06-08T14:11:59.604Z',
    '2021-06-09T17:01:17.194Z',
    '2021-06-11T07:36:17.929Z',
    '2021-06-12T10:51:36.790Z',
  ],
  currency: 'INR',
  locale: 'en-US', 
};

const account2 = {
  owner: 'Siva Karthikeyan',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2021-06-08T14:11:59.604Z',
    '2021-06-09T17:01:17.194Z',
    '2021-06-11T07:36:17.929Z',
    '2021-06-12T10:51:36.790Z',
  ],
  currency: 'INR',
  locale: 'en-GB',
};

const accounts = [account1, account2];


const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


function formatMovementDate(date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

  const daysPassed = Math.round(calcDaysPassed(new Date(), date));
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
}

function getLocalCurrencyFormat(amount, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}


const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  console.log(account.movements);
  const movements = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;


  movements.forEach((movement, i) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type.toUpperCase()}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${getLocalCurrencyFormat(
            movement,
            account.locale,
            account.currency
          )}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};


const createUserName = account => {
  account.username = account.owner 
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');
};


accounts.forEach(account => {
  createUserName(account);
});


const calculateBalanceInAccount = account => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${getLocalCurrencyFormat(
    account.balance,
    account.locale,
    account.currency
  )}`;
};


const calculateSummary = account => {
  const income = account.movements
    .filter(movement => movement > 0)
    .reduce((balance, movement) => balance + movement);

  const outcome = account.movements
    .filter(movement => movement < 0)
    .reduce((balance, movement) => balance + movement);

  const interest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => deposit * (account.interestRate / 100))
    .filter((interest, i, arr) => interest >= 1)
    .reduce((balance, movement) => balance + movement, 0);

  labelSumIn.textContent = `${income.toFixed(2)} ₹`;
  labelSumOut.textContent = `${Math.abs(outcome).toFixed(2)} ₹`;
  labelSumInterest.textContent = `${Math.abs(interest).toFixed(2)} ₹`;
};


let currentAccount, loginTimer;

const now = new Date();
const day = now.getDate();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const hour = now.getHours();
const min = now.getMinutes();
labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

const logoutSession = () => {
  containerApp.style.opacity = 0;
};

let timer;

const startLogoutTimer = () => {
  let time = 300;
  const tick = () => {
    let minutes = Math.trunc(time / 60);
    let seconds = time % 60 > 0 ? String(time % 60) : '00';
    labelTimer.textContent = `0${minutes}:${seconds}`;

    if (time === 0) {
      logoutSession();
    }
    time -= 1;
  };
  tick(); 
  timer = setInterval(tick, 1000); 
  return timer;
};

const updateUI = currentAccount => {
  displayMovements(currentAccount);
  calculateBalanceInAccount(currentAccount);
  calculateSummary(currentAccount);
};



btnLogin.addEventListener('click', e => {
  e.preventDefault();

  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log('loggedin');
    
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    
    const currentTime = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };

    const locale = currentAccount.locale;
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      currentTime
    );

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    
    if (loginTimer) clearInterval(loginTimer);
    loginTimer = startLogoutTimer();

    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    account => account.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  } else {
    console.log('Transfer Invalid');
  }
  inputTransferAmount.value = inputTransferTo.value = '';

  
  clearInterval(timer);
  timer = startLogoutTimer();
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      account => account.username === currentAccount.username
    );

    
    accounts.splice(index, 1);

   
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some(movement => movement > amount * 0.1)
  ) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    inputLoanAmount.value = '';

  
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
  ['INR', 'Indian Rupees'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];


const mockLogin = () => {
  currentAccount = account1;
  updateUI(currentAccount);
  containerApp.style.opacity = 100;
  if (loginTimer) clearInterval(loginTimer);
  loginTimer = startLogoutTimer();
};

