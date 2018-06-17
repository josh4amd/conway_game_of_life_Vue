import Vue from 'vue'
import ConwayGrid from '@/components/ConwayGrid'

let deepEqual = require('deep-equal');

describe('ConwayGrid.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(ConwayGrid)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('h1').textContent)
      .to.equal("Conway's Game of Life")
  })

  it('should have correct default grid values', () => {
    const Constructor = Vue.extend(ConwayGrid)
    const vm = new Constructor().$mount()
    expect(vm.$data.numRows).to.equal(10)
    expect(vm.$data.numRows).to.equal(10)

    let data = vm.gridData()
    expect(data.length).to.equal(10)
    expect(data[0].length).to.equal(10)
  })

  it('should perform deep copies correctly', () => {
    const Constructor = Vue.extend(ConwayGrid)
    const vm = new Constructor().$mount()
    let obj = { one: 1, func: () => { return 5 }}
    let obj2 = {}
    obj2 = vm.copy(obj)
    expect(deepEqual(obj, obj2))
  })
})
