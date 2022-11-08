export class PinComponent extends HTMLElement {
   
    render() {
      // const para = document.createElement("span");
      // const node = document.createTextNode("This is new.");
      // // para.innerHTML
      // para.appendChild(node);
      // this.replaceChildren(para);
      let theMode;
      if (this.hasAttribute("mode")) {
        theMode = this.getAttribute("mode");
      } else {
        this.setAttribute("mode", "view")
        theMode = "view"
      }
      const para = document.createElement("span");
      // set pos attribute as thePoshash
      para.setAttribute("pos", this.getAttribute("id"));
      // set para element background color as black
      para.style.backgroundColor = "black";
      // set para element as circle
      para.style.borderRadius = "50%";
      // set para element width and height as 20px
      para.style.width = "20px";
      // set para padding as 10px
      para.style.padding = "10px";
      para.innerText = theMode;
      this.replaceChildren(para);
    }

    connectedCallback() {
      // browser calls this method when the element is added to the document
      // (can be called many times if an element is repeatedly added/removed)
      // this.setAttribute("onclick", 'clickTest(this.getAttribute("id"))')
      this.render()
    }

    // disconnectedCallback() {
    //   // browser calls this method when the element is removed from the document
    //   // (can be called many times if an element is repeatedly added/removed)
    // }

    static get observedAttributes() {
      return ['mode'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.render()
    }


    // // there can be other element methods and properties
    constructor() {
      super();      
    }
  }