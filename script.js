'use strict';

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

///////////////////////////////////////
// Modal window

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

// OpenModal is a node list (result of querySelectorAll) NOT an array. However, can still use forEarch
btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

///////////////////////////////////////
// Button Scrolling

btnScrollTo.addEventListener('click', function (e) {
  const s1coords = section1.getBoundingClientRect();
  console.log(s1coords);

  console.log(e.target.getBoundingClientRect());

  console.log('Current scroll (X/Y)', window.pageXOffset, window.pageYOffset);

  console.log(
    'height/width viewport',
    document.documentElement.clientHeight,
    document.documentElement.clientWidth
  );

  // Scrolling- current position + current scroll
  // window.scrollTo(
  //   s1coords.left + window.pageXOffset,
  //   s1coords.top + window.pageYOffset
  // );

  // smooth scrolling- must create object and specify left, top, and behavior properties
  // window.scrollTo({
  //   left: s1coords.left + window.pageXOffset,
  //   top: s1coords.top + window.pageYOffset,
  //   behavior: 'smooth',
  // });

  // This method only works in modern browsers
  section1.scrollIntoView({ behavior: 'smooth' });
});

///////////////////////////////////////
// Page Navigation

// This code is not efficient; attaching same event handler to multiple elements and would not be feasible for 10,000 elements
// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault();
//     const id = this.getAttribute('href');
//     console.log(id);
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

// Event Delegation
// 1. Add event listenerto common parent element
// 2. Determine what element originated the event

document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();

  // Matching strategy
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    console.log(id);
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

// Tabbed Component

tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');

  // Guard clause- if statment will return early if some condition is met (ignore clicks when the result is null)
  if (!clicked) return;

  // Remove active classes
  tabs.forEach(t => t.classList.remove('operations__tab--active')); // clearing active from all
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  // Active tab
  clicked.classList.add('operations__tab--active');

  // Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

// Menu fade animation
const handleHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

// using bind to pass 'argument' into event handler function
nav.addEventListener('mouseover', handleHover.bind(0.5));

nav.addEventListener('mouseout', handleHover.bind(1)); // 'mouseout' to undo the opacity

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sticky navigation
// const initialCoords = section1.getBoundingClientRect();
// console.log(initialCoords);

// window.addEventListener('scroll', function () {
//   console.log(window.scrollY);

//   if (window.scrollY > initialCoords.top) nav.classList.add('sticky');
//   else nav.classList.remove('sticky');
// });
// scroll function has bad performance, so dont do this (esp mobile)

// Sticky navigation: intersection observer API

// const obsCallback = function (entries, observer) {
//   entries.forEach(entry => {
//     console.log(entry);
//   });
// }; // callback function will get called each time the observed element (target element section1) is intersecting the root element at the threshold we defined

// const obsOptions = {
//   // root is element that the target is intersecting
//   // threshold is basically the percentage of intersection at which the observer callback will be called
//   root: null,
//   thershold: [0, 0.2], // 0%: callback will trigger each time the target element moves completely out of the view and as soon as it enters the view. If callback was 1, it would only be called when 100% of the target is visible in the viewport
// };

// const observer = new IntersectionObserver(obsCallback, obsOptions);
// observer.observe(section1);

const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`,
  // rootMargin: box of specified values that will be applied outside of the target element (header)
});
headerObserver.observe(header);

// Reveal Sections ////////////////////////////////////////////////////////////////////////////////////
const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  // section.classList.add('section--hidden');
});

// Lazy loading images ////////////////////////////////////////////////////////////////////////////
const imgTargets = document.querySelectorAll('img[data-src]'); // select images that have the property of data-src

const loadImg = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  // Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  }); // best to only remove blur filter once load event happens

  // entry.target.classList.remove('lazy-img') this will only emit the load event after a long time on slow network (blur filter removed too quickly)

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px',
});

imgTargets.forEach(img => imgObserver.observe(img));

// Slider /////////////////////////////////////////////////////////////////////////////////
const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  // Functions
  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  // Next slide
  const nextSlide = function () {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }

    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };
  init();

  // Event handlers
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  document.addEventListener('keydown', function (e) {
    console.log(e);
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide(); // can also use short circuiting e.key === 'ArrowRight' && nextSlide()
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};
slider();

/////// Lectures ///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////

/*
// SELECTING ELEMENTS
console.log(document.documentElement); // .documentElement allow you to apply changes to the entire page
console.log(document.head);
console.log(document.body);

const header = document.querySelector('.header');
const allSections = document.querySelectorAll('.section'); // to select multiple elements
console.log(allSections);

document.getElementById('section--1'); // only pass ID name itself without selector
const allButtons = document.getElementsByTagName('button'); // returns HTMLCollection (live collection); if DOM changes, this is updated automatically
console.log(allButtons);

document.getElementsByClassName('btn'); // also returns live HTML collection

// CREATING AND INSERTING ELEMENTS
// .insertAdjacentHTML quick and easy way of creating elements
const message = document.createElement('div'); // creates a DOM element and stores into variable (message). Not yet in DOM itself
message.classList.add('cookie-message');
// message.textContent =
//   'We use cookies for improved functionality and analytics.';
message.innerHTML =
  'We use cookies for improved functionality and analytics. <button class="btn btn--close-cookie">Got it!</button>';

// can use these methods to both insert elements and move them (can only exist at one place at a time)
// header.prepend(message); // prepend adds the element as the first child of 'header'
header.append(message); // append adds the element as the last child of 'header'

// to have multiple copies of the same element:
// header.append(message.cloneNode(true)); // pass in 'true' so that child elements will be copied as well

// header.before(message); // inserts message before the header element (sibling)
// header.after(message); // inserts message after the header element

// Delete elements
document
  .querySelector('.btn--close-cookie')
  .addEventListener('click', function () {
    message.remove();
    // Old way: message.parentElement.removeChild(message);
  });

// Styles - set as inline styles
message.style.backgroundColor = '#37383d';
message.style.width = '120%';

console.log(message.style.height); // cannot get a style that is hidden inside of a class or that doesn't exist
console.log(message.style.backgroundColor);

console.log(getComputedStyle(message).color); // contains all of the properties with all of the values
console.log(getComputedStyle(message).height);

message.style.height =
  Number.parseFloat(getComputedStyle(message).height, 10) + 30 + 'px';

document.documentElement.style.setProperty('--color-primary', 'orangered'); // use for custom properties

// Attributes
const logo = document.querySelector('.nav__logo');
console.log(logo.alt);
console.log(logo.className);

logo.alt = 'beautiful minimalist logo';

// Non-standard
console.log(logo.designer); // undefined, because it is not a standard property that is expected
console.log(logo.getAttribute('designer'));
logo.setAttribute('company', 'Bankist');

console.log(logo.src); // absolute version of link
console.log(logo.getAttribute('src')); // relative version of link

const link = document.querySelector('.nav__link--btn');
console.log(link.href);
console.log(link.getAttribute('href'));

// Data Attributes- start with word 'data'
console.log(logo.dataset.versionNumber); // these special objects always stored in the dataset object. Used for storing data in the UI

// Classes
logo.classList.add('c');
logo.classList.remove('c');
logo.classList.toggle('c');
logo.classList.contains('c'); // NOT includes like arrays

// DO NOT USE; will override existing classes and only allows you to put one class on any element
logo.className = 'Jonas';


const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

btnScrollTo.addEventListener('click', function (e) {
  const s1coords = section1.getBoundingClientRect();
  console.log(s1coords);

  console.log(e.target.getBoundingClientRect());

  console.log('Current scroll (X/Y)', window.pageXOffset, window.pageYOffset);

  console.log(
    'height/width viewport',
    document.documentElement.clientHeight,
    document.documentElement.clientWidth
  );

  // Scrolling- current position + current scroll
  // window.scrollTo(
  //   s1coords.left + window.pageXOffset,
  //   s1coords.top + window.pageYOffset
  // );

  // smooth scrolling- must create object and specify left, top, and behavior properties
  // window.scrollTo({
  //   left: s1coords.left + window.pageXOffset,
  //   top: s1coords.top + window.pageYOffset,
  //   behavior: 'smooth',
  // });

  // This method only works in modern browsers
  section1.scrollIntoView({ behavior: 'smooth' });
});
// BoundingClientRect is basically relative to the visible view port

// addEventListener is better because it allow you to add multiple eventListeners to the same event
const h1 = document.querySelector('h1');

const alertH1 = function (e) {
  alert('Great! you are reading the heading :D');

  // h1.removeEventListener('mouseenter', alertH1); // makes it so you can only listen for event once
};

h1.addEventListener('mouseenter', alertH1); // mouseenter is like hover event in CSS; does NOT bubble

setTimeout(() => h1.removeEventListener('mouseenter', alertH1), 3000);

// h1.onmouseenter = function (e) {
//   alert('onmouseenter: Great! you are reading the heading :D');
// };


// rgb(255, 255, 255)
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomColor = () =>
  `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`;
console.log(randomColor(0, 255));

document.querySelector('.nav__link').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor();
  console.log('LINK', e.target, e.currentTarget); // target is where the event (click) happened, not the element where the event handler was attached. Current target is the element on which the event handler is attached
  console.log(e.currentTarget === this);

  // // stop propagation - generally not a good idea to use
  // e.stopPropagation();
});

document.querySelector('.nav__links').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor();
  console.log('CONTAINER', e.target, e.currentTarget);
});

document.querySelector('.nav').addEventListener(
  'click',
  function (e) {
    this.style.backgroundColor = randomColor();
    console.log('NAV', e.targe, e.currentTarget);
  } // when true, event handler will no longer listen to bubbling events (listens to capture events)
);


// Dom Traversing- select an element based on another element
const h1 = document.querySelector('h1');

// Going downwards: child
console.log(h1.querySelectorAll('.highlight'));
// for direct children
console.log(h1.childNodes); // not much used
console.log(h1.children);
h1.firstElementChild.style.color = 'white';
h1.lastElementChild.style.color = 'blue';

// Going upwards: parents
console.log(h1.parentNode);
console.log(h1.parentElement);
// 'closest' is kind of opposite of querySelector; qs finds CHILDREN no matter how deep in the DOM tree while closest finds PARENTS
h1.closest('.header').style.background = 'var(--gradient-secondary)'; // we use this a LOT. important for event delegation

h1.closest('h1').style.background = 'var(--gradient-primary)';

// Going sideways: siblings
console.log(h1.previousElementSibling); // null; h1 is first child of parent element
console.log(h1.nextElementSibling);

console.log(h1.previousSibling);
console.log(h1.nextSibling);
// if you need all the siblings and not just prev/next- move to parent element --> read children
console.log(h1.parentElement.children);
[...h1.parentElement.children].forEach(function (el) {
  if (el !== h1) el.style.transform = 'scale(0.5)';
});


// DOM Lifecycle Events ///////////////////////////////////////////////
//////////////////////////////////////////////////////

// DOM Content Loaded- fired by document as soon at the HTML is completely parsed (HTML downlaoded --> converted to DOM tree)
// does not wait for images or other external resources to load (just HTML and JS)
document.addEventListener('DOMContentLoaded', function (e) {
  console.log('HTML parsed and DOM tree built!');
});

// script tag- imports JS into the HTML at the end of HTML body; do not need to listen to the DOM content loaded event

// Load Event- fired by the window as soon as the HTML is parsed as well as all the images and external resources
window.addEventListener('load', function (e) {
  console.log('Page fully loaded', e);
});

// Before unload event- created immediately before the user is about to leave a page
// window.addEventListener('beforeunload', function (e) {
//   e.preventDefault();
//   console.log(e);
//   e.returnValue = '';
// });
*/

// DEFER and Async Script Loading

// <script src="script.js"> in the head - parse, waiting[fetch script, execute], finish parsing --> DOMContentLoaded. NOT ideal; script executed before DOM is ready
// put script tag in body end so that all the HTML is parsed when it reaches the script tag - pasring HTML, fetch script, execute --> DOMContentLoaded. Scripts fetched and executed AFTER the HTML is completely parsed

// <script async src="script.js"> in the head - script loaded at the same time the HTML is parsed. However, HTML parsing still stops for the script execution. Script downloaded asynchronously but it is executed IMMEDIATELY  in a synchronous way. DOMContentLoaded does not wait for async script; fires as soon as HTML is finished parsing
// scripts not guaranteed to execute in order
// Use for 3rd party scripts where order doesn't matter (google analytics)
// Doesnt make sense to put in end

// <script defer src="script.js"> in the head- execution of script is deferred until the end of HTML pasring. HTML parsing is never interrupted (script only executed at the end)
// scripts are fetched asynchronously and executed AFTER HTML is completely parsed; DOMContentLoaded fires after defer script is executed
// scripts are executed in order
// overall BEST solution. Use for own scripts and when order matters (e.g. library)
// Doesnt make sense to put in end

// async and defer only used in newer browsers
