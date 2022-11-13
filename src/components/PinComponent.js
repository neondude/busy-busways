export class PinComponent extends HTMLElement {
   
    render() {
      // const para = document.createElement("span");
      // const node = document.createTextNode("This is new.");
      // // para.innerHTML
      // para.appendChild(node);
      // this.replaceChildren(para);
      let theMode;
      let thePassengerCount;
      let theMarkerType;
      if (this.hasAttribute("mode")) {
        theMode = this.getAttribute("mode");
      } else {
        this.setAttribute("mode", "view")
        theMode = "view"
      }
      if (this.hasAttribute("pcount")) {
        thePassengerCount = this.getAttribute("pcount");
      } else {
        this.setAttribute("pcount", "0")
        thePassengerCount = "0"
      }
      if (this.hasAttribute("mtype")) {
        theMarkerType = this.getAttribute("mtype");
      } else {
        this.setAttribute("mtype", "oval")
        theMarkerType = "oval";
      }

      const spanElement = document.createElement("span");
      // set pos attribute as thePoshash
      spanElement.setAttribute("pos", this.getAttribute("id"));
      // set para element background color as black
      spanElement.style.backgroundColor = "black";
      // set para element as circle
      if(theMarkerType === "oval") {
      spanElement.style.borderRadius = "50%";

      }
      if(theMode === "choosable" || theMode === "chosen") {
        // thick border
        spanElement.style.borderWidth = "5px";
        spanElement.style.borderStyle = "solid";
      }
      if(theMode === "chosen") {
        spanElement.style.borderColor = "yellow";
      } else if (theMode === "choosable") {
        spanElement.style.borderColor = "red";
      }

        //
      // set para element width and height as 20px
      spanElement.style.width = "20px";
      // set para padding as 10px
      spanElement.style.padding = "15px";
      spanElement.innerText = thePassengerCount;
      // set svg image as content of the para element
      //  spanElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">`
      // create svg element      
      this.replaceChildren(spanElement);
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
      return ['mode','pcount'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.render()
    }


    // // there can be other element methods and properties
    constructor() {
      super();      
    }
  }