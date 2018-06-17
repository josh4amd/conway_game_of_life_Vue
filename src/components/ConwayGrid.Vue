<template>
  <div>
    <h1 style="text-align:center">Conway's Game of Life</h1>
    <button v-on:click="start()" :disabled="this.interval != null">start</button>
    <button v-on:click="stop()" :disabled="this.interval == null">stop</button>
    <button v-on:click="clear()" :disabled="this.interval != null">clear</button>
    <div id='grid'>
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
      interval: null
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
      for (var row = 0; row < 10; row++) {
        data.push( new Array() );

        // iterate for cells/columns inside rows
        for (var column = 0; column < 10; column++) {
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
    	if(this.$data.gData[x - 1 < 0 ? 10 - 1 : x - 1][y - 1 < 0 ? 10 - 1 : y - 1].isLive) {
    		count++;
    	}

    	//top
    	if(this.$data.gData[x][y - 1 < 0 ? 10 - 1 : y - 1].isLive) {
    		count++;
    	}

    	//top-right
    	if(this.$data.gData[x + 1 > 10 - 1 ? 0 : x + 1][y - 1 < 0 ? 10 - 1 : y - 1].isLive) {
    		count++;
    	}

    	//left
    	if(this.$data.gData[x - 1 < 0 ? 10 - 1 : x - 1][y].isLive) {
    		count++;
    	}

    	//right
    	if(this.$data.gData[x + 1 > 10 - 1 ? 0 : x + 1][y].isLive) {
    		count++;
    	}

    	//bottom-left
    	if(this.$data.gData[x - 1 < 0 ? 10 - 1 : x - 1][y + 1 > 10 - 1 ? 0 : y + 1].isLive) {
    		count++;
    	}

    	//bottom
    	if(this.$data.gData[x][y + 1 > 10 - 1 ? 0 : y + 1].isLive) {
    		count++;
    	}

    	//bottom-right
    	if(this.$data.gData[x + 1 > 10 - 1 ? 0 : x + 1][y + 1 > 10 - 1 ? 0 : y + 1].isLive) {
    		count++;
    	}

    	return count;
    },
    update () {
    	var newGridData = this.copy(this.$data.gData);

      d3.select("svg").remove();

    	for(var i = 0; i < 10; i++) {
    		for(var j = 0; j < 10; j++) {
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
    }
  },
  mounted () {
    this.$data.gData = this.gridData()
    this.drawGrid(this.$data.gData)
  }
}
</script>
