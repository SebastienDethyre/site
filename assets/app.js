class Application extends Object {zoneYang
    /* List of tabs and their appropriate buttons  */
    #tabs = [];
    #tabButtons = [];
    #currentTabIndex = 0;
    
    #tmpEventClient = 0;
    #prevPosX = 0;

    #fishes = {
        tabAchievements:[    
            {path: "assets/img/fishes/blueYellowL.png"  ,direction: "left"  ,number: 1},
            {path: "assets/img/fishes/blueYellowR.png"  ,direction: "right" ,number: 1},
            {path: "assets/img/fishes/clownL.png"       ,direction: "left"  ,number: 0},
            {path: "assets/img/fishes/clownR.png"       ,direction: "right" ,number: 1},
            {path: "assets/img/fishes/pinkL.png"        ,direction: "left"  ,number: 1},
            {path: "assets/img/fishes/pinkR.png"        ,direction: "right" ,number: 0},
            {path: "assets/img/fishes/yellowBlackL.png" ,direction: "left"  ,number: 1},
            {path: "assets/img/fishes/yellowBlackR.png" ,direction: "right" ,number: 1},
            {path: "assets/img/fishes/blueL.png"        ,direction: "left"  ,number: 1},
            {path: "assets/img/fishes/blueR.png"        ,direction: "right" ,number: 1}
        ],
        tabContact:[    
            {path: "assets/img/fishes/blueYellowL.png"  ,direction: "left"  ,number: 0},
            {path: "assets/img/fishes/blueYellowR.png"  ,direction: "right" ,number: 1},
            {path: "assets/img/fishes/clownL.png"       ,direction: "left"  ,number: 1},
            {path: "assets/img/fishes/clownR.png"       ,direction: "right" ,number: 1},
            {path: "assets/img/fishes/pinkL.png"        ,direction: "left"  ,number: 0},
            {path: "assets/img/fishes/pinkR.png"        ,direction: "right" ,number: 1},
            {path: "assets/img/fishes/yellowBlackL.png" ,direction: "left"  ,number: 1},
            {path: "assets/img/fishes/yellowBlackR.png" ,direction: "right" ,number: 1},
            {path: "assets/img/fishes/blueL.png"        ,direction: "left"  ,number: 1},
            {path: "assets/img/fishes/blueR.png"        ,direction: "right" ,number: 1}
        ]
    };

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
        this.header           = qs("#header");
        this.myName         = qs("#myName");
        this.linksMenu        = qs(".linksMenu");
        this.switcher         = qs("#switcher");
        this.linkHome         = qs('[data-target="tabHome"]');
        this.linkAchievements = qs('[data-target="tabAchievements"]');
        this.linkContact      = qs('[data-target="tabContact"]');
        this.tabsContainer    = qs(".tabsContainer");
        this.tabHome          = qs("#tabHome");
        this.tabAchievements  = qs("#tabAchievements");
        this.tabContact       = qs("#tabContact");
        this.links            = qsa(".linksMenu li");
        this.contents         = qsa(".everyTab");

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
            let containerBounds = this.linksMenu.getBoundingClientRect();
            let targetBounds = this.#tabButtons[this.#currentTabIndex].getBoundingClientRect();
            this.switcher.style.right =  containerBounds.right - targetBounds.right + 'px';
            this.switcher.style.left = targetBounds.x - containerBounds.x + 'px';
        }
    };

    /**
     * Set screen swaping behaviors (#startup, #handleTabsStart, #handleTabsMove, #handleTabsEnd, #handleTabsCancel)
     */
    #startup() {
        const d =  document;
        d.addEventListener("pointerdown"  , this.#handleTabsStart.bind(this));
        d.addEventListener("pointerup"    , this.#handleTabsEnd.bind(this));
        d.addEventListener("pointercancel", this.#handleTabsCancel.bind(this));
        d.addEventListener("pointermove"  , this.#handleTabsMove.bind(this));

        this.#bubbles(this.tabHome)
        
        this.#bubbles(this.tabAchievements)
        for(let i=0 ; i < this.#fishes.tabAchievements.length ; ++i) this.#flyinImage(this.tabAchievements,this.#fishes.tabAchievements[i].path, this.#fishes.tabAchievements[i].direction,this.#fishes.tabAchievements[i].number); 

        for(let i=0 ; i < this.#fishes.tabContact.length ; ++i)this.#flyinImage(this.tabContact,this.#fishes.tabContact[i].path, this.#fishes.tabContact[i].direction,this.#fishes.tabContact[i].number); 
        this.#bubbles(this.tabContact)
    }
    #handleTabsStart(evt){
        this.#prevPosX = evt.clientX;
        qs("#header").style.cursor = "grabbing";
        mask.style.cursor = "grabbing";
        for (let i = 0; i < this.#tabs.length; i++) this.#tabs[i].style.cursor = "grabbing";
    }
    #handleTabsMove(evt) {
        evt.preventDefault();
        this.#tmpEventClient = evt.clientX;
    }
    #handleTabsEnd(evt) {
        evt.preventDefault();
        qs("#header").style.cursor = "auto";
        mask.style.cursor = "auto";
        for (let i = 0; i < this.#tabs.length; i++) this.#tabs[i].style.cursor = "auto";
        if(isSeachActivate)mask.style.cursor = "none";
        if(!isSeachActivate)mask.style.cursor = "auto";
        let diffPos = this.#prevPosX - evt.clientX;
        if(evt.pointerType === "mouse"){
            if(evt.target == intro) return;
            if(diffPos > 60) this.#tabButtons[clamp(this.#currentTabIndex + 1, 0, this.#tabButtons.length-1)].click();
            if(diffPos < -60) this.#tabButtons[clamp(this.#currentTabIndex - 1, 0, this.#tabButtons.length-1)].click();
        }
    }
    #handleTabsCancel(evt) {
        evt.preventDefault();
        let diffPos = this.#tmpEventClient - this.#prevPosX;
        if(evt.pointerType === "touch"){
            if(evt.target == intro) return;
            if(diffPos < -8.5) this.#tabButtons[clamp(this.#currentTabIndex + 1, 0, this.#tabButtons.length-1)].click();
            if(diffPos > 8.5) this.#tabButtons[clamp(this.#currentTabIndex - 1, 0, this.#tabButtons.length-1)].click();
        }
    }
    /**
     * A method to create visual moving bubbles. Thanks to @tipsy
     * @param config Possible modifications of the bubbles aspect
     *
     */
    #bubbles(element, config) {
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

    #flyinImage(element, imagePath = null, imageDirection = null, numberImages = 1, config) {
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
        context.shadowColor = c.shadowColor || "#fff00";
        context.shadowBlur = c.blur || 1;
        
        const gradient = context.createLinearGradient(0, 0, width, height);
        
        gradient.addColorStop(0, c.colorStart || "#39B8ED00");
        gradient.addColorStop(1, c.colorStop || "#39B8ED00");
    
        const nbImagesToDisplay = c.images || Math.floor((width + height) * 0.001 * numberImages);
        const images   = [];
        for (let i = 0; i < nbImagesToDisplay; i++) {
            let randomVelocity = 5 + Math.round(Math.random() * 20);
            images.push({
                f: (c.bubbleFunc || (() => `hsla(0, 0%, 100%, ${r() * 0.1})`)).call(), // fillStyle
                x: r() * width, // x-position
                y: r() * height, // y-position
                r: (c.radiusFunc || (() => 4 + r() * width / 25)).call(), // radius
                a: (c.angleFunc || (() => r() * Math.PI * 2)).call(), // angle
                v: (c.velocityFunc || (() => .5 + r() * 0.1 * randomVelocity)).call() // velocity
            });
        }
        let base_image = new Image();
        base_image.src = 'assets/img/fishes/blue.png';
                
        if(imagePath !== null)base_image.src = imagePath;

        (function draw() {
            if (canvas.parentNode === null) {
                return cancelAnimationFrame(draw)
            }
            if (c.animate !== false) {
                requestAnimationFrame(draw);
            }
            context.canvas.width = element.offsetWidth*2;
            context.canvas.height =  element.offsetHeight*2;
          
            context.globalCompositeOperation = c.compose || "light";
            images.forEach(bubble => {
                context.drawImage(base_image, bubble.x, bubble.y, bubble.r,bubble.r * 1.5);
                context.fillStyle = bubble.f;
                context.fill();
                // update positions for next draw
                if(imageDirection && imageDirection === "left") bubble.x += -Math.abs(Math.cos(bubble.a) * bubble.v);
                if(imageDirection && imageDirection === "right") bubble.x += Math.abs(Math.cos(bubble.a) * bubble.v);
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

    /**
     * Creates the application
     *
     */
    getCurrentTabIndex(){return this.#currentTabIndex}

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

const draggable           = qsa(".draggable");
for (let i = 0; i < draggable.length; i++) draggable[i].style.position = "relative";

const intro               = qs("#intro");
const tabHome             = qs("#tabHome");
const introContent        = qs("#introContent");
const introContentOverlay = qs("#introContentOverlay");
const emptyPannel         = qs("#emptyPannel")
const activePannel        = qs(".activePannel");
const btnFlipTablet       = qs("#btnFlipTablet");

const linkHome            = qs('[data-target="tabHome"]');
const linkAchievements    = qs('[data-target="tabAchievements"]');
const switcher            = qs("#switcher");
const linkContact         = qs('[data-target="tabContact"]');
const tabButtons          = [linkHome, linkAchievements, linkContact];

const blurMaskTop         = qs("#blurMaskTop");
const blurMaskBottom      = qs("#blurMaskBottom");
const blurMaskLeft        = qs("#blurMaskLeft");
const blurMaskRight       = qs("#blurMaskRight");

const mask                = qs(".mask");
const zones               = qsa(".zone");
const imgActivateSearch   = qs("#imgActivateSearch");
const endGame             = qs("#endGame");
const overlayBubble       = qs("#overlayBubble");
const imgBubble           = qs("#imgBubble");
const videoLink           = qs("#videoLink");
const linkSite            = qs("#linkSite");
const textBubble          = qs("#textBubble");
const closeBubble         = qs("#closeBubble");
const infoBubble          = qs("#infoBubble");
const imgEndGame          = qs("#imgEndGame");
const help                = qs("#help");
const treasureCounter     = qs("#treasureCounter");
const userSubmit          = qs("#userSubmit");

let introBounds;
let containerBounds; 
let relativeTop;   
let relativeBottom;  
let relativeLeft;   
let relativeRight;

let isSeachActivate    = false;
let isGameEnded        = false;

let treasuresNumber    = 0;
let isYinFound         = false;
let isYangFound        = false;
let isRythmyFound      = false;
let isEasygitFound     = false;

const titleYin         = "Vidéo Yin";
const titleYang        = "Vidéo Yang";
const titleRythmy      = "Vidéo Rythmy";
const titleEasygit     = "Vidéo EasyGit";
const titleHelp        = "Abréger le jeu"
const titleSiteRythmy  = "Site Rythmy";
const titleSiteEasygit = "Dépôt GitHub EasyGit";
const textYin          = "Ce montage vidéo reprend des images du film Ong Bak 3 avec Tony Jaa, sur une musique du groupe Tech N9ne : Wordwide Chopper";
const textYang         = "Ce montage vidéo reprend des images du film Ong Bak 3 avec Tony Jaa, sur une musique de Bob Marley : Jammin' <br><br>Le mot de passe est : yang";
const textRythmy       = "L'origine de ce site est la poursuite d'un projet de réseau social musical dans le cadre de mon IUT. Il s'est finalement transformé en plateforme de remix";
const textEasygit      = "Cette interface graphique entièrement codée en Bash, a pour but de simplifier l'usage de Git dans le sens de tout faire d'une main, sauf les commits";
const textHelp         = "Chasse aux trésor !<br><br>Le compteur au-dessus du coffre indique le nombre de travaux découverts.<br><br>Vous pouvez <b>abréger le mini-jeu</b> en cliquant sur le drapeau ci-dessus";
const linkYin          = "https://www.dailymotion.com/video/x1005ve";
const linkYang         = "https://www.dailymotion.com/video/x2qlfv7";
const linkRythmy       = "https://www.youtube.com/watch?v=GMLWWS612lg";
const linkEasygit      = "https://www.youtube.com/watch?v=x4DwNZzGstc";

const imgYin           = "assets/img/yin.png";
const imgYang          = "assets/img/yang.png";
const imgRythmy        = "assets/img/note.png";
const imgEasygit       = "assets/img/git.png";
const imgIdYin         = "#imgYin";
const imgIdYang        = "#imgYang";
const imgIdRythmy      = "#imgRythmy";
const imgIdEasygit     = "#imgEasygit";
const linkSiteRythmy   = "https://dethyre.alwaysdata.net/";
const linkSiteEasygit  = "https://github.com/SebastienDethyre/easyGit.git";


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
    
    intro.onmousemove = dr;
    intro.ontouchmove = dr;

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
    
        introBounds = intro.getBoundingClientRect();
        containerBounds = tabHome.getBoundingClientRect();
        
        target.style.left = target.oldLeft + target.distX + "px";
        target.style.top  = target.oldTop  + target.distY + "px";
    
        if(target.offsetTop  < -200){target.style.top = "0px";}
        if(target.offsetLeft < (window.pageXOffset)-150)target.style.left ="0px";
        
        let targetRight  = target.offsetLeft + target.offsetWidth;
        if(targetRight   > (window.innerWidth)+200)target.style.left = "0px";
        let targetBottom = target.offsetTop + target.offsetHeight;
        if(targetBottom  > (window.innerHeight)+50)target.style.top = "0px";

        let relativeTop     = introBounds.top        - containerBounds.top;
        let relativeBottom  = containerBounds.bottom - introBounds.bottom;
        let relativeLeft    = introBounds.left       - containerBounds.left;
        let relativeRight   = containerBounds.right  - introBounds.right;
        let roundedAnglesAdjust     = 12;
        blurMaskTop.style.height    = relativeTop    + roundedAnglesAdjust + "px";
        if(relativeTop    < 0 )     blurMaskTop.style.height= "0px";
        blurMaskBottom.style.height = relativeBottom + roundedAnglesAdjust + "px";
        if(relativeBottom < 0 )     blurMaskBottom.style.height= "0px";
        blurMaskLeft.style.width    = relativeLeft   + roundedAnglesAdjust + "px";
        if(relativeLeft   < 0 )     blurMaskLeft.style.width= "0px";
        blurMaskRight.style.width   = relativeRight  + roundedAnglesAdjust + "px";
        if(relativeRight  < 0 )     blurMaskRight.style.width= "0px";
        intro.style.cursor = "grabbing";
    }
    window.onresize = () =>{
        introBounds     = intro.getBoundingClientRect();
        containerBounds = tabHome.getBoundingClientRect();
        relativeTop     = introBounds.top - containerBounds.top;
        relativeBottom  = containerBounds.bottom - introBounds.bottom;
        relativeLeft    = introBounds.left - containerBounds.left;
        relativeRight   = containerBounds.right - introBounds.right;

        let roundedAnglesAdjust     = 12;
        blurMaskTop.style.height    = relativeTop + roundedAnglesAdjust + "px";
        if(relativeTop < 0 )        blurMaskTop.style.height= "0px";
        blurMaskBottom.style.height = relativeBottom + roundedAnglesAdjust + "px";
        if(relativeBottom < 0 )     blurMaskBottom.style.height= "0px";
        blurMaskLeft.style.width    = relativeLeft + roundedAnglesAdjust + "px";
        if(relativeLeft < 0 )       blurMaskLeft.style.width= "0px";
        blurMaskRight.style.width   = relativeRight + roundedAnglesAdjust + "px";
        if(relativeRight < 0 )      blurMaskRight.style.width= "0px";
        target.style.left           ="0";

        const containerLinksBounds  = qs(".linksMenu").getBoundingClientRect();
        const targetBounds          = tabButtons[app.getCurrentTabIndex()].getBoundingClientRect();
        switcher.style.right        =  containerLinksBounds.right - targetBounds.right + 'px';
        switcher.style.left         = targetBounds.x - containerLinksBounds.x + 'px';
    }
    function endDrag() {
        target.moving             = false;
        introContent.style.zIndex = 0;
        intro.style.cursor        = "grab";
    }

    target.onmouseup  = endDrag;
    target.ontouchend = endDrag;
    //            👆
}

/* Click Amination */
function clickAnim(e) {
	const rond      = document.createElement("div");
	rond.className  = "clickAnim";
	rond.style.top  = `${e.pageY - 25}px`;
	rond.style.left = `${e.pageX - 25}px`;	
	document.body.appendChild(rond);
	setTimeout(() => {rond.remove();}, 1500)
}

function c(e){console.log(e)}

/* accessing methods */
function cRem(parent, child){if(gc(parent)[0].classList.contains(child))return gc(parent)[0].classList.remove(child);}

function cAdd(parent, child){return gc(parent)[0].classList.add(child);}

/* shortcut for getElementById */
function gi(idName){return document.getElementById(idName)}

/* shortcut for getElementsByClassName */
function gc(className){return document.getElementsByClassName(className)}

let isFlipped=false;

btnFlipTablet.onclick= (e) =>{
    let indice = 2;
	let time = indice * 100;
    
	if (isFlipped==false){
        introContentOverlay.style.zIndex = "-1";
		cAdd("activePannel","flipTuileOn");
        clickAnim(e)
		setTimeout(() => {introContent.style.transform= "rotateY(90deg)";}, time);
		setTimeout(() => {cRem("activePannel","flipTuileOn")}, time);
		isFlipped=true;
		setTimeout(() => {cAdd("emptyPannel","flipTuileOff")}, time);
		setTimeout(() => {emptyPannel.style.transform = "rotateY(0deg)";}, time * 2);
		setTimeout(() => {cRem("emptyPannel","flipTuileOff")}, time * 2);	
	}
	else{
        introContentOverlay.style.zIndex = "0";
		cAdd("emptyPannel","flipTuileOn");
        clickAnim(e)
		setTimeout(() => {emptyPannel.style.transform = "rotateY(90deg)";}, time);
		setTimeout(() => {cRem("emptyPannel","flipTuileOn")}, time);
		isFlipped=false;
		setTimeout(() => {cAdd("introContent","flipTuileOff")}, time)
		setTimeout(() => {introContent.style.transform = "rotateY(0deg)";}, time * 2);
		setTimeout(() => {cRem("introContent","flipTuileOff")}, time * 2);	
	}	
}

intro.onmousedown = filter;
intro.ontouchstart = filter;
//                👆

for (let i = 0; i < zones.length; i++) zones[i].addEventListener("mouseover", ()=>{ 
    if(isSeachActivate){
        mask.style.setProperty('--z', "14vh"); 
        zones[i].style.animation="heartbeat_element_white_bright 1s alternate infinite"; 
    }
    if (isGameEnded) zones[i].style.animation = "";
})

for (let i = 0; i < zones.length; i++) zones[i].addEventListener("mouseout", ()=>{ 
    if(isSeachActivate)mask.style.setProperty('--z', "8vh"); 
    zones[i].style.animation = "";
})

function handlerMove (ev) {
    mask.style.setProperty('--x', ev.offsetX / ev.target.offsetWidth);
    mask.style.setProperty('--y', ev.offsetY / ev.target.offsetHeight);
}

imgActivateSearch.addEventListener("click", (e)=>{
    if(!isSeachActivate) {
        clickAnim(e);
        isSeachActivate   = true;
        mask.style.cursor = "none";
        for (let i = 0; i < zones.length; i++) zones[i].style.cursor="pointer";
        imgActivateSearch.style.cursor = "zoom-out";
        imgActivateSearch.setAttribute("src", "assets/img/unactivSearch.png");
        mask.addEventListener("mousemove", handlerMove)
    }
    else{
        clickAnim(e);
        isSeachActivate   = false;
        mask.style.cursor = "auto"
        for (let i = 0; i < zones.length; i++) zones[i].style.cursor="auto";
        imgActivateSearch.style.cursor = "zoom-in";
        imgActivateSearch.setAttribute("src", "assets/img/activSearch.png");
        mask.removeEventListener("mousemove", handlerMove)
    }
})

function activateZone(zoneName, isFound, textZone, titleZone, imgZone, linkZone, imgId, titleLinkSup, linkSup){
    zoneName= qs(zoneName);
    zoneName.addEventListener("click", (e)=>{
        if(isFound){
            clickAnim(e);	
            mask.style.cursor = "none";
            closeBubble.style.cursor = "pointer";
            cAdd("infoBubble", "activeBubble");
            fillInfoBubble(textZone, titleZone, linkZone, imgZone, titleLinkSup,linkSup);
        }
        if(!isSeachActivate) return;
        if (!isFound){
            treasuresNumber += 1;
            isFound = true;
            clickAnim(e);	
            qs(imgId).setAttribute("src",imgZone);
            qs(imgId).style.height = "100%";
            updateTreasure();
        }

        mask.style.cursor        = "none";
        closeBubble.style.cursor = "pointer";
        cAdd("infoBubble", "activeBubble");
        fillInfoBubble(textZone, titleZone, imgZone, linkZone, titleLinkSup,linkSup);
    })
}

function activateEveryZone(){
    activateZone("#zoneYang",    isYangFound,    textYang,    titleYang,    imgYang,    linkYang,    imgIdYang                                      );
    activateZone("#zoneYin",     isYinFound,     textYin,     titleYin,     imgYin,     linkYin,     imgIdYin                                       );
    activateZone("#zoneRythmy",  isRythmyFound,  textRythmy,  titleRythmy,  imgRythmy,  linkRythmy,  imgIdRythmy,  titleSiteRythmy,  linkSiteRythmy );
    activateZone("#zoneEasygit", isEasygitFound, textEasygit, titleEasygit, imgEasygit, linkEasygit, imgIdEasygit, titleSiteEasygit, linkSiteEasygit);
}
activateEveryZone()

function updateTreasure(){
    let treasureCounter = qs("#treasureCounter");
    if (treasuresNumber > 3) {
        treasuresNumber = 4;
        isGameEnded     = true;
        imgActivateSearch.style.display = "none";
        cAdd("mask", "unmask");
    }
    treasureCounter.innerHTML = "<h1><big>" + treasuresNumber + "/4</big></h1>";
}

function fillInfoBubble(text, title, img = "", link = "", titleLinkSup = "",linkSup = ""){
    clearInfoBubble()
    textBubble.innerHTML=text;
    if (img !== "") imgBubble.setAttribute("src", img);
    if (link !== ""){
        videoLink.innerHTML = title;
        videoLink.setAttribute("href", link);
    }
    linkSite.style.display = "none";
    linkSite.innerHTML     = "";
    if (titleLinkSup !== "" && linkSup !== ""){
        linkSite.setAttribute("href", linkSup);
        linkSite.style.display = "block";
        linkSite.innerHTML     = titleLinkSup;
    } 
}

function clearInfoBubble(){
    textBubble.innerHTML  = "";
    videoLink.innerHTML   = "";
    imgBubble.src         = "";
    linkSite.innerHTML    = "";
    imgEndGame.src        = "";
    endGame.style.display = "none";
}

mask.onclick          = e => {
    if(e.target != infoBubble) cRem("infoBubble", "activeBubble");
    if(isSeachActivate)mask.style.cursor = "none"; 
    else mask.style.cursor = "auto";
};

overlayBubble.onclick = e => {if(e.target != infoBubble) cRem("infoBubble", "activeBubble");};
closeBubble.onclick   = ()=> {cRem("infoBubble", "activeBubble"); mask.style.cursor = "none"; closeBubble.style.cursor = "none";};
userSubmit.onclick    = e => {clickAnim(e);};
help.onclick          = e => {
    clearInfoBubble()
    clickAnim(e);	
    if(!isGameEnded) imgEndGame.setAttribute("src", "assets/img/finishFlag.png")
    closeBubble.style.cursor = "pointer";
    textBubble.innerHTML     = textHelp;
    endGame.style.display    = "flex";
    cAdd("infoBubble", "activeBubble");
}
endGame.onclick       = e => {
    imgBubble.setAttribute("src", "");
    clickAnim(e);
    treasuresNumber = 4; 
    isSeachActivate = true ;
    qs(imgIdYin).setAttribute("src",imgYin);
    qs(imgIdYin).style.height     = "100%";
    qs(imgIdYang).setAttribute("src",imgYang);
    qs(imgIdYang).style.height    = "100%";
    qs(imgIdRythmy).setAttribute("src",imgRythmy);
    qs(imgIdRythmy).style.height  = "100%";
    qs(imgIdEasygit).setAttribute("src",imgEasygit);
    qs(imgIdEasygit).style.height = "100%";
    updateTreasure();
    activateEveryZone();
    endGame.style.display = "none";
}

function sendMail(){
    let userGender  = document.forms["contactForm"]["userGender"].value;	
    let userName    = document.forms["contactForm"]["userName"].value;	
    let userSurname = document.forms["contactForm"]["userSurname"].value;	
    let userMessage = document.forms["contactForm"]["userMessage"].value;	
    const mail      = "dethyres@hotmail.fr";
    let subject     = "Message de Mme " + userName + " " + userSurname;
    if (userGender === "male") subject = "Message de Mr " + userName + " " + userSurname;

    alert("Votre message à bien été envoyé sur votre messagerie\npar défaut pour Sébastien Dethyre");
    
    const body      = userMessage;
    location.href   = `mailto:${mail}?subject=${subject}&body=${encodeURIComponent(body)}`;
    userName        = document.forms["contactForm"]["userName"].value = "";	
    userSurname     = document.forms["contactForm"]["userSurname"].value = "";	
    userMessage     = document.forms["contactForm"]["userMessage"].value = "";
}


let app= new Application();
app.create();