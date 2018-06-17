<template>
  <div>
    <h1 style="text-align:center">Conway's Game of Life</h1>
    <div class="content">
      <div class="row">
        <div class="col-md-4"></div>
        <div class="col-md-1">
          <input v-model="numRows" v-on:change="sizeUpdated()" class="form-control" type="number" :disabled="this.interval != null"/>
        </div>
        <div class="col-md-2">
          <h2>X</h2>
        </div>
        <div class="col-md-1">
          <input v-model="numCols" v-on:change="sizeUpdated()" class="form-control" type="number" :disabled="this.interval != null"/>
        </div>
        <div class="col-md-3"></div>
      </div>
      <div style="padding-bottom: 10px" class="row">
        <div class="col-md-3"></div>
        <div class="col-md-2">
          <button class="form-control" v-on:click="start()" :disabled="this.interval != null">start</button>
        </div>
        <div class="col-md-2">
          <button class="form-control" v-on:click="stop()" :disabled="this.interval == null">stop</button>
        </div>
        <div class="col-md-2">
          <button class="form-control" v-on:click="clear()" :disabled="this.interval != null">clear</button>
        </div>
        <div class="col-md-3"></div>
      </div>
      <div class="row">
        <div class="col-md-12" id='grid'></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
export default {
  name: 'ConwayGrid',
  data () {
    return {
      gData: [],
      interval: null,
      numRows: 10,
      numCols: 10
    }
  },
  methods: {
    copy (o) {
      var self = this
      var output,  v,  key;
      output = Array.isArray(o) ? [] : {};
      for (key in o) {
          v = o[key];
          output[key] = (typeof v === 'object') ? self.copy(v) : v;
      }
      return output;
    },
    gridData () {
      var data = new Array();
      var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
      var ypos = 1;
      var width = 50;
      var height = 50;
      var click = 0;
      var isLive = false;

      // iterate for rows
      for (var row = 0; row < this.$data.numCols; row++) {
        data.push( new Array() );

        // iterate for cells/columns inside rows
        for (var column = 0; column < this.$data.numRows; column++) {
          data[row].push({
            x: xpos,
            y: ypos,
            width: width,
            height: height,
            click: click,
            isLive: isLive
          })
          // increment the x position. I.e. move it over by 50 (width variable)
          xpos += width;
        }
        // reset the x position after a row is complete
        xpos = 1;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height;
      }
      return data;
    },
    drawGrid(data) {
      // I like to log the data to the console for quick debugging
      //console.log(gridData);

      var grid = d3.select('#grid')
        .append('svg')
        .attr('width', '510px')
        .attr('height', '510px')

      var row = grid.selectAll('.row')
        .data(data)
        .enter().append('g')
        .attr('class', 'row')

      //column
      row.selectAll('.square')
      .data(function (d) { return d })
      .enter().append('rect')
      .attr('class', 'square')
      .attr('x', function (d) { return d.x })
      .attr('y', function (d) { return d.y })
      .attr('width', function (d) { return d.width })
      .attr('height', function (d) { return d.height })
      .attr('fill', function (d) { if (d.isLive) { return '#000' } else { return '#fff' } })
      .style('stroke', '#222')
      .on('click', function (d) {
        if (!d.isLive) {
          d3.select(this).style('fill', '#000')
          d.isLive = true
        } else {
          d3.select(this).style('fill', '#fff')
          d.isLive = false
        }
      })
    },
    countNeighbors(x, y) {
    	var count = 0;

    	//top-left
    	if(this.$data.gData[x - 1 < 0 ? this.$data.numCols - 1 : x - 1][y - 1 < 0 ? this.$data.numRows - 1 : y - 1].isLive) {
    		count++;
    	}

    	//top
    	if(this.$data.gData[x][y - 1 < 0 ? this.$data.numRows - 1 : y - 1].isLive) {
    		count++;
    	}

    	//top-right
    	if(this.$data.gData[x + 1 > this.$data.numCols - 1 ? 0 : x + 1][y - 1 < 0 ? this.$data.numRows - 1 : y - 1].isLive) {
    		count++;
    	}

    	//left
    	if(this.$data.gData[x - 1 < 0 ? this.$data.numCols - 1 : x - 1][y].isLive) {
    		count++;
    	}

    	//right
    	if(this.$data.gData[x + 1 > this.$data.numCols - 1 ? 0 : x + 1][y].isLive) {
    		count++;
    	}

    	//bottom-left
    	if(this.$data.gData[x - 1 < 0 ? this.$data.numCols - 1 : x - 1][y + 1 > this.$data.numRows - 1 ? 0 : y + 1].isLive) {
    		count++;
    	}

    	//bottom
    	if(this.$data.gData[x][y + 1 > this.$data.numRows - 1 ? 0 : y + 1].isLive) {
    		count++;
    	}

    	//bottom-right
    	if(this.$data.gData[x + 1 > this.$data.numCols - 1 ? 0 : x + 1][y + 1 > this.$data.numRows - 1 ? 0 : y + 1].isLive) {
    		count++;
    	}

    	return count;
    },
    update () {
    	var newGridData = this.copy(this.$data.gData);

      d3.select("svg").remove();

    	for(var i = 0; i < this.$data.numCols; i++) {
    		for(var j = 0; j < this.$data.numRows; j++) {
    			var neighbors = this.countNeighbors(i, j);

    			//console.log('neighbors ', i, ' ', j, ' ', neighbors);

    			//Any live cell with fewer than two live neighbors dies, as if by under population.
    			if(neighbors < 2) {
    				newGridData[i][j].isLive = false;
    			}

    			//Any live cell with more than three live neighbors dies, as if by overpopulation.
    			if(neighbors > 3) {
    				newGridData[i][j].isLive = false;
    			}

    			//Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
    			if(neighbors == 3) {
    				newGridData[i][j].isLive = true;
    			}
    		}
    	}

    	this.$data.gData = newGridData;
      this.drawGrid(this.$data.gData);
    },
    start() {
      var self = this
    	self.interval = setInterval(function() {
    	  self.update()
    	}, 125)
    },
    stop() {
      clearInterval(this.interval)
      // set so we can make disabled button check
      this.interval = null;
    },
    clear() {
      this.$data.gData = this.gridData()
      this.update();
    },
    sizeUpdated() {
      if(this.$data.numRows < 3) { this.$data.numRows = 3 }
      if(this.$data.numCols < 3) { this.$data.numCols = 3 }
      this.clear()
    }
  },
  mounted () {
    this.$data.gData = this.gridData()
    this.drawGrid(this.$data.gData)
  }
}
</script>
