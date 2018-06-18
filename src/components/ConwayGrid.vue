<template>
  <div>
    <h1 style="text-align:center">Conway's Game of Life</h1>
    <p>Click to set/unset each cell (Clear-Dead, Dark-Live). Press Start/Stop to control simulation. Press clear to reset.</p>
    <div style="background-color: #e9ecef; padding-top: 10px;" class="content">
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
          <button class="btn btn-primary form-control" v-on:click="start()" :disabled="this.interval != null">start</button>
        </div>
        <div class="col-md-2">
          <button class="btn btn-danger form-control" v-on:click="stop()" :disabled="this.interval == null">stop</button>
        </div>
        <div class="col-md-2">
          <button class="btn btn-light form-control" v-on:click="clear()" :disabled="this.interval != null">clear</button>
        </div>
        <div class="col-md-3"></div>
      </div>
      <hr />
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
      let self = this
      let output, v, key
      output = Array.isArray(o) ? [] : {}
      for (key in o) {
        v = o[key]
        output[key] = (typeof v === 'object') ? self.copy(v) : v
      }
      return output
    },
    // Adapted from: https://bl.ocks.org/cagrimmett/07f8c8daea00946b9e704e3efcbd5739
    gridData () {
      let data = []
      let xpos = 1
      let ypos = 1
      let width = 50
      let height = 50
      let click = 0
      let isLive = false

      // iterate for rows
      for (let row = 0; row < this.$data.numCols; row++) {
        data.push([])

        // iterate for cells/columns inside rows
        for (let column = 0; column < this.$data.numRows; column++) {
          data[row].push({
            x: xpos,
            y: ypos,
            width: width,
            height: height,
            click: click,
            isLive: isLive
          })

          xpos += width
        }

        xpos = 1
        ypos += height
      }
      return data
    },
    drawGrid (data) {
      let grid = d3.select('#grid')
        .append('svg')
        .attr('width', (this.$data.numRows * 50) + 2)
        .attr('height', (this.$data.numCols * 50) + 2)

      let row = grid.selectAll('.row')
        .data(data)
        .enter().append('g')
        .attr('class', 'row')

      // column
      row.selectAll('.square')
        .data((d) => { return d })
        .enter().append('rect')
        .attr('class', 'square')
        .attr('x', (d) => { return d.x })
        .attr('y', (d) => { return d.y })
        .attr('width', (d) => { return d.width })
        .attr('height', (d) => { return d.height })
        .attr('fill', (d) => { if (d.isLive) { return '#000' } else { return '#fff' } })
        .style('stroke', '#222')
        // For some reason a lamba does not work here so use ES5 syntax
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
    countNeighbors (x, y) {
      let count = 0

      // top-left
      if (this.$data.gData[x - 1 < 0 ? this.$data.numCols - 1 : x - 1][y - 1 < 0 ? this.$data.numRows - 1 : y - 1].isLive) {
        count++
      }

      // top
      if (this.$data.gData[x][y - 1 < 0 ? this.$data.numRows - 1 : y - 1].isLive) {
        count++
      }

      // top-right
      if (this.$data.gData[x + 1 > this.$data.numCols - 1 ? 0 : x + 1][y - 1 < 0 ? this.$data.numRows - 1 : y - 1].isLive) {
        count++
      }

      // left
      if (this.$data.gData[x - 1 < 0 ? this.$data.numCols - 1 : x - 1][y].isLive) {
        count++
      }

      // right
      if (this.$data.gData[x + 1 > this.$data.numCols - 1 ? 0 : x + 1][y].isLive) {
        count++
      }

      // bottom-left
      if (this.$data.gData[x - 1 < 0 ? this.$data.numCols - 1 : x - 1][y + 1 > this.$data.numRows - 1 ? 0 : y + 1].isLive) {
        count++
      }

      // bottom
      if (this.$data.gData[x][y + 1 > this.$data.numRows - 1 ? 0 : y + 1].isLive) {
        count++
      }

      // bottom-right
      if (this.$data.gData[x + 1 > this.$data.numCols - 1 ? 0 : x + 1][y + 1 > this.$data.numRows - 1 ? 0 : y + 1].isLive) {
        count++
      }

      return count
    },
    update () {
      let newGridData = this.copy(this.$data.gData)

      d3.select('svg').remove()

      for (let i = 0; i < this.$data.numCols; i++) {
        for (let j = 0; j < this.$data.numRows; j++) {
          let neighbors = this.countNeighbors(i, j)

          // Any live cell with fewer than two live neighbors dies, as if by under population.
          if (neighbors < 2) {
            newGridData[i][j].isLive = false
          }

          // Any live cell with more than three live neighbors dies, as if by overpopulation.
          if (neighbors > 3) {
            newGridData[i][j].isLive = false
          }

          // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
          if (neighbors === 3) {
            newGridData[i][j].isLive = true
          }
        }
      }

      this.$data.gData = newGridData
      this.drawGrid(this.$data.gData)
    },
    start () {
      let self = this
      self.interval = setInterval(() => { self.update() }, 125)
    },
    stop () {
      clearInterval(this.interval)
      // set so we can make disabled button check
      this.interval = null
    },
    clear () {
      this.$data.gData = this.gridData()
      this.update()
    },
    sizeUpdated () {
      if (this.$data.numRows < 3) { this.$data.numRows = 3 }
      if (this.$data.numCols < 3) { this.$data.numCols = 3 }
      this.clear()
    }
  },
  mounted () {
    this.$data.gData = this.gridData()
    this.drawGrid(this.$data.gData)
  }
}
</script>
