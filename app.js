const CONFIG = {
  paddleClientToken: "",
  paddlePriceId: ""
};

const buyButtons = [...document.querySelectorAll('.js-buy')];
const offerNote = document.querySelector('.js-offer-note');
const toast = document.getElementById('toast');
let paddleInitialized = false;
let paddleInitPromise = null;
let scriptPromise = null;

const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
const query = new URLSearchParams(location.search);
const attribution = {};
const safeStorage = {
  get(key){ try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key,value){ try { sessionStorage.setItem(key,value); } catch {} }
};
utmKeys.forEach(key => {
  const value = query.get(key) || safeStorage.get('ship7_' + key);
  if (value) {
    attribution[key] = value;
    safeStorage.set('ship7_' + key, value);
  }
});

function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>toast.classList.remove('show'),3200);
}

function hasPaddleConfig(){
  return Boolean(CONFIG.paddleClientToken && CONFIG.paddlePriceId);
}

function loadPaddle(){
  if (window.Paddle) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdn.paddle.com/paddle/v2/paddle.js';
    s.async=true;
    s.onload=resolve;
    s.onerror=()=>reject(new Error('Paddle.js failed to load'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

async function initPaddle(){
  if (paddleInitialized) return true;
  if (!hasPaddleConfig()) return false;
  if (paddleInitPromise) return paddleInitPromise;
  paddleInitPromise = (async () => {
    await loadPaddle();
    if (CONFIG.paddleClientToken.startsWith('test_')) Paddle.Environment.set('sandbox');
    Paddle.Initialize({
      token: CONFIG.paddleClientToken,
      eventCallback: event => {
        if (event?.name === 'checkout.completed') showToast('Payment complete. Welcome to SHIP7.');
      }
    });
    paddleInitialized = true;
    return true;
  })();
  try { return await paddleInitPromise; }
  catch (error) { paddleInitPromise = null; throw error; }
}

async function openCheckout(){
  if (!hasPaddleConfig()) {
    document.getElementById('offer').scrollIntoView({behavior:'smooth',block:'center'});
    showToast('Payments are not open yet. Founding price stays $25.');
    return;
  }
  try {
    await initPaddle();
    Paddle.Checkout.open({
      items:[{priceId:CONFIG.paddlePriceId,quantity:1}],
      customData:Object.keys(attribution).length ? attribution : undefined,
      settings:{displayMode:'overlay',theme:'dark',locale:'en'}
    });
  } catch (error) {
    console.error(error);
    showToast('Checkout could not open. Please try again.');
  }
}

buyButtons.forEach(button => button.addEventListener('click',openCheckout));

if (!hasPaddleConfig()) {
  buyButtons.forEach(button => {
    button.textContent = 'Checkout opens soon · $25';
    button.setAttribute('aria-label','Payments open soon. Founding price is $25.');
  });
  if (offerNote) offerNote.textContent = 'Payments are not open yet. Founding price stays $25.';
} else {
  buyButtons.forEach(button => { button.textContent = 'Start SHIP7 — $25'; button.removeAttribute('aria-label'); });
  initPaddle().catch(console.error);
  if (offerNote) offerNote.textContent = 'Secure checkout powered by Paddle.';
}
