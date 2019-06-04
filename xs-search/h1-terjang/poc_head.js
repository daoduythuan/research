let WINBG;
let historyLenOrig;
let working = false;
let c_notfound = 'red';
let c_found = 'green';
let c_searching = 'grey';

Array.prototype.back = function(){
    if(this.length == 0) return undefined
    return this[this.length - 1];
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

if(window.opener) {
    WINBG = window.opener;
    historyLenOrig = WINBG.history.length;
    console.log(historyLenOrig);
}
else {
    throw('The original tab was closed');
}


async function switchToBlank(withiframe=false){
    WINBG.location = "/blank.html";
    while(1){
        try{
            if( WINBG.location.pathname == "/blank.html" ){
                if(withiframe)
                    WINBG.document.documentElement.appendChild(WINBG.document.createElement('iframe'));
                return 1;
            } 
        }
        catch(e){
            ;
        }
        await sleep(10);
    }
}

async function goBack(s){ // s works only for cross origin.
    let diff = 0;
    try{
        if(WINBG.location.pathname.split('/').pop() == 'poc.html') return 1;
    }
    catch(e){
        diff = 1;
        await switchToBlank()
    }

    let steps = (s === undefined?
            -(WINBG.history.length - historyLenOrig + 1):
            s - diff);

    WINBG.history.go(steps)
        
    while(1){
        try{
            if( WINBG.location.pathname.split('/').pop() == 'poc.html' ){
                WINBG.history.pushState('', null, ''); // clear history.length
                return 1;
            }
        }
        catch(e){
            return 1;
        }                
        await sleep(10);
    }
}


async function opencors(url, delay=300){
    WINBG.location = url;
    while(1){
        try{
            WINBG.history.length;
        }
        catch(e){
            await sleep(delay);
            return 1;
        }
        await sleep(30);
    }
}

async function checkTwoUrls(url1, url2, timeout=1000, c=3, b=true){
    await opencors(url1);
    await sleep(timeout);
    WINBG.location = url2;
    await switchToBlank();
    console.log(histlen());
    const res = histlen()==c;
    if(b) await goBack();
    return res;
}


function histlen(){
    return WINBG.history.length - historyLenOrig;
}

function msg(e, color=c_searching){
    spanmsg.innerText = e;
    spanmsg.style.color = color;
}

function start(m='searching...'){
    if(working) return 0;
    working = 1;
    msg(m, c_searching);
    return 1;
}

function end(m='finished', found){
    working = 0;
    let color = found? c_found : c_notfound;
    msg(m, color);
    return 1;
}



function detectLengthChange(val, limit=3000){
    return new Promise(resolve => {
        let start = Date.now();
        let interval = setInterval(()=>{
            if(WINBG.length >= val) {
                clearInterval(interval);
                return resolve(1);
            }
            if(Date.now() - start >= limit){
                clearInterval(interval);
                return resolve(0);
            }
        }, 30);
    });    
}


// if the window.length became 0 returns 1
// usually used to append the URL fragment
// setInterval()


async function openedWithReload(url, limit=300){
    return new Promise(resolve => {
        WINBG.location = url;
        let start = Date.now();
        let interval = setInterval(()=>{
            if(WINBG.length == 0) {
                clearInterval(interval);
                return resolve(1);
            }
            if(Date.now() - start >= limit){
                clearInterval(interval);
                return resolve(0);
            }
        }, 30);
    });    
}


window.onbeforeunload = function(){
    WINBG.location = 'poc.html';
};
