window.moveTo(4000, 0);

switchToBlank(1);


document.querySelectorAll('.timer').forEach(x => x.parentNode.timer = new Timer(x));

const pad = (val, N) => val.toString().padStart(N, '0');
    const splittime = (st) => {dif = Date.now() - st; return [parseInt(dif/100) % 10, parseInt(dif/1000)%60, parseInt(dif/60000)]};

function Timer(el){
    this.parent = el;
    this.start = function(){
        let st = Date.now();
        this.interval = setInterval( function(){
            let [ms, s, m] = splittime(st);
            this.parent._ms.innerText = pad(ms, 1);
            this.parent._s.innerText = pad(s, 2);
            this.parent._m.innerText = pad(m, 2);
        }, 100);
    }

    this.stop = function(){
        clearInterval(this.interval);
    }
    
}
var sec = 0;


const createURL = function(phrase, from){
    let url = `https://twitter.com/search?q=${encodeURIComponent(phrase)}%20from:${from}&src=typd`
    return url;
};

const createURLRange = function(start, end, N, from){
    let wrange = createRange(start, end, N);
    return createURL(wrange, from);
};

const fillRanges = function(N, STEP){
    let ranges = []
    for(let start = 0; start < 10**N; start+=STEP){
        let max = start+STEP < 10**N? start+STEP : 10**N - 1;
        ranges.push([start, max]);
    }
    return ranges;
};

const createRange = function(min, max, N=3){
    let numbers = [];
    max = max > 10**N ? 10**N : max;
    for(let i=min; i<max; i++){
        numbers.push(pad(i, N))
    }
    return numbers.join(' OR ');
};



async function searchForMessage(e){
    if( !start() ) return;
    
    let phrase = `"${e.searchPhrase.value.trim()}"`;
    let from = e.from.value.trim();
    let url = createURL(phrase, from);
    
    await openedWithReload(url, 800);
    await detectLengthChange(5, 1000);
    let reloaded = await openedWithReload(url + '#hello', 800);

    let m = `The phrase ${phrase} ${reloaded?"doesn't exist": "exists"} in yout tweets`
   
    end(m, !reloaded);
}




async function fetchNumbers(e){
    const DELAY = 600;

    if( !start() ) return;
    e.timer.start();
    let m = '||'

    let from = e.from.value.trim();
    let numbers = []
    const N = 3;
    let ranges = fillRanges(N, 49)

    while(ranges.length){
        let [a,b] = ranges.pop();
        
        console.log('range', a, b);
        let url = createURLRange(a, b, N, from);
        
        let opened = false;

        while(!opened){ // sometimes the redirect doesn't happen and it gets stuck
            await openedWithReload(url, DELAY);
            opened = await detectLengthChange(5, 3000);

        }

        let reloaded = await openedWithReload(url + '#hello', DELAY);
        if(reloaded) {
            await sleep(DELAY);
            continue;
        }

        if(a == b - 1) {
            m += ` Found: ${pad(a,N)} ||`;
            msg(m, c_searching);
            continue;
        }
        if( b - a <= 8){
            for(let start = a; start < b; start++){
                ranges.push([start, start+1]);
            }
            continue;
        }
        let mid = (a+b) >> 1;
        ranges.push([a, mid], [mid, b]);
    }
    e.timer.stop();
    end(m, 1);
}