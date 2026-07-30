const realTime = document.getElementById('times');
setInterval(()=> {
const timeer = new Date();
realTime.innerHTML = timeer.toLocaleTimeString();
}, 1000)
