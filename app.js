const CONFIG={paddleClientToken:"",paddlePriceId:""};
const T=window.SHIP7_I18N||{};
const select=document.getElementById("languageSelect"),toast=document.getElementById("toast");
Object.entries(T).forEach(([code,v])=>{const o=document.createElement("option");o.value=code;o.textContent=v.name;select.appendChild(o)});
const q=new URLSearchParams(location.search);const qLang=q.get("lang");let saved=null;try{saved=localStorage.getItem("ship7_lang_v2")}catch{}
const browser=(navigator.language||"en").toLowerCase().split("-")[0];let lang=T[qLang]?qLang:T[saved]?saved:T[browser]?browser:"en";
function render(l){lang=l;const t=T[l];document.documentElement.lang=l;document.documentElement.dataset.lang=l;document.title=t.title;select.value=l;
document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(t[k]!=null)el.textContent=t[k]});
document.querySelectorAll("[data-i18n-html]").forEach(el=>{const k=el.dataset.i18nHtml;if(t[k]!=null)el.innerHTML=t[k]});
document.getElementById("dayGrid").innerHTML=t.days.map((d,i)=>`<article class="day-card ${i===6?"active":""}"><span class="num">${d[0]}</span><h3>${d[1]}</h3><p>${d[2]}</p><span class="result">✓ ${d[3]}</span></article>`).join("");
document.getElementById("faq").innerHTML=t.faqs.map(x=>`<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join("");
try{localStorage.setItem("ship7_lang_v2",l)}catch{}
const u=new URL(location.href);u.searchParams.set("lang",l);history.replaceState(null,"",u);
}
render(lang);select.addEventListener("change",()=>render(select.value));
function msg(){const m={en:"Payments are opening soon. Founding price stays $25.",ru:"Оплата скоро откроется. Стартовая цена останется $25.",es:"Los pagos se abrirán pronto. El precio fundador seguirá en $25.",de:"Zahlungen öffnen bald. Der Founder-Preis bleibt bei $25.",fr:"Les paiements ouvriront bientôt. Le prix fondateur reste à $25.",pt:"Os pagamentos abrirão em breve. O preço fundador continua $25.",it:"I pagamenti apriranno presto. Il prezzo founder resta $25.",pl:"Płatności ruszą wkrótce. Cena founder pozostaje $25.",tr:"Ödemeler yakında açılacak. Kurucu fiyatı $25 olarak kalacak.",uk:"Оплата скоро відкриється. Стартова ціна залишиться $25."}[lang];toast.textContent=m;toast.classList.add("show");clearTimeout(msg.timer);msg.timer=setTimeout(()=>toast.classList.remove("show"),3000)}
document.querySelectorAll(".js-buy").forEach(b=>b.addEventListener("click",()=>{if(!CONFIG.paddleClientToken||!CONFIG.paddlePriceId){document.getElementById("price").scrollIntoView({behavior:"smooth",block:"center"});msg();return}}));