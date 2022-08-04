class Application extends Object {

    /* List of tabs and their appropriate buttons  */
    #tabs = [];
    #tabButtons = [];
    #currentTabIndex = 0;

    /* Instances of TabView */
    #homeTabView;
    #alertTabView;
    #historyTabView;
 
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

    /*   HTML Elements creation   */
                                  //        _______________________________________________________________________________________________________________________
    #constructHTML = () => {      //        |   Type    |                        Attributs, Datasets & Inner Texts                          |    Elément Parent   |
                                  //        |_d'Element_|___________________________________________________________________________________|__def:document.body__|
        this.header          = createElement( "header" ,{id             :"header"                                                           }                    );
        this.userName        = createElement(  "span"  ,{id             :"userName"                    ,text :"Sébastien Dethyre"                            },        this.header);
        // this.userNameImg     = createElement(   "img"  ,{src            :"img/planche.png"                            ,alt :""         },      this.userName);
        this.linksMenu       = createElement(   "ul"   ,{class          :"linksMenu"                                       ,role :"tablist" },        this.header);
        this.switcher        = createElement(  "span"  ,{id             :"switcher"                                                         },     this.linksMenu);
        this.linkHome        = createElement(   "li"   ,{"data-target"  :"tabHome"                    ,class :"active"     ,role :"tab"     },     this.linksMenu);
        const anchorHome     = createElement(   "a"    ,{text           :"Accueil"                                         ,href :"#"       },      this.linkHome);
        this.linkHistory     = createElement(   "li"   ,{"data-target"  :"tabHistory"                                      ,role :"tab"     },     this.linksMenu);
        const anchorHistory  = createElement(   "a"    ,{text           :"Réalisations"                                    ,href :"#"       },   this.linkHistory);
        this.linkAlerts      = createElement(   "li"   ,{"data-target"  :"tabAlerts"                                       ,role :"tab"     },     this.linksMenu);
        const anchorAlerts   = createElement(   "a"    ,{text           :"Me contacter"                                    ,href :"#"       },    this.linkAlerts);
        this.tabsContainer   = createElement(  "div"   ,{class          :"tabsContainer"                                                    }                    );
        this.tabHome         = createElement(  "div"   ,{id:"tabHome"   ,class:"everyTab",  "aria-labelledby":   "tabHome" ,role:"tabpanel" }, this.tabsContainer);
        this.tabHistory      = createElement(  "div"   ,{id:"tabHistory",class:"everyTab",  "aria-labelledby":"tabHistory" ,role:"tabpanel" }, this.tabsContainer);
        this.tabAlerts       = createElement(  "div"   ,{id:"tabAlerts" ,class:"everyTab",  "aria-labelledby": "tabAlerts" ,role:"tabpanel" }, this.tabsContainer);
        this.links           =      qsa     (".linksMenu li");
        this.contents        =      qsa     (".everyTab");

        // Put all tabs and their associated button in a list, for scalability
        this.#tabs = [this.tabHome, this.tabHistory, this.tabAlerts];
        this.#tabButtons = [this.linkHome, this.linkHistory, this.linkAlerts];

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
        bubbly()
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
            if(diffPos > 0) this.#tabButtons[clamp(this.#currentTabIndex + 1, 0, this.#tabButtons.length-1)].click();
            if(diffPos < 0) this.#tabButtons[clamp(this.#currentTabIndex - 1, 0, this.#tabButtons.length-1)].click();
        }
    }
    #handleCancel(evt) {
        let diffPos = this.#tmpEventClient - this.#prevPosX;
        if(evt.pointerType === "touch"){
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
 let bubbly = function (config) {
    const c = config || {};
    const r = () => Math.random();
    const canvas = c.canvas || document.createElement("canvas");
    let width = canvas.width;
    let height = canvas.height;
    if (canvas.parentNode === null) {
        canvas.setAttribute("style", "position:fixed;z-index:-1;left:0;top:0;min-width:100vw;min-height:100vh;");
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
    }
    const context = canvas.getContext("2d");
    context.shadowColor = c.shadowColor || "#fff";
    context.shadowBlur = c.blur || 4;
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, c.colorStart || "#2AE");
    gradient.addColorStop(1, c.colorStop || "#17B");
    const nrBubbles = c.bubbles || Math.floor((width + height) * 0.02);
    const bubbles = [];
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





let app= new Application()
app.create()