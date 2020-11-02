import { countItems, reverseObject } from '../src/parser'

describe('parser', () => {
  describe('reverseObject', () => {
    it('should reverse key-value', () => {
      expect(reverseObject({ a: 1 })).toEqual({ '1': 'a' })
      expect(reverseObject({ '1': 'a' })).toEqual({ a: '1' })
    })
  })

  describe('countItems', () => {
    it('should count occurincies', () => {
      expect(countItems(['a', 'b'])).toEqual({ a: 1, b: 1 })
      expect(countItems(['a', 'b', 'b', 'b', 'a', 'c'])).toEqual({ a: 2, b: 3, c: 1 })
    })
  })
})
