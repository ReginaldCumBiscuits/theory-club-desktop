/* ================= storage ================= */
const store={get(k,d){try{const v=localStorage.getItem('tc:'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('tc:'+k,JSON.stringify(v))}catch(e){}if(store.hook)store.hook(k)}};

