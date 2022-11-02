export class PinComponent extends HTMLElement {
   
    render() {
      // const para = document.createElement("span");
      // const node = document.createTextNode("This is new.");
      // // para.innerHTML
      // para.appendChild(node);
      // this.replaceChildren(para);
      let theMode;
      if (this.hasAttribute("mode")){
        theMode = this.getAttribute("mode");
      } else {
        this.setAttribute("mode", "view")
        theMode = "view"
      }
      const para = document.createElement("span");
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