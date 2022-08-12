class Application extends Object {

    /* List of tabs and their appropriate buttons  */
    #tabs = [];
    #tabButtons = [];
    #currentTabIndex = 0;
 
    #tmpEventClient = 0;
    #prevPosX = 0;

     /**
     * Creates a new instance of the Application
     * 
     */
    constructor() {
        super();
        this.previousTabPosition = "tabHome";
        this.screenWidth = window.innerWidth;
        window.addEventListener("resize", ()=> {this.screenWidth = window.innerWidth;});
    }
   
    #constructHTML = () => {   
        this.header          = qs("#header");
        this.userName        = qs("#userName");
        
        this.linksMenu       = qs(".linksMenu");
        this.switcher        = qs("#switcher");
        this.linkHome        = document.querySelector('[data-target="tabHome"]');
    
        this.linkAchievements     = document.querySelector('[data-target="tabAchievements"]');

        this.linkContact      = document.querySelector('[data-target="tabContact"]');

        this.tabsContainer   = qs(".tabsContainer");
        this.tabHome         = qs("#tabHome");
        this.tabAchievements      = qs("#tabAchievements");
        this.tabContact       = qs("#tabContact");
        this.links           =      qsa     (".linksMenu li");
        this.contents        =      qsa     (".everyTab");

        // Put all tabs and their associated button in a list, for scalability
        this.#tabs = [this.tabHome, this.tabAchievements, this.tabContact];
        this.#tabButtons = [this.linkHome, this.linkAchievements, this.linkContact];
        // Put the links slightly on top of the switcher
        for(let tab of this.#tabButtons) tab.style.zIndex = '1';
    }

    /**
     * Set the tabs behavior
     */
    #setTabsBehavior = () => {
        const toggle = (targetIndex, skipAnimation=false, forceToggle=false) => {
            if(targetIndex === this.#currentTabIndex && !forceToggle) return;

            // Remove all class transitions, then apply the appropriate one
            for(let index in this.#tabs){
                let currentTab = this.#tabs[index];

                // Compute animation settings
                let addedClass = index < targetIndex ? "left" : index > targetIndex ? "right" : "middle"
                let currentBounds = currentTab.getBoundingClientRect();
                let destination = addedClass === "left" ? - window.innerWidth : addedClass === "right" ? window.innerWidth : 0;

                // Then we update the class holding transform properties
                currentTab.style.transitionDuration = !skipAnimation * ((0.3 * Math.abs(currentBounds.x - destination)) / window.innerWidth) + "s";
                currentTab.classList.remove("left", "middle", "right");
                currentTab.classList.add(addedClass);
                currentTab.style.zIndex = '0';
            }

            // Put priority on the two main animating tabs
            this.#tabs[this.#currentTabIndex].style.zIndex = '2';
            this.#tabs[targetIndex].style.zIndex = '3';


            // button transition, we need to be direction aware
            let containerBounds = this.linksMenu.getBoundingClientRect();
            let targetBounds = this.#tabButtons[targetIndex].getBoundingClientRect();
            this.switcher.style.right =  containerBounds.right - targetBounds.right + 'px';
            this.switcher.style.left = targetBounds.x - containerBounds.x + 'px';
            this.#currentTabIndex = targetIndex;
        }
        // Bind button click to their respective tabs
        for(let index in this.#tabButtons){
            this.#tabButtons[index].addEventListener("click", () => toggle(index));
        }
        toggle(0, true, true);
        window.onresize = () =>{
            c("youpi")
            let containerBounds = this.linksMenu.getBoundingClientRect();
            let targetBounds = this.#tabButtons[this.#currentTabIndex].getBoundingClientRect();
            this.switcher.style.right =  containerBounds.right - targetBounds.right + 'px';
            this.switcher.style.left = targetBounds.x - containerBounds.x + 'px';
        }
    };

    /**
     * Set screen swaping behaviors (#startup, #handleStart, #handleMove, #handleEnd, #handleCancel)
     */
    #startup() {
        const d =  document;
        d.addEventListener("pointerdown"  , this.#handleStart.bind(this));
        d.addEventListener("pointerup"    , this.#handleEnd.bind(this));
        d.addEventListener("pointercancel", this.#handleCancel.bind(this));
        d.addEventListener("pointermove"  , this.#handleMove.bind(this));
        bubbles(this.tabHome)
        bubbles(this.tabAchievements)
        bubbles(this.tabContact)
    }
    #handleStart(evt){
        this.#prevPosX = evt.clientX;
    }
    #handleMove(evt) {
        evt.preventDefault();
        this.#tmpEventClient=evt.clientX;
    }
    #handleEnd(evt) {
        evt.preventDefault();
        let diffPos = this.#prevPosX - evt.clientX;
        if(evt.pointerType === "mouse"){
            if(evt.target == qs("#intro")){ return;}
            if(diffPos > 0) this.#tabButtons[clamp(this.#currentTabIndex + 1, 0, this.#tabButtons.length-1)].click();
            if(diffPos < 0) this.#tabButtons[clamp(this.#currentTabIndex - 1, 0, this.#tabButtons.length-1)].click();
        }
    }
    #handleCancel(evt) {
        let diffPos = this.#tmpEventClient - this.#prevPosX;
        if(evt.pointerType === "touch"){
            if(evt.target == qs("#intro")){ return}
            if(diffPos < -8.5) this.#tabButtons[clamp(this.#currentTabIndex + 1, 0, this.#tabButtons.length-1)].click();
            if(diffPos > 8.5) this.#tabButtons[clamp(this.#currentTabIndex - 1, 0, this.#tabButtons.length-1)].click();
        }
        evt.preventDefault();
    }

    /**
     * Creates the application
     *
     */
    create() {
        this.#constructHTML();
        this.#setTabsBehavior();
        this.#startup();
    };
}


/**
 * Allow to easily access elements
 * @param {String } element The element name as an id or a class 
 * @param parent The element's parent
 *
 * @return The required element
 */
 function qs(element, parent = document){return parent.querySelector(element);}

 /**
  * Allow to easily access all the same elements
  * @param {String } element The element name as a tag or a class 
  * @param parent The element's parent
  *
  * @return The required element
  */
 function qsa(element, parent = document){return [...parent.querySelectorAll(element)];}

/**
 * Easy way to create elements
 * @param {String } type The type of the element 
 * @param options every attribute, classes and ids to set to the class 
 * @param parent The element's parent
 * @param {Boolean} prepend If set true, prepend the element instead of appending it
 *
 * @return The required element
 */
function createElement(type, options = {}, parent = document.body, prepend = false) {
    const element = document.createElement(type);
    Object.entries(options).forEach(([key, value]) => {
        if (key === "class") {
            const classes = value.split(" ");
            classes.forEach(oneClass => element.classList.add(oneClass));
            return;
        }
        if (key === "dataset") {
            Object.entries(options).forEach(([dataKey, dataValue]) => {
            element.dataSet[dataKey] = dataValue;
            })
            return;
        }
        if (key === "text") {
            element.textContent = value;
            return;
        }
        element.setAttribute(key, value);
    })
    prepend ? parent.prepend(element): parent.append(element);
    return element;
}

/**
 * Clamp the number between two extremes
 * @param {Number} number The current value
 * @param {Number} min The minimum value
 * @param {Number} max The maximum value
 *
 * @return {Number} The clamped value
 */
function clamp(number, min, max){
    return Math.min(Math.max(number, min), max);
}

/**
 * A method to create visual moving bubbles. Thanks to @tipsy
 * @param config Possible modifications of the bubbles aspect
 *
 */
 let bubbles = function (element, config) {
    const c = config || {};
    const r = () => Math.random();
    const canvas = c.canvas || document.createElement("canvas");
    let width   = canvas.width;
    let height  = canvas.height;
    if (canvas.parentNode === null) {
        canvas.setAttribute("style", "position:fixed;z-index:-1;left:0;top:0;min-width:100vw;min-height:100vh;");
        width   = canvas.width = window.innerWidth;
        height  = canvas.height = window.innerHeight;
        element.appendChild(canvas);
    }
    const context = canvas.getContext("2d");
    context.shadowColor = c.shadowColor || "#fff";
    context.shadowBlur = c.blur || 4;
    
    const gradient = context.createLinearGradient(0, 0, width, height);
    
    gradient.addColorStop(0, c.colorStart || "#2AE");
    gradient.addColorStop(1, c.colorStop || "#17B");
    const nrBubbles = c.bubbles || Math.floor((width + height) * 0.02);
    const bubbles   = [];
    for (let i = 0; i < nrBubbles; i++) {
        bubbles.push({
            f: (c.bubbleFunc || (() => `hsla(0, 0%, 100%, ${r() * 0.1})`)).call(), // fillStyle
            x: r() * width, // x-position
            y: r() * height, // y-position
            r: (c.radiusFunc || (() => 4 + r() * width / 25)).call(), // radius
            a: (c.angleFunc || (() => r() * Math.PI * 2)).call(), // angle
            v: (c.velocityFunc || (() => 0.1 + r() * 0.5)).call() // velocity
        });
    }
    (function draw() {
        if (canvas.parentNode === null) {
            return cancelAnimationFrame(draw)
        }
        if (c.animate !== false) {
            requestAnimationFrame(draw);
        }
        context.globalCompositeOperation = "source-over";
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = c.compose || "lighter";
        bubbles.forEach(bubble => {
            context.beginPath();
            context.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
            context.fillStyle = bubble.f;
            context.fill();
            // update positions for next draw
            bubble.x += Math.cos(bubble.a) * bubble.v;
            bubble.y += Math.sin(bubble.a) * bubble.v;
            if (bubble.x - bubble.r > width) {
                bubble.x = -bubble.r;
            }
            if (bubble.x + bubble.r < 0) {
                bubble.x = width + bubble.r;
            }
            if (bubble.y - bubble.r > height) {
                bubble.y = -bubble.r;
            }
            if (bubble.y + bubble.r < 0) {
                bubble.y = height + bubble.r;
            }
        });
    })();
};

const d = document.getElementsByClassName("draggable");

for (let i = 0; i < d.length; i++) {
    d[i].style.position = "relative";
}
let blurMaskTop     = qs("#blurMaskTop");
let blurMaskBottom  = qs("#blurMaskBottom");
let blurMaskLeft    = qs("#blurMaskLeft");
let blurMaskRight   = qs("#blurMaskRight");
let introBounds 
let containerBounds 

function filter(e) {
    let target = e.target;
    
    if (!target.classList.contains("draggable")) {
        return;
    }

    target.moving = true;
    //      👇 Check if Mouse events exist on users' device
    if (e.clientX) {
        target.oldX = e.clientX; // If they exist then use Mouse input
        target.oldY = e.clientY;
        
    } 
    else {
        target.oldX = e.touches[0].clientX; // Otherwise use touch input
        target.oldY = e.touches[0].clientY;
    }
    //           👆 Since there can be multiple touches, you need to mention which touch to look for, we are using the first touch only in this case
    
    target.oldLeft = window.getComputedStyle(target).getPropertyValue('left').split('px')[0] * 1;
    target.oldTop = window.getComputedStyle(target).getPropertyValue('top').split('px')[0] * 1;
    
    qs("#intro").onmousemove = dr;
    qs("#intro").ontouchmove = dr;

    function dr(event) {
        event.stopPropagation()
        event.preventDefault();
        
        if (!target.moving) {
            return;
        }
        //          👇
        if (event.clientX) {
            target.distX = event.clientX - target.oldX;
            target.distY = event.clientY - target.oldY;
            
        } 
        else {
            target.distX = event.touches[0].clientX - target.oldX;
            target.distY = event.touches[0].clientY - target.oldY;
        }
        //          👆
    
        introBounds = qs("#intro").getBoundingClientRect();
        containerBounds = qs("#tabHome").getBoundingClientRect();
        
        target.style.left = target.oldLeft + target.distX + "px";
        target.style.top  = target.oldTop + target.distY + "px";
      
        if(target.offsetTop < -250)target.style.top ="-50px"
     
        if(target.offsetLeft < -300)target.style.left ="-100px"

        let relativeTop     = introBounds.top - containerBounds.top;
        let relativeBottom  = containerBounds.bottom - introBounds.bottom;
        let relativeLeft    = introBounds.left - containerBounds.left;
        let relativeRight   = containerBounds.right - introBounds.right;

        let roundedAnglesAdjust = 12;

        blurMaskTop.style.height    = relativeTop + roundedAnglesAdjust + "px";
        if(relativeTop < 0 )        blurMaskTop.style.height= "0px";
        blurMaskBottom.style.height = relativeBottom + roundedAnglesAdjust + "px";
        if(relativeBottom < 0 )     blurMaskBottom.style.height= "0px";
        blurMaskLeft.style.width    = relativeLeft + roundedAnglesAdjust + "px";
        if(relativeLeft < 0 )       blurMaskLeft.style.width= "0px";
        blurMaskRight.style.width   = relativeRight + roundedAnglesAdjust + "px";
        if(relativeRight < 0 )      blurMaskRight.style.width= "0px";
    }

    function endDrag() {
        target.moving = false;
        qs("#introContent").style.zIndex=0
    }

    target.onmouseup = endDrag;
    target.ontouchend = endDrag;
    //            👆
    
}

function cRem(parent, child){if(gc(parent)[0].classList.contains(child)){return gc(parent)[0].classList.remove(child);}
}


function cAdd(parent, child){ return gc(parent)[0].classList.add(child);}

/* shortcut for getElementById */
function gi(idName){return document.getElementById(idName)}

/* shortcut for getElementsByClassName */
function gc(className){return document.getElementsByClassName(className)}
var activePannel = qs(".activePannel");
var btnFlipTablet = qs("#btnFlipTablet");
var isFlipped=false;
btnFlipTablet.onclick= () =>{
	let indice = 2;
	let time = indice * 100;

	if (isFlipped==false){
		cAdd("activePannel","flipTuileOn");
		//
		setTimeout(() => {qs("#introContent").style.transform= "rotateY(90deg)";}, time);
		setTimeout(() => {cRem("activePannel","flipTuileOn")}, time);
		isFlipped=true;
		setTimeout(() => {cAdd("emptyPannel","flipTuileOff")}, time);
		setTimeout(() => {qs("#emptyPannel").style.transform= "rotateY(0deg)";}, time * 2);
		setTimeout(() => {cRem("emptyPannel","flipTuileOff")}, time * 2);	
	}
	else{
		cAdd("emptyPannel","flipTuileOn");
		setTimeout(() => {qs("#emptyPannel").style.transform= "rotateY(90deg)";}, time);
		setTimeout(() => {cRem("emptyPannel","flipTuileOn")}, time);
		isFlipped=false;
		setTimeout(() => {cAdd("introContent","flipTuileOff")}, time)
		setTimeout(() => {qs("#introContent").style.transform= "rotateY(0deg)";}, time * 2);
		setTimeout(() => {cRem("introContent","flipTuileOff")}, time * 2);	
	}	
}


qs("#intro").onmousedown = filter;
qs("#intro").ontouchstart = filter;
//                👆

function c(e){console.log(e)}

let app= new Application()
app.create();