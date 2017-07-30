var Cell = function(props) {
        this.id = props && props.id || undefined;
        this.width = props && props.width || 0;
        this.height = props && props.height || 0;
        this.label = props && props.label || '';
        this.cellEl = props && props.cellEl || undefined;
        this.parentEl = props && props.parentEl || undefined;
        this.cellType = props && props.cellType || undefined;
        this.cellContentType = props && props.cellContentType || undefined;           
        this.labelNode = props && props.labelNode || undefined;
        this.events = []; // TODO: track events with callbacks {eN: 'click', cB: func() {}}
    };

    Cell.prototype.destroy = function() {
        // console.log('removing cell', this);
        this.cellEl.removeEventListener('click', this);
    };

    Cell.prototype.handleEvent = function(event) {    
        //this.cellEl.getBoundingClientRect()
        var styles = this.cellEl.getBoundingClientRect();
        var parentEl = this.parentEl;
        var cloneEl = this.cellEl.cloneNode(true);
        
        parentEl.classList.add('item-selected');
        
        cloneEl.style.top = styles.top + window.pageYOffset + 'px';
        cloneEl.style.left = styles.left + window.pageXOffset + 'px';
        cloneEl.classList.add('cloned');
        document.body.appendChild(cloneEl);
        
        var bodyBBox = document.body.getBoundingClientRect();
        var top = (bodyBBox.height/2) - (200/2);
        var left = (bodyBBox.width/2) - (200/2);
        setTimeout(function() {
            cloneEl.classList.add('scaled');
            cloneEl.style.top = top + 'px';
            cloneEl.style.left = left + 'px';
            cloneEl.style.width = 200 + 'px';
            cloneEl.style.height = 200 + 'px';
        },100);
        // cloneEl.style.lineHeight = 200 + 'px';
        cloneEl.addEventListener('click', function() {
            this.removeEventListener('click', this);
            document.removeEventListener('mousemove', threeDEffect); // remove 3d shifting effect listener
            document.body.removeChild(this);
            parentEl.classList.remove('item-selected');    
        }, false);
        
        // 3d shifting effect
        var clonePos,
            parentElPos = this.parentEl.getBoundingClientRect();
        setTimeout(function() {
            clonePos = cloneEl.getBoundingClientRect();           
            // document.addEventListener('mousemove', threeDEffect);
            // cloneEl.classList.add('no-anim');
        }, 80);
        
        var threeDEffect = function(e) {

            var x = (e.clientX - (parentElPos.width/2))/8;
            var y = (e.clientY - (parentElPos.height/2))/8;

            cloneEl.style.top = (parentElPos.height/2) + y - (clonePos.height/2) + 'px';
            cloneEl.style.left = (parentElPos.width/2) + x - (clonePos.width/2) + 'px';
        }; 
        
    };
    Cell.prototype.init = function () {
        if (!this.cellType) throw 'must provide cell type like div or span';
        var contentContainerEl;
        this.cellEl = document.createElement(this.cellType);
        this.labelNode = document.createTextNode(this.label);
            
        if (this.cellContentType) {
            contentContainerEl = document.createElement(this.cellContentType);
            contentContainerEl.appendChild(this.labelNode);
            this.cellEl.appendChild(contentContainerEl);
        } else {
            this.cellEl.appendChild(this.labelNode);
        }
        
        this.cellEl.className = 'cell';
        this.cellEl.style.width = this.width + 'px';
        this.cellEl.style.height = this.height + 'px';
        this.cellEl.style.lineHeight = this.height + 'px';
        
        // this calls 'handleEvent' fn above.
        this.cellEl.addEventListener('click', this, false);
    };

    Cell.prototype.setLabel = function (label) {
        this.labelNode.nodeValue = label;   
    };

var Grid = function(props) {
        this.gridEl = props && props.gridEl || undefined;
        this.cellType = props && props.cellType || 'div';
        this.rows = props && props.rows || 0;
        this.columns = props && props.columns || 0;
        this.width = props && props.width || 0;
        this.height = props && props.height || 0;
        this.cellCount = this.rows * this.columns;
        this.cellContentType = props.cellContentType || undefined
        this.cells = [];
    };
    Grid.prototype.addCell = function(props) {
        var cell = new Cell(props);
        cell.init();
        cell.setLabel(this.cells.length + 1);
        this.cells.push(cell);
        this.gridEl.appendChild(cell.cellEl);
    };
    Grid.prototype.removeCell = function(elNode) {
        var removedEl = this.cells.pop();
        removedEl && removedEl.destroy();
        this.gridEl.removeChild(this.gridEl.lastChild);
    };
    Grid.prototype.init = function() {
        if(!this.gridEl) {
            throw 'Grid element required!'; 
        }
        if(this.rows <= 0 || this.columns <= 0) {
            throw 'rows and columns must be above 0';
        }
        
        this.gridEl.style.width = this.width + 'px';
        
        for (var i = 0; i < this.cellCount; i++){
            var cellProps = {
                width: this.width / this.columns,
                height:  this.width / this.columns,
                cellType: this.cellType,
                parentEl: this.gridEl.parentNode,
                cellContentType: this.cellContentType
            };
            this.addCell(cellProps);
        }   
    };

    Grid.prototype.clearAll = function() {
        while(this.gridEl.lastChild) {
            this.removeCell();
        } 
    };

    Grid.prototype.update = function(props) {
        // not efficiant but it works.    
        this.clearAll();
        this.rows = props && props.rows || this.rows;
        this.columns = props && props.columns || this.columns;
        this.width = props && props.width || this.width;
        this.height = props && props.height || this.height;
        this.cellCount = this.rows * this.columns;
        
        for (var i = 0; i < this.cellCount; i++) {
            var cellProps = {
                id: i,
                width: this.width / this.columns,
                height: this.width / this.columns,
                cellType: this.cellType,
                cellContentType: this.cellContentType,
                parentEl: this.gridEl.parentNode
            };  
            this.addCell(cellProps);
        }
    };

