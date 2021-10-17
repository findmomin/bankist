'use strict';

// Elements
const elements = {
  labelWelcome: document.querySelector('.welcome'),
  labelDate: document.querySelector('.date'),
  labelBalance: document.querySelector('.balance__value'),
  labelSumIn: document.querySelector('.summary__value--in'),
  labelSumOut: document.querySelector('.summary__value--out'),
  labelSumInterest: document.querySelector('.summary__value--interest'),
  labelTimer: document.querySelector('.timer'),

  containerApp: document.querySelector('.app'),
  containerMovements: document.querySelector('.movements'),

  btnLogin: document.querySelector('.login__btn'),
  btnTransfer: document.querySelector('.form__btn--transfer'),
  btnLoan: document.querySelector('.form__btn--loan'),
  btnClose: document.querySelector('.form__btn--close'),
  btnSort: document.querySelector('.btn--sort'),

  inputLoginUsername: document.querySelector('.login__input--user'),
  inputLoginPin: document.querySelector('.login__input--pin'),
  inputTransferTo: document.querySelector('.form__input--to'),
  inputTransferAmount: document.querySelector('.form__input--amount'),
  inputLoanAmount: document.querySelector('.form__input--loan-amount'),
  inputCloseUsername: document.querySelector('.form__input--user'),
  inputClosePin: document.querySelector('.form__input--pin'),
};

// Data
class Account {
  constructor(username, owner, pin, currency, locale) {
    this.username = username;
    this.owner = owner;
    this.pin = pin;
    this.currency = currency;
    this.locale = locale;

    // Static Properties
    this.interestRate = 1.2;
  }

  setMovements(movArr, movDatesArr) {
    this.movements = movArr;
    this.movementsDates = movDatesArr;
  }

  getCurrentBal() {
    return this.movements.reduce((acc, cur) => acc + cur);
  }

  getTotalIn() {
    return this.movements
      .filter(mov => mov > 0)
      .reduce((acc, cur) => acc + cur)
      .toFixed(2);
  }

  getTotalOut() {
    return this.movements
      .filter(mov => mov < 0)
      .reduce((acc, cur) => acc + cur)
      .toFixed(2);
  }

  getTotalInterest() {
    return ((this.getTotalIn() * this.interestRate) / 100).toFixed(2);
  }

  transferMoney(amount, transferTo) {
    clearInterval(countDown);
    scheduleLogout(10);

    const receiver = accounts.find(acc => acc.username === transferTo);
    const movDate = new Date().toISOString();

    if (
      receiver &&
      amount > 0 &&
      amount <= this.getCurrentBal() &&
      transferTo !== this.username
    ) {
      // push the amount
      this.movements.push(-amount);
      receiver.movements.push(amount);

      // push the date
      this.movementsDates.push(movDate);
      receiver.movementsDates.push(movDate);

      updateUI();
    }
  }
}

const accounts = [
  new Account('abdul', 'Abdul Momin', 1111, 'EUR', 'pt-PT'), // navigator.language
  new Account('james', 'James S.', 2222, 'USD', 'en-US'), // navigator.language
];

accounts[0].setMovements(
  [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-10-26T10:51:36.790Z',
  ]
);
accounts[1].setMovements(
  [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ]
);

let loggedInUser;
let isSorted = false;
let countDown;

// Authentication
const renderEl = arr => {
  // Clear movements before inserting
  elements.containerMovements.innerHTML = '';

  arr.forEach(el =>
    elements.containerMovements.insertAdjacentHTML('afterbegin', el)
  );
};

const renderMov = (acc, sorted = false) => {
  const movArr = sorted
    ? [...acc.movements].sort((a, b) => (a > b ? 1 : -1))
    : acc.movements;

  const allMovements = movArr.map((mov, i) => {
    const movDate = new Date(loggedInUser.movementsDates[i]);
    const daysPassed = Math.floor((new Date() - movDate) / 1000 / 60 / 60 / 24);

    const dateString =
      daysPassed <= 1
        ? `Today`
        : daysPassed <= 2
        ? `Yesterday`
        : daysPassed <= 7
        ? `${daysPassed} days ago`
        : new Intl.DateTimeFormat(loggedInUser.locale).format(movDate);

    const movType = mov > 0 ? 'deposit' : 'withdrawal';

    const markup = `
    <div class="movements__row">
      <div class="movements__type movements__type--${movType}">${
      i + 1
    } ${movType}</div>
      <div class="movements__date">${dateString}</div>
      <div class="movements__value">${new Intl.NumberFormat(
        loggedInUser.locale,
        {
          style: 'currency',
          currency: acc.currency,
        }
      ).format(mov)}</div>
    </div>
    `;

    return markup;
  });

  renderEl(allMovements);
  isSorted = !isSorted;
};

const updateUI = () => {
  const today = new Intl.DateTimeFormat(loggedInUser.locale, {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(new Date());

  elements.inputLoginUsername.value =
    elements.inputLoginPin.value =
    elements.inputTransferTo.value =
    elements.inputTransferAmount.value =
      '';
  elements.inputLoginPin.blur();
  elements.labelWelcome.textContent = `Good Evening, ${
    loggedInUser.owner.split(' ')[0]
  }!`;
  elements.labelDate.textContent = today;
  elements.labelBalance.textContent = `${new Intl.NumberFormat(
    loggedInUser.locale,
    {
      style: 'currency',
      currency: loggedInUser.currency,
    }
  ).format(loggedInUser.getCurrentBal())}`;
  renderMov(loggedInUser, false);
  elements.labelSumIn.textContent = `${new Intl.NumberFormat(
    loggedInUser.locale,
    {
      style: 'currency',
      currency: loggedInUser.currency,
    }
  ).format(loggedInUser.getTotalIn())}`;
  elements.labelSumOut.textContent = `${new Intl.NumberFormat(
    loggedInUser.locale,
    {
      style: 'currency',
      currency: loggedInUser.currency,
    }
  ).format(Math.abs(loggedInUser.getTotalOut()))}`;
  elements.labelSumInterest.textContent = `${new Intl.NumberFormat(
    loggedInUser.locale,
    {
      style: 'currency',
      currency: loggedInUser.currency,
    }
  ).format(loggedInUser.getTotalInterest())}`;

  elements.containerApp.classList.add('logged-in');
};

const scheduleLogout = timeTillLogOut => {
  let totalTime = timeTillLogOut * 60;

  clearInterval(countDown);

  const timer = () => {
    const minute = Math.floor(totalTime / 60);
    const seconds = `${totalTime % 60}`.padStart(2, 0);

    elements.labelTimer.textContent = `${minute}:${seconds}`;

    // Stop the timer
    if (totalTime === 0) {
      clearInterval(countDown);
      elements.labelWelcome.textContent = `Log in to get started`;
      elements.containerApp.classList.remove('logged-in');
    }

    totalTime--;
  };
  timer();

  // Display timer
  countDown = setInterval(timer, 1000);
};

const authUser = e => {
  e.preventDefault();

  // Find the user
  loggedInUser = accounts.find(
    acc =>
      elements.inputLoginUsername.value === acc.username &&
      parseInt(elements.inputLoginPin.value) === acc.pin
  );

  // Log the user in
  if (loggedInUser) updateUI();

  // Schedule logout
  scheduleLogout(10);
};

const transferMoney = e => {
  e.preventDefault();

  const [amount, transferTo] = [
    parseFloat(elements.inputTransferAmount.value),
    elements.inputTransferTo.value,
  ];
  loggedInUser.transferMoney(amount, transferTo);
};

const requestLoan = e => {
  e.preventDefault();

  clearInterval(countDown);
  scheduleLogout(10);

  const reqAmount = parseFloat(elements.inputLoanAmount.value);
  const movDate = new Date().toISOString();

  if (
    reqAmount > 0 &&
    loggedInUser.movements.some(mov => mov >= reqAmount * 0.1)
  )
    setTimeout(() => {
      // add the amount
      loggedInUser.movements.push(reqAmount);

      // add the date
      loggedInUser.movementsDates.push(movDate);

      updateUI();
    }, 2000);

  elements.inputLoanAmount.value = '';
};

const closeAccount = e => {
  e.preventDefault();

  const [confirmUser, confirmPin] = [
    elements.inputCloseUsername.value,
    parseInt(elements.inputClosePin.value),
  ];
  const toClose = accounts.findIndex(
    acc => loggedInUser.username === acc.username
  );

  if (
    confirmUser === loggedInUser.username &&
    confirmPin === loggedInUser.pin
  ) {
    accounts.splice(toClose, 1);
    elements.inputCloseUsername.value = elements.inputClosePin.value = '';
    elements.containerApp.classList.remove('logged-in');
  }
};

const sortMovements = () => {
  renderMov(loggedInUser, isSorted);
};

// Event Handlers
// Login
elements.btnLogin.addEventListener('click', authUser);

// Transfer money
elements.btnTransfer.addEventListener('click', transferMoney);

// Request Loan
elements.btnLoan.addEventListener('click', requestLoan);

// Close account
elements.btnClose.addEventListener('click', closeAccount);

// Sort Movements
elements.btnSort.addEventListener('click', sortMovements);
